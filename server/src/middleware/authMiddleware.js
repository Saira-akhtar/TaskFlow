import jwt from "jsonwebtoken";
const authMiddleware=(req,res,next)=>{
    try{
    const authHeader=req.headers.authorization;
    if(!authHeader || !authHeader.startsWith("Bearer "))
    {
        return res.status(401).json({message:"token is required.pleae login first"});
    }
    const token=authHeader.split(" ")[1];
    const decoded=jwt.verify(token,process.env.JWT_SECRET);
    req.userId=decoded.userId;
    next();
}
catch(err){
    console.log(err);
    res.status(500).json({message:"token is invalid"}); 
    
}
};

export default authMiddleware;