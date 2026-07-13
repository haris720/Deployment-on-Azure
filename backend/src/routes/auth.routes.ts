import { Router } from "express";

import {
    register,
    login,
    getProfile
} from "../controllers/auth.controller";

import { protect } from "../middleware/auth.middleware";

import { adminOnly } from "../middleware/admin.middleware";

import { validate } from "../middleware/validate.middleware";

import { authLimiter } from "../middleware/rate.middleware";

import {
    registerSchema,
    loginSchema
} from "../validations/auth.validation";


const router = Router();


router.post(
    "/register",
    authLimiter,
    validate(registerSchema),
    register
);


router.post(
    "/login",
    authLimiter,
    validate(loginSchema),
    login
);


router.get(
    "/profile",
    protect,
    getProfile
);


router.get(
    "/admin",
    protect,
    adminOnly,
    (req, res) => {

        res.json({

            message: "Admin route accessed",

            user: req.user

        });

    }
);


export default router;
