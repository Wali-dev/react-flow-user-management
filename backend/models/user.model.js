const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    id: {
        type: String,
        required: true,
        index: true
    },
    username: {
        type: String,
        required: true,
        sparse: true,
        index: true
    },
    email: {
        type: String,
        sparse: true,
    },
    age: {
        type: Number,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    hobbies: {
        type: [String],
        default: []
    },
}, {
    timestamps: true
});

// Compound index for common query patterns
// userSchema.index({ isDeleted: 1, isVerified: 1 });

module.exports = mongoose.model("Users", userSchema);
