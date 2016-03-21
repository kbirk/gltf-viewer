(function () {

    'use strict';

    var TARGETS = {
        '34962': 'ARRAY_BUFFER',
        '34963': 'ELEMENT_ARRAY_BUFFER'
    };

    module.exports = function( gltf, description, done ) {
        var buffer = gltf.buffers[ description.buffer ];
        var source = buffer.source.slice( description.byteOffset, description.byteOffset + description.byteLength );
        description.buffer = buffer;
        description.source = source;
        if ( description.buffer ) {
            description.target = TARGETS[ description.target ];
        }
        done( null );
    };

}());
