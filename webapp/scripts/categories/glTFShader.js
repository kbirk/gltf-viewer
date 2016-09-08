(function () {

    'use strict';

    let XHRLoader = require('../util/XHRLoader');

    module.exports = function(gltf, description, done) {
        // load shader source
        XHRLoader.load({
            url: description.uri,
            responseType: 'text',
            success: source => {
                description.source = source;
                done(null);
            },
            error: err => {
                done(err);
            }
        });
    };

}());
