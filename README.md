# InternTaskV — E-Commerce Platform

A full-stack e-commerce application built with **Koa.js**, **React 19**, **TypeScript**, and **PostgreSQL**. The platform supports three user roles (Buyer, Seller, Admin) with product management, shopping cart, order processing, real-time notifications via SSE, email notifications, and Khalti payment integration.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [User Roles & Permissions](#user-roles--permissions)
- [Payment Integration](#payment-integration)
- [Order Status Lifecycle](#order-status-lifecycle)

---

## Features

### For Buyers

- Register and log in with JWT authentication
- Browse products with category filtering and pagination
- Add/remove products to/from shopping cart
- Place orders and track order status in real time
- Khalti payment gateway integration
- Real-time order notifications via Server-Sent Events (SSE)
- View full order history and cancel pending orders

### For Sellers

- Full product CRUD (Create, Read, Update, Delete)
- Image upload and management (up to 12 images per product, processed with Sharp)
- View all orders containing their products
- Update order item status: `PENDING` → `PROCESSING` → `SHIPPED` → `COMPLETED` / `DECLINE`
- Real-time notifications for new orders

### For Admins

- User management: view, edit, hard-delete, and enable/disable accounts
- Full product management: view, edit, hard-delete any product
- View all carts, orders, and payments platform-wide
- Update any order's status

### Platform-wide

- JWT-based authentication with role-based access control (RBAC)
- Soft-delete for users and products
- Email notifications for order placement (Nodemailer)
- Request body and query validation with Yup
- Structured logging with Winston (console, file, and exception transports)
- Image serving via static file middleware

---

## Tech Stack

### Backend

| Concern          | Library / Tool                    |
| ---------------- | --------------------------------- |
| Runtime          | Node.js                           |
| Framework        | Koa.js 3                          |
| Language         | TypeScript 5                      |
| Database         | PostgreSQL                        |
| ORM              | Prisma 7                          |
| Auth             | koa-jwt + jsonwebtoken + bcryptjs |
| Validation       | Yup                               |
| File Upload      | @koa/multer + Multer 2            |
| Image Processing | Sharp                             |
| Email            | Nodemailer                        |
| Logging          | Winston                           |
| HTTP Client      | Axios                             |

### Frontend

| Concern       | Library / Tool     |
| ------------- | ------------------ |
| Framework     | React 19           |
| Build Tool    | Vite 8             |
| Language      | TypeScript 6       |
| Styling       | Tailwind CSS 4     |
| Routing       | React Router DOM 7 |
| HTTP Client   | Axios              |
| Notifications | React Toastify     |
| JWT Parsing   | jwt-decode         |

---

## Project Structure

```
InternTaskV/
├── frontend/                   # React + Vite frontend
│   └── src/
│       ├── components/         # Reusable UI components (Navbar, ProtectedRoute, Admin tabs, etc.)
│       ├── context/            # React context (AuthContext)
│       ├── lib/                # Axios instance configuration
│       └── pages/              # Page-level route components
├── src/                        # Koa.js backend
│   ├── controller/             # Route handler functions
│   ├── middleware/             # Validation & auth middleware
│   ├── prisma/                 # Prisma schema, migrations, seed data
│   ├── routes/
│   │   ├── public/             # Unauthenticated routes
│   │   └── private/            # JWT-protected routes (user / seller / admin)
│   ├── service/                # Database access layer (one file per model)
│   ├── types/                  # Shared TypeScript types and AppError class
│   ├── utils/                  # Helpers, logger, order lifecycle utilities
│   └── validation/             # Yup schemas for env vars and request bodies
├── public/uploads/             # Uploaded product images (served statically)
├── logs/                       # Winston log files (gitignored)
├── prisma.config.ts            # Prisma configuration
└── .env                        # Environment variables (not committed)
```

---

## Prerequisites

- Node.js 20+
- PostgreSQL 14+
- npm 10+

---

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd InternTaskV
   ```

2. **Install backend dependencies**

   ```bash
   npm install
   ```

3. **Install frontend dependencies**

   ```bash
   cd frontend && npm install && cd ..
   ```

4. **Configure environment variables**

   ```bash
   cp .env.example .env
   # Fill in the values described in the Environment Variables section
   ```

---

## Environment Variables

Create a `.env` file in the project root:

```env
# Server
SERVER_PORT=3000

# PostgreSQL
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/<dbname>"

# JWT secret — minimum 32 characters
SECRET_KEY="your-32-char-minimum-secret-key-here"

# Frontend origin (used for CORS and payment redirect URLs)
FRONTEND_URL="http://localhost:5173"

# Email — example uses Mailtrap sandbox
EMAIL_HOST=sandbox.smtp.mailtrap.io
EMAIL_PORT=587
EMAIL_USERNAME=your_mailtrap_username
EMAIL_PASSWORD=your_mailtrap_password

# Khalti payment gateway
KHALTI_API="https://dev.khalti.com/api/v2/epayment/initiate/"
KHALTI_KEY="key your_khalti_secret_key"
KHALTI_VERIFY_API="https://dev.khalti.com/api/v2/epayment/lookup/"
```

---

## Database Setup

1. **Run migrations**

   ```bash
   npx prisma migrate dev
   ```

2. **Seed the database** — creates demo users, products, carts, orders, and payments

   ```bash
   npx tsx src/prisma/seed.ts
   ```

   Default seed credentials:

   | Role   | Email           | Password  |
   | ------ | --------------- | --------- |
   | Admin  | admin@email.com | Admin@123 |
   | Seller | user1@email.com | User1@123 |
   | Buyer  | user8@email.com | User8@123 |

3. **Regenerate the Prisma client** (run after any schema change)

   ```bash
   npx prisma generate
   ```

---

## Running the Application

### Development

Run the backend and frontend in separate terminals:

```bash
# Backend (hot reload via nodemon + tsx)
npm run dev

# Frontend (from the frontend/ directory)
cd frontend
npm run dev
```

- Backend: `http://localhost:3000`
- Frontend: `http://localhost:5173`

### Production Build

```bash
# Compile backend TypeScript
npm run build

# Build frontend assets
cd frontend && npm run build
```

---

## API Endpoints

All routes are prefixed with `/api`.

### Public — `/api/public`

| Method | Path                     | Description                                              |
| ------ | ------------------------ | -------------------------------------------------------- |
| `POST` | `/login`                 | Authenticate and receive a JWT                           |
| `POST` | `/register`              | Register a new user account                              |
| `GET`  | `/products`              | List products (`page`, `limit`, `category` query params) |
| `GET`  | `/products/:id`          | Get a single product                                     |
| `GET`  | `/users/:id/products`    | List products by a specific seller                       |
| `GET`  | `/image?filename=<name>` | Serve a product image file                               |

### Private User — `/api` (JWT required)

| Method   | Path                     | Description                             |
| -------- | ------------------------ | --------------------------------------- |
| `PATCH`  | `/users`                 | Update own profile (name, email)        |
| `PATCH`  | `/users/change-password` | Change own password                     |
| `DELETE` | `/users/account`         | Soft-delete own account                 |
| `GET`    | `/users/carts`           | View own cart                           |
| `PATCH`  | `/users/carts/:id`       | Add a product to cart                   |
| `DELETE` | `/users/carts/:id`       | Remove a product from cart              |
| `GET`    | `/users/orders`          | List own orders                         |
| `POST`   | `/users/orders`          | Place a new order from cart             |
| `DELETE` | `/users/orders/:id`      | Cancel a pending order                  |
| `GET`    | `/payment`               | Initiate a Khalti payment               |
| `GET`    | `/payment/check`         | Verify Khalti payment status (`?pidx=`) |
| `GET`    | `/notifications/stream`  | SSE stream for real-time notifications  |

### Seller — `/api` (JWT + `SELLER` role)

| Method   | Path                          | Description                                          |
| -------- | ----------------------------- | ---------------------------------------------------- |
| `POST`   | `/products/`                  | Add a new product                                    |
| `GET`    | `/products/`                  | List own products                                    |
| `PATCH`  | `/products/:id`               | Update own product details                           |
| `PUT`    | `/products/:id/upload-images` | Upload images (`multipart/form-data`, field `photo`) |
| `DELETE` | `/products/:id`               | Soft-delete own product                              |
| `GET`    | `/orders`                     | List all orders containing own products              |
| `PATCH`  | `/orders/update`              | Update an order item's status                        |

### Admin — `/api/admin` (JWT + `ADMIN` role)

| Method   | Path                | Description                  |
| -------- | ------------------- | ---------------------------- |
| `GET`    | `/users`            | List all users               |
| `PATCH`  | `/users/:id`        | Edit any user                |
| `PATCH`  | `/users/:id/enable` | Re-enable a disabled account |
| `DELETE` | `/users/:id`        | Hard-delete a user           |
| `GET`    | `/products`         | List all products            |
| `PATCH`  | `/products/:id`     | Edit any product             |
| `DELETE` | `/products/:id`     | Hard-delete a product        |
| `GET`    | `/carts`            | List all carts               |
| `GET`    | `/orders`           | List all orders              |
| `PATCH`  | `/orders/:id`       | Update any order             |
| `GET`    | `/payments`         | List all payments            |

---

## User Roles & Permissions

| Permission                 | Buyer | Seller | Admin |
| -------------------------- | :---: | :----: | :---: |
| Browse products            |   ✓   |   ✓    |   ✓   |
| Manage own cart            |   ✓   |   —    |   —   |
| Place / cancel orders      |   ✓   |   —    |   —   |
| Initiate & verify payment  |   ✓   |   —    |   —   |
| Manage own products        |   —   |   ✓    |   —   |
| Update order item status   |   —   |   ✓    |   —   |
| Manage all users           |   —   |   —    |   ✓   |
| Manage all products        |   —   |   —    |   ✓   |
| View all orders & payments |   —   |   —    |   ✓   |

---

## Payment Integration

The platform integrates with the **Khalti** payment gateway (sandbox by default).

**Flow:**

1. Authenticated buyer calls `GET /api/payment` — the server initiates a Khalti transaction and returns a `payment_url`.
2. Buyer is redirected to the Khalti-hosted payment page.
3. On return, the frontend calls `GET /api/payment/check?pidx=<pidx>`.
4. The server verifies the transaction with Khalti and updates the payment record:
   - `Completed` → `PaymentStatus.SUCCESS`
   - Any other outcome → `PaymentStatus.FAILED` or `CANCELLED`

To use production Khalti, replace `KHALTI_API` and `KHALTI_VERIFY_API` with the live URLs and provide a live `KHALTI_KEY`.

---

## Order Status Lifecycle

### Overall Order

```
PENDING → PROCESSING → SHIPPING → COMPLETED
PENDING → PROCESSING → DECLINED
PENDING → DECLINED
```

### Order Item (per seller)

```
PENDING → PROCESSING → SHIPPED → COMPLETED
PENDING  → DECLINE
PROCESSING → DECLINE
```

The overall order status is automatically recalculated whenever a seller updates an order item — once all items reach a terminal state the order advances accordingly.
