const app = require('express')();
const functions = require('./firebase').functions;
const screamController = require('./routes/scream.routes');
const userController = require('./routes/user.routes');

app.use('/', screamController);
app.use('/', userController);
exports.api = functions.https.onRequest(app);
