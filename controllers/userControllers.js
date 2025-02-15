const User = require("../models/userSchema");
const { validationResult } = require("express-validator");

const userSignUp = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render("signup", { error: errors.array()[0].msg });
    }
    const { name, email, password } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.render("signup", { error: "User already exists" });
        }
        const newUser = new User({ name, email, password: password });
        await newUser.save();
        const token = await User.matchPasswordAndGenerateToken(email, password);
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: 'Strict',
            maxAge: 24 * 60 * 60 * 1000
        }).redirect("/");
    }
    catch (err) {
        console.error("Error during sign up:", err.message);
        return res.render("signup", { error: "Something went wrong, please try again" });
    }
}

const userSignIn = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render("signin", { error: errors.array()[0].msg });
    }
    const { email, password } = req.body;
    try {
        const token = await User.matchPasswordAndGenerateToken(email, password);
        if (!token) {
            return res.render("signin", { error: "Invalid Password" });
        }
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: 'Strict',
            maxAge: 24 * 60 * 60 * 1000
        }).redirect("/");
    }
    catch (err) {
        console.error("Error during sign in:", err.message);
        return res.render("signin", { error: "Something went wrong, please try again" });
    }
}

module.exports = { userSignUp, userSignIn };