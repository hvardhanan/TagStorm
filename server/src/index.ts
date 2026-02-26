import express from 'express';
import cors from 'cors'
import { room } from './routes/room.js';
import { user } from './routes/user.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.use('/room', room);
app.use('/user', user);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})
