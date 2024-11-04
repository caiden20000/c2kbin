
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

### Second iteration

First iteration is complete. Some things aren't as described above, but I'm not going back to change the documentation because this isn't documentation, it's more of a TODO list.
The second iteration will have:
- 2.1 = IP rate limiting
- 2.2 = rate limiting by size and frequency 
- 2.3 = console printout of how much space the DB is taking up
- 2.4 = More DB metrics
- 2.4 = encrypted posts

#### Breakdown

- 2.1: IP rate limit will be like 1 post every 30 seconds.
- 2.2: Size rate limiting will also rate limit you if you post too much size per whatever. Max size per POST request right now is set to 1mb, so the max one IP could post is 2mb per minute. This might be fine?
- 2.3: This one is a good health indicator for the DB and how it's being used.
- 2.4: I added this version so that I could get a good understanding of how the DB is being used:
        - Average posts per second
        - Average size per post
        - Average posts per IP
        - Average visits per post
    - We should just record all this data into another part of the DB, then use a separate webpage to display graphs on this information, like HOST/stats or something.
- 2.5: Encryption of posts seems pretty cool. The user will give a password at post creation time, and when the post is processed by the server, we will encrypt the post with the hash of that password. When a user attempts to access an encrypted post, they're met with a password modal. If the password they give corretly decrypts a prepended control string (either a static control or a hash of the rest of the data), the post is then returned.
    - This only really encrypts the post at rest, on the server. In transit it is still vulnerable. However, since the server I'm running it on only uses HTTPS, it might be theoretically encrypted in motion?? I'm not sure about that.






