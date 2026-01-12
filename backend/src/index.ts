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
