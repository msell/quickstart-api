var request = require('supertest'),
    expect = require('expect'),
    chai = require('chai');

describe('WeighIn Controller', function () {
    beforeEach(function () {
        // create user
        request(sails.hooks.http.app)
            .post('/auth/register')
            .send({
                email: 'foo@bar.com',
                password: 'scoobysnacks'
            })
            .end(function (err, res) {
                if (err) return done(err);
                done();
            })
    });
    it('should accept weigh in', function (done) {
        request(sails.hooks.http.app)
            .post('/weighIn/create')
        .set('Authorization', TOKEN)
            .send({
                'weight': 200,
                'date': '2015-01-01',
                'user': 1
            })

        .expect(200)
            .end(function (err, res) {
                if (err) return done(err);
                done();
            })
    });
    it('should require a user association', function (done) {
        request(sails.hooks.http.app)
            .post('/weighIn/create')        
            .send({
                'weight': 200,
                'date': '2015-01-01'
            })

        .expect(401)
            .end(function (err, res) {
                if (err) return done(err);
                done();
            })
    });
    it('should require existing user', function (done) {
        request(sails.hooks.http.app)
            .post('/weighIn/create')
            .send({
                'weight': 200,
                'date': '2015-01-01',
                'user': 555
            })

        .expect(401)
            .end(function (err, res) {
                if (err) return done(err);
                done();
            })
    });
});