const express = require("express");
const cors = require('cors');
const morgan = require("morgan");
const bodyParser = require("body-parser");
const { graphqlHTTP } = require('express-graphql');

const app = express();
const httpServer = require("http").createServer(app);
const authFunctions = require("./src/authFunctions.js");


const port = process.env.PORT || 1337;

const io = require("socket.io")(httpServer, {
  cors: {
    // origin: `http://localhost:4200`,
    origin: `https://www.student.bth.se`,
    methods: ["GET", "POST"]
  }
});
io.on("connect_error", (err) => {
    console.log(`connect_error due to ${err.message}`);
 });

io.sockets.on('connection', function(socket) {
    let oldRoom;
    socket.on('create', function(room) {
        socket.leave(oldRoom);
        socket.join(room);
        oldRoom = room;
        console.log(`Rum ${room} öppet`)
    });
    socket.on("doc", function (data) {
        socket.to(data._id).emit("doc", data);
    });
});

const docs = require('./routes/docs');
const auth = require('./routes/auth');


app.use(cors());
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(express.json());

// don't show the log when it is test
if (process.env.NODE_ENV !== 'test') {
    // use morgan to log at command line
    app.use(morgan('combined')); // 'combined' outputs the Apache style LOGs
}

// This is middleware called for all routes.
// Middleware takes three parameters.
app.use((req, res, next) => {
    console.log(req.method);
    console.log(req.path);
    next();
});

app.use('/docs', docs);
app.use('/auth', auth);

// GraphQL

const visual = false;
const {
  GraphQLSchema
} = require("graphql");

const Root = require("./graphql/root.js");

const schema = new GraphQLSchema({
    query: Root.RootQueryType
});

app.use('/graphql',
    (request, response, next) => authFunctions.checkToken(request, response, next),
    graphqlHTTP({
    schema: schema,
    graphiql: visual,
}));

// Add routes for 404 and error handling
// Catch 404 and forward to error handler
// Put this last
app.use((req, res, next) => {
    var err = new Error("Not Found");

    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    res.status(err.status || 500).json({
        "errors": [
            {
                "status": err.status,
                "title":  err.message,
                "detail": err.message
            }
        ]
    });
});

// Start up server
const server = httpServer.listen(port, () => {
    console.log('Me and socket api listening on port ' + port);
});
module.exports = server;
