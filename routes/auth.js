var express = require('express');
var router = express.Router();

const authFunctions = require("../src/authFunctions.js");

router.post("/login", async (request, response) => {
    await authFunctions.login(response, request.body);
});

router.post("/register", async (request, response) => {
    let res = await authFunctions.sendToCollection({username: request.body.username, password: request.body.password});
    response.json(res);
});

module.exports = router;