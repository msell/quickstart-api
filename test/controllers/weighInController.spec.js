var VehcileController = require('../../api/controllers/WeighInController'),
    request = require('supertest'),
    expect = require('expect'),
    chai = require('chai');

describe('WeighIn Controller', function () {
    it('should accept weigh in', function (done) {
        request(sails.hooks.http.app)
            .post('/weighIn/create')
            .send({
                'weight': 200,
                'date': '2015-01-01',
                'owner': 1
            })

        .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                done();

            })
    });
});