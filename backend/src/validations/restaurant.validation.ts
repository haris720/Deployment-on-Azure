import { z } from "zod";


export const createRestaurantSchema = z.object({

    name: z
        .string()
        .trim()
        .min(2)
        .max(120),


    description: z
        .string()
        .max(2000)
        .optional(),


    address: z
        .string()
        .trim()
        .min(3)
        .max(255),


    city: z
        .string()
        .trim()
        .min(2)
        .max(80),


    phone: z
        .string()
        .max(30)
        .optional(),


    email: z
        .email()
        .optional(),


    website: z
        .url()
        .optional(),


    openingTime: z
        .string()
        .max(20)
        .optional(),


    closingTime: z
        .string()
        .max(20)
        .optional(),


    latitude: z
        .coerce
        .number()
        .min(-90)
        .max(90)
        .optional(),


    longitude: z
        .coerce
        .number()
        .min(-180)
        .max(180)
        .optional(),


    categoryId: z
        .coerce
        .number()
        .int()
        .positive()

});


// Every field optional on update, but at least one must be sent.

export const updateRestaurantSchema =
    createRestaurantSchema
        .partial()
        .refine(
            (data) => Object.keys(data).length > 0,
            {
                message: "At least one field is required"
            }
        );


export const categorySchema = z.object({

    name: z
        .string()
        .trim()
        .min(2)
        .max(50)

});


export const reviewSchema = z.object({

    restaurantId: z
        .coerce
        .number()
        .int()
        .positive(),


    rating: z
        .coerce
        .number()
        .int()
        .min(1)
        .max(5),


    comment: z
        .string()
        .max(1000)
        .optional()

});


export const reservationSchema = z.object({

    restaurantId: z
        .coerce
        .number()
        .int()
        .positive(),


    reservationDate: z
        .coerce
        .date()
        .refine(
            (date) => date.getTime() > Date.now(),
            {
                message: "reservationDate must be in the future"
            }
        ),


    people: z
        .coerce
        .number()
        .int()
        .min(1)
        .max(50),


    specialRequest: z
        .string()
        .max(500)
        .optional()

});
