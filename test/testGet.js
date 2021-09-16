/* global it describe before */

process.env.NODE_ENV = 'test';

//Require the dev-dependencies
const chai = require('chai');
const chaiHttp = require('chai-http');

const server = require('../app.js');

chai.should();

const database = require("../db/database.js");
const collectionName = "docs";

chai.use(chaiHttp);

describe('docs', () => {
    before(() => {
        return new Promise(async (resolve) => {
            const db = await database.getDb();

            db.db.listCollections(
                { name: collectionName }
            )
                .next()
                .then(async function(info) {
                    if (info) {
                        await db.collection.drop();
                    }
                })
                .catch(function(err) {
                    console.error(err);
                })
                .finally(async function() {
                    await db.client.close();
                    resolve();
                });
        });
    });
    // Test that get docs opens
    describe('GET /docs', () => {
        it('200 HAPPY PATH', (done) => {
            chai.request(server)
                .get("/docs")
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

    // Create new document in database
    describe('POST /docs:id', () => {
        it('should create a new document in the database', (done) => {
            let doc = {
                title: "Jannis testtitel",
                content: "<p>Hello world!</p>",
            };

            chai.request(server)
                .post("/docs")
                .send(doc)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.should.have.property("insertedId");
                    this.id = res.body.insertedId;
                    console.log(this.id);

                    done();
                });
        });

        
        
        it('should edit a document in the database', (done) => {
            let doc = {
                title: "Jannis uppdaterade titel",
                content: "<p>Uppdaterat innehåll</p>",
            };

            chai.request(server)
                .post("/docs/" + this.id)
                .send(doc)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.modifiedCount.should.equal(1);
                    done();
                });
        });
        
    });
    // Test that get docs opens
    describe('GET /docs:id', () => {
        it('opens edited document', (done) => {
            chai.request(server)
                .get("/docs/" + this.id)
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                });
        });
    });
});