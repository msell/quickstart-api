/**
* WeightLossGoal.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
      startDate: { type: 'date', required: true},
      endDate: { type: 'date', required: true},
      startWeight: { type: 'integer', required: true, min: 100},
      endWeight: { type: 'integer', required: true, min: 100},
      user: {model: 'user', required: true}
  },
    beforeCreate:function(values, cb){
        //console.log(values);
        cb();
    }
};

