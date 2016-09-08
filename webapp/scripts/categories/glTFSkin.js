(function () {

    'use strict';

    let Skin = require('../render/Skin');

    let NUM_COMPONENTS = {
        'SCALAR': 1,
        'VEC2': 2,
        'VEC3': 3,
        'VEC4': 4,
        'MAT2': 4,
        'MAT3': 9,
        'MAT4': 16
    };

    let COMPONENT_TYPES = {
        5120: Int8Array,
        5121: Uint8Array,
        5122: Int16Array,
        5123: Uint16Array,
        5126: Float32Array
    };

    function getArrayBufferView(accessor, bufferView) {
        let numComponents = NUM_COMPONENTS[ accessor.type ];
        let TypedArray = COMPONENT_TYPES[ accessor.componentType ];
        return new TypedArray(
            bufferView.source,
            accessor.byteOffset,
            accessor.count * numComponents);
    }

    function getNodeByJointName(nodes, jointName) {
        let keys = Object.keys(nodes);
        let node;
        for (let i=0; i<keys.length; i++) {
            node = nodes[ keys[i] ];
            if (node.jointName && node.jointName === jointName) {
                return node;
            }
        }
        return null;
    }

    module.exports = function(gltf, description, done) {
        // get inverse bind arraybuffer
        let accessor = gltf.accessors[ description.inverseBindMatrices ];
        let bufferView = gltf.bufferViews[ accessor.bufferView ];
        let inverseBindMatrices = getArrayBufferView(accessor, bufferView);
        // get joints
        let joints = description.jointNames.map(jointName => {
            return getNodeByJointName(gltf.nodes, jointName).instance;
        });
        // create instance
        description.instance = new Skin({
            bindShapeMatrix: description.bindShapeMatrix,
            inverseBindMatrices: inverseBindMatrices,
            joints: joints,
            size: accessor.size
        });
        done(null);
    };

}());
