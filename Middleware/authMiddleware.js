 import jwt from 'jsonwebtoken';

 export const authMiddleware = (req , res  , next )=>{
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(401).json({message:'no token provided'})
    }
    const token = authHeader.split(' ')[1];
     if (!token) return res.redirect('/login');
    try{
        const decoded = jwt.verify(token , process.env.JWT_SECRET);
        req.userId = decoded.userId;
        req.userEmail = decoded.email;
        if(decoded.email === process.env.ADMIN_EMAIL){
            return res.redirect('/Admin');
        }
        next();
    }
    catch(error){
        console.error('Auth middleware error:', error);
        res.status(401).json({message:'invalid token', error: error.message})
    }
 }