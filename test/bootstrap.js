/**
 * Test starter - with this version of sails.js we can only start one sails server,
 * to solve this problem we use only one before All and after All to start and
 * stop the server
 */
var Sails = require('sails');
var _ = require('lodash');
var request = require('supertest');

global.DOMAIN = 'http://localhost';
global.PORT = 1420;
global.HOST = DOMAIN + ':' + PORT;
global.TOKEN = {};

before(function (callback) {
    this.timeout(7000);

    var configs = {
        log: {
            level: 'info'
        },
        connections: {
            memory: {
                // lets use memory tests ...
                adapter: 'sails-memory'
            }
        },
        models: {
            connection: 'memory'
        },
        port: PORT,
        environment: 'test',

        // @TODO needs suport to csrf token
        csrf: false,

        // we dont need this configs in API test
        hooks: {
            grunt: false,
            socket: false,
            pubsub: false
        }
    };

    Sails.load(configs, function (err, sails) {
        if (err) {
            console.error(err);
            return callback(err);
        }

        console.log('rodo!');
        request(sails.hooks.http.app)
            .post('/auth/register')
            .send({
                email: 'foo@bar.com',
                password: 'abc123!'
            })
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    console.error(err);
                    return callback(err);
                }

                TOKEN = 'bearer ' + res.body.token
                console.log("token: " + TOKEN);
            });

        // here you can load fixtures, etc.
        callback(err, sails);
    });
});

after(function (done) {
    // here you can clear fixtures, etc.
    console.log('lowering sails');
    sails.lower(done);
});