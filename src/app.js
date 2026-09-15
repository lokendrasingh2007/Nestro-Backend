import "dotenv/config";
import express from "express";
import cors from "cors";
// json parser
const server = express();
import { connectDB } from './config/connectDB.js';


//Router import
import categoryRouter from './routers/category.router.js';
import roomRouter from './routers/room.router.js';
import productRouter from "./routers/product.router.js";
import userRouter from "./routers/user.router.js";
import cartRouter from "./routers/cart.router.js";
import orderRouter from "./routers/order.router.js";
import colorRouter from "./routers/color.router.js";
import contactRouter from "./routers/contact.router.js";


import cookieParser from "cookie-parser";
server.use(cookieParser())
server.use(express.json());
const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "https://nestro-frentend.vercel.app",
    /^https:\/\/nestro-frentend.*\.vercel\.app$/,  // preview deployments
];

server.use(cors({
    origin: (origin, callback) => {
        // allow server-to-server requests (no origin) and allowed origins
        if (!origin || allowedOrigins.some(o =>
            typeof o === 'string' ? o === origin : o.test(origin)
        )) {
            callback(null, true);
        } else {
            callback(new Error(`CORS blocked: ${origin}`));
        }
    },
    credentials: true
}));

server.use("/api/category", categoryRouter)
server.use("/api/room-type", roomRouter)
server.use("/api/color", colorRouter)
server.use("/api/product", productRouter)
server.use("/api/user", userRouter)
server.use("/api/cart", cartRouter)
server.use("/api/order", orderRouter)
server.use("/api/contact", contactRouter)


connectDB()
server.listen(process.env.PORT, () => {
    console.log("Server is running on port 5000")
}) 

