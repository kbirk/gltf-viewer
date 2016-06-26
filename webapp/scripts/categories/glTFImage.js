(function () {

    'use strict';

    var ImageLoader = require('../util/ImageLoader');

    module.exports = function(gltf, description, done) {
        // load image
        ImageLoader.load({
            url: description.uri,
            success: function(image) {
                description.image = image;
                done(null);
            },
            error: function(err) {
                done(err);
            }
        });
    };

}());
