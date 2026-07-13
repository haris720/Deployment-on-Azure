import { Router } from "express";

import {
    createReview,
    updateReview,
    deleteReview,
    getReviews
} from "../controllers/review/review.controller";

import { protect } from "../middleware/auth.middleware";

import { validate } from "../middleware/validate.middleware";

import { reviewSchema } from "../validations/restaurant.validation";


const router = Router();


// PUBLIC

router.get(
    "/restaurant/:restaurantId",
    getReviews
);


// LOGGED IN USERS

router.post(
    "/",
    protect,
    validate(reviewSchema),
    createReview
);


router.put(
    "/:id",
    protect,
    updateReview
);


router.delete(
    "/:id",
    protect,
    deleteReview
);


export default router;
