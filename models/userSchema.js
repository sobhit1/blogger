const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { createTokenForUser } = require("../services/authentication");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    profileImageURL: {
        type: String,
        default: '/images/profile.png'
    },
    role: {
        type: String,
        enum: ['USER', 'ADMIN'],
        default: 'USER'
    }
}, {timestamps: true});

userSchema.pre('save', async function(next) {
    const user = this;
    if (user.isModified('password')) {
        try {
            user.password = await bcrypt.hash(user.password, 10);
        }
        catch (error) {
            return next(error);
        }
    }
    next();
});

userSchema.statics.matchPasswordAndGenerateToken = async function(email, password) {
    try {
        const user = await this.findOne({ email: email });
        if (!user)  return null;
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            const token = createTokenForUser(user);
            return token;
        }
        else  return null;
    }
    catch (error) {
        console.error(error);
        return null;
    }
};

const User = mongoose.model('User', userSchema);

module.exports = User;