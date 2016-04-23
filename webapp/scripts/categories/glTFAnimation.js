(function () {

    'use strict';

    var Animation = require('../render/Animation');

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

    module.exports = function( gltf, description, done ) {
        // get parameter accessors
        var parameters = description.parameters;
        Object.keys( parameters ).forEach( function(key) {
            var accessor = gltf.accessors[ parameters[key] ];
            var bufferView = gltf.bufferViews[ accessor.bufferView ];
            var arraybuffer = getArrayBufferView( accessor, bufferView );
            var numComponents = NUM_COMPONENTS[ accessor.type ];
            var values = [];
            var i;
            for ( i=0; i<accessor.count*numComponents; i+=numComponents ) {
                // get the subarray that composes the matrix
                var sub = arraybuffer.subarray( i, i + numComponents );
                values.push( ( sub.length === 1 ) ? sub[0] : sub );
            }
            parameters[ key ] = values;
        });
        // create animation and attach to relevant nodes
        description.channels.forEach( function( channel ) {
            var target = channel.target;
            // get the node for the channel
            var node = gltf.nodes[ target.id ].instance;
            var key = description.name || 'untitled';
            // create animations if they don't exist
            node.animations = node.animations || {};
            if ( !node.animations[ key ] ) {
                node.animations[ key] = new Animation();
            }
            // add sampler info under the animation path
            var sampler = description.samplers[ channel.sampler ];
            // add channel to animation
            node.animations[ key ].addChannel( target.path, {
                input: parameters[ sampler.input ],
                values: parameters[ target.path ],
                interpolation: sampler.interpolation
            });
        });

        done( null );
    };

}());
