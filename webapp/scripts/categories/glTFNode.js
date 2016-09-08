(function () {

    'use strict';

    let Node = require('../render/Node');

    module.exports = function(gltf, description, done) {
        let camera;
        if (description.camera) {
            camera = gltf.cameras[description.camera].instance;
        }
        let skin;
        if (description.skin) {
            skin = gltf.skins[description.skin].instance;
        }
        let primitives;
        if (description.meshes) {
            primitives = [];
            description.meshes.forEach(mesh => {
                gltf.meshes[ mesh ].primitives.forEach(primitive => {
                    primitives.push(primitive.instance);
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
        done(null);
    };

}());
