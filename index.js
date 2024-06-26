import dotenv from "dotenv";
dotenv.config();
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";
import vendorRoutes from "./routes/routes.js";
import path from "path";
const app = express();
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 5000;
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());
app.use(cookieParser());

// Define a route
app.use("/api", vendorRoutes);
// Serve static files from the 'public' directory
const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);
app.use("/public", express.static(path.join(__dirname, "../public")));
// Start the server
app.listen(PORT, () => console.log(`server started successfully on ${PORT}`));
