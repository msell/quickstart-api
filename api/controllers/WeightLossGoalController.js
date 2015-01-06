module.exports = {
    index: function (req, res) {        
        console.log(req.session.userId);
        
        console.log(req);
        //console.log("index userid " + req.session.userId);
        //values.owner = req.session.userId;
//        Model.create(values, function(err, model){
//            console.log(values);
//        })
    }
};