(function() {

    'use strict';

    let path = require('path');
    let express = require('express');
    let compression = require('compression');
    let bodyParser = require('body-parser');
    let models = require('./routes/models');
    let app = express();

    const HTTP_PORT = 8080;
    const APP_DIR = path.normalize(__dirname + '/../build');

    // support JSON-encoded bodies
    app.use(bodyParser.json());
    // support URL-encoded bodies
    app.use(bodyParser.urlencoded({ extended: false }));
    // use compression
    app.use(compression());
    app.use(express.static(APP_DIR));

    app.get('/models', (req, res) => {
        const PREFIX = 'build/';
        let paths =  models.get('build/models').map(path => {
            return path.replace(PREFIX, '');
        });
        res.send(paths);
    });

    app.listen(HTTP_PORT, () => {
        console.log('Listening on port %d', HTTP_PORT);
    });

}());
