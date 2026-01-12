# Uniblox - Ecommerce Store

A full-stack ecommerce application with discount code system. Clients can add items to cart, checkout, and apply discount codes. Every nth order (3rd order) gets a 10% discount code.

## Tech Stack

- **Backend**: Node.js, Express, TypeScript
- **Frontend**: React, Vite, TypeScript, Tailwind CSS
- **Storage**: In-memory (for assignment purposes)

## Local Development Setup

### Prerequisites

- **Node.js** 18 or higher
- **npm** (comes with Node.js)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd uniblox
```

### Step 2: Install Dependencies

You can install all dependencies at once:

```bash
npm run install:all
```

Or install them separately:

```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### Step 3: Run the Application

You need **two terminal windows** to run both frontend and backend:

**Terminal 1 - Start Backend:**
```bash
cd backend
npm run dev
```

The backend will start on: **http://localhost:3000**

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm run dev
```

The frontend will start on: **http://localhost:5173**

### Step 4: Access the Application

- **Frontend UI**: Open http://localhost:5173 in your browser
- **Backend API**: http://localhost:3000

### Alternative: Run from Root Directory

If you prefer running from the root directory:

```bash
# Terminal 1
npm run dev:backend

# Terminal 2
npm run dev:frontend
```

## Project Structure

```
uniblox/
├── backend/              # Express API server
│   ├── src/
│   │   ├── index.ts      # Main server file
│   │   ├── store.ts      # In-memory store logic
│   │   ├── types.ts      # TypeScript types
│   │   └── data/
│   │       └── products.json  # Product data
│   ├── package.json
│   └── tsconfig.json
├── frontend/             # React frontend
│   ├── src/
│   │   ├── App.tsx       # Main app component
│   │   ├── api.ts       # API client
│   │   ├── types.ts     # TypeScript types
│   │   ├── components/  # React components
│   │   └── utils/       # Utility functions
│   ├── package.json
│   └── vite.config.ts
├── package.json          # Root package.json
└── README.md
```

## API Documentation

All API endpoints are prefixed with `/api`. The backend runs on `http://localhost:3000` in development.

### Authentication

Most endpoints require a **Session ID** in the request header:
```
x-session-id: <your-session-id>
```

The frontend automatically generates and manages session IDs. For API testing (Postman), you can use any string as session ID (e.g., `test-session-123`).

---

### Client APIs

#### 1. Get All Products

**GET** `/api/products`

Get a list of all available products.

**Request:**
- No headers required
- No body required

**Response:**
```json
[
  {
    "id": "prod_1",
    "name": "Sony WH-1000XM5 Wireless Headphones",
    "price": 34800,
    "quantity": 10,
    "image": "https://..."
  },
  ...
]
```

---

#### 2. Get Cart Items

**GET** `/api/cart`

Get all items in the cart for the current session.

**Request Headers:**
```
x-session-id: <session-id>
```

**Response:**
```json
[
  {
    "productId": "prod_1",
    "quantity": 2
  },
  ...
]
```

---

#### 3. Add Item to Cart

**POST** `/api/cart`

Add an item to the cart or update quantity if item already exists.

**Request Headers:**
```
x-session-id: <session-id>
Content-Type: application/json
```

**Request Body:**
```json
{
  "productId": "prod_1",
  "quantity": 1
}
```

**Response:**
```json
{
  "message": "Item added to cart",
  "cart": [
    {
      "productId": "prod_1",
      "quantity": 1
    }
  ]
}
```

**Error Responses:**
- `400`: Missing session ID, invalid productId, or invalid quantity
- `404`: Product not found

---

#### 4. Validate Discount Code

**POST** `/api/discount/validate`

Validate a discount code before applying it to the cart.

**Request Headers:**
```
x-session-id: <session-id>
Content-Type: application/json
```

**Request Body:**
```json
{
  "code": "DISCOUNT_3_ABC123"
}
```

**Response (Valid):**
```json
{
  "valid": true,
  "discountPercentage": 0.1
}
```

**Response (Invalid):**
```json
{
  "valid": false,
  "message": "Discount code has already been used"
}
```

**Possible Error Messages:**
- "Discount code not found"
- "Discount code has already been used"
- "Discount code is not valid for this order"

---

#### 5. Checkout

**POST** `/api/checkout`

Create an order from cart items. Optionally apply a discount code.

**Request Headers:**
```
x-session-id: <session-id>
Content-Type: application/json
```

**Request Body:**
```json
{
  "discountCode": "DISCOUNT_3_ABC123"  // Optional
}
```

