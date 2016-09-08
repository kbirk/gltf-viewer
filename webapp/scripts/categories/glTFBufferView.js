(function () {

    'use strict';

    let context = require('../render/gl');

    module.exports = function(gltf, description, done) {
        let gl = context();
        let buffer = gltf.buffers[ description.buffer ].instance;
        description.source = buffer.slice(description.byteOffset, description.byteOffset + description.byteLength);
        if (description.target) {
            description.instance = gl.createBuffer();
            gl.bindBuffer(description.target, description.instance);
            gl.bufferData(description.target, description.source, gl.STATIC_DRAW);
        }
        done(null);
    };

}());
