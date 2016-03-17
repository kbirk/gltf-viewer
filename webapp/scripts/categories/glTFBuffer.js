(function () {

    'use strict';

    var XHRLoader = require('../util/XHRLoader');

    module.exports = function( gltf, description, done ) {
        XHRLoader.load({
            url: description.uri,
            responseType: 'arraybuffer',
            success: function( buffer ) {
                description.source = buffer;
                done( null );
            },
            error: function( err ) {
                done( err );
            }
        });
    };

}());
