const { ObjectId } = require('bson');
var express = require('express');
var router = express.Router();

const database = require('../db/database.js');

const docFunctions = require("../src/docFunctions.js");

// Return a JSON object with list of all documents within the collection.
router.get("/", async (request, response) => {
    let res = await docFunctions.findInCollection({}, {}, 0);
    response.json(res);
});

router.get("/:id", async function(request, response) {
    let res = await docFunctions.getOne(request.params.id);
    response.json(res);
});

router.post("/", async (request, response) => {
    console.log(request.body.data);
    let res = await docFunctions.sendToCollection({title: request.body["title"], content: request.body["content"]});
    response.json(res);
});

router.post("/:id", async (request, response) => {
    let res = await docFunctions.changeOne(request.params.id, {title: request.body["title"], content: request.body["content"]});
    response.json(res);
});


module.exports = router;