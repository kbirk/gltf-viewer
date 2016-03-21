(function () {

    'use strict';

    var MAG_FILTERS = {
        '9728': 'NEAREST',
        '9729': 'LINEAR'
    };

    var MIN_FILTERS = {
        '9728': 'NEAREST',
        '9729': 'LINEAR',
        '9984': 'NEAREST_MIPMAP_NEAREST',
        '9985': 'LINEAR_MIPMAP_NEAREST',
        '9986': 'NEAREST_MIPMAP_LINEAR',
        '9987': 'LINEAR_MIPMAP_LINEAR'
    };

    var WRAP_S = {
        '33071': 'CLAMP_TO_EDGE',
        '33648': 'MIRRORED_REPEAT',
        '10497': 'REPEAT'
    };

    var WRAP_T = {
        '33071': 'CLAMP_TO_EDGE',
        '33648': 'MIRRORED_REPEAT',
        '10497': 'REPEAT'
    };

    module.exports = function( gltf, description, done ) {
        description.minFilter = MIN_FILTERS[ description.minFilter ];
        description.magFilter = MAG_FILTERS[ description.magFilter ];
        description.wrapS = WRAP_S[ description.wrapS ];
        description.wrapT = WRAP_T[ description.wrapT ];
        done( null );
    };

}());
