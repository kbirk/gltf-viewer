(function () {

    'use strict';

    let VertexBuffer = require('../render/VertexBuffer');
    let IndexBuffer = require('../render/IndexBuffer');
    let Primitive = require('../render/Primitive');

    module.exports = function(gltf, description, done) {
        let primitives = description.primitives;
        primitives.forEach(primitive => {
            let vertices = Object.keys(primitive.attributes).map(key => {
                return gltf.accessors[ primitive.attributes[key] ];
            });
            let material = gltf.materials[ primitive.material ];
            let technique = gltf.techniques[ material.technique ];
            let program = gltf.programs[ technique.program ];
            // use the attributes array from program so we can
            // mirror the correct attribute indices.
            let attributes = program.attributes;
            // create vertex buffers
            let vertexBuffers = attributes.map((attribute, index) => {
                let accessor = vertices[index];
                let bufferView = gltf.bufferViews[ accessor.bufferView ];
                return new VertexBuffer({
                    buffer: bufferView.instance,
                    index: index,
                    type: accessor.componentType,
                    size: accessor.size,
                    byteOffset: accessor.byteOffset,
                    byteStride: accessor.byteStride,
                    count: accessor.count,
                    mode:  primitive.mode
                });
            });
            let indexBuffer;
            if (primitive.indices) {
                // create index buffer
                let indices = gltf.accessors[ primitive.indices ];
                let bufferView = gltf.bufferViews[ indices.bufferView ];
                indexBuffer = new IndexBuffer({
                    buffer: bufferView.instance,
                    type: indices.componentType,
                    count: indices.count,
                    mode: primitive.mode,
                    byteOffset: indices.byteOffset
                });
            }
            // create renderable
            primitive.instance = new Primitive({
                vertexBuffers: vertexBuffers,
                indexBuffer: indexBuffer,
                material: material.instance,
                technique: technique.instance
            });
        });
        done(null);
    };

}());
