const PostModel = require('./model/post.model');
const EncryptedPostModel = require('./model/encryptedPost.model');
const mongoose = require('mongoose');
const encryption = require('./encryption');

async function init() {
    return mongoose.connect('mongodb://127.0.0.1:27017/test');
}


function validatePostObject(postObject) {
    if (postObject == undefined) return false;
    const properties = Object.keys(postObject);
    if (properties == undefined) return false;

    // Returns true if all these are included in the object
    return ["title", "author", "content"].every(r => properties.includes(r));
}

// Returns the ID of the new post, or NULL if error (ex. validation)
async function storePostObject(postObject) {
    if (validatePostObject(postObject) == false) return null;

    const newID = await _generatePostID();

    if (postObject.password != "" && postObject.password != undefined) {
        // Encrpted post request

        const plaintext = JSON.stringify({
            title: postObject.title,
            author: postObject.author,
            content: postObject.content
        });
        const ciphertext = encryption.encrypt(plaintext, postObject.password);

        const newEncryptedPost = new EncryptedPostModel({
            uid: newID,
            data: ciphertext
        });

        const result = newEncryptedPost.save();
        return newID;

    } else {
        // Unencrypted post request

        const newPost = new PostModel({
            uid: newID, // TODO, add uid to schema
            title: postObject.title,
            author: postObject.author,
            content: postObject.content
        });
    
        // May throw unhandled errors
        const result = await newPost.save();
        return newID;

    }
}

// returns null if nothing is found
async function retrievePostObject(id) {
    // TODO
    const foundPost = await PostModel.findOne({ uid: id }).exec();
    return foundPost;
}

async function doesEncryptedPostObjectExist(id) {
    const foundPost = await EncryptedPostModel.findOne({ uid: id }).exec();
    return foundPost != null;
}

async function retrieveEncryptedPostObject(id, password) {
    const foundPost = await EncryptedPostModel.findOne({ uid: id }).exec();
    if (foundPost == null) return null;
    const decrypted = encryption.decrypt(foundPost.data, password);
    return JSON.parse(decrypted);
}

// Also verifies ID does not yet exist in DB
// If for some reason it cannot find a good ID, it returns NULL
async function _generatePostID() {
    let unique = false;
    let retries = 0;
    const maxRetries = 100;
    while (unique == false) {
        // Modified from https://stackoverflow.com/a/10727155
        const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const length = 8;
        let result = '';
        for (let i=length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];

        // Result is new uid candidate
        const retrieveResult = await retrievePostObject(result);
        if (retrieveResult == null) {
            unique = true;
            return result;
        }

        retries ++;
        if (retries > maxRetries) break;
    }
    return null;
}



module.exports = {
    init: init,
    validatePostObject: validatePostObject,
    storePostObject: storePostObject,
    retrievePostObject, retrievePostObject,
    doesEncryptedPostObjectExist: doesEncryptedPostObjectExist,
    retrieveEncryptedPostObject: retrieveEncryptedPostObject
}