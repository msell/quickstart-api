var jwt = require('jwt-simple');

module.exports = function(req, res, next){
    
    if (!req.headers || !req.headers.authorization) {
        return res.status(401).send({
            message: 'Unauthorized'
        });
    }

    var token = req.headers.authorization.split(' ')[1];
    var payload = jwt.decode(token, "shhh..");

    if (!payload.sub) {
        res.status(401).send({
            message: 'Authentication failed'
        });
    }
        
    sails.models.user.findOne({id: payload['sub']}, function(err, user){  
        if(err) return next(err);
           
        req.body.user = user;
//        var model = req.options.model || req.options.controller;
//        if(model && sails.models[model].attributes['user']){
//            req.body[model].user = user;
//        }
        
        next();
    })    
}