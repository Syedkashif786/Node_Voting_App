const jwt = require('jsonwebtoken');

const jwtAuthMiddleware = (req, res, next)=>{
    const authHeader = req.headers.authorization;

    //check if header is present and starts with bearer
    if(!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(401).json({error: 'Token not found'});
    }

    //extract the token from the request header
    const token = authHeader.split(' ')[1];
    if(!token) return res.status(401).json({error: 'Unauthorized'});

    try{
        //verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        //attach user information to the request object
        // in decoded we will the user data basically jwt.verify will decoded the data present in the token if the token is verified successfully
        req.user = decoded; 
        next();
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
};

//function to generate token
//userData = the data you want to hide inside the token (like user id, email, role, etc.).
const generateToken = (userData) => {
    return jwt.sign(userData, process.env.JWT_SECRET, {expiresIn: '1hr'});
};

module.exports = {
    jwtAuthMiddleware,
    generateToken
};

