(function () {

    'use strict';

    var XHRLoader = require('../util/XHRLoader');

    module.exports = function(gltf, description, done) {
        // load shader source
        XHRLoader.load({
            url: description.uri,
            responseType: 'text',
            success: function(source) {
                description.source = source;
                done(null);
            },
            error: function(err) {
                done(err);
            }
        });
    };

}());
