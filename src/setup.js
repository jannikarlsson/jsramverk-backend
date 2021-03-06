/**
 * Connect to the database and setup it with some default data.
 */
"use strict";

let config;
try {
    config = require('../config.json');
} catch (error) {
    console.error(error);
}

// const username = process.env.username || config.username;
// const password = process.env.password || config.password;

const mongo = require("mongodb").MongoClient;
const dsn =  process.env.DBWEBB_DSN || `mongodb+srv://${config.username}:${config.password}@cluster0.yyjqm.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const fs = require("fs");
const path = require("path");
const docs = JSON.parse(fs.readFileSync(
    path.resolve(__dirname, "setup.json"),
    "utf8"
));
const users = JSON.parse(fs.readFileSync(
    path.resolve(__dirname, "users.json"),
    "utf8"
));

// Do it.
resetCollection(dsn, "savedDocs", docs)
    .catch(err => console.log(err));

resetCollection(dsn, "users", users)
    .catch(err => console.log(err));

 /**
  * Reset a collection by removing existing content and insert a default
  * set of documents.
  *
  * @async
  *
  * @param {string} dsn     DSN to connect to database.
  * @param {string} colName Name of collection.
  * @param {string} doc     Documents to be inserted into collection.
  *
  * @throws Error when database operation fails.
  *
  * @return {Promise<void>} Void
  */
async function resetCollection(dsn, colName, doc) {
    const client  = await mongo.connect(dsn);
    const db = await client.db();
    const col = await db.collection(colName);

    await col.deleteMany();
    await col.insertMany(doc);

    await client.close();
}