(function() {

    'use strict';

    var glm = require('gl-matrix');
    var context = require('./scripts/render/gl');
    var glTFLoader = require('./scripts/glTFLoader');
    var Debug = require('./scripts/render/Debug');

    var MODEL_NAME = 'vc';

    var gl;
    var origin;
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
        // continue to next frame
    	requestAnimationFrame( render );
    }

    function resizeCanvas() {
        gl.canvas.width = window.innerWidth;
        gl.canvas.height = window.innerHeight;
        gl.viewport(0, 0, window.innerWidth, window.innerHeight );
    }

    window.start = function() {

        gl = context();

        // only continue if WebGL is available
        if ( gl ) {

            // size the canvas according to the window
            resizeCanvas();

            // resize viewport on window resize
            window.addEventListener( 'resize', resizeCanvas );

            glTFLoader.load('./models/' + MODEL_NAME + '/' + MODEL_NAME + '.gltf', function( err, gltf ) {
                if ( err ) {
                    console.error( err );
                    return;
                }

                // get scene instance
                scene = gltf.scenes[ gltf.scene ].instance;

                // create origin matrix
                origin = glm.mat4.create();

                render();
            });

        }
    };

}());
