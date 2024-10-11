const JWT = require("jsonwebtoken");
require("dotenv").config();
const secret= process.env.JWT_SECRET;

if (!secret) {
    throw new Error("JWT_SECRET is not defined in the environment variables");
}

const createTokenForUser = (user) => {
    const payload = {
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImageURL: user.profileImageURL,
        role: user.role,
    };
    const token = JWT.sign(payload, secret, { expiresIn: "1d" });
    return token;
};

const verifyToken = (token) => {
    try {
        const payload = JWT.verify(token, secret);
        return payload;
    } catch (error) {
        console.error("Error verifying token:", error.message);
        return null; 
    }
};

module.exports = { createTokenForUser, verifyToken };