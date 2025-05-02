const mongoose = require('mongoose');
require('dotenv').config();

//define mongodb connection url
// const mongoURL = process.env.MONGODB_URL_LOCAL
const mongoURL = process.env.MONGODB_URL

//setup mongodb connection 
mongoose.connect(mongoURL);

const db = mongoose.connection;

//define event listener for database connection
db.on('connected', ()=>{
    console.log('Connected to MongoDB Server')
});
db.on('error', (err)=>{
    console.error('MongoDB connection error: ', err);
});
db.on('disconnected', ()=>{
    console.log('MongoDB disconnected');
});

module.exports = db;