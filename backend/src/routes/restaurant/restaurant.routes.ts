import { Router } from "express";

import {

    createRestaurant,

    getRestaurants,

    getRestaurantById,

    updateRestaurant,

    deleteRestaurant,

    uploadRestaurantImages,

    deleteRestaurantImage

} from "../../controllers/restaurant/restaurant.controller";

import { protect } from "../../middleware/auth.middleware";

import { adminOnly } from "../../middleware/admin.middleware";

import { validate } from "../../middleware/validate.middleware";

import { upload } from "../../middleware/upload.middleware";

import {
    createRestaurantSchema,
    updateRestaurantSchema
} from "../../validations/restaurant.validation";


const router = Router();


// PUBLIC

router.get(
    "/",
    getRestaurants
);


router.get(
    "/:id",
    getRestaurantById
);


// ADMIN ONLY

router.post(
    "/",
    protect,
    adminOnly,
    validate(createRestaurantSchema),
    createRestaurant
);


router.put(
    "/:id",
    protect,
    adminOnly,
    validate(updateRestaurantSchema),
    updateRestaurant
);


router.delete(
    "/:id",
    protect,
    adminOnly,
    deleteRestaurant
);


// IMAGES (admin)

router.post(
    "/:id/images",
    protect,
    adminOnly,
    upload.array("images", 5),
    uploadRestaurantImages
);


router.delete(
    "/images/:imageId",
    protect,
    adminOnly,
    deleteRestaurantImage
);


export default router;
