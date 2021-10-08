var express = require('express');
var router = express.Router();

const authFunctions = require("../src/authFunctions.js");

// Return a JSON object with list of all documents within the collection.
// router.get("/", async (request, response) => {
//     let res = await authFunctions.findInCollection({}, {}, 0);
//     response.json(res);
// });

// router.get("/:user", async function(request, response) {
//     let res = await authFunctions.getOne(request.params.user);
//     response.json(res);
// });

router.post("/login", async (request, response) => {
    await authFunctions.login(response, request.body);
});

router.post("/register", async (request, response) => {
    let res = await authFunctions.sendToCollection({username: request.body.username, password: request.body.password});
    response.json(res);
});

module.exports = router;