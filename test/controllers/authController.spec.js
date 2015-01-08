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
                .send({email:'foo@baz.com', password:'abc123!'})
                .expect(200, done);
        });
        it("should reqire password", function (done) {
            request(sails.hooks.http.app)
                .post('/auth/register')
                .send({email:'foo@bar.com'})
                .expect(401, done);
        });
        it("should return auth token", function (done) {
            request(sails.hooks.http.app)
                .post('/auth/register')
                .send({email:'baz@bar.com', password:'abc123!'})
                .expect(200)
                .expect(sentToken)
                .end(function(err, res){
                    if(err) return done(err);
                    done();
            })
        });
        
        function sentToken(res){
            if(!('token' in res.body)) throw new Error('missing token in body');
        }
    });
});