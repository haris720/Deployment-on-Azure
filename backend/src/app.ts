import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import healthRoutes from "./routes/health.routes";


const app = express();


app.use(cors());

app.use(helmet());

app.use(morgan("dev"));

app.use(express.json());


app.use("/api/health", healthRoutes);


export default app;
