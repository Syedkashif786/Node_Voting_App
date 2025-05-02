const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

//User schema
const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    age: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        unique: true
    },
    mobile: {
        type: String
    },
    address: {
        type: String,
        required: true
    },
    aadharCardNumber: {
        type: Number,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['voter', 'admin'],
        default: 'voter'
    },
    isVoted: {
        type: Boolean,
        default: false
    }
});

userSchema.pre('save', async function(next){
    const user = this;
    
    //hash the password only if it is modified or have the new record
    if(!user.isModified('password')) return next();

    //hash password generation
    try{
        //create random salt to add to password for hashing
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password,salt);

        user.password = hashedPassword;
        next();
    }
    catch(err){
        return next(err);
    }
});

userSchema.methods.comparePassword = async function (userPassword){
    try{
        const isMatch = await bcrypt.compare(userPassword, this.password);
        return isMatch;
    }
    catch(err){
        throw err;
    }
};

const User = mongoose.model('User', userSchema);
module.exports = User;