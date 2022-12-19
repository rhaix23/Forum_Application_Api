// Import dependencies
import express, { Request, Response } from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import compression from "compression";
import "express-async-errors";
dotenv.config();

// Import custom middleware
import { errorHandler } from "./middleware/errorHandler.js";
import { notFound } from "./middleware/notFoundHandler.js";

// Import database
import { connectDB } from "./database/db.js";

// Import routes
import { userRouter } from "./routes/userRoutes.js";
import { categoryRouter } from "./routes/categoryRoutes.js";
import { subcategoryRouter } from "./routes/subcategoryRoutes.js";
import { postRouter } from "./routes/postRoutes.js";
import { commentRouter } from "./routes/commentRoutes.js";
import { ratingRouter } from "./routes/ratingRoute.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(morgan("tiny"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(mongoSanitize());
app.use(compression());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.disable("x-powered-by");

app.get("/", (req: Request, res: Response) => {
  res.send("API is running...");
});

// Routes
app.use("/api/users", userRouter);
app.use("/api/category", categoryRouter);
app.use("/api/subcategory", subcategoryRouter);
app.use("/api/post", postRouter);
app.use("/api/comment", commentRouter);
app.use("/api/rating", ratingRouter);

// Not found handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Database connection
const start = async () => {
  await connectDB(app, process.env.MONGO_URI as string, PORT as string);
};

start();