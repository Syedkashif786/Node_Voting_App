const express = require('express');
const router = express.Router();
const User = require('./../models/user');
const {jwtAuthMiddleware, generateToken} = require('./../jwt');


router.post('/signup', async(req,res)=>{
    try{
        const data = req.body; //assuming the req body containing the person data

        //create a new user document using the mongoose model
        const newUser = new User(data);

        //save the newUser data to the database
        const response = await newUser.save();
        console.log('User data saved successfully!');
        

        //payload is the which you want to hide in your token
        const payload = {
            id: response.id
        };

        console.log(JSON.stringify(payload));
        const token = generateToken(payload);
        console.log('Token is '+ token);
        res.status(200).json({response: response, token: token});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

router.post('/login', async(req,res)=>{
    try{
        const {aadharCardNumber, password} = req.body;
        //find the user by aadhaar card number
        const user = await User.findOne({aadharCardNumber: aadharCardNumber});
        if(!user || !(await user.comparePassword(password))){
            return res.status(401).json({error: 'Invalid username or password'});
        }
        //generate token
        const payload = {
            id: user.id
        }
        const token = generateToken(payload);
        res.status(200).json({token});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

router.get('/profile', jwtAuthMiddleware, async(req,res)=>{
    try{
        const userData = req.user;
        // console.log("User data " + userData);
        
        const id = userData.id;
        const user = await User.findById(id);
        res.status(200).json({user});

    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

router.put('/profile/password', jwtAuthMiddleware, async(req,res)=>{

    try{

    const userId = req.user.id; // extract the user id by the token 
    const {currentPassword, newPassword} = req.body // extract the current and new password from request body

    //find the user by id
    const user = await User.findById(userId);

    //chech if the user password is correct or not
    if(!(await user.comparePassword(currentPassword))){
        res.status(401).json({error: 'Enter the correct password'});
    }
    
    //update the user's password
    user.password = newPassword;
    await user.save();
    console.log('Password updated successfully!');
    res.status(200).json({message: 'Password changed successfully!'});
}
catch(err){
    console.log(err);
    res.status(500).json({error: 'Internal Server Error'});
}
});

module.exports = router;