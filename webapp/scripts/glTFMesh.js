(function () {

    'use strict';

    var _ = require('lodash');
    var esper = require('esper');

    var ACCESSOR_COMPONENT_TYPES = {
        '5120': 'BYTE',
        '5121': 'UNSIGNED_BYTE',
        '5122': 'SHORT',
        '5123': 'UNSIGNED_SHORT',
        '5126': 'FLOAT'
    };

    var PRIMITIVE_MODES = {
        '0': 'POINTS',
        '1': 'LINES',
        '2': 'LINE_LOOP',
        '3': 'LINE_STRIP',
        '4': 'TRIANGLES',
        '5': 'TRIANGLE_STRIP',
        '6': 'TRIANGLE_FAN',
        'default': 'TRIANGLES'
    };

    var BUFFERVIEW_TARGETS = {
        '34962': 'ARRAY_BUFFER',
        '34963': 'ELEMENT_ARRAY_BUFFER'
    };

    var COMPONENT_TYPES_TO_TYPED_ARRAYS = {
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

    function bufferAttributeData( webglBuffers, accessorId, json, buffers ) {

        if ( !accessorId ) {
            return null;
        }

        var gl = esper.WebGLContext.get();
        var accessor = json.accessors[ accessorId ];
        var bufferViewName = accessor.bufferView;
        var bufferView = json.bufferViews[ bufferViewName ];
        var bufferTarget = BUFFERVIEW_TARGETS[ bufferView.target ];
        var accessorArrayCount = accessor.count * TYPES_TO_NUM_COMPONENTS[ accessor.type ];
        var TypedArray = COMPONENT_TYPES_TO_TYPED_ARRAYS[ accessor.componentType ];

        if ( !webglBuffers[ bufferViewName ] ) {
            // create the buffer if it doesnt exist
            webglBuffers[ bufferViewName ] = gl.createBuffer();
            // get the type of buffer target
            bufferTarget = BUFFERVIEW_TARGETS[ bufferView.target ];
            // bind and set buffers byte length
            gl.bindBuffer( gl[ bufferTarget ], webglBuffers[ bufferViewName ] );
            gl.bufferData( gl[ bufferTarget ], bufferView.byteLength, gl.STATIC_DRAW );
        }

        var buffer = new TypedArray(
            // use the respective ArrayBuffer
            buffers[ bufferView.buffer ],
            // combine the bufferViews offset and the accessors offset
            bufferView.byteOffset + accessor.byteOffset,
            // only 'view' the accessors count ( taking into account the number of components per type )
            accessorArrayCount );

        // TODO: cache accessors so that their data isn't buffered multiple times?
        // buffer the accessors sub data
        // buffer the data from the accessors offset into the WebGLBuffer
        gl.bufferSubData( gl[ bufferTarget ], accessor.byteOffset, buffer );

        // return attributePointer
        return {
            bufferView: bufferViewName,
            size: TYPES_TO_NUM_COMPONENTS[ accessor.type ],
            type: ACCESSOR_COMPONENT_TYPES[ accessor.componentType ],
            stride: accessor.byteStride,
            offset: accessor.byteOffset,
            count: accessor.count
        };
    }

    function setPointerByBufferView( pointers, index, pointer ) {
        if ( !pointer ) {
            // ignore if undefined
            return;
        }
        // add vertex attribute pointer under the correct webglbuffer
        pointers[ pointer.bufferView ] = pointers[ pointer.bufferView ] || {};
        pointers[ pointer.bufferView ][ index ] = pointer;
    }

    function createRenderableFromPrimitive( webglBuffers, primitive, json, buffers, materials ) {
        var attributes = primitive.attributes;
        var indices = primitive.indices;
        var material = primitive.material;
        var pointers = {};
        var vertexBuffers = [];
        var indexBuffer;
        // buffer attribute data and store resulting attribute pointers
        var positionsPointer = bufferAttributeData( webglBuffers, attributes.POSITION || attributes.POSITION_0, json, buffers );
        var normalsPointer = bufferAttributeData( webglBuffers, attributes.NORMAL || attributes.NORMAL_0, json, buffers );
        var uvsPointer = bufferAttributeData( webglBuffers, attributes.TEXCOORD || attributes.TEXCOORD_0, json, buffers );
        var jointsPointer = bufferAttributeData( webglBuffers, attributes.JOINT || attributes.JOINT_0, json, buffers );
        var weightsPointer = bufferAttributeData( webglBuffers, attributes.WEIGHT || attributes.WEIGHT_0, json, buffers );
        //var colorsPointer = bufferAttributeData( webglBuffers, attributes.COLOR || attributes.COLOR_0, json, buffers );
        // create map of pointers keyed by bufferview
        setPointerByBufferView( pointers, '0', positionsPointer );
        setPointerByBufferView( pointers, '1', normalsPointer );
        setPointerByBufferView( pointers, '2', uvsPointer );
        //setPointerByBufferView( pointersByBufferView, '3', colorsPointer );
        setPointerByBufferView( pointers, '3', jointsPointer );
        setPointerByBufferView( pointers, '4', weightsPointer );
        // for each bufferview create a VertexBuffer object, and
        // pass the pointers for the attributes that use it
        _.forIn( pointers, function( pointer, index ) {
            // create VertexBuffer that references the WebGLBuffer for the bufferview
            vertexBuffers.push( new esper.VertexBuffer( webglBuffers[ index ], pointer ) );
        });
        // create similar pointer for indices
        var indicesPointer = bufferAttributeData( webglBuffers, indices, json, buffers );
        // set primiive mode
        indicesPointer.mode = PRIMITIVE_MODES[ primitive.primitive ] || PRIMITIVE_MODES.default;
        // create index buffer that references the WebGLBuffer for the bufferview
        indexBuffer = new esper.IndexBuffer(
            webglBuffers[ indicesPointer.bufferView ],
            indicesPointer );
        // instantiate the Renderable object
        return {
            vertexBuffers: vertexBuffers,
            indexBuffer: indexBuffer,
            material: materials[ material ]
        };
    }

    function createRenderables( webglBuffers, mesh, json, buffers, materials ) {
        // for each primitive
        return mesh.primitives.map( function( primitive ) {
            return createRenderableFromPrimitive(
                webglBuffers,
                primitive,
                json,
                buffers,
                materials
            );
        });
    }

    module.exports = {

        createMeshes: function( json, buffers, materials ) {
            var webglBuffers = {};
            var results = {};
            _.forIn( json.meshes, function( mesh, id ) {
                // create the array of renderables for the mesh
                results[ id ] = createRenderables(
                    webglBuffers,
                    mesh,
                    json,
                    buffers,
                    materials );
            });
            return results;
        }

    };

}());
