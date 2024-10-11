const mongoose = require("mongoose");
const { createHmac, randomBytes } = require("crypto");
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
    salt: String,
    password: {
        type: String,
        required: true
    },
    profileImageURL: {
        type: String,
        default: '/public/images/profile.png'
    },
    role: {
        type: String,
        enum: ['USER', 'ADMIN'],
        default: 'USER'
    }
}, {timestamps: true});

userSchema.pre('save', function(next) {
    const user = this;
    if(!user.isModified('password')) {
        return next();
    }
    const salt=randomBytes(16).toString('hex');
    const hashedPassword = createHmac('sha256', salt)
        .update(user.password)
        .digest('hex');
    user.salt = salt;
    user.password = hashedPassword;
    next();
})

userSchema.static('matchPasswordAndGenerateToken', async function(email, password) {
    const user = await this.findOne({ email: email });
    const salt = user.salt;
    const userProvidedHash = createHmac('sha256', salt)
        .update(password)
        .digest('hex');
    const token = createTokenForUser(user);
    return ((userProvidedHash === user.password) ? token : null);
});

const User = mongoose.model('User', userSchema)

module.exports = User;