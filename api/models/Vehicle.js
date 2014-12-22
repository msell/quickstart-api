/**
 * Vehicle.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

    attributes: {
        make: {
            type: 'string',
            required: true
        },
        model: {
            type: 'string',
            required: true
        },
        year: {
            type: 'integer',
            required: false
        }
    }
};