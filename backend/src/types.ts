export interface Product {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
}

export interface CartItem {
    productId: string;
    quantity: number;
}

export interface Order {
    id: string;
    userId: string;
    items: { productId: string; price: number; quantity: number }[];
    totalAmount: number;
    discountParams?: {
        code: string;
        amount: number;
    };
    timestamp: Date;
}

export interface DiscountCode {
    code: string;
    isUsed: boolean;
    orderIndexCondition: number; // The 'n' value this code corresponds to (e.g., 3rd order, 6th order)
}
