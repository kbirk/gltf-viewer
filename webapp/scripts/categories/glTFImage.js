(function () {

    'use strict';

    var ImageLoader = require('../util/ImageLoader');

    module.exports = function( gltf, description, done ) {
        ImageLoader.load({
            url: description.uri,
            responseType: 'arraybuffer',
            success: function( image ) {
                description.image = image;
                done( null );
            },
            error: function( err ) {
                done( err );
            }
        });
    };

}());
