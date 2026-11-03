# 🛒 Cartiva – MERN E-Commerce Platform

<p align="center">
  <strong>A Full-Stack E-Commerce Platform Built with the MERN Stack</strong>
</p>

<p align="center">
  A modern shopping platform with secure authentication, product management, order processing, online payments, and a comprehensive admin dashboard.
</p>

---

## 📌 Overview

**Cartiva** is a full-stack e-commerce web application developed using the MERN stack (MongoDB, Express.js, React.js, and Node.js).

The platform provides customers with a seamless online shopping experience, allowing them to explore products, manage their shopping carts, place orders, make online payments, and track their purchases.

It also includes a dedicated admin dashboard that enables administrators to manage products, categories, coupons, orders, and customers through a centralized interface.

The project focuses on building a practical, scalable, and secure e-commerce application using modern full-stack development practices.

## ✨ Features

### 👤 Customer Features

- User registration and login.
- Email verification using 6-digit OTP.
- Secure password hashing and JWT authentication.
- Browse and search products.
- View detailed product information.
- Shopping cart management.
- Wishlist management.
- Address management.
- Apply discount coupons.
- Secure checkout process.
- Online payment integration using Razorpay.
- Order history and order confirmation.
- Product reviews and ratings.
- Responsive user interface.

### 🛠️ Admin Dashboard

- Admin authentication and protected routes.
- Dashboard for centralized management.
- Product management (Create, Read, Update, Delete).
- Category management.
- Coupon management.
- Order management and status updates.
- Customer management.
- Activate and deactivate products, categories, and customers.
- Search, filtering, sorting, and pagination.
- View detailed product, order, and customer information.

## 🧰 Tech Stack

### Frontend
- React.js
- Vite
- Tailwind CSS v4
- React Router
- Axios
- Lucide React

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Tokens (JWT)
- Bcrypt
- Nodemailer
- Zod

### Payment Integration
- Razorpay

### Development Tools
- Visual Studio Code
- Postman
- Git and GitHub
- MongoDB Atlas
- npm

## 🏗️ Project Architecture

Cartiva follows a client-server architecture.

```text
                 CARTIVA E-COMMERCE
                         |
          +--------------+--------------+
          |                             |
     FRONTEND                       BACKEND
          |                             |
    React + Vite                 Node.js + Express
          |                             |
    React Router                 REST API
          |                             |
    Axios                         Middleware
          |                             |
          +-------------+---------------+
                        |
                   MongoDB Atlas
                        |
               Persistent Database
                        |
          +-------------+-------------+
          |                           |
     Razorpay                     Nodemailer
   Payment Gateway               Email OTP
```

## 📂 Project Structure

```text
cartiva-ecommerce-platform/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routers/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   │
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md
```

## ⚙️ Getting Started

Follow these instructions to run Cartiva locally.

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- MongoDB Atlas account
- Git
- Razorpay account (for payment integration)
- Gmail account with an App Password (for OTP emails)

### 1. Clone the Repository

```bash
git clone https://github.com/Prajwalbabuks/cartiva-ecommerce-platform.git
```

Navigate into the project:

```bash
cd cartiva-ecommerce-platform
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the backend directory using `.env.example` as a reference.

Configure the following environment variables:

```env
NODE_ENV=development
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=your_jwt_expiry

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

EMAIL_USER=your_email@gmail.com
EMAIL_APP_PASSWORD=your_gmail_app_password

FRONTEND_URL=http://localhost:5173
```

Start the backend development server:

```bash
npm run dev
```

Backend runs at:

```text
http://localhost:5000
```

### 3. Frontend Setup

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file using the frontend `.env.example` file.

Configure:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

Start the frontend development server:

```bash
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

## 🔐 Authentication and Security

Cartiva implements several authentication and security mechanisms:

- JWT-based authentication.
- Password hashing using Bcrypt.
- Email verification using time-limited OTP.
- Protected customer and admin routes.
- Role-based access control.
- Backend request validation using Zod.
- Environment variables for sensitive configuration.
- Centralized error handling.

## 💳 Payment Integration

Cartiva integrates Razorpay to support online payments.

The payment workflow includes:

1. Customer proceeds to checkout.
2. Backend creates a Razorpay order.
3. Frontend initiates the payment process.
4. Customer completes payment.
5. Backend verifies payment details.
6. Order processing continues after successful verification.

**Note:** Razorpay credentials and payment verification must remain on the backend. Never expose the Razorpay secret in frontend code.

## 🌐 Deployment

Planned deployment architecture:

| Component | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB Atlas |
| Payment Gateway | Razorpay |
| Email Service | Gmail SMTP |

Production environment variables must be configured through the respective hosting platforms.

## 📸 Screenshots

Screenshots of the application will be added here.

Suggested screenshots:

- Home page
- Product listing page
- Product details
- Shopping cart
- Checkout page
- Email verification page
- Customer order history
- Admin dashboard
- Product management
- Order management
- Customer management

## 🚀 Future Improvements

Potential enhancements for future versions:

- Product recommendation system.
- AI-powered product search.
- Personalized shopping experience.
- Real-time order notifications.
- Advanced analytics for administrators.
- Improved inventory management.

## 🎯 Learning Outcomes

Through this project, I gained practical experience in:

- Full-stack application development using MERN.
- REST API design and implementation.
- MongoDB database modelling.
- Authentication and authorization.
- React component architecture and state management.
- Payment gateway integration.
- Email communication using Nodemailer.
- Admin dashboard development.
- API testing using Postman.
- Git and GitHub version control.
- Preparing applications for cloud deployment.

## 👨‍💻 Author

**Prajwal Babu K S**

Computer Science and Engineering Student

The National Institute of Engineering, Mysuru

- GitHub: [@Prajwalbabuks](https://github.com/Prajwalbabuks)

---

<p align="center">
  <strong>Cartiva – Shop Smart. Shop with Cartiva.</strong>
</p>

<p align="center">
  Built with ❤️ using the MERN Stack.
</p>
