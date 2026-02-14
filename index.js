import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './Routes/authRoutes.js';
import userRoutes from './Routes/userRoutes.js';
import questionRoutes from './Routes/questionRoutes.js';
import aiRoutes from './Routes/aiRoutes.js';


dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://algoflow-frontend.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);
app.use(express.json());


app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/ai', aiRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});