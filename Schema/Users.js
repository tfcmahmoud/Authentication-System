const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date, default: Date.now, expires: '1h' }, // Token expires in 1 hour
    emailVerificationToken: { type: String },
    emailVerified: { type: Boolean, default: false },
    accountToken: { type: String } // New field to store account token
});

module.exports = { userSchema }