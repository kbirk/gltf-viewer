(function () {

    'use strict';

    let Texture = require('../render/Texture');

    module.exports = function(gltf, description, done) {
        // create instance
        description.instance = new Texture({
            internalFormat: description.internalFormat,
            format: description.format,
            type: description.type,
            target: description.target,
            image: gltf.images[ description.source ].image,
            sampler: gltf.samplers[ description.sampler ]
        });
        done(null);
    };

}());
