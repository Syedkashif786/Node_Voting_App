const express = require('express');
const app = express();
const db = require('./db');
const PORT = process.env.PORT || 3000;
require('dotenv').config();

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

//log the request 
const logRequest = (req, res, next)=>{
    console.log(`[${new Date().toLocaleString()}] Request made to: ${req.originalUrl}`)
    next();
}
app.use(logRequest);



// import the router files
const userRoutes = require('./routes/userRoutes');
const candidateRoutes = require('./routes/candidateRoutes');

//use the routers
app.use('/user', userRoutes);
app.use('/candidate', candidateRoutes);

app.listen(PORT, (error)=>{
    if(!error){
        console.log(`Server is successfully running on port number: ${PORT}`);
    }else{
        console.log("Error occured, server can't start" + error);
    }
});