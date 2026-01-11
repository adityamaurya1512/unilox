import { Product, CartItem, Order, DiscountCode } from './types';
import productsData from './data/products.json';

export class Store {
    private static instance: Store;

    public products: Product[] = [];
    public carts: Map<string, CartItem[]> = new Map(); // sessionId -> items
    public orders: Order[] = [];
    public discountCodes: DiscountCode[] = [];

    // Configurable N for "Every nth order"
    public readonly NTH_ORDER = 3;

    private constructor() {
        this.products = productsData as Product[];
    }

    public static getInstance(): Store {
        if (!Store.instance) {
            Store.instance = new Store();
        }
        return Store.instance;
    }

    // --- Product Methods ---
    public getProducts(): Product[] {
        return this.products;
    }

    public getProduct(id: string): Product | undefined {
        return this.products.find(p => p.id === id);
    }

    // --- Cart Methods ---
    public getCart(sessionId: string): CartItem[] {
        if (!this.carts.has(sessionId)) {
            this.carts.set(sessionId, []);
        }
        return this.carts.get(sessionId) || [];
    }

    public addToCart(sessionId: string, productId: string, quantity: number): void {
        const cart = this.getCart(sessionId);
        const existingItem = cart.find(item => item.productId === productId);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({ productId, quantity });
        }
    }

    public clearCart(sessionId: string): void {
        this.carts.set(sessionId, []);
    }

    // --- Order Methods ---
    public createOrder(order: Order): void {
        this.orders.push(order);
    }

    public getStats() {
        return {
            totalOrders: this.orders.length,
            totalPurchaseAmount: this.orders.reduce((sum, order) => sum + order.totalAmount, 0),
            discountCodes: this.discountCodes,
            totalDiscountAmount: this.orders.reduce((sum, order) => sum + (order.discountParams?.amount || 0), 0)
        };
    }

    // --- Discount Methods ---
    public generateDiscountCode(): string | null {
        // Condition: The NEXT order (orders.length + 1) must be a multiple of N
        // AND we shouldn't have already generated a code for this specific index
        const nextOrderIndex = this.orders.length + 1;

        if (nextOrderIndex % this.NTH_ORDER === 0) {
            // Check if we already have an unused code for this Nth position
            const existingCode = this.discountCodes.find(d =>
                d.orderIndexCondition === nextOrderIndex && !d.isUsed
            );

            if (existingCode) {
                return existingCode.code;
            }

            // Generate new code
            const newCode = `DISCOUNT_${nextOrderIndex}_${Math.random().toString(36).substring(7).toUpperCase()}`;
            this.discountCodes.push({
                code: newCode,
                isUsed: false,
                orderIndexCondition: nextOrderIndex
            });
            return newCode;
        }

        return null;
    }

    public validateDiscountCode(code: string): boolean {
        const discount = this.discountCodes.find(d => d.code === code);

        // Code must exist, be unused, AND correspond to the CURRENT order slot
        // User race condition: If someone else stole the slot (orders.length increased), this code is now invalid.
        const currentNextOrder = this.orders.length + 1;

        if (discount && !discount.isUsed && discount.orderIndexCondition === currentNextOrder) {
            return true;
        }

        return false;
    }

    public markDiscountUsed(code: string): void {
        const discount = this.discountCodes.find(d => d.code === code);
        if (discount) {
            discount.isUsed = true;
        }
    }
}
