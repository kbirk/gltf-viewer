(function () {

    'use strict';

    let NUM_COMPONENTS = {
        'SCALAR': 1,
        'VEC2': 2,
        'VEC3': 3,
        'VEC4': 4,
        'MAT2': 4,
        'MAT3': 9,
        'MAT4': 16
    };

    module.exports = function(gltf, description, done) {
        description.size = NUM_COMPONENTS[ description.type ];
        done(null);
    };

}());
