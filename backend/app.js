import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db.js';
import router from './routes/route.js';
import path from 'path';
import { fileURLToPath } from 'url';
import productRoutes from './routes/product.js';
import cartRoutes from './routes/cart.js';
import instrumentRoutes from './routes/r.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', router);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);

// Use the instrument routes
router.use('/r', instrumentRoutes);

// Serve uploads from the project uploads folder
const projectRoot = path.join(__dirname, '..');
const uploadsPath = path.join(projectRoot, 'uploads');
console.log('Serving uploads from:', uploadsPath);
app.use('/uploads', express.static(uploadsPath));

export default app;
