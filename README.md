# api [![Build Status](https://travis-ci.org/msell/quickstart-api.svg?branch=master)](https://travis-ci.org/msell/quickstart-api)

a [Sails](http://sailsjs.org) application

# Run tests
```
npm test
```
# Facebook OAuth
Use the [Facebook developers tools](https://developers.facebook.com/apps/) to approve any client URLs

# Google OAuth
Use the [Google developers console](https://console.developers.google.com) to approve any client URLs

# Environment Variables
QUICKSTART_DB=mongodb://<dbuser>:<dbpassword>@<hostname>:<port>/databaseName

# Issues
- Would like to figure out a way to get mocha --watch to work on tests.  Adding --watch flag to mocha.opts does not play nice with sails.


# Debugging Mocha tests
> node-inspector
> mocha --debug-brk bootstrap.js controllers/weightLossGoalContoller.spec.js
- in chrome: http://127.0.0.1:8080/debug?port=5858
