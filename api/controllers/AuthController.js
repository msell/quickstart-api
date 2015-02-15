/**
 * AuthController
 *
 * @description :: Server-side logic for managing auths
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var bcrypt = require('bcrypt-nodejs');
var createAndSendToken = require('../services/createAndSendToken.js');
var request = require('request');
var qs = require('querystring');
var emailService = require('../services/emailService.js');
var jwt = require('jwt-simple');

module.exports = {
    login: function (req, res) {
        var email = req.body.email;
        var password = req.body.password;

        if (!email || !password) {
            return res.status(401).send({
                message: 'username and password required'
            });
        }

        User.findOneByEmail(email, function (err, foundUser) {
            if (!foundUser) {
                return res.status(401).send({
                    message: 'username or password invalid'
                });
            }

            bcrypt.compare(password, foundUser.password, function (err, valid) {
                if (err) return res.status(403);

                if (!valid) {
                    return res.status(401).send({
                        message: 'username or password invalid'
                    });
                }

                createAndSendToken(foundUser, res);
            });
        })
    },

    register: function (req, res) {
        var email = req.body.email;
        var password = req.body.password

        if (!email || !password) {
            return res.status(401).send({
                message: 'username and password required'
            });
        }

        User.create({
            email: email,
            password: password
        }).exec(function (err, user) { // .exec is a waterline function
            if (err) return res.status(403);

            createAndSendToken(user, res);
        })
    },

    facebook: function (req, res) {
        var accessTokenUrl = 'https://graph.facebook.com/oauth/access_token';
        var graphApiUrl = 'https://graph.facebook.com/me';

        var params = {
            client_id: req.body.clientId,
            redirect_uri: req.body.redirectUri,
            client_secret: process.env.FACEBOOK_SECRET,
            code: req.body.code
        };

        request.get({
            url: accessTokenUrl,
            qs: params
        }, function (err, response, accessToken) {

            accessToken = qs.parse(accessToken);

            request.get({
                url: graphApiUrl,
                qs: accessToken,
                json: true
            }, function (err, response, profile) {
                User.findOneByFacebookId(profile.id).exec(function (err, existingUser) {
                    if (existingUser) {
                        console.log('facebook user back ' + existingUser);
                        emailService.send('mwsell@gmail.com');
                        return createAndSendToken(existingUser, res);
                    }

                    console.log('New facebook user: ' + profile.name);
                    User.create({
                        facebookId: profile.id,
                        displayName: profile.name
                    }).exec(function (err, newUser) {
                        if (err) return res.status(403);

                        return createAndSendToken(newUser, res);
                    })
                })
            });
        })
    },

    google: function (req, res) {
        var url = 'https://accounts.google.com/o/oauth2/token';
        var apiUrl = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect';

        var params = {
            client_id: req.body.clientId,
            redirect_uri: req.body.redirectUri,
            code: req.body.code,
            grant_type: 'authorization_code',
            client_secret: process.env.GOOGLE_SECRET
        };

        request.post(url, {
            json: true,
            form: params
        }, function (err, response, token) {
            var accessToken = token.access_token;
            var headers = {
                Authorization: 'Bearer ' + accessToken
            }

            request.get({
                url: apiUrl,
                headers: headers,
                json: true
            }, function (err, response, profile) {
                User.findOneByGoogleId(profile.sub).exec(function (err, foundUser) {
                    if (foundUser) {
                        console.log('welcome back ' + foundUser.displayName);
                        return createAndSendToken(foundUser, res);
                    }

                    console.log('creating user ' + profile.name);
                    User.create({
                        googleId: profile.sub,
                        displayName: profile.name
                    }).exec(function (err, newUser) {
                        if (err) return res.status(403);

                        return createAndSendToken(newUser, res);
                    })
                })
            })
        });
    },
    twitter: function (req, res) {
        var requestTokenUrl = 'https://api.twitter.com/oauth/request_token';
        var accessTokenUrl = 'https://api.twitter.com/oauth/access_token';
        var authenticateUrl = 'https://api.twitter.com/oauth/authorize';

        if (!req.query.oauth_token || !req.query.oauth_verifier) {
            var requestTokenOauth = {
                consumer_key: 'UENUvKrmfHn31MmBy2Xufo8QN',
                consumer_secret: process.env.TWITTER_SECRET,
                callback: 'http://localhost:9000'
            };

            // Step 1. Obtain request token for the authorization popup.
            request.post({
                url: requestTokenUrl,
                oauth: requestTokenOauth
            }, function (err, response, body) {
                var oauthToken = qs.parse(body);
                var params = qs.stringify({
                    oauth_token: oauthToken.oauth_token
                });

                // Step 2. Redirect to the authorization screen.
                res.redirect(authenticateUrl + '?' + params);
            });
        } else {
            var accessTokenOauth = {
                consumer_key: 'UENUvKrmfHn31MmBy2Xufo8QN',
                consumer_secret: process.env.TWITTER_SECRET,
                token: req.query.oauth_token,
                verifier: req.query.oauth_verifier
            };

            // Step 3. Exchange oauth token and oauth verifier for access token.
            request.post({
                url: accessTokenUrl,
                oauth: accessTokenOauth
            }, function (err, response, profile) {
                profile = qs.parse(profile);
                // Step 4a. Link user accounts.
                if (req.headers.authorization) {
                    User.findOne({
                        twitter: profile.user_id
                    }, function (err, existingUser) {
                        if (existingUser) {
                            return res.status(409).send({
                                message: 'There is already a Twitter account that belongs to you'
                            });
                        }
                        var token = req.headers.authorization.split(' ')[1];
                        var payload = jwt.decode(token, 'shhh..');
                        User.findById(payload.sub, function (err, user) {
                            if (!user) {
                                return res.status(400).send({
                                    message: 'User not found'
                                });
                            }
                            user.twitter = profile.user_id;
                            user.displayName = user.displayName || profile.screen_name;
                            user.twitterToken = profile.oauth_token;
                            user.twitterSecret = profile.oauth_token_secret;

                            User.create({
                                twitter: user.twitter,
                                displayName: user.displayName,
                                twitterToken: user.twitterToken,
                                twitterSecret: user.twitterSecret
                            }).exec(function (err, user) {
                                createAndSendToken(user, res);
                            });
                        });
                    });
                } else {
                    // Step 4b. Create a new user account or return an existing one.
                    User.findOne({
                        twitter: profile.user_id
                    }, function (err, existingUser) {
                        if (existingUser) {
                            createAndSendToken(existingUser, res);
                        }
                        User.create({
                            twitter: profile.user_id,
                            displayName: profile.screen_name,
                            twitterToken: profile.oauth_token,
                            twitterSecret: profile.oauth_token_secret
                        }).exec(function (err, user) {
                            createAndSendToken(user, res);
                        });
                    });
                }
            });
        }
    }
};