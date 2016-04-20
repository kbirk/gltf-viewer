(function () {

    'use strict';

    var esper = require('esper');
    var glTFParser = require('./glTFParser');

    var COMPONENT_TYPES = {
        'BYTE': Int8Array,
        'UNSIGNED_BYTE': Uint8Array,
        'SHORT': Int16Array,
        'UNSIGNED_SHORT': Uint16Array,
        'FLOAT': Float32Array
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

    function getArrayBufferView( accessor ) {
        var bufferView = accessor.bufferView;
        var numComponents = NUM_COMPONENTS[ accessor.type ];
        var TypedArray = COMPONENT_TYPES[ accessor.componentType ];
        return new TypedArray(
            bufferView.source,
            accessor.byteOffset,
            accessor.count * numComponents );
    }

    module.exports = {

        construct: function( gltf, callback ) {

            var gl = esper.WebGLContext.get();

            glTFParser.parse( gltf, {
                bufferViews: function( gltf, description, done ) {
                    if ( description.target ) {
                        description.instance = gl.createBuffer();
                        gl.bindBuffer( gl[description.target], description.instance );
                        gl.bufferData( gl[description.target], description.source, gl.STATIC_DRAW );
                    }
                    done( null );
                },
                programs: function( gltf, description, done ) {
                    description.instance = new esper.Shader({
                        vert: description.vertexShader.source,
                        frag: description.fragmentShader.source,
                        attributes: description.attributes
                    });
                    done( null );
                },
                textures: function( gltf, description, done ) {
                    description.instance = new esper.ColorTexture2D({
                        src: description.source.image,
                        wrapS: description.sampler.wrapS,
                        wrapT: description.sampler.wrapT,
                        minFilter: description.sampler.minFilter,
                        magFilter: description.sampler.magFilter,
                        invertY: false
                    });
                    done( null );
                },
                animations: function( gltf, description, done ) {
                    var parameters = description.parameters;
                    Object.keys( parameters ).forEach( function( key ) {
                        var accessor = parameters[ key ];
                        var numComponents = NUM_COMPONENTS[ accessor.type ];
                        var arraybuffer = getArrayBufferView( accessor );
                        var values = [];
                        var i;
                        for ( i=0; i<accessor.count*numComponents; i+=numComponents ) {
                            // get the subarray that composes the matrix
                            var sub = arraybuffer.subarray( i, i + numComponents );
                            values.push( ( sub.length === 1 ) ? sub[0] : sub );
                        }
                        parameters[ key ] = values;
                    });

                    description.channels.forEach( function( channel ) {
                        var target = channel.target;
                        // get the node for the channel
                        var node = gltf.nodes[ target.id ];
                        node.animations = node.animations || {};
                        var key = description.name || 'untitled';
                        node.animations[ key ] = node.animations[ key ] || {};
                        // add sampler info under the animation path
                        var sampler = channel.sampler;
                        node.animations[ key ][ target.path ] = {
                            input: parameters[ sampler.input ],
                            values: parameters[ target.path ],
                            interpolation: sampler.interpolation
                        };
                    });

                    done( null );
                },
                skins: function( gltf, description, done ) {
                    var accessor = description.inverseBindMatrices;
                    var numComponents = NUM_COMPONENTS[ accessor.type ];
                    var arraybuffer = getArrayBufferView( accessor );
                    var inverseBindMatrices = [];
                    var i;
                    for ( i=0; i<accessor.count*numComponents; i+=numComponents ) {
                        // get the subarray that composes the matrix
                        inverseBindMatrices.push( arraybuffer.subarray( i, i + numComponents ) );
                    }
                    description.inverseBindMatrices = inverseBindMatrices;
                    done( null );
                },
                meshes: function( gltf, description, done ) {
                    var primitives = description.primitives;
                    primitives.forEach( function( primitive ) {
                        var technique = primitive.material.technique;
                        // use the attributes array from program so we can
                        // mirror the correct attribute indices.
                        var attributes = technique.program.attributes;
                        // create vertex buffers
                        var vertexBuffers = attributes.map( function( attribute, index ) {
                            var parameter = technique.attributes[ attribute ];
                            var semantic = technique.parameters[ parameter ].semantic;
                            var pointer = primitive.attributes[semantic];
                            var pointers = {};
                            pointers[ index ] = {
                                type: pointer.componentType,
                                size: pointer.size,
                                byteOffset: pointer.byteOffset
                            };
                            return new esper.VertexBuffer(
                                pointer.bufferView.instance,
                                pointers,
                                {
                                    byteLength: pointer.bufferView.byteLength
                                });
                        });
                        // create index buffer
                        var indices = primitive.indices;
                        var indexBuffer = new esper.IndexBuffer(
                            indices.bufferView.instance,
                            {
                                type: indices.componentType,
                                count: indices.count,
                                mode: primitive.mode,
                                byteOffset: indices.byteOffset,
                                byteLength: indices.bufferView.byteLength
                            });
                        primitive.instance = new esper.Renderable({
                            vertexBuffers: vertexBuffers,
                            indexBuffer: indexBuffer
                        });
                    });
                    done( null );
                },
                success: function( gltf ) {
                    callback( null, gltf );
                },
                error: function( err ) {
                    callback( err );
                }
            });
        }

    };

}());
