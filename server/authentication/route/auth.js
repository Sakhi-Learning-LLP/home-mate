const express = require('express');
const authRouter = express.Router();
const bcrypt = require('bcrypt');
const User = require('../model/user'); // Change 'user' to 'User'
const {validateSignUpData} = require('../validation/validate');

authRouter.post('/signup', async (req, res) => {
    try {
        validateSignUpData(req); // Validate input data
        
        const { firstName, lastName, emailId, password } = req.body;

        // Check for existing user
        const existingUser = await User.findOne({ emailId });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists with this email!" });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const userModel = new User({ firstName, lastName, emailId, password: passwordHash });
        const savedUser = await userModel.save();
        const token = await savedUser.getJWT();

        res.cookie('token', token, {
            expires: new Date(Date.now() + 1 * 360000),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
        });

        res.status(201).json({ data: savedUser, message: "User added successfully!" });
    } catch (err) {
        res.status(400).json({ message: err.message || "Server error" }); // Handle specific errors
    }
});


authRouter.post('/login', async (req, res) => {
    try {
        const { emailId, password } = req.body;
        const user = await User.findOne({ emailId: emailId });
        
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials!" });
        }

        const isPasswordValid = await user.validatePassword(password);
        
        if (isPasswordValid) {
            const token = await user.getJWT();
            res.cookie('token', token, {
                expires: new Date(Date.now() + 1 * 360000),
            });
            res.status(200).json({
                token,
                firstName: user.firstName,
                _id: user._id, // Assuming _id is the user ID
            });
        } else {
            res.status(400).json({ message: "Invalid credentials!" });
        }
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
});


authRouter.post('/logout', async (req, res) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true, // Helps secure the cookie
        sameSite: 'Strict' // Prevents CSRF attacks
    });
    res.status(200).send("Logged out!");
});


module.exports = authRouter;
