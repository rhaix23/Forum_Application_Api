// Import dependencies
import express, { NextFunction, Request, Response } from "express";
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
import { verifyRole } from "./middleware/verifyRole.js";

// Import database
import { connectDB } from "./database/db.js";

// Import routes
import { userRouter } from "./routes/userRoutes.js";
import { categoryRouter } from "./routes/categoryRoutes.js";
import { subcategoryRouter } from "./routes/subcategoryRoutes.js";
import { postRouter } from "./routes/postRoutes.js";
import { commentRouter } from "./routes/commentRoutes.js";
import { ratingRouter } from "./routes/ratingRoute.js";
import { adminPostRouter } from "./routes/admin/adminPostRoutes.js";
import { adminUserRouter } from "./routes/admin/adminUserRoutes.js";
import { adminCategoryRouter } from "./routes/admin/adminCategoryRoutes.js";
import { adminSubcategoryRouter } from "./routes/admin/adminSubcategoryRoutes.js";
import { adminCommentRouter } from "./routes/admin/adminCommentRoutes.js";
import { reportRouter } from "./routes/reportRoutes.js";
import { adminReportRouter } from "./routes/admin/adminReportRoutes.js";

// Allowed origins configuration
import { allowedOrigins } from "./configurations/allowedOrigins.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
if (process.env.NODE_ENV === "development") {
  app.use(morgan("tiny"));
}
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(mongoSanitize());
app.use(compression());

app.get("/", (req: Request, res: Response) => {
  res.send("API is running...");
});

// User routes
app.use("/api/user", userRouter);
app.use("/api/category", categoryRouter);
app.use("/api/subcategory", subcategoryRouter);
app.use("/api/post", postRouter);
app.use("/api/comment", commentRouter);
app.use("/api/rating", ratingRouter);
app.use("/api/report", reportRouter);

// Admin routes
app.use("/api/admin/category", verifyRole, adminCategoryRouter);
app.use("/api/admin/subcategory", verifyRole, adminSubcategoryRouter);
app.use("/api/admin/user", verifyRole, adminUserRouter);
app.use("/api/admin/post", verifyRole, adminPostRouter);
app.use("/api/admin/comment", verifyRole, adminCommentRouter);
app.use("/api/admin/report", verifyRole, adminReportRouter);

// Not found handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Database connection
const start = async () => {
  await connectDB(app, process.env.MONGO_URI as string, PORT as string);
};

start();
