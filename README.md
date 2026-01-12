# Uniblox - Ecommerce Store

A full-stack ecommerce application with discount code system.

## Features

- Product listing and browsing
- Shopping cart functionality
- Checkout with discount code validation
- Admin APIs for discount code generation and statistics
- Every nth order (3rd order) gets a 10% discount code

## Tech Stack

- **Backend**: Node.js, Express, TypeScript
- **Frontend**: React, Vite, TypeScript, Tailwind CSS
- **Storage**: In-memory (for assignment purposes)

## Project Structure

```
uniblox/
├── backend/          # Express API server
│   └── src/
│       ├── index.ts  # Main server file
│       ├── store.ts  # In-memory store logic
│       └── types.ts  # TypeScript types
├── frontend/         # React frontend
│   └── src/
│       ├── App.tsx
│       ├── api.ts    # API client
│       └── components/
└── package.json      # Root package.json for deployment
```

## Local Development

### Prerequisites
- Node.js 18+ 
- npm

### Running Locally

**Option 1: Run separately (recommended for development)**

Terminal 1 - Backend:
```bash
cd backend
npm install
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm install
npm run dev
```

**Option 2: Run from root**
```bash
npm run install:all
npm run dev:backend    # Terminal 1
npm run dev:frontend   # Terminal 2
```

- Backend runs on: http://localhost:3000
- Frontend runs on: http://localhost:5173

## Deployment on Render

This project is configured to deploy as a **single web service** on Render.

### Setup Steps:

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Create Web Service on Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Render will auto-detect the `render.yaml` file

3. **Or Manual Configuration:**
   - **Root Directory**: Leave empty (root of repo)
   - **Build Command**: 
     ```bash
     cd backend && npm install && cd ../frontend && npm install && npm run build && cd ../backend && npm run build
     ```
   - **Start Command**: 
     ```bash
     cd backend && npm start
     ```
   - **Environment**: Node
   - **Environment Variables**:
     - `NODE_ENV=production`

### How It Works

- In **development**: Frontend and backend run separately
- In **production**: 
  - Backend serves API routes at `/api/*`
  - Backend serves built frontend static files at root
  - Single service, single URL

## API Endpoints

### Client APIs
- `GET /api/products` - Get all products
- `POST /api/cart` - Add item to cart (TODO)
- `GET /api/cart` - Get cart items (TODO)
- `POST /api/checkout` - Checkout with discount code (TODO)

### Admin APIs
- `POST /api/admin/discount/generate` - Generate discount code (TODO)
- `GET /api/admin/stats` - Get statistics (TODO)

## Notes

- Data is stored in-memory and resets on server restart
- Discount codes are generated for every 3rd order (configurable via `NTH_ORDER` in store.ts)
- Discount code applies 10% discount to entire order

## License

ISC
