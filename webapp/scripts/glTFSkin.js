(function () {

    'use strict';

    var _ = require('lodash');

    var IDENTITY = [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ];

    var COMPONENT_TYPES_TO_BUFFERVIEWS = {
        '5120': Int8Array,
        '5121': Uint8Array,
        '5122': Int16Array,
        '5123': Uint16Array,
        '5126': Float32Array
    };

    var TYPES_TO_NUM_COMPONENTS = {
        'SCALAR': 1,
        'VEC2': 2,
        'VEC3': 3,
        'VEC4': 4,
        'MAT2': 4,
        'MAT3': 9,
        'MAT4': 16
    };

    function getInverseBindMatrices( json, skin, buffers ) {
        var accessor = json.accessors[ skin.inverseBindMatrices ];
        var bufferView = json.bufferViews[ accessor.bufferView ];
        var buffer = buffers[ bufferView.buffer ];
        var TypedArray = COMPONENT_TYPES_TO_BUFFERVIEWS[ accessor.componentType ];
        var numComponents = TYPES_TO_NUM_COMPONENTS[ accessor.type ];
        var componentCount = accessor.count * numComponents;
        var arrayBuffer = new TypedArray( buffer, bufferView.byteOffset + accessor.byteOffset, componentCount );
        var inverseBindMatrices = [];
        var beginIndex;
        var endIndex;
        var i;
        // for each matrix in the accessor
        for ( i=0; i<accessor.count; i++ ) {
            // calc the begin and end in arraybuffer
            beginIndex = i * numComponents;
            endIndex = beginIndex + numComponents;
            // get the subarray that composes the matrix
            inverseBindMatrices.push( new Array( arrayBuffer.subarray( beginIndex, endIndex ) ) );
        }
        return inverseBindMatrices;
    }

    module.exports = {

        loadSkins: function( json, buffers ) {
            // for each skin
            var skins = {};
            _.forIn( json.skins, function( skin, id ) {
                // load inverse bind matrices
                var inverseBindMatrices = getInverseBindMatrices( json, skin, buffers );
                // for each joint
                var joints = {};
                skin.jointNames.forEach( function( jointName, index ) {
                    // create joint here first, in order to pass as parent to recursions
                    joints[ jointName ] = {
                        inverseBindMatrix: inverseBindMatrices[ index ],
                        index: index
                    };
                });
                skins[ id ] = {
                    joints: joints,
                    bindShapeMatrix: skin.bindShapeMatrix || IDENTITY.slice()
                };
            });
            return skins;
        }


    };

}());
