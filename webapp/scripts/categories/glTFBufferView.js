(function () {

    'use strict';

    var TARGETS = {
        '34962': 'ARRAY_BUFFER',
        '34963': 'ELEMENT_ARRAY_BUFFER'
    };

    module.exports = function( gltf, description, done ) {
        description.buffer = gltf.buffers[ description.buffer ];
        description.target = TARGETS[ description.target ];
        done( null );
    };

}());
