const { ObjectId } = require('bson');
var express = require('express');
var router = express.Router();

const database = require('../db/database.js');

const docFunctions = require("../src/docFunctions.js");
const authFunctions = require("../src/authFunctions.js");


// Return a JSON object with list of all documents within the collection.
router.get("/", 
(request, response, next) => authFunctions.checkToken(request, response, next),
async (request, response) => {
    let res = await docFunctions.findInCollection({}, {}, 0);
    response.json(res);
});

router.get("/:id", 
    (request, response, next) => authFunctions.checkToken(request, response, next),
    async function(request, response) {
    let res = await docFunctions.getOne(request.params.id);
    response.json(res);
});

router.post("/", 
(request, response, next) => authFunctions.checkToken(request, response, next),
async (request, response) => {
    console.log(request.body);
    console.log(request.headers["x-access-token"]);
    let res = await docFunctions.sendToCollection({title: request.body["title"], content: request.body["content"], owner: request.body["owner"], permissions: request.body["permissions"]});
    response.json(res);
});

router.post("/:id", 
    (request, response, next) => authFunctions.checkToken(request, response, next),
    async (request, response) => {
    let res = await docFunctions.changeOne(request.params.id, {title: request.body["title"], content: request.body["content"], permissions: request.body["permissions"]});
    response.json(res);
});


module.exports = router;