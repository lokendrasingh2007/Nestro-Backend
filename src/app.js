
import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { connectDB } from "./config/connectDB.js";

// Router imports
import categoryRouter from "./routers/category.router.js";
import roomRouter from "./routers/room.router.js";
import productRouter from "./routers/product.router.js";
import userRouter from "./routers/user.router.js";
import cartRouter from "./routers/cart.router.js";
import orderRouter from "./routers/order.router.js";
import colorRouter from "./routers/color.router.js";
import contactRouter from "./routers/contact.router.js";

const server = express();

// Allowed frontend origins
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "https://nestro-frontend.vercel.app",
];

// CORS configuration
server.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests from Postman and other clients
      // that do not send an Origin header.
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware
server.use(cookieParser());
server.use(express.json());

// Health check route
server.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Nestro Backend is running successfully",
  });
});

// API routes
server.use("/api/category", categoryRouter);
server.use("/api/room-type", roomRouter);
server.use("/api/color", colorRouter);
server.use("/api/product", productRouter);
server.use("/api/user", userRouter);
server.use("/api/cart", cartRouter);
server.use("/api/order", orderRouter);
server.use("/api/contact", contactRouter);

// Database connection
connectDB();

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});