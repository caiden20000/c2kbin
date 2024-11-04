const crypto = require('node:crypto');

const ENCRYPTION_TYPE = "aes-256-cbc";
const IV_LENGTH = 16;
const KEY_LENGTH = 32; // 256 bits == 32 bytes
const CONTROL_STRING = "decrypt is good!"; // This string is checked for during a decryption to verify correctness


// Returns a Buffer: IV concat with ciphertext.
function encrypt(plaintext, password) {
    const key = getKeyFromPassword(password);
    const iv = getIV();
    const plaintextBuffer = Buffer.from(plaintext);
    const plainPlusControl = Buffer.concat([plaintextBuffer, Buffer.from(CONTROL_STRING)]);
    const cipher = crypto.createCipheriv(ENCRYPTION_TYPE, key, iv);
    return Buffer.concat([iv, cipher.update(plainPlusControl), cipher.final()]);
}

// Returns string if decrypted
// Returns null if error or bad password
function decrypt(ivAndCiphertext, password) {
    const key = getKeyFromPassword(password);
    const iv = ivAndCiphertext.subarray(0, IV_LENGTH);
    const ciphertext = ivAndCiphertext.subarray(IV_LENGTH);
    const decipher = crypto.createDecipheriv(ENCRYPTION_TYPE, key, iv);
    try {
        const result = decipher.update(ciphertext, null, "utf8") + decipher.final("utf8");
        // console.log(result);
        if (result.slice(-CONTROL_STRING.length) == CONTROL_STRING) {
            return result.slice(0, -CONTROL_STRING.length);
        } else {
            return null;
        }

    } catch (error) {
        return null;
    }
}

function getKeyFromPassword(password) {
    // TODO: Figure out what a good salt is and how to handle usage and storage.
    return crypto.scryptSync(password, "salt", KEY_LENGTH);
}

function getIV() {
    return crypto.randomBytes(IV_LENGTH);
}

module.exports = {
    encrypt: encrypt,
    decrypt: decrypt
}


// Test code
function testSamePasswordWorks() {
    const msg = "test message 1, test message 1.";
    const pass = "password1";
    const enc = encrypt(msg, pass);
    const dec = decrypt(enc, pass);
    return dec == msg;
}

function testWrongPasswordFails() {
    const msg = "test message 2, test message 2.";
    const pass = "password2";
    const enc = encrypt(msg, pass);
    const dec = decrypt(enc, pass + "mismatch");
    return dec == null;
}

function testLargePlaintext() {
    let msg = "test message 3, test message 3.";
    while (msg.length < 30000) msg = msg + msg;
    // msg is minimum 30kb
    const pass = "password1";
    const enc = encrypt(msg, pass);
    const dec = decrypt(enc, pass);
    return dec == msg;
}

// Passes all the tests :)
// console.log(testSamePasswordWorks());
// console.log(testWrongPasswordFails());
// console.log(testLargePlaintext());