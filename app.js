/*global require, module, __dirname, console*/

var express = require('express'),
    swig = require('swig'),
    bodyParser = require('body-parser'),
    orm = require('orm'),
    path = require('path');

//var http = require('http');
//var favicon = require('serve-favicon');


/*** APP SETUP ***/


var app = express(); //now app.js can be required to bring app

var router = express.Router();

module.exports = app;
module.exports.routers = router;
//app.use(router);


//bodyparser settings
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// method-override
var methodOverride = require('method-override');

// override with POST having ?_method=DELETE
app.use(methodOverride('_method'));

//public dir
app.use(express.static(path.join(__dirname, '/public')));

//set up views
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

//change this to production later
app.set('env', 'development');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));



/*** DB ***/

var db_conf = require("./database/db");
app.use(orm.express("sqlite://database/stackunderflow.db", db_conf));


/*** ROUTES ***/

require('./routes/routes');


/*** ERROR HANDLERS ***/

// catch 404 and forward to error handler
// app.use(function (req, res, next) {
//     var err = new Error('The page is Not Found');
//     err.status = 404;
//     next(err);
// });

app.use(function (err, req, res, next) {
    'use strict';

    var errors = {
        200: 'OK',
        201: 'Created',
        204: 'No Content',
        205: 'Reset Content',
        300: 'Multiple Choices',
        301: 'Moved Permanently',
        302: 'Found',
        303: 'See Other',
        304: 'Not Modified',
        400: 'Bad Request',
        404: 'Not Found',
        405: 'Method Not Allowed',
        406: 'Not Acceptable',
        500: 'Internal Server Error',
        501: 'Not Implemented'
    };

    //try to assign error status
    try {

        if (err.status !== undefined) {

            res.status(err.status || 404);

            if (err.status === 404) {

                err.message = "The Page you required is not found in our server";

            } else if (err.status === 400) {

                err.message = "Invalid parameters. Question id, answer id and comment id need to be numeric.";

            }

        }

    } catch (ignore) {}

    //no custom error message -> use default
    if (err.message === undefined) {

        err.message = errors[err.status];

    }

    //output
    res.format({

        //output in text/html
        'text/html': function () {
            res.set('Content-Type', 'text/html');
            res.render('error', {message: err.message, status: err.status });
        },

        //output in application/json
        'application/json': function () {
            res.set('Content-Type', 'application/json');
            res.send({'message': err.message, 'status': err.status });
        },

        //output format not recognised
        'default': function () {
            res.set('Content-Type', 'application/json');
            res.json({'message': err.message, 'status': err.status });
        }

    });//res.format

});//app.use(function (err, req, res, next)


// error handlers


// // development error handler
// // will print stacktrace
// if (app.get('env') === 'development') {
//     app.use(function (err, req, res, next) {
//         res.status(err.status || 500);
//         res.format({
//             'text/html': function (){
//                 res.render('error', {message: err.message, status: err.status });
//             },

//             'application/json': function (){
//                 res.send({'message': err.message, 'status': err.status });
//             } 
//         });
//     });
// } else {
//     // production error handler
//     // no stacktraces leaked to user
//     app.use(function (err, req, res, next) {
//         res.status(err.status || 500);
//         res.render('error', {
//             message: err.message,
//             error: {}
//         });
//     });
// }

console.log('listening on port 3000');
app.listen(3000);
