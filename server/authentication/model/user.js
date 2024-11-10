const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userInfo = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 30
    },
    lastName: {
        type: String,
        required: false,
        minlength: 3,
        maxlength: 30
    },
    emailId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        // Uncomment if you want to use the validator for email
        // validate(value) {
        //     if (!validator.isEmail(value)) {
        //         throw new Error("Please provide a valid email: " + value);
        //     }
        // }
    },
    password: {
        type: String,
        required: true,
        // Uncomment if you want to use the validator for password strength
        // validate(value) {
        //     if (!validator.isStrongPassword(value)) {
        //         throw new Error("Please provide a strong password: " + value);
        //     }
        // }
    }
});

// Define the getJWT method to generate a JWT
userInfo.methods.getJWT = async function () {
    const user = this;
    const token = jwt.sign(
        { _id: user._id },
        'shhh', // Replace with your actual secret key
        { expiresIn: '7d' }
    );
    return token;
};

// Define the validatePassword method to compare hashed passwords
userInfo.methods.validatePassword = async function (userPassword) {
    const user = this;
    const passwordHash = user.password;
    const isPasswordValid = await bcrypt.compare(userPassword, passwordHash);
    return isPasswordValid;
};

module.exports = mongoose.model('userAuth', userInfo);
