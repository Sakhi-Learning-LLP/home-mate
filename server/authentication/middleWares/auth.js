const jwt = require('jsonwebtoken');
const User = require('../model/user'); // Ensure the model name is capitalized

const userAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization']; // Get the Authorization header
        const token = authHeader && authHeader.split(' ')[1]; // Extract token after "Bearer"
        if (!token) {
            return res.status(401).send("Please login"); // Use 401 for unauthorized
        }
        
        // Verify the token
        const decodeObject = jwt.decode(token); 
        if(!decodeObject){
            return res.status(401).send("invalid token")        
        }
        const { _id } = decodeObject;

        // Find the user in the database
        const user = await User.findById(_id);
        if (!user) {
            return res.status(401).send("User not found"); // Respond with 401 if user not found
        }

        // Set the authenticated user in req.user
        req.user = user; // Use found user to set req.user
        next(); // Proceed to the next middleware or route
    } catch (err) {
        console.error("Authentication Error:", err); // Log the error for debugging
        if (err instanceof jwt.JsonWebTokenError) {
            return res.status(401).send("Invalid token");
        }
        if (err instanceof jwt.TokenExpiredError) {
            return res.status(401).send("Token has expired");
        }
        res.status(500).send("Server error: " + err.message);
    }
};

module.exports = { userAuth };
