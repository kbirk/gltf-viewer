(function () {

    'use strict';

    var Material = require('../render/Material');

    module.exports = function( gltf, description, done ) {
        // replace textures with instances
        Object.keys( description.values ).forEach( function( key ) {
            var value = description.values[key];
            if ( typeof value === 'string' ) {
                description.values[key] = gltf.textures[value].instance;
            }
        });
        // create instance
        description.instance = new Material({
            values: description.values
        });
        done( null );
    };

}());
