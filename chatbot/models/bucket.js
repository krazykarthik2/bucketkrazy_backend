const mongoose = require('mongoose');

const bucketSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    type: { type: String, enum: ['password', 'admin', 'open'], required: true },
    password: { type: String },
    messages: [{ type: String }],
    images: [{ type: String }],
    videos: [{ type: String }],
    audio: [{ type: String }],
    files:[{ type: String }],
    adminApproved: { type: Boolean, default: false },
    joinedMembers: [{ type: String }],
    pendingApproval: [{ type: String }],
    adminUsername: { type: String, required: true }
});

module.exports = mongoose.model('Bucket', bucketSchema);
