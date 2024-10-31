
### First iteration
Frontend is a simple interface on HOST/index that allows a user to submit a post via POST.
The client will POST a JSON object like:
{
    "title": "Example Post",
    "content": "Example content, this is the main body of the paste.",
    "author": "unused",
}

The server will only accept a correctly formed JSON object.
On successful JSON, server returns 303 to the created post.
On malformed JSON, server returns 400.

When the server receives a POST at HOST/create, the JSON data is stored as a row within a table, along with an 8 character B64 identifier.
When a client tries to GET anything under HOST/* other than HOST/index, the server will validate and attempt to locate the identifier in the database.
If a match is found, a templated HTML page is returned. If no match is found, a 404 is returned.

If a client tries to POST to anything other than HOST/create, the server returns a 405.

EDIT: We'll be sending a FORM object, NOT a JSON object.




### old rambling documentation outlining an encryption method, will be second or third iteration

We'll have an API, ofc. Call POST to HOST/create with your message enclosed in a JSON object like so:

{
    "title": "Example Post",
    "content": "Example content, this is the main body of the paste.",
    "author": "unused",
}

Then the backend will store it in an SQLite DB file. We will store the whole JSON object as an encrypted blob.
The blob will be assigned a random 16 character B64 string. The encryption key will be determined after.
When a post is requested to be posted as unencrypted, the encryption key will be identical to the URL.
When a post is requested to be encrypted with a password, the key will be that password URI encoded, then hashed.
To view an unencrypted post, you GET the URL: HOST/Ggo+eaNe73Nqje
To view an encrypted post, you GET the URL with a query for the key: HOST/eJeg+ej_ebxyTeGE?key=secret_password
If the key doesn't decrypt the JSON object properly, or if no key is provided for an encrypted post, a 404 is returned, NOT a 403 or something. This is an attempt to mitigate knowledge of the resources on the server.




The POST requests will be limited to avoid spam or DOS. I'm thinking 1 post every 20 seconds is reasonable.




