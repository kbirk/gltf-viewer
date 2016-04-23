(function () {

    'use strict';

    var XHRLoader = require('../util/XHRLoader');

    module.exports = function( gltf, description, done ) {
        // load buffer
        XHRLoader.load({
            url: description.uri,
            responseType: 'arraybuffer',
            success: function( buffer ) {
                description.instance = buffer;
                done( null );
            },
            error: function( err ) {
                done( err );
            }
        });
    };

}());
