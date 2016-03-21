(function () {

    'use strict';

    var COMPONENT_TYPES = {
        '5120': 'BYTE',
        '5121': 'UNSIGNED_BYTE',
        '5122': 'SHORT',
        '5123': 'UNSIGNED_SHORT',
        '5126': 'FLOAT'
    };

    var NUM_COMPONENTS = {
        'SCALAR': 1,
        'VEC2': 2,
        'VEC3': 3,
        'VEC4': 4,
        'MAT2': 4,
        'MAT3': 9,
        'MAT4': 16
    };

    module.exports = function( gltf, description, done ) {
        description.bufferView = gltf.bufferViews[ description.bufferView ];
        description.componentType = COMPONENT_TYPES[ description.componentType ];
        description.size = NUM_COMPONENTS[ description.type ];
        done( null );
    };

}());
