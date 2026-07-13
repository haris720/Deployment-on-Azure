import { Router } from "express";

import {

    createCategory,

    getCategories,

    getCategoryById,

    updateCategory,

    deleteCategory

} from "../../controllers/category/category.controller";

import { protect } from "../../middleware/auth.middleware";

import { adminOnly } from "../../middleware/admin.middleware";

import { validate } from "../../middleware/validate.middleware";

import { categorySchema } from "../../validations/restaurant.validation";


const router = Router();


// PUBLIC

router.get(
    "/",
    getCategories
);


router.get(
    "/:id",
    getCategoryById
);


// ADMIN ONLY

router.post(
    "/",
    protect,
    adminOnly,
    validate(categorySchema),
    createCategory
);


router.put(
    "/:id",
    protect,
    adminOnly,
    validate(categorySchema),
    updateCategory
);


router.delete(
    "/:id",
    protect,
    adminOnly,
    deleteCategory
);


export default router;
