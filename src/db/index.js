import { DB_NAME } from "../constant.js";
import mongoose from "mongoose";

export const dbConnect = async () => {
  try {
    const databaseConnection = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );

    console.log(
      "Database connected Successfully with Host: ",
      databaseConnection.connection.host
    );
  } catch (error) {
    console.log("MONGODB CONNECTION FAILED", error);
    process.exit(1);
  }
};

