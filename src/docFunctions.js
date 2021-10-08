const database = require("../db/database.js");
// const { ObjectId } = require('bson');
const collectionName = "savedDocs"
const { ObjectId } = require("mongodb");

const data = {
    // Return all documents in collection
    findInCollection: async function run(username) {
    const db = await database.getDb(collectionName);
    const q = {permissions: username};
    const res = await db.collection.find(q).toArray();
    await db.client.close();
    return res;
    },

// Return single document based on ID
    getOne: async function run(id) {
        if (ObjectId.isValid(id)) {
            const db = await database.getDb(collectionName);
            const q = {_id: new ObjectId(id)};
            const res = await db.collection.find(q).toArray();

            await db.client.close();
            return res[0];
        }
        return "Error!";
    },

// Update contents of single document based on ID
    changeOne: async function run(id, data) {
        if (ObjectId.isValid(id)) {
            const db = await database.getDb(collectionName);
            const q = {_id: new ObjectId(id)};
            const res = await db.collection.updateOne(q, {$set: {"title": data["title"], "content": data["content"], "permissions": data["permissions"]}});

            await db.client.close();
            return res;
        }
        return "Error!";
    },

// Save new document in collection
    sendToCollection: async function run(data) {

    const db = await database.getDb(collectionName);
    const res = await db.collection.insertOne(data)

    await db.client.close();
    return res;
    }
};

module.exports = data;