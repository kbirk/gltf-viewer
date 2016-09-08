(function () {

    'use strict';

    let Animation = require('../render/Animation');
    let Tree = require('../util/BST');

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

    module.exports = function(gltf, description, done) {
        // get parameter accessors
        let parameters = description.parameters;
        Object.keys(parameters).forEach(key => {
            let accessor = gltf.accessors[ parameters[key] ];
            let bufferView = gltf.bufferViews[ accessor.bufferView ];
            let arraybuffer = getArrayBufferView(accessor, bufferView);
            let numComponents = NUM_COMPONENTS[ accessor.type ];
            let values = [];
            for (let i=0; i<accessor.count*numComponents; i+=numComponents) {
                // get the subarray that composes the matrix
                let sub = arraybuffer.subarray(i, i + numComponents);
                values.push((sub.length === 1) ? sub[0] : sub);
            }
            parameters[ key ] = {
                values: values
            };
        });
        // create animation and attach to relevant nodes
        description.channels.forEach(function(channel) {
            let target = channel.target;
            // get the node for the channel
            let node = gltf.nodes[ target.id ].instance;
            let key = description.name || 'untitled';
            // create animations if they don't exist
            node.animations = node.animations || {};
            if (!node.animations[ key ]) {
                node.animations[ key] = new Animation();
            }
            // add sampler info under the animation path
            let sampler = description.samplers[ channel.sampler ];
            // get output
            let output = parameters[ target.path ];
            // get input
            let input = parameters[ sampler.input ];
            // index input values as BST
            if (!input.instance) {
                input.instance = new Tree(input.values);
            }
            // add channel to animation
            node.animations[ key ].addChannel(target.path, {
                input: input.instance,
                values: output.values,
                interpolation: sampler.interpolation
            });
        });

        done(null);
    };

}());
