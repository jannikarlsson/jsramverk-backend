process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');

const server = require('../app.js');
const setup = require("./setupTest.js")

chai.use(chaiHttp);
chai.should();
var expect = chai.expect;

let insertedId;

describe('Get documents', () => {
    before(async () => {
        await setup.insertUser();
        await setup.insertDoc();
    });

    // Test that a single document opens
    describe('GET /docs:id', () => {
        it('opens single document', (done) => {
            chai.request(server)
                .get("/docs/" + setup.docId)
                .set({ "x-access-token": setup.token })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body._id.should.equal(setup.docId);
                    expect(res.body.title).to.exist;
                    expect(res.body.content).to.exist;
                    expect(res.body.owner).to.exist;
                    expect(res.body.type).to.exist;
                    expect(res.body.permissions).to.exist;
                    done();
                });
        });
    });

    // Try to open doc with fake ID, should not work
    describe('GET /docs:id', () => {
        it('should not open document', (done) => {
            let fakeId = "34"

            chai.request(server)
                .get("/docs/" + fakeId)
                .set({ "x-access-token": setup.token })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a("string");
                    res.body.should.equal("Error!");
                    done();
                });
        });
    });
    
    describe('POST /docs:id', () => {

        // Edits a document in the database
        it('should edit a document in the database', (done) => {
            let doc = {
                title: "Uppdaterad titel",
                content: "<p>Uppdaterat innehåll</p>",
                permissions: ["testuser"]
            };

            chai.request(server)
                .post("/docs/" + setup.docId)
                .send(doc)
                .set({ "x-access-token": setup.token })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.matchedCount.should.equal(1);
                    res.body.modifiedCount.should.equal(1);
                    done();
                });
        });
    });

    // Adds permission in the database
    describe('POST /docs/permission', () => {
        it('should add permission to a document in the database and send email', (done) => {
            let permission = {
                id: setup.docId,
                email: "fake@fake.fake",
                title: "",
                sender: ""
            };

            chai.request(server)
                .post("/docs/permission")
                .send(permission)
                .set({ "x-access-token": setup.token })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.modifiedCount.should.equal(1);
                    done();
                });
        });
    });

    // Print document to pdf
    describe('POST /docs/print', () => {
        it('should return a pdf buffer', (done) => {
            let doc = {
                title: "Jannis testtitel",
                content: "<p>Hello world!</p>"
            };

            chai.request(server)
                .post("/docs/print")
                .send(doc)
                .set({ "x-access-token": setup.token })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.data.should.be.an("array");
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
                owner: "testuser2",
                permissions: ["testuser2"],
                type: "text"
            };

            chai.request(server)
                .post("/docs")
                .send(doc)
                .set({ "x-access-token": setup.token })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.should.have.property("insertedId");
                    this.insertedId = res.body.insertedId;
                    done();
                });
        });
        // Test that the new document opens
        it('opens the new document', (done) => {
            chai.request(server)
                .get("/docs/" + this.insertedId)
                .set({ "x-access-token": setup.token })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body._id.should.equal(this.insertedId);
                    res.body.content.should.equal("<p>Hello world!</p>");
                    res.body.title.should.equal("Jannis testtitel");
                    res.body.owner.should.equal("testuser2");
                    res.body.permissions.should.include("testuser2");
                    res.body.type.should.equal("text");
                    done();
                });
        });
    });

    // Adds comment to document
    describe('POST /docs/comment', () => {
        it('should add a comment to a document in the database', (done) => {
            let comment = {
                id: setup.docId,
                text: "kommenterad text",
                comment: "kommentar",
                user: "testuser"
            };

            chai.request(server)
                .post("/docs/comment")
                .send(comment)
                .set({ "x-access-token": setup.token })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.an("object");
                    res.body.modifiedCount.should.equal(1);
                    done();
                });
        });
        // Test that the document now has comments
        it('should find a comment', (done) => {
            chai.request(server)
                .get("/docs/" + setup.docId)
                .set({ "x-access-token": setup.token })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body._id.should.equal(setup.docId);
                    res.body.comments[0].should.include({text: "kommenterad text", comment: "kommentar", user: "testuser"});
                    done();
                });
        });
    });

    // Returns all documents for one user

    describe('POST /graphql', () => {
        it('200 HAPPY PATH', (done) => {
            let user = "testuser";
            chai.request(server)
                .post("/graphql")
                .send({ query: `{documents(username: "${user}"){ title }}`})
                .set({ "x-access-token": setup.token })
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.data.documents.should.be.an("array");
                    done();
                });
        });
    });
});