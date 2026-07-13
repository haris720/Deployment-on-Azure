import rateLimit from "express-rate-limit";


// The production defaults throttle an end-to-end browser run, which
// makes far more requests than a human in 15 minutes. The e2e suite
// raises these via env; production leaves them unset and gets 100/10.

const apiMax = Number(process.env.RATE_LIMIT_MAX) || 100;

const authMax = Number(process.env.AUTH_RATE_LIMIT_MAX) || 10;


// General API traffic.

export const apiLimiter = rateLimit({

    windowMs: 15 * 60 * 1000,

    max: apiMax,

    standardHeaders: true,

    legacyHeaders: false,

    message: {

        success: false,

        message: "Too many requests, please try again later"

    }

});


// Login and register are the brute-force targets: 100 attempts
// per 15 minutes is a comfortable password-guessing budget, so
// they get their own much tighter limit.

export const authLimiter = rateLimit({

    windowMs: 15 * 60 * 1000,

    max: authMax,

    standardHeaders: true,

    legacyHeaders: false,

    skipSuccessfulRequests: true,

    message: {

        success: false,

        message:
            "Too many authentication attempts, please try again later"

    }

});
