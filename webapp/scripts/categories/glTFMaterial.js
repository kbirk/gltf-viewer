(function () {

    'use strict';

    module.exports = function( gltf, description, done ) {
        description.technique = gltf.techniques[ description.technique ];
        Object.keys( description.values ).forEach( function( key ) {
            var value = description.values[key];
            if ( typeof value === 'string' ) {
                description.values[key] = gltf.textures[value];
            }
        });
        done( null );
    };

}());
