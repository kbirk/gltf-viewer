(function () {

    'use strict';

    var Node = require('../render/Node');

    module.exports = function( gltf, description, done ) {
        var camera;
        if (description.camera) {
            camera = gltf.cameras[description.camera].instance;
        }
        var skin;
        if (description.skin) {
            skin = gltf.skins[description.skin].instance;
        }
        var primitives;
        if (description.meshes) {
            primitives = [];
            description.meshes.forEach( function( mesh ) {
                gltf.meshes[ mesh ].primitives.forEach( function( primitive ) {
                    primitives.push( primitive.instance );
                });
            });
        }
        // create instance
        description.instance = new Node({
            matrix: description.matrix,
            rotation: description.rotation,
            translation: description.translation,
            scale: description.scale,
            camera: camera,
            skin: skin,
            jointName: description.jointName,
            primitives: primitives
        });
        done( null );
    };

}());
