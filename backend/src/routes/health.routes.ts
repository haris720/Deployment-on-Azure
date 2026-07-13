import {Router} from "express";


const router = Router();


router.get("/",(req,res)=>{

res.json({

success:true,

message:"My Treats API is running",

timestamp:new Date()

});

});


export default router;
