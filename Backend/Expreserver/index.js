import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import pool from './db/postgres.js';
import productsRouter from './routes/products.js';
import authRouter from './routes/auth.js';
// import paymentsRouter from './routes/payments.js';

const app = express();
const port = 3000;

// credentials: true is required so the browser sends the httpOnly refresh-token
// cookie on cross-origin requests (e.g. Vite dev server → Express)
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
// cookie-parser lets Express read req.cookies (our httpOnly refreshToken cookie lives here)
app.use(cookieParser());

app.use('/api/products', productsRouter);
app.use('/api/auth', authRouter);
// Payments routes: create orders, verify payments, get payment history
// app.use('/api/payments', paymentsRouter);

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});
