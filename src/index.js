import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import vendorRoutes from './routes/routes.js';
import path from 'path';

const app = express();
app.use(express.json())
const PORT = process.env.PORT || 5000;

app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: '30mb', extended: true }))
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }))
app.use(cors());
app.use(cookieParser());

// Define a route
app.use('/api', vendorRoutes);
// Start the server
app.listen(PORT, () => console.log(`server started successfully on ${PORT}`));
app.get('/', (req, res) => {
    res.send(`Server running on port: ${PORT}`);
});