# Resonance

Resonance is a full-stack web application designed for music-related services such as studio booking, instrument rentals, product purchasing, user authentication, and admin management. The platform provides a modern and seamless experience for both customers and administrators.

## Overview

Resonance brings together several core features into one integrated system:

- User registration, login, password reset, and email verification
- Profile management and user activity tracking
- Studio booking and rental services
- Product browsing, cart management, and checkout
- Collaboration hub with posts, comments, likes, and replies
- Admin dashboard for users, bookings, products, studios, and rewards
- Image upload support for products, studios, and instruments

## Project Goals

The main purpose of this project is to build a complete, responsive, and functional online platform for a music-centered business. It demonstrates full-stack development skills using a modern frontend framework and a RESTful backend API backed by MongoDB.

## Tech Stack

### Frontend
- React
- Vite
- React Router
- Tailwind CSS
- Axios
- Zustand
- React Toastify

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Multer for image upload handling
- Nodemailer for email services

## Project Structure

```text
backend/
  controllers/
  middleware/
  models/
  routes/
  config/
  utils/
  app.js
  index.js

frontend/
  src/
    components/
    pages/
    context/
    store/
    api/
    utils/
```

## Key Features

### Customer Features
- Browse and view products
- Add products to cart
- Place orders and complete checkout
- Book studios and view studio details
- Rent instruments
- Manage personal profile
- Participate in collaboration discussions

### Admin Features
- Manage users
- Manage products
- Manage studios
- Manage instruments
- Manage bookings
- Manage rewards and points
- Manage site information and content

## Prerequisites

Before running the project locally, make sure you have:

- Node.js installed
- MongoDB running or a MongoDB Atlas connection string
- A mail service configured if you want email functionality

## Environment Variables

Create a `.env` file in the project root for the backend with the following variables:

```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
CLIENT_URL=http://localhost:5173
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
EMAIL_FROM=your_email
EMAIL_FROM_NAME=Resonance
```

Create a `.env` file inside the frontend directory for the frontend:

```env
VITE_API_URL=http://localhost:5001/api
```

## Installation

### 1. Install backend dependencies

```bash
npm install
```

### 2. Install frontend dependencies

```bash
cd frontend
npm install
```

## Running the Application Locally

### Start the backend

From the project root:

```bash
npm run dev
```

### Start the frontend

From the frontend folder:

```bash
cd frontend
npm run dev
```

The frontend will usually run at:

```text
http://localhost:5173
```

The backend will run at:

```text
http://localhost:5001
```

## Deployment Notes

This project is configured to work with separate frontend and backend deployments. For production:

- Set the frontend environment variable `VITE_API_URL` to the deployed backend URL
- Ensure the backend has access to MongoDB and email credentials
- Make sure uploaded image files are stored in a persistent location

## Notes

- Uploaded images are stored in the `uploads` directory and served from the backend
- The project includes a complete admin panel for content and service management
- The application is built as a full-stack demo and can be extended with additional features such as payments, notifications, and analytics

## License

This project is for educational and demonstration purposes.
