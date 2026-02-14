import express from 'express';
import { authMiddleware } from '../Middleware/authMiddleware.js';
import prisma from "../prisma/prismaClient.js";

const router = express.Router();

router.get('/profile' , authMiddleware , async(req , res) =>{
    try{
        const user = await prisma.user.findUnique({
            where : {id : req.userId},
            select : {
                id : true,
                name :true,
                email :true,
            }
        });
        return res.status(200).json({message:'user profile fetched successfully', user})
    }
    catch(error){
        console.error('Profile fetch error:', error);
        res.status(500).json({message:'internal server error', error: error.message})   
    }
});

router.get ('/count' , async(req , res)=>{
    try{
        const userCount = await prisma.user.count();
        res.status(200).json({message:'user count fetched successfully', count : userCount})
    }
    catch(error){
        console.error('User count fetch error:', error);
        res.status(500).json({message:'internal server error', error: error.message})   
    }
})

export default router;