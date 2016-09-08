(function () {

    'use strict';

    let XHRLoader = require('../util/XHRLoader');

    module.exports = function(gltf, description, done) {
        // load buffer
        XHRLoader.load({
            url: description.uri,
            responseType: 'arraybuffer',
            success: buffer => {
                description.instance = buffer;
                done(null);
            },
            error: err => {
                done(err);
            }
        });
    };

}());
