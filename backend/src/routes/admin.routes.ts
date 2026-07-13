import { Router } from "express";

import {

    dashboard,

    getUsers,

    updateUserRole,

    deleteUser,

    getReservations,

    getReviews

} from "../controllers/admin/admin.controller";

// Restaurant management reuses the restaurant controller.
// A separate admin copy would duplicate the field whitelist
// and validation, and the two would drift apart.

import {

    createRestaurant,

    updateRestaurant,

    deleteRestaurant

} from "../controllers/restaurant/restaurant.controller";

import { deleteReview } from "../controllers/review/review.controller";

import { updateReservationStatus } from "../controllers/reservation/reservation.controller";

import { protect } from "../middleware/auth.middleware";

import { adminOnly } from "../middleware/admin.middleware";

import { validate } from "../middleware/validate.middleware";

import {
    createRestaurantSchema,
    updateRestaurantSchema
} from "../validations/restaurant.validation";


const router = Router();


// Every route below requires a valid token AND an ADMIN role.

router.use(
    protect,
    adminOnly
);


// DASHBOARD

router.get(
    "/dashboard",
    dashboard
);


// USERS

router.get(
    "/users",
    getUsers
);


router.put(
    "/users/:id/role",
    updateUserRole
);


router.delete(
    "/users/:id",
    deleteUser
);


// RESTAURANTS

// Same zod schemas as /api/restaurants. Without these an admin could
// save a 1-character name here that the public route would reject.

router.post(
    "/restaurants",
    validate(createRestaurantSchema),
    createRestaurant
);


router.put(
    "/restaurants/:id",
    validate(updateRestaurantSchema),
    updateRestaurant
);


router.delete(
    "/restaurants/:id",
    deleteRestaurant
);


// REVIEWS

router.get(
    "/reviews",
    getReviews
);


router.delete(
    "/reviews/:id",
    deleteReview
);


// RESERVATIONS

router.get(
    "/reservations",
    getReservations
);


router.put(
    "/reservations/:id/status",
    updateReservationStatus
);


export default router;
