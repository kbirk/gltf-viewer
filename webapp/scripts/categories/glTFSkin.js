(function () {

    'use strict';

    // var COMPONENT_TYPES_TO_BUFFERVIEWS = {
    //     '5120': Int8Array,
    //     '5121': Uint8Array,
    //     '5122': Int16Array,
    //     '5123': Uint16Array,
    //     '5126': Float32Array
    // };
    //
    // var TYPES_TO_NUM_COMPONENTS = {
    //     'SCALAR': 1,
    //     'VEC2': 2,
    //     'VEC3': 3,
    //     'VEC4': 4,
    //     'MAT2': 4,
    //     'MAT3': 9,
    //     'MAT4': 16
    // };

    // function extractInverseBinds( skin ) {
    //     var accessor = skin.inverseBindMatrices;
    //     var bufferView = accessor.bufferView;
    //     var buffer = bufferView.buffer;
    //     var TypedArray = COMPONENT_TYPES_TO_BUFFERVIEWS[ accessor.componentType ];
    //     var numComponents = TYPES_TO_NUM_COMPONENTS[ accessor.type ];
    //     var componentCount = accessor.count * numComponents;
    //     var arraybuffer = new TypedArray( buffer.source, bufferView.byteOffset + accessor.byteOffset, componentCount );
    //     var inverseBindMatrices = [];
    //     var beginIndex;
    //     var endIndex;
    //     var i;
    //     // for each matrix in the accessor
    //     for ( i=0; i<accessor.count; i++ ) {
    //         // calc the begin and end in arraybuffer
    //         beginIndex = i * numComponents;
    //         endIndex = beginIndex + numComponents;
    //         // get the subarray that composes the matrix
    //         inverseBindMatrices.push( new Array( arraybuffer.subarray( beginIndex, endIndex ) ) );
    //     }
    //     return inverseBindMatrices;
    // }

    module.exports = function( gltf, description, done ) {
        description.inverseBindMatrices = gltf.accessors[ description.inverseBindMatrices ];
        done( null );
    };

}());
