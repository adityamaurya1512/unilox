import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { Store } from './store';
import type { Order } from './types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// CORS - allow all origins in development, restrict in production if needed
app.use(cors());
app.use(express.json());

// --- API Routes ---

// Get all products
app.get('/api/products', (req, res) => {
    const store = Store.getInstance();
    res.json(store.getProducts());
});

// Get cart items for a session
app.get('/api/cart', (req, res) => {
    const sessionId = req.headers['x-session-id'] as string;
    if (!sessionId) {
        return res.status(400).json({ error: 'Session ID required' });
    }
    const store = Store.getInstance();
    const cartItems = store.getCart(sessionId);
    res.json(cartItems);
});

// Add item to cart
app.post('/api/cart', (req, res) => {
    const sessionId = req.headers['x-session-id'] as string;
    if (!sessionId) {
        return res.status(400).json({ error: 'Session ID required' });
    }
    
    const { productId, quantity } = req.body;
    if (!productId || !quantity || quantity <= 0) {
        return res.status(400).json({ error: 'productId and quantity (positive) are required' });
    }
    
    const store = Store.getInstance();
    const product = store.getProduct(productId);
    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }
    
    // No stock management - assignment doesn't require it
    store.addToCart(sessionId, productId, quantity);
    res.json({ message: 'Item added to cart', cart: store.getCart(sessionId) });
});

// --- Admin APIs ---

// Generate discount code if condition is satisfied (Admin API)
app.post('/api/admin/discount/generate', (req, res) => {
    const store = Store.getInstance();
    const code = store.generateDiscountCode();
    
    if (code) {
        res.json({ 
            code, 
            discountPercentage: store.DISCOUNT_PERCENTAGE,
            message: 'Discount code generated successfully' 
        });
    } else {
        res.json({ 
            code: null, 
            message: 'Discount code not available. Next order is not the nth order.' 
        });
    }
});

// Get statistics (Admin API)
app.get('/api/admin/stats', (req, res) => {
    const store = Store.getInstance();
    const stats = store.getStats();
    res.json(stats);
});

// --- Client APIs ---

// Validate discount code (for preview before checkout)
app.post('/api/discount/validate', (req, res) => {
    const { code } = req.body;
    if (!code) {
        return res.status(400).json({ error: 'Discount code is required' });
    }
    
    const store = Store.getInstance();
    const validation = store.validateDiscountCode(code);
    
    if (validation.valid) {
        res.json({ 
            valid: true, 
            discountPercentage: store.DISCOUNT_PERCENTAGE 
        });
    } else {
        res.json({ 
            valid: false, 
            message: validation.reason || 'Invalid or expired discount code' 
        });
    }
});

// Checkout - Create order with discount code validation
app.post('/api/checkout', (req, res) => {
    const sessionId = req.headers['x-session-id'] as string;
    if (!sessionId) {
        return res.status(400).json({ error: 'Session ID required' });
    }
    
    const { discountCode } = req.body;
    const store = Store.getInstance();
    const cartItems = store.getCart(sessionId);
    
    if (cartItems.length === 0) {
        return res.status(400).json({ error: 'Cart is empty' });
    }
    
    // Calculate order total
    let subtotal = 0;
    const orderItems = [];
    
    for (const item of cartItems) {
        const product = store.getProduct(item.productId);
        if (!product) {
            return res.status(404).json({ error: `Product ${item.productId} not found` });
        }
        
        const itemTotal = product.price * item.quantity;
        subtotal += itemTotal;
        orderItems.push({
            productId: product.id,
            price: product.price,
            quantity: item.quantity
        });
    }
    
    // Validate and apply discount code if provided
    let discountAmount = 0;
    if (discountCode) {
        const validation = store.validateDiscountCode(discountCode);
        if (!validation.valid) {
            return res.status(400).json({ 
                error: validation.reason || 'Invalid or expired discount code' 
            });
        }
        
        discountAmount = subtotal * store.DISCOUNT_PERCENTAGE;
        store.markDiscountUsed(discountCode);
    }
    
    const totalAmount = subtotal - discountAmount;
    
    // Create order
    const order: Order = {
        id: `order_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        userId: sessionId,
        items: orderItems,
        totalAmount,
        timestamp: new Date(),
        ...(discountCode && {
            discountParams: {
                code: discountCode,
                amount: discountAmount
            }
        })
    };
    
    store.createOrder(order);
    store.clearCart(sessionId);
    
    res.json({
        message: 'Order placed successfully',
        order
    });
});

// --- Serve Frontend (Production) ---
// In production, serve the built frontend static files
if (process.env.NODE_ENV === 'production') {
    const frontendDistPath = path.join(__dirname, '../../frontend/dist');
    app.use(express.static(frontendDistPath));
    
    // Catch all handler: send back React's index.html file for client-side routing
    app.get('*', (req, res) => {
        res.sendFile(path.join(frontendDistPath, 'index.html'));
    });
}

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    if (process.env.NODE_ENV === 'production') {
        console.log('Serving frontend from static files');
    }
});
