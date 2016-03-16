(function () {

    'use strict';

    var async = require('async');
    var glTFUtil = require('./glTFUtil');
    var glTFMaterial = require('./glTFMaterial');
    //var glTFAnimation = require('./glTFAnimation');
    var glTFMesh = require('./glTFMesh');
    var glTFParser = require('./glTFParser');
    var glTFSkin = require('./glTFSkin');
    //var glTFSkeleton = require('./glTFSkeleton');

    function assembleHierarchyRecursive( json, meshes, skins, nodeId ) {
        // get the node object
        var node = json.nodes[ nodeId ];

        if ( node.camera || node.light ) {
            // node is either a joint, camera, or light, so ignore it as an entity
            // TODO: process these
            return null;
        }

        // append the id
        node.id = nodeId;

        // recursively assemble the skeleton joint tree
        var children = [];
        node.children.forEach( function( childId ) {
            var child = assembleHierarchyRecursive( json, meshes, skins, childId );
            if ( child ) {
                children.push( child );
            }
        });
        // replace children
        node.children = children;

        // if node has a mesh, add the renderables
        // TODO: refactor this (extra 's' on meshes)
        if ( node.meshes ) {
            var meshess = [];
            node.meshes.forEach( function( meshId ) {
                meshess = meshess.concat( meshes[ meshId ] );
            });
            node.meshes = meshess;
        }

        // if node has skin, process skeleton
        //var animations;
        if ( node.skin ) {
            // append skeleton
            node.skin = skins[ node.skin ];
        }

        // TODO: animations
        // var animations = glTFAnimation.createAnimations( json, buffers );

        return node;
    }

    function assembleHierarchy( json, meshes, skins ) {
        var roots = json.scenes[ json.scene ].nodes;
        var nodes = [];
        // for each node
        roots.forEach( function( node ) {
            var result = assembleHierarchyRecursive( json, meshes, skins, node );
            if ( result ) {
                nodes.push( result );
            }
        });
        return nodes;
    }

    function loadEntity( json, callback ) {
        async.parallel({
            buffers: function( done ) {
                // send requests for buffers
                glTFUtil.requestBuffers( json.buffers, done );
            },
            materials: function( done ) {
                // load material objects
                glTFMaterial.loadMaterials( json, done );
            }
        }, function( err, res ) {
            if ( err ) {
                callback( err );
                return;
            }
            var buffers = res.buffers;
            var materials = res.materials;
            // create meshes, then entities
            var skins = glTFSkin.loadSkins( json, buffers );
            var meshes = glTFMesh.loadMeshes( json, buffers, materials );
            var hierarchy = assembleHierarchy( json, meshes, skins );
            callback( null, hierarchy );
        });
    }

    // function loadGLTF( url, done ) {
    //
    // }

    module.exports = {

        load: function( url, callback ) {

            glTFParser.load( url, {
                buffers: function(id, description) {
                    console.log('buffer', id);
                    console.log(description);
                },
                bufferViews: function(id, description) {
                    console.log('bufferView',id);
                    console.log(description);
                },
                shaders: function(id, description) {
                    console.log('shader',id);
                    console.log(description);
                },
                programs: function(id, description) {
                    console.log('program',id);
                    console.log(description);
                },
                techniques: function(id, description) {
                    console.log('technique',id);
                    console.log(description);
                },
                materials: function(id, description) {
                    console.log('material',id);
                    console.log(description);
                },
                meshs: function(id, description) {
                    console.log('mesh',id);
                    console.log(description);
                },
                cameras: function(id, description) {
                    console.log('camera',id);
                    console.log(description);
                },
                lights: function(id, description) {
                    console.log('light',id);
                    console.log(description);
                },
                nodes: function(id, description) {
                    console.log('node',id);
                    console.log(description);
                },
                scenes: function(id, description) {
                    console.log('scene',id);
                    console.log(description);
                },
                images: function(id, description) {
                    console.log('image',id);
                    console.log(description);
                },
                animations: function(id, description) {
                    //console.log('animation',id);
                    //console.log(description);
                },
                accessors: function(id, description) {
                    console.log('accessor',id);
                    console.log(description);
                },
                skins: function(id, description) {
                    console.log('skin',id);
                    console.log(description);
                },
                samplers: function(id, description) {
                    console.log('sampler',id);
                    console.log(description);
                },
                textures: function(id, description) {
                    console.log('texture',id);
                    console.log(description);
                },
                success: function(json) {
                    // load the entity
                    loadEntity( json, function( err, nodes ) {
                        if ( err ) {
                            callback( err );
                            return;
                        }
                        callback( null, {
                            children: nodes
                        });
                    });
                },
                error: function(err) {
                    callback( err );
                }
            });
        }

    };

}());
