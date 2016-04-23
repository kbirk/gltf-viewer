(function () {

    'use strict';

    var VertexBuffer = require('../render/VertexBuffer');
    var IndexBuffer = require('../render/IndexBuffer');
    var Primitive = require('../render/Primitive');

    module.exports = function( gltf, description, done ) {
        var primitives = description.primitives;
        primitives.forEach( function( primitive ) {
            var vertices = Object.keys( primitive.attributes ).map( function(key) {
                return gltf.accessors[ primitive.attributes[key] ];
            });
            var material = gltf.materials[ primitive.material ];
            var technique = gltf.techniques[ material.technique ];
            var program = gltf.programs[ technique.program ];
            // use the attributes array from program so we can
            // mirror the correct attribute indices.
            var attributes = program.attributes;
            // create vertex buffers
            var vertexBuffers = attributes.map( function( attribute, index ) {
                var accessor = vertices[index];
                var bufferView = gltf.bufferViews[ accessor.bufferView ];
                return new VertexBuffer({
                    buffer: bufferView.instance,
                    index: index,
                    type: accessor.componentType,
                    size: accessor.size,
                    byteOffset: accessor.byteOffset,
                    byteStride: accessor.byteStride,
                    mode:  primitive.mode
                });
            });
            // create index buffer
            var indices = gltf.accessors[ primitive.indices ];
            var bufferView = gltf.bufferViews[ indices.bufferView ];
            var indexBuffer = new IndexBuffer({
                buffer: bufferView.instance,
                type: indices.componentType,
                count: indices.count,
                mode: primitive.mode,
                byteOffset: indices.byteOffset
            });
            // create renderable
            primitive.instance = new Primitive({
                vertexBuffers: vertexBuffers,
                indexBuffer: indexBuffer,
                material: material.instance,
                technique: technique.instance
            });
        });
        done( null );
    };

}());
