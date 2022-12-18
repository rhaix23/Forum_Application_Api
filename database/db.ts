import { Express } from "express";
import mongoose from "mongoose";

const connectDB = async (app: Express, url: string, PORT: string) => {
  try {
    const conn = await mongoose.connect(url);
    console.log(`[MONGODB] Connected: ${conn.connection.host}`);
    app.listen(PORT, () => {
      console.log(`[SERVER] Running on PORT ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

export { connectDB };
