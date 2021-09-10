const { ObjectId } = require('bson');
var express = require('express');
var router = express.Router();

const database = require('../db/database.js');
console.log(database);


// Return a JSON object with list of all documents within the collection.
router.get("/", async (request, response) => {
    try {
        let res = await findInCollection({}, {}, 0);

        console.log(res);
        response.json(res);
    } catch (err) {
        console.log(err);
        response.json(err);
    }
});

router.get("/:id", async (request, response) => {
    try {
        let res = await getOne(request.params.id);

        console.log(res);
        response.json(res);
    } catch (err) {
        console.log(err);
        response.json(err);
    }
});

router.post("/", async (request, response) => {
   
    try {
        console.log(request.body.data);
        let res = await sendToCollection({title: request.body["title"], content: request.body["content"]});
        console.log(res);
        response.json(res);
    } catch (err) {
        console.log(err);
        response.json(err);
    }
});

router.post("/:id", async (request, response) => {
    try {
        let res = await changeOne(request.params.id, {title: request.body["title"], content: request.body["content"]});
        console.log(res);
        response.json(res);
    } catch (err) {
        console.log(err);
        response.json(err);
    }
});

// Return all documents in collection
async function findInCollection(criteria, projection, limit) {

    const db = await database.getDb();
    const res = await db.collection.find(criteria, projection).limit(limit).toArray();

    await db.client.close();
    console.log(res)
    return res;
}

// Return single document based on ID
async function getOne(id) {

    const db = await database.getDb();
    const res = await db.collection.find({"_id":ObjectId(id)}).toArray();

    await db.client.close();
    console.log(res)
    return res;
}

// Update contents of single document based on ID
async function changeOne(id, data) {
    const db = await database.getDb();
    const res = await db.collection.updateOne({"_id":ObjectId(id)}, {$set: {"title": data["title"], "content": data["content"]}});

    await db.client.close();
    console.log(res)
    return res;
}

// Save new document in collection
async function sendToCollection(data) {

    const db = await database.getDb();
    const res = await db.collection.insertOne(data)

    await db.client.close();
    console.log(res)
    return res;
}


module.exports = router;