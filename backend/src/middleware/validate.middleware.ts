import {
    Request,
    Response,
    NextFunction
} from "express";

import { ZodType } from "zod";


export const validate =
    (schema: ZodType) =>
        (
            req: Request,
            res: Response,
            next: NextFunction
        ): void => {


            const result = schema.safeParse(req.body);


            if (!result.success) {

                // zod v4 exposes `.issues`. The older `.errors`
                // property is gone, and reading it would throw.

                res.status(400).json({

                    success: false,

                    message: "Validation error",

                    errors: result.error.issues.map(
                        (issue) => ({

                            field: issue.path.join("."),

                            message: issue.message

                        })
                    )

                });

                return;

            }


            // Hand the parsed value back: it is trimmed, coerced
            // and stripped of unknown keys.

            req.body = result.data;


            next();


        };
