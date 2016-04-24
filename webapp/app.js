(function() {

    'use strict';

    var glm = require('gl-matrix');
    var context = require('./scripts/render/gl');
    var glTFLoader = require('./scripts/glTFLoader');
    var Debug = require('./scripts/render/Debug');
    var XHRLoader = require('./scripts/util/XHRLoader');

    var model;
    var models;

    var gl;
    var origin = glm.mat4.create();
    var scene;
    var view;
    var projection;

    var start = Date.now();
    var time;

    function renderPrimitive( node, model, primitive ) {
        var material = primitive.material;
        var technique = primitive.technique;
        // enable state
        technique.enableState();
        // set uniforms
        technique.setUniforms( node, material, model, view, projection, time );
        // draw the primitive
        primitive.draw();
        // disable state
        technique.disableState();
    }

    function renderHierarchy( node, parentMatrix ) {
        var matrix = node.getMatrix( time );
        if ( parentMatrix ) {
            glm.mat4.multiply( matrix, parentMatrix, matrix );
        }
        if ( node.primitives ) {
            node.primitives.forEach( function( primitive ) {
                // draw
                renderPrimitive( node, matrix, primitive );
            });
        }
        node.children.forEach( function( child ) {
            renderHierarchy( child, matrix );
        });
    }

    function render() {
        if ( scene ) {
            // get timestamp
            time = ( Date.now() - start ) / 1000;
            // update view matrix based on camera position
            view = scene.getGlobalViewMatrix( time );
            // get projection matrix
            projection = scene.getProjectionMatrix();
            // render origin
            Debug.renderNode( origin, view, projection );
            // render scene
            scene.nodes.forEach( function( node ) {
                renderHierarchy( node );
            });
        }
        // continue to next frame
    	requestAnimationFrame( render );
    }

    function resizeCanvas() {
        gl.canvas.width = window.innerWidth;
        gl.canvas.height = window.innerHeight;
        gl.viewport(0, 0, window.innerWidth, window.innerHeight );
    }

    function loadModel( path ) {
        // load and parse glTF model into runtime format
        glTFLoader.load( path, function( err, gltf ) {
            if ( err ) {
                console.error( err );
                return;
            }
            if ( scene ) {
                scene.destroy();
            }
            // get scene instance
            scene = gltf.scenes[ gltf.scene ].instance;
        });
    }

    function changeModel( event ) {
        var M_CODE = 109;
        var modelIndex = models.indexOf( model );
        if ( event.keyCode === M_CODE ) {
            modelIndex = ( modelIndex + 1 ) % models.length;
            // switch model
            model = models[ modelIndex ];
            // load the model
            loadModel( model );
        }

    }

    window.start = function() {
        // get WebGL context
        gl = context();
        // only continue if WebGL is available
        if ( gl ) {
            // size the canvas according to the window
            resizeCanvas();
            // resize viewport on window resize
            window.addEventListener( 'resize', resizeCanvas );
            // get all models
            XHRLoader.load({
                url: 'models',
                responseType: 'json',
                success: function( res ) {
                    if ( res.length === 0 ) {
                        console.error( 'There are no models to render' );
                        return;
                    }
                    models = res;
                    model = models[0];
                    // add model change listener
                    window.addEventListener( 'keypress', changeModel );
                    // load the model
                    loadModel( model );
                    // start rendering
                    render();
                },
                error: function( err ) {
                    console.error( err );
                }
            });
        }
    };

}());
