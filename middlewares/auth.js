const { verifyToken } = require("../services/authentication");

function checkForAuthCookie(cookieName) {
    return (req, res, next) => {
        const tokenCookieValue = req.cookies[cookieName];

        if (!tokenCookieValue) {
            req.user = null;  // Explicitly set user as null
            return next();
        }

        try {
            const payload = verifyToken(tokenCookieValue);
            req.user = payload;
        } catch (err) {
            console.error(`Token verification error for cookie "${cookieName}":`, err.message);
            res.clearCookie(cookieName, { httpOnly: true, secure: true, sameSite: 'Strict' });
            return res.status(401).json({ message: "Invalid or expired token, please log in again." });
        }

        next();
    };
}


module.exports = { checkForAuthCookie };