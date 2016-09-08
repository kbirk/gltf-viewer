(function () {

    'use strict';

    let Scene = require('../render/Scene');

    function buildHierarchy(gltf, id) {
        let node = gltf.nodes[ id ];
        node.children.forEach(childId => {
            let child = buildHierarchy(gltf, childId);
            node.instance.addChild(child);
        });
        return node.instance;
    }

    module.exports = function(gltf, description, done) {
        // set technique uniform nodes here since all instances will exist
        Object.keys(gltf.techniques).forEach(key => {
            let technique = gltf.techniques[ key ];
            technique.instance.uniforms.forEach(uniform => {
                if (uniform.node) {
                    uniform.node = gltf.nodes[ uniform.node ].instance;
                }
            });
        });
        // attach skins to nodes here since all instances will exist
        Object.keys(gltf.nodes).forEach(key => {
            let node = gltf.nodes[ key ];
            if (node.skin) {
                node.instance.skin = gltf.skins[ node.skin ].instance;
            }
        });
        // get all cameras for the scene
        let cameras = Object.keys(gltf.nodes).filter(key => {
            let node = gltf.nodes[ key ];
            return !!node.camera;
        }).map(camera => {
            return gltf.nodes[ camera ].instance;
        });
        // assemble hierarchy here since all instances will exist
        let nodes = description.nodes.map(id => {
            return buildHierarchy(gltf, id);
        });
        // create instance
        description.instance = new Scene({
            nodes: nodes,
            cameras: cameras
        });
        done(null);
    };

}());
