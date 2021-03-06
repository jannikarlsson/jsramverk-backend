var express = require('express');
var router = express.Router();

const docFunctions = require("../src/docFunctions.js");
const authFunctions = require("../src/authFunctions.js");


router.post("/print", async (request, response) => {
    let res = await docFunctions.printDoc(request.body);
    response.json(res);
});

router.post("/permission", 
(request, response, next) => authFunctions.checkToken(request, response, next),
async (request, response) => {
    let res = await authFunctions.emailPermission(request.body);
    console.log(request.body);
    response.json(res);
});

router.get("/:id", 
    (request, response, next) => authFunctions.checkToken(request, response, next),
    async function(request, response) {
    let res = await docFunctions.getOne(request.params.id);
    response.json(res);
});

router.post("/comment", 
    (request, response, next) => authFunctions.checkToken(request, response, next),
    async (request, response) => {
    let res = await docFunctions.saveComment(request.body);
    response.json(res);
})

router.post("/", 
(request, response, next) => authFunctions.checkToken(request, response, next),
async (request, response) => {
    let res = await docFunctions.sendToCollection({title: request.body["title"], content: request.body["content"], owner: request.body["owner"], type: request.body["type"], permissions: request.body["permissions"]});
    response.json(res);
});

router.post("/:id", 
    (request, response, next) => authFunctions.checkToken(request, response, next),
    async (request, response) => {
    let res = await docFunctions.changeOne(request.params.id, {title: request.body["title"], content: request.body["content"], permissions: request.body["permissions"]});
    response.json(res);
});

module.exports = router;