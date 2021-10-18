/* global it describe before */

process.env.NODE_ENV = 'test';

//Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');

const server = require('../app.js');

chai.should();

const database = require("../db/database.js");
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const jwt = require('jsonwebtoken');

chai.use(chaiHttp);

let token;
let docId;

const dbSetup = {
    insertDoc: async function() {
        await this.tearDownDocs();
        const db = await database.getDb("savedDocs");
        let res = await db.collection.insertOne(
            { 
                "title" : "Testtitel",
                "content" : "Testinnehåll",
                "owner": "testuser",
                "type": "text",
                "permissions": ["testuser"]
            }
        )
        this.docId = res.insertedId.toString();
    },
    insertUser: async function() {
        await this.tearDownUsers();
        let user = {
            "username": "testuser",
            "password": "password"
        }
        const db = await database.getDb("users");
        bcrypt.hash(user.password, saltRounds, async function(err, hash) {
            const res = await db.collection.insertOne({"username": user.username, "password": hash})
            await db.client.close();
            return res;
        });
        this.getToken();
    },
    getToken: async function() {
        try {
            config = require('../secret.json');
        } catch (error) {
            console.error(error);
        }
        
        let secret = process.env.secret || config.secret;

        let payload = { username: "testuser" };
        this.token = jwt.sign(payload, secret, { expiresIn: '24h' });
    },
    tearDownDocs: async function() {
        const db = await database.getDb("savedDocs");

        db.db.listCollections(
            { name: "savedDocs" }
        )
            .next()
            .then(async function (info) {
                if (info) {
                    await db.collection.drop();
                    return "success";
                }
            })
            .catch(function (err) {
                console.error(err);
            })
            .finally(async function () {
                await db.client.close();
                resolve();
            });
        },
    tearDownUsers: async function() {
        const db = await database.getDb("users");
        db.db.listCollections(
            { name: "users" }
        )
            .next()
            .then(async function(info) {
                if (info) {
                    await db.collection.drop();
                    return "success";
                }
            })
            .catch(function(err) {
                console.error(err);
            })
            .finally(async function() {
                await db.client.close();
                resolve();
            });
    },
}


module.exports = dbSetup, token;