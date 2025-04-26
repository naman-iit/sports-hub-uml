import express, { Express, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import dbConnect from "./db/config";
import authRoutes from "./routes/authRoutes";
import openaiRoutes from "./routes/openaiRoutes";
import ticketmasterRoutes from "./routes/ticketmasterRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import stadiumRoutes from "./routes/stadiumRoutes";
import bookingRoutes from "./routes/bookingRoutes";

// Load environment variables
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 8080;

//connect to db
dbConnect();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/openai", openaiRoutes);
app.use("/api/events", ticketmasterRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/stadiums", stadiumRoutes);
app.use("/api/booking", bookingRoutes);

// Basic route
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Welcome to Sports Hub API" });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
