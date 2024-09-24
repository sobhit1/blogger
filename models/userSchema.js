const mongoose = require("mongoose");
const { createHmac, randomBytes } = require("crypto");

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
        default: '../public/images/profile.png'
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
    const salt=randomBytes(16).toString();
    const hashedPassword = createHmac('sha256', salt)
        .update(user.password)
        .digest('hex');
    this.salt = salt;
    this.password = hashedPassword;
    next();
})

userSchema.static('matchPassword', async function(email, password) {
    const user = await this.findOne({ email: email });
    const salt = user.salt;
    const userProvidedHash = createHmac('sha256', salt)
        .update(password)
        .digest('hex');
    return user.password === userProvidedHash;
});

const User = mongoose.model('User', userSchema)

module.exports = User;