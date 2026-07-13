import { z } from "zod";


export const registerSchema = z.object({

    name: z
        .string()
        .trim()
        .min(3, "Name must be at least 3 characters")
        .max(60),


    email: z
        .email("A valid email is required")
        .toLowerCase(),


    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(72)   // bcrypt silently ignores bytes past 72

});


// Login only checks that a password was sent. Enforcing the
// 8-character policy here would lock out every account created
// before the rule existed, and telling an attacker "that
// password is too short" is free information.

export const loginSchema = z.object({

    email: z
        .email("A valid email is required")
        .toLowerCase(),


    password: z
        .string()
        .min(1, "Password is required")

});
