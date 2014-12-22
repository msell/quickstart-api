var config = require('../../config/appConfig.js');
var _ = require('underscore');
var fs = require('fs');
var jwt = require('jwt-simple');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var User = require('../models/User.js');

module.exports.send = function (email) {
    var payload = {
        sub: email

    };
    
    var mandrillOptions = {
        service: 'Mandrill',                
        auth: {
            user: process.env.SMTP_USERNAME,
            pass: process.env.SMTP_PASSWORD            
        }
    };

    var token = jwt.encode(payload, process.env.EMAIL_SECRET);
    var transporter = nodemailer.createTransport(smtpTransport(mandrillOptions));

    var mailOptions = {  
        from:'foo <accounts@foo.com>',
        to: email,
        subject: 'Welcome to foo',
        html: getHtml(token)
    };
    
    transporter.sendMail(mailOptions, function(err){
        if(err) return res.send(500, err);
        
        console.log('sent email to ' + email);
    })
}

module.exports.handler = function(req, res){
    var token = req.token;
    var payload = jwt.decode(token, process.env.EMAIL_SECRET);
    var email = payload.sub;
    if(!email) return errorHandler(res);
    
    User.findOne({email:email}, function(err, foundUser){
        if(err) return res.status(500);
        
        if(!foundUser) return handleError(res);
        
        if(!user.active)
            user.active = true;
        
        user.save(function(err){
            if(err) return res.status(500);
            
            return res.redirect(config.APP_URL);
        })
    })
}

var model = {
    verifyUrl: 'http://localhost:3000/auth/verfiyEmail?token=',
    title: 'Welcome to foo',
    subTitle: 'Thanks for signing up!',
    body: 'Please verify your email address by clicking the button below'
};

function getHtml(token) {
    
    var path = __dirname + '/emailVerification.html';
    var html = fs.readFileSync(path, encoding = 'utf8'); // TODO: Make async
    var template = _.template(html);
    model.verifyUrl += token;
    return template(model);
}
function handleError(res){
    return res.status(401).send({
        message: 'Authentication failed, unable to verify email'
    });    
}
_.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g
};