# Resonance

Resonance is a full-stack web application designed for music-related services such as studio booking, instrument rentals, product purchasing, user authentication, and admin management. The platform provides a modern and seamless experience for both customers and administrators.

## Live Demo

View the project online: https://resonance-frontend-ouhc.onrender.com

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

## Notes

- The project includes a complete admin panel for content and service management
- The application is built as a full-stack demo and can be extended with additional features such as payments, notifications, and analytics

## License

This project is for educational and demonstration purposes.
