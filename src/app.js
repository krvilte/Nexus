import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: false }));
app.use(express.static("public"));

//Import Routes
import userRouter from "./routes/user.routes.js";

// Router declaration
app.use("/api/v1/users", userRouter);

export default app;
