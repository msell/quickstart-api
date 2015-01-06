var request = require('supertest'),
    expect = require('expect'),
    chai = require('chai');

describe('WeightLossGoal Controller', function () {
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
        it('should accept new goal', function (done) {
            request(sails.hooks.http.app)
                .post('/weightLossGoal/create')
                .send({
                    'startDate': '2015-01-01',
                    'endDate': '2015-06-01',
                    'startWeight': 260,
                    'endWeight': 200,
                    'user': 1
                })

            .expect(200)
                .end(function (err, res) {
                    if (err) return done(err);
                    done();
                })
        });

        it('should require endWeight', function (done) {
            request(sails.hooks.http.app)
                .post('/weightLossGoal/create')
                .send({
                    'startDate': '2015-01-01',
                    'endDate': '2015-06-01',
                    'startWeight': 260,
                    'endWeight': 0,
                    'user': 1
                })

            .expect(400)
                .end(function (err, res) {
                    if (err) return done(err);
                    done();
                })
        });

        it('should require existing user',
            function (done) {
                request(sails.hooks.http.app)
                    .post('/weightLossGoal/create')
                    .send({
                        'startDate': '2015-01-01',
                        'endDate': '2015-06-01',
                        'startWeight': 260,
                        'endWeight': 200
                    })
                    .expect(400)
                    .end(function (err, res) {
                        if (err) return done(err);
                        done();
                    })

            });
});