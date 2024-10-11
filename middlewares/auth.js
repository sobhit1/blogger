const { verifyToken } = require("../services/authentication"); 

function checkForAuthCookie(cookieName) {
    return (req, res, next) => {
        const tokenCookieValue = req.cookies[cookieName];
        if (!tokenCookieValue) return next();
        try {
            const payload = verifyToken(tokenCookieValue);
            req.user = payload;
        } catch (err) {
            console.error("Token verification error:", err.message);
            res.clearCookie(cookieName);
            return res.status(401).json({ message: "Invalid or expired token, please log in again." });
        }
        next();
    };
}

module.exports = { checkForAuthCookie };