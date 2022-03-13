//  server.js

var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');

var TripRoute=require('./api/trip');
module.exports.start = (options) => {

  return new Promise((resolve, reject) => {

    //  Make sure we have a repository and port provided.
    if(!options.db) throw new Error("A server must be started with a connected repository.");
    if(!options.port) throw new Error("A server must be started with a port.");

    //  Create the app, add some logging.
    let app = express();
    let trips= new TripRoute(express.Router(),options.db);

    app.use(morgan('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));

    //  Add the APIs to the app.
    app.use('/trips',trips.router);
    //  Start the app, creating a running server which we return.
    let server = app.listen(options.port, () => {
      resolve(server);
    });

  });



    function modifyResponseBody(req, res, next) {
        let oldJson = res.json;

        res.json = function(data){
            // arguments[0] (or `data`) contains the response body
            // arguments[0] = "modified : " + arguments[0];
            oldJson.apply(res, arguments);

            // res.status(500).send('error')
        };
        next();
    }

};