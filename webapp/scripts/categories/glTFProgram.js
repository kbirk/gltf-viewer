(function () {

    'use strict';

    var Shader = require('../render/Shader');

    module.exports = function( gltf, description, done ) {
        // create instance
        description.instance = new Shader({
            vertex: gltf.shaders[ description.fragmentShader ],
            fragment: gltf.shaders[ description.vertexShader ],
            attributes: description.attributes
        });
        done( null );
    };

}());
