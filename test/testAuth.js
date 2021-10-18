process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');

const server = require('../app.js');
const database = require("../db/database.js");
const setup = require("./setupTest.js")

chai.use(chaiHttp);
chai.should();

describe('Get documents', () => {
    before(async () => {
        await setup.insertUser();
        await setup.insertDoc();
    });

    // Logs user in

    describe('POST /auth/login', () => {
        it('should log the user in', (done) => {
            let user = {
                username: "testuser",
                password: "password"
            };

            chai.request(server)
                .post("/auth/login")
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.data.should.have.property("token");
                    done();
                });
        });
    });

    // Tries to log in with fake username

    describe('POST /auth/login', () => {
        it('should log the user in', (done) => {
            let user = {
                username: "testuser34",
                password: "password"
            };

            chai.request(server)
                .post("/auth/login")
                .send(user)
                .end((err, res) => {
                    res.should.have.status(401);
                    done();
                });
        });
    });

    // Creates new user in database
    describe('POST /auth/register', () => {
        it('should create a new user in the database', (done) => {
            let user = {
                username: "testuser2",
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

});