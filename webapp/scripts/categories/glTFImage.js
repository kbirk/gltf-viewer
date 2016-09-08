(function () {

    'use strict';

    let ImageLoader = require('../util/ImageLoader');

    module.exports = function(gltf, description, done) {
        // load image
        ImageLoader.load({
            url: description.uri,
            success: image => {
                description.image = image;
                done(null);
            },
            error: err => {
                done(err);
            }
        });
    };

}());
