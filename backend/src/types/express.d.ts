import { AuthUser } from "../middleware/auth.middleware";


declare global {

    namespace Express {

        interface Request {

            user?: AuthUser;

        }

    }

}


export {};
