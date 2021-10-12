const database = require("../db/database.js");
const collectionName = "savedDocs"
const { ObjectId } = require("mongodb");
var html_to_pdf = require('html-pdf-node');

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

    // Saves comment
    saveComment: async function run(data) {
        if (ObjectId.isValid(data.id)) {
            let id = data.id;
            let commentData = {"text": data.text, "comment": data.comment, "user": data.user}
            const db = await database.getDb(collectionName);
            const q = {_id: new ObjectId(id)};
            const res = await db.collection.updateOne(q, {$push: {"comments": commentData}});
            await db.client.close();
            return res;
        }
    },

// Save new document in collection
    sendToCollection: async function run(data) {
    const db = await database.getDb(collectionName);
    const res = await db.collection.insertOne(data)
    await db.client.close();
    return res;
    },

    // Returns pdf buffer to frontend

    printDoc: async function(data) {
        let file = { content: "<h1>" + data.title + "</h1><p>" + data.content };
        let options = { format: 'A4', margin: {top: '20mm', left: '15mm', right: '20mm', bottom: '20mm'}};
        let pdf = await html_to_pdf.generatePdf(file, options)
        return pdf;
    }
};

module.exports = data;