(function () {

    'use strict';

    var _ = require('lodash');

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

    function getAttributeBuffer( json, accessorId, buffers ) {

        if ( !accessorId ) {
            return null;
        }

        var accessor = json.accessors[ accessorId ];
        var bufferViewName = accessor.bufferView;
        var bufferView = json.bufferViews[ bufferViewName ];
        var accessorArrayCount = accessor.count * TYPES_TO_NUM_COMPONENTS[ accessor.type ];
        var TypedArray = COMPONENT_TYPES_TO_TYPED_ARRAYS[ accessor.componentType ];

        // TODO: should we attached the buffer view? Or the root arraybuffer, since
        // we already include the offset, etc. It seems these are designed to be shared.
        var buffer = new TypedArray(
            // use the respective ArrayBuffer
            buffers[ bufferView.buffer ],
            // combine the bufferViews offset and the accessors offset
            bufferView.byteOffset + accessor.byteOffset,
            // only 'view' the accessors count ( taking into account the number of components per type )
            accessorArrayCount );

        // return attributePointer
        return {
            buffer: buffer,
            //bufferView: bufferViewName,
            target: BUFFERVIEW_TARGETS[ bufferView.target ],
            size: TYPES_TO_NUM_COMPONENTS[ accessor.type ],
            type: ACCESSOR_COMPONENT_TYPES[ accessor.componentType ],
            stride: accessor.byteStride,
            offset: accessor.byteOffset,
            count: accessor.count
        };
    }

    function createMeshFromPrimitive( json, primitive, buffers, materials ) {
        var attributes = {};
        _.forIn( primitive.attributes, function( attribute, type ) {
            // buffer attribute data and store resulting attribute pointers
            attributes[ type ] = getAttributeBuffer( json, attribute, buffers );
        });
        // set indices
        var indices = getAttributeBuffer( json, primitive.indices, buffers );
        indices.mode = PRIMITIVE_MODES[ primitive.primitive ] || PRIMITIVE_MODES.default;
        // return mesh
        return {
            attributes: attributes,
            indices: indices,
            material: materials[ primitive.material ]
        };
    }

    function createMeshes( json, mesh, buffers, materials ) {
        // for each primitive
        return mesh.primitives.map( function( primitive ) {
            return createMeshFromPrimitive(
                json,
                primitive,
                buffers,
                materials
            );
        });
    }

    module.exports = {

        loadMeshes: function( json, buffers, materials ) {
            var results = {};
            _.forIn( json.meshes, function( mesh, id ) {
                // create the array of renderables for the mesh
                results[ id ] = createMeshes(
                    json,
                    mesh,
                    buffers,
                    materials );
            });
            return results;
        }

    };

}());