**Response:**
```json
{
  "message": "Order placed successfully",
  "order": {
    "id": "order_1234567890_abc123",
    "userId": "session-id",
    "items": [
      {
        "productId": "prod_1",
        "price": 34800,
        "quantity": 1
      }
    ],
    "totalAmount": 31320,
    "discountParams": {
      "code": "DISCOUNT_3_ABC123",
      "amount": 3480
    },
    "timestamp": "2026-01-12T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `400`: Missing session ID, empty cart, or invalid discount code

---

### Admin APIs

#### 6. Generate Discount Code

**POST** `/api/admin/discount/generate`

Generate a discount code if the next order will be the nth order (every 3rd order).

**Request Headers:**
```
x-session-id: <session-id>
```

**Request Body:**
- None required

**Response (Code Generated):**
```json
{
  "code": "DISCOUNT_3_ABC123",
  "discountPercentage": 0.1,
  "message": "Discount code generated successfully"
}
```

**Response (Not Available):**
```json
{
  "code": null,
  "message": "Discount code not available. Next order is not the nth order."
}
```

**Note:** The discount code is only generated if the next order number is a multiple of 3 (configurable via `NTH_ORDER` in `backend/src/store.ts`).

---

#### 7. Get Statistics

**GET** `/api/admin/stats`

Get store statistics including total orders, purchase amount, discount codes, and discount amounts.

**Request Headers:**
```
x-session-id: <session-id>
```

**Response:**
```json
{
  "totalOrders": 5,
  "totalPurchaseAmount": 250000,
  "discountCodes": [
    {
      "code": "DISCOUNT_3_ABC123",
      "isUsed": true,
      "orderIndexCondition": 3
    },
    {
      "code": "DISCOUNT_6_XYZ789",
      "isUsed": false,
      "orderIndexCondition": 6
    }
  ],
  "totalDiscountAmount": 5000
}
```

---

## API Testing with Postman

A Postman collection file (`Uniblox_API.postman_collection.json`) is included in the root directory. 

### Importing the Collection

1. Open Postman
2. Click **Import** button
3. Select `Uniblox_API.postman_collection.json`
4. The collection will be imported with all endpoints pre-configured

### Using the Collection

1. **Set Environment Variable:**
   - Create a new environment in Postman
   - Add variable: `sessionId` with value: `test-session-123` (or any string)
   - Use this environment for all requests

2. **Update Base URL:**
   - The collection uses `{{baseUrl}}` variable
   - Set `baseUrl` to `http://localhost:3000` in your environment

3. **Session ID:**
   - All requests (except `/api/products`) require `x-session-id` header
   - The collection automatically uses the `{{sessionId}}` variable

### Testing Flow

1. **Get Products** - Verify products are available
2. **Add to Cart** - Add items to cart
3. **Get Cart** - Verify items in cart
4. **Generate Discount Code** (Admin) - Generate code if next order is nth
5. **Validate Discount Code** - Validate the generated code
6. **Checkout** - Place order with or without discount code
7. **Get Stats** (Admin) - View statistics

---

## Discount Code System

### How It Works

- **Every 3rd order** gets a discount code opportunity (configurable via `NTH_ORDER` in `backend/src/store.ts`)
- Discount code provides **10% discount** on the entire order (configurable via `DISCOUNT_PERCENTAGE`)
- Discount code can only be used **once** and only for the specific nth order it was generated for
- If a discount code is not used for its nth order, it becomes invalid for future orders

### Flow

1. Admin/User requests discount code via `/api/admin/discount/generate`
2. If next order is nth order → code is generated
3. User applies code in cart → validates via `/api/discount/validate`
4. User checks out → code is validated again and marked as used
5. Next nth order gets a new discount code

---

## Important Notes

- **In-Memory Storage**: All data (products, carts, orders, discount codes) is stored in-memory and resets when the server restarts
- **Session-Based Carts**: Each session ID has its own cart. Use the same session ID to maintain cart state
- **No Stock Management**: The assignment doesn't require stock management, so products can be added to cart without stock validation
- **Discount Code Validation**: Discount codes are validated twice - once when applying to cart, and again during checkout to prevent race conditions

---

## Troubleshooting

### Backend won't start
- Check if port 3000 is already in use
- Verify Node.js version: `node --version` (should be 18+)
- Check backend logs for errors

### Frontend won't start
- Check if port 5173 is already in use
- Verify all dependencies are installed: `cd frontend && npm install`
- Check browser console for errors

### API requests failing
- Ensure backend is running on port 3000
- Check that `x-session-id` header is included (for cart/checkout endpoints)
- Verify request body format matches API documentation

### Products not loading
- Check backend is running
- Verify CORS is enabled (should be automatic)
- Check browser network tab for errors

---

## License

ISC
