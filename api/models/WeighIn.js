//var validateUser = require('../services/validateUser.js')

function validationError(invalidAttributes, status, message) {
  var WLValidationError = require('../../node_modules/sails/node_modules/waterline/lib/waterline/error/WLValidationError.js');
  return new WLValidationError({
      invalidAttributes: invalidAttributes,
      status: status,
      message: message
    }
  );
}


module.exports = {

    attributes: {
        weight: {
            type: 'float',
            required: true
        },
        date: {
            type: 'date',
            required: 'true'
        },
        user: {
            model: 'user'
        }
    },
    beforeCreate: function (values, next) {        
        User.findOne({
            id: values.user
        }).exec(function (err, user) {
            if (err) return next(err);
            if (!user) {                         
                return next(validationError({user: [{message: 'User does not exist'}]}, 400));
            }
            next();
        })
    }
};