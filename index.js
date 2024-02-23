import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import vendorRoutes from './routes/routes.js';
import path from 'path';

dotenv.config();
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
// Serve static files from the 'public' directory
const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);
app.use('/public', express.static(path.join(__dirname, '../public')));
// Start the server
app.listen(PORT, () => console.log(`server started successfully on ${PORT}`));