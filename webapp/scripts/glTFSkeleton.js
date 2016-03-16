(function () {

    'use strict';

    var alfador = require('alfador');
    var glTFUtil = require('./glTFUtil');
    var Joint = require('./Joint');
    var Skeleton = require('./Skeleton');

    var COMPONENT_TYPES_TO_BUFFERVIEWS = {
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

    var TYPES_TO_CLASS = {
        'MAT3': alfador.Mat33,
        'MAT4': alfador.Mat44
    };

    function getInverseBindMatrices( json, skin, buffers ) {
        var accessor = json.accessors[ skin.inverseBindMatrices ];
        var bufferView = json.bufferViews[ accessor.bufferView ];
        var buffer = buffers[ bufferView.buffer ];
        var TypedArray = COMPONENT_TYPES_TO_BUFFERVIEWS[ accessor.componentType ];
        var numComponents = TYPES_TO_NUM_COMPONENTS[ accessor.type ];
        var MatrixClass = TYPES_TO_CLASS[ accessor.type ];
        var accessorArrayCount = accessor.count * numComponents;
        var arrayBuffer = new TypedArray( buffer, bufferView.byteOffset + accessor.byteOffset, accessorArrayCount );
        var inverseBindMatrices = [];
        var beginIndex;
        var endIndex;
        var i;
        // for each matrix in the accessor
        for ( i=0; i<accessor.count; i++ ) {
            // calc the begin and end in arraybuffer
            beginIndex = i * numComponents;
            endIndex = beginIndex + numComponents;
            // get the subarray that composes the matrix
            inverseBindMatrices.push(
                new MatrixClass( new Array( arrayBuffer.subarray( beginIndex, endIndex ) ) )
            );
        }
        return inverseBindMatrices;
    }

    function createJointHierarchy( json, nodeName, parent, skin, inverseBindMatrices ) {
        var node = json.nodes[ nodeName ];
        var jointIndex = skin.jointNames.indexOf( node.jointName );
        // if joint does not exist in the skins jointNames, ignore
        if ( jointIndex === -1 ) {
            return null;
        }
        // get the bind / inverse bind matrices
        var bindMatrix = glTFUtil.getNodeMatrix( node );
        var inverseBindMatrix = inverseBindMatrices[ jointIndex ];
        // create joint here first, in order to pass as parent to recursions
        var joint = new Joint({
            id: nodeName,
            name: node.jointName,
            bindMatrix: bindMatrix,
            inverseBindMatrix: inverseBindMatrix,
            parent: parent,
            children: [], // array will be empty here, but populated subsequently
            index: jointIndex
        });
        // fill in children array
        node.children.forEach( function( childId ) {
            var child = createJointHierarchy( json, childId, joint, skin, inverseBindMatrices );
            if ( child ) {
                // only add if joint exists in jointNames
                joint.children.push( child );
            }
        });
        return joint;
    }

    module.exports = {

        /**
         * For each skeleton root node in an instanceSkin, build the joint
         * hierarchies and return a single Skeleton object.
         *
         * @param {Object} json - The glTF JSON.
         * @param {Object} node - The node object.
         * @param {Object} buffers - The map of loaded buffers.
         *
         * @returns {Skeleton} The Skeleton object.
         */
        createSkeleton: function( json, node, buffers ) {
            // first find nodes with the names in the instanceSkin.skeletons
            // then search only those nodes and their sub trees for nodes with
            // jointId equal to the strings in skin.joints
            var skin = json.skins[ node.skin ];
            var skeletons = node.skeletons;
            var inverseBindMatrices = getInverseBindMatrices( json, skin, buffers );
            // for each root node, create hierarchy of Joint objects
            var nodes = skeletons.map( function( skeleton ) {
                return createJointHierarchy( json, skeleton, null, skin, inverseBindMatrices );
            });
            // return Skeleton object
            return new Skeleton({
                root: nodes,
                bindShapeMatrix: new alfador.Mat44( skin.bindShapeMatrix || [] )
            });
        }

    };

}());
