(function () {

    'use strict';

    let Shader = require('../render/Shader');

    module.exports = function(gltf, description, done) {
        // create instance
        description.instance = new Shader({
            vertex: gltf.shaders[ description.vertexShader ].source,
            fragment: gltf.shaders[ description.fragmentShader ].source,
            attributes: description.attributes
        });
        done(null);
    };

}());
