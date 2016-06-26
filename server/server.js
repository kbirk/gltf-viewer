(function() {

    'use strict';

    var path = require('path');
    var express = require('express');
    var compression = require('compression');
    var bodyParser = require('body-parser');
    var models = require('./routes/models');
    var app = express();

    var HTTP_PORT = 8080;
    var APP_DIR = path.normalize(__dirname + '/../build');

    app.use(bodyParser.json()); // support JSON-encoded bodies
    app.use(bodyParser.urlencoded({ extended: false })); // support URL-encoded bodies
    app.use(compression());
    app.use(express.static(APP_DIR));

    app.get('/models', function(req, res) {
        var PREFIX = 'build/';
        var paths =  models.get('build/models').map(function(path) {
            return path.replace(PREFIX, '');
        });
        res.send(paths);
    });

    app.listen(HTTP_PORT, function() {
        console.log('Listening on port %d', HTTP_PORT);
    });

}());
