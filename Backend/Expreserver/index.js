import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pool from './db/postgres.js';
import productsRouter from './routes/products.js';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.use('/api/products', productsRouter);

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
})