const database = require("../db/database.js");
// const { ObjectId } = require('bson');
const { ObjectId } = require("mongodb");

const data = {
    // Return all documents in collection
    findInCollection: async function run(criteria, projection, limit) {

    const db = await database.getDb();
    const res = await db.collection.find(criteria, projection).limit(limit).toArray();

    await db.client.close();
    return res;
    },

// Return single document based on ID
    getOne: async function run(id) {
        if (ObjectId.isValid(id)) {
            const db = await database.getDb();
            const q = {_id: new ObjectId(id)};
            const res = await db.collection.find(q).toArray();

            await db.client.close();
            return res;
        }
        return "Error!";
    },

// Update contents of single document based on ID
    changeOne: async function run(id, data) {
        if (ObjectId.isValid(id)) {
            const db = await database.getDb();
            const q = {_id: new ObjectId(id)};
            const res = await db.collection.updateOne(q, {$set: {"title": data["title"], "content": data["content"]}});

            await db.client.close();
            return res;
        }
        return "Error!";
    },

// Save new document in collection
    sendToCollection: async function run(data) {

    const db = await database.getDb();
    const res = await db.collection.insertOne(data)

    await db.client.close();
    return res;
    }
};

module.exports = data;