(function () {

    'use strict';

    module.exports = function( gltf, description, done ) {
        if (description.camera) {
            description.camera = gltf.cameras[description.camera];
        }
        if (description.skin) {
            description.skin = gltf.skins[description.skin];
        }
        if (description.meshes) {
            description.meshes = description.meshes.map( function(mesh) {
                return gltf.meshes[ mesh ];
            });
        }
        if (description.skeletons) {
            description.skeletons = description.skeletons.map( function(skeleton) {
                return gltf.nodes[ skeleton ];
            });
        }
        description.children = description.children.map( function(child) {
            return gltf.nodes[ child ];
        });
        done( null );
    };

}());
