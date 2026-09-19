import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
const app = express();

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true
}))

app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded());
app.use(cookieParser());

import userRouter from "./routes/user.routes.js"
import videoRoute from "./routes/video.route.js"

app.use("/api/v1/users",userRouter);
app.use("/api/v1/videos",videoRoute);

export {app};

