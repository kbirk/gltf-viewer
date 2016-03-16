(function () {

    'use strict';

    var async = require('async');
    var glTFUtil = require('./glTFUtil');
    var glTFMaterial = require('./glTFMaterial');
    //var glTFAnimation = require('./glTFAnimation');
    var glTFMesh = require('./glTFMesh');
    var glTFParser = require('./glTFParser');
    var glTFSkeleton = require('./glTFSkeleton');
    var Entity = require('./Entity');

    function createEntityRecursive( json, meshes, buffers, nodeId ) {
        // get the node object
        var node = json.nodes[ nodeId ];

        if ( node.jointName || node.camera || node.light ) {
            // node is either a joint, camera, or light, so ignore it as an entity
            // TODO: process these
            return null;
        }

        // get the nodes transform
        var transform = glTFUtil.getNodeMatrix( node ).decompose();

        // recursively assemble the skeleton joint tree
        var children = [];
        node.children.forEach( function( childId ) {
            var child = createEntityRecursive( json, meshes, buffers, childId );
            if ( child ) {
                children.push( child );
            }
        });

        // if node has a mesh, add the renderables
        // TODO: deal with renderabels later
        // var renderables = [];
        // if ( node.meshes ) {
        //     node.meshes.forEach( function( meshId ) {
        //         renderables = renderables.concat( meshes[ meshId ] );
        //     });
        // }

        // if node has skin, process skeleton
        var skeleton;
        //var animations;
        if ( node.skin ) {
            skeleton = glTFSkeleton.createSkeleton( json, node, buffers );
            // TODO: animations
            // var animations = glTFAnimation.createAnimations( json, buffers );
            // TODO: is this deprecated?
            // for ( i=0; i<node.skin.meshes.length; i++ ) {
            //     renderables = renderables.concat( meshes[ node.skin.meshes[i] ] );
            // }
        }

        var entity = new Entity({
            id: nodeId,
            up: transform.up,
            forward: transform.forward,
            left: transform.left,
            origin: transform.origin,
            scale: transform.scale,
            children: children
        });
        // TODO: add this in a better way
        entity.skeleton = skeleton;
        return entity;
    }

    function createEntity( json, meshes, buffers ) {
        var rootNodes = json.scenes[ json.scene ].nodes;
        var entities = [];
        // for each node
        rootNodes.forEach( function( node ) {
            var entity = createEntityRecursive( json, meshes, buffers, node );
            if ( entity ) {
                entities.push( entity );
            }
        });
        return entities;
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
            var meshes = glTFMesh.createMeshes( json, buffers, materials );
            var entity = createEntity( json, meshes, buffers );
            callback( null, entity );
        });
    }

    module.exports = {

        load: function( url, callback ) {
            var scene = new Entity();
            var parser = Object.create( glTFParser, {
                handleLoadCompleted: {
                    value: function() {
                        // load the entity
                        loadEntity( this.json, function( err, entities ) {
                            if ( err ) {
                                console.error( err );
                                callback( null );
                                return;
                            }
                            entities.forEach( function( entity ) {
                                scene.addChild( entity );
                            });
                            callback( scene );
                        });
                    }
                }
            });
            parser.initWithPath( url );
            parser.load( null, null );
            return scene;
        }

    };

}());
