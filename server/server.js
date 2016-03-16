( function() {

    "use strict";

    var path = require('path');
    var express = require('express');
    var compression = require('compression');
    var bodyParser = require('body-parser');
    var app = express();

    var HTTP_PORT = 8080;
    var APP_DIR = path.normalize( __dirname + '/../build' );

    app.use( bodyParser.json() ); // support JSON-encoded bodies
    app.use( bodyParser.urlencoded({ extended: false }) ); // support URL-encoded bodies
    app.use( compression() );
    app.use( express.static( APP_DIR ) );

    app.listen( HTTP_PORT, /*HOST,*/ function() {
        console.log( 'Listening on port %d', HTTP_PORT );
    });

}());
