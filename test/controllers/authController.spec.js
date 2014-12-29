var VehcileController = require('../../api/controllers/AuthController'),
    request = require('supertest'),
    expect = require('expect'),
    chai = require('chai');

//sinon = require('sinon'),

describe('AuthController', function () {
    describe("register", function () {
        it("should register new user", function (done) {
            request(sails.hooks.http.app)
                .post('/auth/register')
                .send({email:'foo@bar.com', password:'abc123!'})
                .expect(200, done);
        });    
    });
});