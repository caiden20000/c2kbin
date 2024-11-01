const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    uid: {type: String, required: true},
    title: String,
    author: String,
    content: String,
    timeCreated: { type: Date, default: Date.now() },
});

const PostModel = mongoose.model('Post', postSchema);

module.exports = PostModel;
