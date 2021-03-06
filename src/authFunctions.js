const database = require("../db/database.js");
const jwt = require('jsonwebtoken');
const { ObjectId } = require("mongodb");


const collectionName = "users"

const bcrypt = require('bcryptjs');
const saltRounds = 10;

const sgMail = require('@sendgrid/mail')

let secret;
let sendgrid;

try {
    sendgrid = require('../sendgrid.json');
} catch (error) {
    console.error(error);
}

try {
    config = require('../secret.json');
} catch (error) {
    console.error(error);
}

secret = process.env.secret || config.secret;
// secret = config.secret;
sendgrid_api = process.env.sendgrid || sendgrid.api;
// sendgrid_api = sendgrid.api;

sgMail.setApiKey(sendgrid_api);

const data = {
    // Return all users in collection
    findInCollection: async function run() {

    const db = await database.getDb(collectionName);
    const res = await db.collection.find().toArray();

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
            } else {
                return response.status(401).json({
                    errors: {
                        status: 401,
                        source: "/login",
                        title: "Wrong password",
                        detail: "Dubbelkolla ditt l??senord."
                    }
                });;
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
                    detail: "Dubbelkolla ditt anv??ndarnamn."
                }
            });;
        }

    },
    checkToken: function (req, res, next) {
        const token = req.headers['x-access-token'];
        jwt.verify(token, secret, function(err, decoded) {
            if (err) {
                return "Error"
            } else {
                return next();
            }
        });
    },

    sendEmail: function (recipient, sender, documentTitle) {
        const msg = {
            to: recipient,
            from: 'jannikarlsson@gmail.com',
            subject: 'Du har bjudits in att redigera ' + documentTitle,
            text: `Anv??ndaren ${sender} har bjudit in dig att redigera dokumentet ${documentTitle}. H??r kan du logga in eller registrera ett konto f??r att komma ig??ng och redigera: https://bit.ly/3iVxm2h.`,
            html: `<p>Anv??ndaren ${sender} har bjudit in dig att redigera dokumentet ${documentTitle}.</p><p><a href="https://bit.ly/3iVxm2h">H??r kan du logga in eller registrera ett konto f??r att komma ig??ng och redigera</a></p>`,
          }
          sgMail
            .send(msg)
            .then(() => {
              console.log('Email sent')
            })
            .catch((error) => {
              console.error(error)
            })
    },

    emailPermission: async function(data) {
        const db = await database.getDb("savedDocs");
        const q = {_id: new ObjectId(data.id)};
        const res = await db.collection.updateOne(q, {$push: {"permissions": data.email}});
        await db.client.close();
        this.sendEmail(data.email, data.sender, data.title);
        return res;
    }
};

module.exports = data;