/* global it describe before */

process.env.NODE_ENV = 'test';

//Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');

const server = require('../app.js');

chai.should();

const database = require("../db/database.js");
const collectionName = "savedDocs";
const collectionName2 = "users";
let token;

chai.use(chaiHttp);

describe('docs', () => {
    // Clears database before testing
    // before(() => {
    //     return new Promise(async (resolve) => {
    //         const db = await database.getDb();

    //         db.db.listCollections(
    //             { name: collectionName }
    //         )
    //             .next()
    //             .then(async function(info) {
    //                 if (info) {
    //                     await db.collection.drop();
    //                 }
    //             })
    //             .catch(function(err) {
    //                 console.error(err);
    //             })
    //             .finally(async function() {
    //                 await db.client.close();
    //                 resolve();
    //             });
    //         // db.db.listCollections(
    //         //         { name: collectionName2 }
    //         //     )
    //         //         .next()
    //         //         .then(async function(info) {
    //         //             if (info) {
    //         //                 await db.collection.drop();
    //         //             }
    //         //         })
    //         //         .catch(function(err) {
    //         //             console.error(err);
    //         //         })
    //         //         .finally(async function() {
    //         //             await db.client.close();
    //         //             resolve();
    //         //         });    
    //     });
    // });

    // Test that all the users are returned as an array
    describe('GET /auth', () => {
        it('200 HAPPY PATH', (done) => {
            chai.request(server)
                .get("/auth")
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("array");
                    console.log(res.body)
                    done();
                });
        });
    });

    // Creates new user in database
    describe('POST /auth/register', () => {
        it('should create a new user in the database', (done) => {
            let user = {
                username: "daniel.hansson@mau.se",
                password: "semester"
            };

            chai.request(server)
                .post("/auth/register")
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                });
        });
    });

    describe('POST /auth/login', () => {
        it('should log the user in', (done) => {
            let user = {
                username: "daniel.hansson@mau.se",
                password: "semester"
            };

            chai.request(server)
                .post("/auth/login")
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.data.should.have.property("token");
                    this.token = res.body.data.token;
                    done();
                });
        });
    });

    // Test that all the documents are returned as an array
    describe('GET /docs', () => {
        it('200 HAPPY PATH', (done) => {
            chai.request(server)
                .get("/docs")
                .set({ "x-access-token": this.token })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("array");
                    done();
                });
        });
    });

    // This should not work because the url is wrong
    describe('GET /docs', () => {
        it('should return 404', (done) => {
            chai.request(server)
                .get("/doc")
                .end((err, res) => {
                    res.should.have.status(404);
                    done();
                });
        });
    });

    // Creates new document in database
    describe('POST /docs', () => {
        it('should create a new document in the database', (done) => {
            let doc = {
                title: "Jannis testtitel",
                content: "<p>Hello world!</p>",
                owner: "janni@hej.se",
                permissions: ["janni@hej.se"]
            };

            chai.request(server)
                .post("/docs")
                .send(doc)
                .set({ "x-access-token": this.token })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.should.have.property("insertedId");
                    this.id = res.body.insertedId;
                    console.log(this.id);

                    done();
                });
        });
    });

    describe('POST /docs:id', () => {
        // Edits a document in the database
        it('should edit a document in the database', (done) => {
            let doc = {
                title: "Jannis uppdaterade titel",
                content: "<p>Uppdaterat innehåll</p>",
                owner: "janni@hej.se",
                permissions: ["janni@hej.se"]
            };

            chai.request(server)
                .post("/docs/" + this.id)
                .send(doc)
                .set({ "x-access-token": this.token })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.modifiedCount.should.equal(1);
                    done();
                });
        });
    

        //This edit should not work because the ID is invalid
        it('should not edit a document in the database', (done) => {
            let doc = {
                title: "Jannis ouppdaterade titel",
                content: "<p>Ouppdaterat innehåll</p>",
            };
            let fakeId = "34"

            chai.request(server)
                .post("/docs/" + fakeId)
                .send(doc)
                .set({ "x-access-token": this.token })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("string");
                    res.body.should.equal("Error!");
                    done();
                });
        });

    });
        
    });
    // Test that a single document opens
    describe('GET /docs:id', () => {
        it('opens edited document', (done) => {
            chai.request(server)
                .get("/docs/" + this.id)
                .set({ "x-access-token": this.token })
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                });
        });
    });

    // Try to open doc with fake ID, should not work
    describe('GET /docs:id', () => {
        it('opens edited document', (done) => {
            let fakeId = "34"

            chai.request(server)
                .get("/docs/" + fakeId)
                .set({ "x-access-token": this.token })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("string");
                    res.body.should.equal("Error!");
                    done();
                });
        });
    });
