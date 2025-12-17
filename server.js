import express from 'express';
import cors from 'cors';
import mongose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
// ✅ CORS (SOLO UNA VEZ)
app.use(cors({
  origin: "*",
  credentials: true
}));

app.use(express.json());
