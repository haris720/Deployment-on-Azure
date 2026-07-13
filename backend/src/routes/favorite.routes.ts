import { Router } from "express";

import {
    addFavorite,
    getFavorites,
    removeFavorite
} from "../controllers/favorite/favorite.controller";

import { protect } from "../middleware/auth.middleware";


const router = Router();


router.post(
    "/",
    protect,
    addFavorite
);


router.get(
    "/",
    protect,
    getFavorites
);


router.delete(
    "/:restaurantId",
    protect,
    removeFavorite
);


export default router;
