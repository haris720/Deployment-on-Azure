import { Router } from "express";

import {

    createReservation,

    getMyReservations,

    getRestaurantReservations,

    updateReservationStatus,

    cancelReservation

} from "../controllers/reservation/reservation.controller";

import { protect } from "../middleware/auth.middleware";

import { adminOnly } from "../middleware/admin.middleware";

import { validate } from "../middleware/validate.middleware";

import { reservationSchema } from "../validations/restaurant.validation";


const router = Router();


// CUSTOMER

router.post(
    "/",
    protect,
    validate(reservationSchema),
    createReservation
);


router.get(
    "/my",
    protect,
    getMyReservations
);


// Owner or admin (checked in the controller)

router.put(
    "/:id/cancel",
    protect,
    cancelReservation
);


// ADMIN ONLY

router.get(
    "/restaurant/:restaurantId",
    protect,
    adminOnly,
    getRestaurantReservations
);


router.put(
    "/:id/status",
    protect,
    adminOnly,
    updateReservationStatus
);


export default router;
