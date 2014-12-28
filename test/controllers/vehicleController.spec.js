var VehcileController = require('../../api/controllers/VehicleController'),
    request = require('supertest'),
    expect = require('expect'),
    chai = require('chai');
//sinon = require('sinon'),

describe('VehicleController', function () {
    describe("get vehicles", function () {
        it("should not allow anonymous access", function (done) {
            request(sails.hooks.http.app)
                .get('/vehicle')
                .expect(401,done);
        });
        it("should fail", function(){
            expect(1).toBe(1);
        });
    });
});