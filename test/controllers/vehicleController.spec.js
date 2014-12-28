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
        it("should allow user to post new vehicle", function(done){
            request(sails.hooks.http.app)
                .post('/vehicle/create?make=Toyota&model=FJ+Cruiser')
                .expect(200,done);
        });
    });
});