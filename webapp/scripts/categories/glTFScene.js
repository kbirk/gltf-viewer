(function () {

    'use strict';

    var Scene = require('../render/Scene');

    function buildHierarchy(gltf, id) {
        var node = gltf.nodes[ id ];
        node.children.forEach(function(childId) {
            var child = buildHierarchy(gltf, childId);
            node.instance.addChild(child);
        });
        return node.instance;
    }

    module.exports = function(gltf, description, done) {
        // set technique uniform nodes here since all instances will exist
        Object.keys(gltf.techniques).forEach(function(key) {
            var technique = gltf.techniques[ key ];
            technique.instance.uniforms.forEach(function(uniform) {
                if (uniform.node) {
                    uniform.node = gltf.nodes[ uniform.node ].instance;
                }
            });
        });
        // attach skins to nodes here since all instances will exist
        Object.keys(gltf.nodes).forEach(function(key) {
            var node = gltf.nodes[ key ];
            if (node.skin) {
                node.instance.skin = gltf.skins[ node.skin ].instance;
            }
        });
        // get all cameras for the scene
        var cameras = Object.keys(gltf.nodes).filter(function(key) {
            var node = gltf.nodes[ key ];
            return !!node.camera;
        }).map(function(camera) {
            return gltf.nodes[ camera ].instance;
        });
        // assemble hierarchy here since all instances will exist
        var nodes = description.nodes.map(function(id) {
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
