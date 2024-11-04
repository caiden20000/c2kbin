const mongoose = require('mongoose');

const encryptedPostSchema = new mongoose.Schema({
    uid: {type: String, required: true},
    data: {type: Buffer},
    timeCreated: { type: Date, default: Date.now() },
});

const EncryptedPostModel = mongoose.model('EncryptedPost', encryptedPostSchema);

module.exports = EncryptedPostModel;
