import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { Store } from './store';

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
