API for reading, creating and changing documents in a MongoDB database.

## Install

Clone repo from github

Install all dependencies using `npm install`.

Create a file called `config.json` with the username and password for your database in this format:

```
{
    "username": "",
    "password": ""
}
```

## Run

Use `npm start` to run.

## Routes

All routes are found in the file `routes/docs.js`.

* To fetch all documents, use GET "/".
* To fetch one document, use GET "/:id".
* To create a new document, use POST "/".
* To update a document, use POST "/:id".