const mongo = require("mongodb").MongoClient;
const collectionName = "savedDocs";

let config;
try {
    config = require('../config.json');
} catch (error) {
    console.error(error);
}

const username = process.env.username || config.username;
const password = process.env.password || config.password;


const database = {
    getDb: async function getDb () {


        let dsn = "mongodb://localhost:27017/test";
        if (process.env.NODE_ENV !== "test") {
           dsn = `mongodb+srv://${this.username}:${this.password}@cluster0.yyjqm.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
        }

        const client  = await mongo.connect(dsn, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        const db = await client.db();
        const collection = await db.collection(collectionName);

        return {
            collection: collection,
            client: client,
            db: db
        };
    }
};

module.exports = database;