[![Build Status](https://app.travis-ci.com/jannikarlsson/jsramverk-backend.svg?branch=master)](https://app.travis-ci.com/jannikarlsson/jsramverk-backend)

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

The database url and collection name can be changed in `db/database.js`.

Each document in the database has an `_id` that is set automatically when inserted, and also `title` and `content`.

## Run

Use `npm start` to run.

## Routes

All routes are found in the file `routes/docs.js`.

* To fetch all documents, use GET "/".
* To fetch one document, use GET "/:id".
* To create a new document, use POST "/".
* To update a document, use POST "/:id".