/**
 * WeighIn.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

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
        console.log(JSON.stringify(values));
        User.findOne({
            id: values.user
        }).exec(function (err, user) {
            if (err) return next(err);
            if (!user) {
                console.log(user);
                var err = new Error('user does not exist!');
                return next(err);
            }
            next();
        })
    }
};