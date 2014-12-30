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
            
            request.get({url: graphApiUrl, qs: accessToken, json: true}, function (err, response, profile) {                               
                User.findOneByFacebookId(profile.id).exec(function (err, existingUser) {
                    if (existingUser){
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
                        console.log('welcome back '+ foundUser.displayName);
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
    }
};