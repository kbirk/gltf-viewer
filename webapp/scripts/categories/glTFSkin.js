(function () {

    'use strict';

    var Skin = require('../render/Skin');

    var NUM_COMPONENTS = {
        'SCALAR': 1,
        'VEC2': 2,
        'VEC3': 3,
        'VEC4': 4,
        'MAT2': 4,
        'MAT3': 9,
        'MAT4': 16
    };

    var COMPONENT_TYPES = {
        5120: Int8Array,
        5121: Uint8Array,
        5122: Int16Array,
        5123: Uint16Array,
        5126: Float32Array
    };

    function getArrayBufferView( accessor, bufferView ) {
        var numComponents = NUM_COMPONENTS[ accessor.type ];
        var TypedArray = COMPONENT_TYPES[ accessor.componentType ];
        return new TypedArray(
            bufferView.source,
            accessor.byteOffset,
            accessor.count * numComponents );
    }

    function getNodeByJointName( nodes, jointName ) {
        var keys = Object.keys( nodes );
        var node;
        var i;
        for ( i=0; i<keys.length; i++ ) {
            node = nodes[ keys[i] ];
            if ( node.jointName && node.jointName === jointName ) {
                return node;
            }
        }
        return null;
    }

    module.exports = function( gltf, description, done ) {
        // get inverse bind arraybuffer
        var accessor = gltf.accessors[ description.inverseBindMatrices ];
        var bufferView = gltf.bufferViews[ accessor.bufferView ];
        var inverseBindMatrices = getArrayBufferView( accessor, bufferView );
        // get joints and joint indices
        var jointIndices = {};
        var joints = description.jointNames.map( function( jointName, index ) {
            jointIndices[ jointName ] = index;
            return getNodeByJointName( gltf.nodes, jointName ).instance;
        });
        // create instance
        description.instance = new Skin({
            bindShapeMatrix: description.bindShapeMatrix,
            inverseBindMatrices: inverseBindMatrices,
            joints: joints,
            jointIndices: jointIndices
        });
        done( null );
    };

}());
