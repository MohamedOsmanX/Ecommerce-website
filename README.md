# E-Shop E-Commerce Platform

A full-stack e-commerce platform built with Node.js, Express, and PostgreSQL.

## Features

- User authentication (login/register)
- Product management
- Shopping cart functionality
- Order management
- Admin dashboard
- Responsive design

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- PostgreSQL
- npm (Node Package Manager)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/e-shop.git
cd e-shop
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
- Create a PostgreSQL database
- Update the `.env` file with your database credentials:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/your_database_name"
JWT_SECRET="your_jwt_secret_key"
```

4. Run database migrations:
```bash
npx prisma migrate dev
```

5. Start the server:
```bash
node index.js
```

The server will start on `http://localhost:8080`

## Project Structure

```
e-shop/
├── Controllers/         # Route controllers
├── Routes/             # API routes
├── middleware/         # Custom middleware
├── frontend/          # Frontend files
│   ├── js/            # JavaScript files
│   ├── css/           # CSS files
│   └── *.html         # HTML pages
├── prisma/            # Database schema and migrations
├── .env               # Environment variables
├── index.js           # Main server file
└── package.json       # Project dependencies
```

## API Endpoints

### Authentication
- POST `/auth/register` - Register a new user
- POST `/auth/login` - Login user
- GET `/users/profile` - Get user profile

### Products
- GET `/product` - Get all products
- GET `/product/:id` - Get product by ID
- POST `/product` - Create new product (admin only)
- PUT `/product/:id` - Update product (admin only)
- DELETE `/product/:id` - Delete product (admin only)

### Cart
- GET `/cart` - Get user's cart
- POST `/cart/add` - Add item to cart
- PUT `/cart/:id` - Update cart item
- DELETE `/cart/:id` - Remove item from cart

### Orders
- POST `/orders` - Create new order
- GET `/orders` - Get user's orders
- GET `/orders/all` - Get all orders (admin only)
- PUT `/orders/:id/status` - Update order status (admin only)

## Frontend Pages

- `index.html` - Homepage
- `products.html` - Product listing
- `cart.html` - Shopping cart
- `checkout.html` - Checkout process
- `admin-products.html` - Product management (admin)
- `admin-orders.html` - Order management (admin)

## Environment Variables

Create a `.env` file in the root directory with the following variables:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/your_database_name"
JWT_SECRET="your_jwt_secret_key"
PORT=8080
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Your Name - your.email@example.com

Project Link: [https://github.com/yourusername/e-shop](https://github.com/yourusername/e-shop) 