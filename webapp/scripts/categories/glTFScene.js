(function () {

    'use strict';

    module.exports = function( gltf, description, done ) {
        description.nodes = description.nodes.map( function( node ) {
            return gltf.nodes[node];
        });
        done( null );
    };

}());
