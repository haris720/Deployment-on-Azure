import express from "express"; import cors from "cors"; import helmet from "helmet"; import morgan from 
"morgan"; import path from "path"; import swaggerUi from "swagger-ui-express";
import healthRoutes from "./routes/health.routes";
import authRoutes from "./routes/auth.routes";
import restaurantRoutes from "./routes/restaurant/restaurant.routes";
import categoryRoutes from "./routes/category/category.routes";
import reviewRoutes from "./routes/review.routes";
import favoriteRoutes from "./routes/favorite.routes";
import listRoutes from "./routes/list.routes";
import reservationRoutes from "./routes/reservation.routes";
import adminRoutes from "./routes/admin.routes";

import { swaggerSpec } from "./config/swagger";
import { apiLimiter } from "./middleware/rate.middleware";
import { httpLogStream } from "./utils/logger";
import {
    notFound,
    errorHandler
} from "./middleware/error.middleware";


const app = express();


// Behind Azure's load balancer the client IP arrives in
// X-Forwarded-For. Without this, rate limiting sees one proxy IP
// for everyone and would throttle all users together.

app.set("trust proxy", 1);


// In production only the configured frontend may call the API.
// `cors({ origin: undefined })` silently allows every origin, so
// a missing FRONTEND_URL must not quietly become "allow all".

const allowedOrigin = process.env.FRONTEND_URL;

if (process.env.NODE_ENV === "production" && !allowedOrigin) {

    throw new Error(
        "FRONTEND_URL must be set in production (CORS would otherwise allow any origin)"
    );

}

app.use(cors({

    origin: allowedOrigin || true,

    credentials: true

}));


app.use(helmet());

// Images are served cross-origin to the frontend; helmet's default
// CORP header would block them.
app.use(
    helmet.crossOriginResourcePolicy({
        policy: "cross-origin"
    })
);


app.use(
    morgan(
        "combined",
        {
            stream: httpLogStream
        }
    )
);


app.use(express.json({ limit: "1mb" }));


app.use("/api", apiLimiter);


// Uploaded restaurant images.

app.use(
    "/uploads",
    express.static(
        path.join(process.cwd(), "uploads"),
        {
            maxAge: "7d"
        }
    )
);


// API documentation.

app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);


app.use("/api/health", healthRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/restaurants", restaurantRoutes);

app.use("/api/categories", categoryRoutes);

app.use("/api/reviews", reviewRoutes);

app.use("/api/favorites", favoriteRoutes);

app.use("/api/lists", listRoutes);

app.use("/api/reservations", reservationRoutes);

app.use("/api/admin", adminRoutes);


// Must stay last: unmatched routes, then the error handler.

app.use(notFound);

app.use(errorHandler);


export default app;
