import { Router } from "express";

import {
    createList,
    addRestaurantToList,
    removeRestaurantFromList,
    getMyLists,
    deleteList
} from "../controllers/list/list.controller";

import { protect } from "../middleware/auth.middleware";


const router = Router();


router.post(
    "/",
    protect,
    createList
);


router.get(
    "/",
    protect,
    getMyLists
);


router.delete(
    "/:id",
    protect,
    deleteList
);


router.post(
    "/:id/restaurants",
    protect,
    addRestaurantToList
);


router.delete(
    "/:id/restaurants/:restaurantId",
    protect,
    removeRestaurantFromList
);


export default router;
