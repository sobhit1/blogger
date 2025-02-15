const JWT = require("jsonwebtoken");
require("dotenv").config();

const secret = process.env.JWT_SECRET;

if (!secret) {
    throw new Error("JWT_SECRET is not defined in the environment variables");
}

const createTokenForUser = (user, expiresIn = "1d") => {
    const payload = {
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImageURL: user.profileImageURL,
        role: user.role
    };
    try {
        const token = JWT.sign(payload, secret, { expiresIn: "1d"});
        return token;
    }
    catch (error) {
        console.error("Error creating token:", error.message);
        throw new Error("Error creating token");
    }
};

const verifyToken = (token) => {
    try {
        const payload = JWT.verify(token, secret);
        return payload;
    }
    catch (error) {
        console.error("Error verifying token:", error.message);
        return null; 
    }
};

module.exports = { createTokenForUser, verifyToken };