(function () {

    'use strict';

    let Material = require('../render/Material');

    module.exports = function(gltf, description, done) {
        // replace textures with instances
        Object.keys(description.values).forEach(key => {
            let value = description.values[key];
            if (Array.isArray(value)) {
                description.values[key] = new Float32Array(value);
            }
            if (typeof value === 'string') {
                description.values[key] = gltf.textures[value].instance;
            }
        });
        // create instance
        description.instance = new Material({
            values: description.values
        });
        done(null);
    };

}());
