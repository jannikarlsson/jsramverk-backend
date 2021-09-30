const database = require("../db/database.js");
const jwt = require('jsonwebtoken');

// const { ObjectId } = require('bson');
const collectionName = "users"
// const { ObjectId } = require("mongodb");

const bcrypt = require('bcryptjs');
const saltRounds = 10;
const config = require('../secret.json');
const secret = config.secret;

const data = {
    // Return all documents in collection
    findInCollection: async function run(criteria, projection, limit) {

    const db = await database.getDb(collectionName);
    const res = await db.collection.find(criteria, projection).limit(limit).toArray();

    await db.client.close();
    return res;
    },

    sendToCollection: async function run(data) {

        const db = await database.getDb(collectionName);
        bcrypt.hash(data.password, saltRounds, async function(err, hash) {
            const res = await db.collection.insertOne({"username": data.username, "password": hash})
            await db.client.close();
            return res;
        });
        
        
    },

    getOne: async function run(id) {
        const db = await database.getDb(collectionName);
        const q = {username: id}
        const res = await db.collection.find(q).toArray();
        await db.client.close();
        return res[0];
    },
    
    validate: function(response, user, password) {
        bcrypt.compare(password, user.password, function(err, result) {
            if (result) {
                let payload = { username: user.username };
                let jwtToken = jwt.sign(payload, secret, { expiresIn: '24h' });
                return response.json({
                    data: {
                        type: "success",
                        message: "User logged in",
                        user: payload,
                        token: jwtToken
                    }
                });
            }
        });
    },

    login: async function(response, data) {
        const exists = await this.getOne(data.username);
        if (exists) {
            return this.validate(response, exists, data.password);     
        } else {
            return response.status(401).json({
                errors: {
                    status: 401,
                    source: "/login",
                    title: "No such user",
                    detail: "That username was not found."
                }
            });;
        }
        
    },
    checkToken: function (req, res, next) {
        const token = req.headers['x-access-token'];
        jwt.verify(token, secret, function(err, decoded) {
            if (err) {
                console.log("TOKEN DOES NOT WORK")
            } else {
                console.log("TOKEN WORKS")
                return next();
            }
        });
    }
};

module.exports = data;