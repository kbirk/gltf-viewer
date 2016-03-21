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

    /*

    Is there a reason why componentType is not
    */

    module.exports = {

        construct: function( gltf, callback ) {

            var gl = esper.WebGLContext.get();

            glTFParser.parse( gltf, {
                bufferViews: function( gltf, description, done ) {
                    if (description.target) {
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
                        image: description.source.image,
                        wrapS: description.sampler.wrapS,
                        wrapT: description.sampler.wrapT,
                        minFilter: description.sampler.minFilter,
                        magFilter: description.sampler.magFilter,
                        invertY: false
                    });
                    done( null );
                },
                skins: function( gltf, description, done ) {
                    var accessor = description.inverseBindMatrices;
                    var bufferView = accessor.bufferView;
                    var numComponents = NUM_COMPONENTS[ accessor.type ];
                    var TypedArray = COMPONENT_TYPES[ accessor.componentType ];
                    var arraybuffer = new TypedArray(
                        bufferView.source,
                        accessor.byteOffset,
                        accessor.count * numComponents );
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
                                offset: pointer.byteOffset
                            };
                            return new esper.VertexBuffer(
                                pointer.bufferView.instance,
                                pointers );
                        });
                        // create index buffer
                        var indexBuffer = new esper.IndexBuffer(
                            primitive.indices.bufferView.instance,
                            {
                                type: primitive.indices.componentType,
                                count: primitive.indices.count,
                                mode: primitive.mode,
                                offset: primitive.indices.byteOffset
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
