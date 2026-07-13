import { Router } from "express";

import prisma from "../config/database";


const router = Router();


// Azure's load balancer probes this endpoint. Returning 200 while
// the database is unreachable would keep a broken instance in
// rotation, so the check actually pings Postgres.

router.get("/", async (_req, res) => {


    try {


        await prisma.$queryRaw`SELECT 1`;


        res.json({

            success: true,

            message: "My Treats API is running",

            database: "connected",

            timestamp: new Date()

        });


    }

    catch (error) {

        res.status(503).json({

            success: false,

            message: "Database unavailable",

            database: "disconnected",

            timestamp: new Date()

        });

    }


});


export default router;
