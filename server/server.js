require('dotenv').config(); // Sets local env variables from .env file
// I have NODE_ENV = production, so that stack traces aren't leaked to the client.
const express = require('express');
const app = express();
const path = require('path');
const db = require('./database-driver');


// Allow client to request CSS files on the ROOT HOST/
app.use(express.static(path.join(__dirname, 'styles')));

db.init().then(_ => console.log(">> Database connection initialized."));
app.set('view engine', 'ejs');

// The following is required in order to parse form data from POST requests.
// Express uses middleware to parse POST bodies due to many different possibilities.
// All this does is let form-data be accessible from req.body
app.use(express.urlencoded({ extended: true, limit: '1mb' }));


app.get('/', (req, res) => {
    res.redirect('/create');
});

// Main page
app.get('/create', (req, res) => {
    res.sendFile(__dirname + '/static/index.html');
});

// Uploading a post!
app.post('/create', (req, res) => {
    db.storePostObject(req.body).then( uid => {
        if (uid == null) {
            res.status(400).send("400 Error");
        } else {
            res.redirect('/' + uid);
            console.log("Made new post at /" + uid);
        }
    } );
});

// Attempting to access a post
app.get('/:id', (req, res) => {
    db.retrievePostObject(req.params.id).then( postObject => {
        // res.render('content-template', { post: postObject });
        // return;
        if (postObject != null) res.render('content-template', { post: postObject });
        else {
            db.doesEncryptedPostObjectExist(req.params.id).then( exists => {
                if (exists == false) res.status(404).send('404 Not Found');
                else {
                    res.render('encrypted-template', { uid: req.params.id });
                }
            })
        }
    });
});

// Decrypting a post
app.post('/:id', (req, res) => {
    db.retrievePostObject(req.params.id).then( postObject => {
        // Check if it's a non-encrypted post
        if (postObject != null) res.status(405).send('405 Method Not Allowed');
        else {
            // If it's encrypted, try to decrypt.
            db.retrieveEncryptedPostObject(req.params.id, req.body.password).then(
                encryptedPostObject => {
                    if (encryptedPostObject != null) {
                        res.render('content-template', { post: encryptedPostObject });
                    } else {
                        res.status(404).send('404 Not Found');
                    }
                }
            );
        }
    });
});

app.listen(60601);
console.log(">> Express server listening on port 60601.");