(function () {

    'use strict';

    function getNodeByJointName( nodes, jointName ) {
        var keys = Object.keys( nodes );
        var node;
        var i;
        for ( i=0; i<keys.length; i++ ) {
            node = nodes[ keys[i] ];
            if ( node.jointName && node.jointName === jointName ) {
                return node;
            }
        }
        return null;
    }

    module.exports = function( gltf, description, done ) {
        description.inverseBindMatrices = gltf.accessors[ description.inverseBindMatrices ];
        description.joints = description.jointNames.map( function( jointName, index ) {
            var node = getNodeByJointName( gltf.nodes, jointName );
            node.jointIndex = index;
            return node;
        });
        done( null );
    };

}());
