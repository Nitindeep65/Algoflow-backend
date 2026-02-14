import prisma from "../prisma/prismaClient.js";
import bcrypt from 'bcrypt';
import { generateToken } from "../utils/generateToken.js";

export const SignUp = async(req , res)=>{
    try {
        console.log('📝 Signup request received:', req.body);
        const {name , email , password} = req.body;

        const existingUser =await prisma.user.findUnique({
             where: {email},
        });
        if(existingUser){
            return res.status(400).json({message : 'user already exists'})
        } 
        const hashedPassword = await bcrypt.hash(password , 10);

        const user = await prisma.user.create({
            data : {
                name,
                email,
                password : hashedPassword
            }
        });
        const token = generateToken(user.id);
        res.status(201).json({ message : 'user created successfully', user , token})
    }catch(error){
        console.error('Signup error:', error);
        res.status(500).json({message : 'internal server error', error: error.message})
    }
}

export  const Login = async(req  , res)=>{
    try{
        const {email , password}=req.body;
        const user = await prisma.user.findUnique({
            where : {email}
        })
        if(!user){
            return res.status(400).json({message:'user not found '})
        }
        const isMatch = await bcrypt.compare(password , user.password);
        if(!isMatch){
            return res.status(400).json({message:'invalid credentials'})
        }
        
        const adminEmailString = process.env.ADMIN_EMAIL || '';
        const adminEmail = adminEmailString.split(',').map(email => email.trim().toLowerCase());
        
        const role = adminEmail.includes(email.toLowerCase()) ? 'admin' : 'user';
        
        const token = generateToken(user.id);
        res.status(200).json({
            message:'login successful', 
            user: { ...user, role }, 
            token
        })
    }
    catch(error){
        console.error('Login error:', error);
        res.status(500).json({message:'internal server error', error: error.message})
    }
}