(function () {

    'use strict';

    var XHRLoader = require('../util/XHRLoader');

    var TYPES = {
        '35632': 'FRAGMENT_SHADER',
        '35633': 'VERTEX_SHADER'
    };

    module.exports = function( gltf, description, done ) {
        XHRLoader.load({
            url: description.uri,
            responseType: 'text',
            success: function( source ) {
                description.source = source;
                description.type = TYPES[ description.type ];
                done( null );
            },
            error: function( err ) {
                done( err );
            }
        });
    };

}());
