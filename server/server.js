const express = require('express');
const app = express();
const db = require('./database-driver');

db.init().then(_ => console.log(">> Database connection initialized."));
app.set('view engine', 'ejs');

// The following is required in order to parse form data from POST requests.
// Express uses middleware to parse POST bodies due to many different possibilities.
// All this does is let form-data be accessible from req.body
app.use(express.urlencoded({ extended: true }));

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
        res.redirect('/' + uid);
        console.log("Made new post at /" + uid);
    } );
});

// Attempting to access a post
app.get('/:id', (req, res) => {
    db.retrievePostObject(req.params.id).then( postObject => {
        if (postObject == null) res.status(404).send('404 Not Found');
        else res.render('content-template', { post: postObject });
    });
});

app.listen(60601);
console.log(">> Express server listening on port 60601.");