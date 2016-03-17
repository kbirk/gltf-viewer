(function () {

    'use strict';

    module.exports = function( gltf, description, done ) {
        description.fragmentShader = gltf.shaders[ description.fragmentShader ];
        description.vertexShader = gltf.shaders[ description.vertexShader ];
        done( null );
    };

}());
