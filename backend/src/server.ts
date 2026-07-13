import dotenv from "dotenv";

dotenv.config();


import app from "./app";
import prisma from "./config/database";


const PORT = process.env.PORT || 5000;


prisma.$connect()
.then(()=>{

    console.log("Database connected");


    app.listen(PORT,()=>{

        console.log(
            `Server running on port ${PORT}`
        );

    });


})
.catch((error:Error)=>{

    console.log(
        "Database connection failed",
        error.message
    );

});
