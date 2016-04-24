(function () {

    'use strict';

    var glm = require('gl-matrix');
    var Node = require('./Node');
    var Camera = require('./Camera');

    var C_KEYCODE = 99;
    var DEFAULT_DISTANCE = 10;
    var MAX_DISTANCE = DEFAULT_DISTANCE * 10;
    var MIN_DISTANCE = DEFAULT_DISTANCE / 10;
    var SCROLL_FACTOR = 0.00005;
    var X_FACTOR = -0.1;
    var Y_FACTOR = -0.2;

    function addMouseControls( scene, node ) {

        var last;
        var down;
        var distance = glm.vec3.length( glm.vec3.fromValues(
            node.matrix[12],
            node.matrix[13],
            node.matrix[14] ) );

        var x = glm.vec3.create();
        var y = glm.vec3.create();
        var z = glm.vec3.create();
        var translation = glm.vec3.create();
        var rotation = glm.mat4.create();


        scene.mousedown = function( event ) {
            last = {
                x: event.screenX,
                y: event.screenY
            };
            down = true;
        };

        scene.mousemove = function( event ) {
            if ( down ) {
                var pos = {
                    x: event.screenX,
                    y: event.screenY
                };
                var dx = pos.x - last.x;
                var dy = pos.y - last.y;

                var matrix = node.matrix;

                // get axes
                // x
                x[0] = matrix[0];
                x[1] = matrix[1];
                x[2] = matrix[2];
                glm.vec3.normalize( x, x );
                // y
                y[0] = matrix[4];
                y[1] = matrix[5];
                y[2] = matrix[6];
                glm.vec3.normalize( y, y );
                // z
                z[0] = matrix[8];
                z[1] = matrix[9];
                z[2] = matrix[10];
                glm.vec3.normalize( z, z );
                // translation
                translation[0] = matrix[12];
                translation[1] = matrix[13];
                translation[2] = matrix[14];

                // rotate along world y-axis
                var angle = dx * X_FACTOR * ( Math.PI / 180 );
                glm.mat4.fromRotation( rotation, angle, [ 0, 1, 0 ] );
                // rotate along local x-axis
                angle = dy * Y_FACTOR * ( Math.PI / 180 );
                glm.mat4.rotate( rotation, rotation, angle, x );

                glm.vec3.transformMat4( x, x, rotation );
                glm.vec3.transformMat4( y, y, rotation );
                glm.vec3.transformMat4( z, z, rotation );
                glm.vec3.transformMat4( translation, translation, rotation );

                matrix[0] = x[0];
                matrix[1] = x[1];
                matrix[2] = x[2];

                matrix[4] = y[0];
                matrix[5] = y[1];
                matrix[6] = y[2];

                matrix[8] = z[0];
                matrix[9] = z[1];
                matrix[10] = z[2];

                matrix[12] = translation[0];
                matrix[13] = translation[1];
                matrix[14] = translation[2];

                last = pos;
            }
        };

        scene.wheel = function( event ) {
            distance += ( event.deltaY * SCROLL_FACTOR * MAX_DISTANCE );
            distance = Math.min( Math.max( distance, MIN_DISTANCE ), MAX_DISTANCE );
            var matrix = node.matrix;
            // get normalized translation vector
            translation[0] = matrix[12];
            translation[1] = matrix[13];
            translation[2] = matrix[14];
            glm.vec3.normalize( translation, translation );
            // scale it by the updated distance
            glm.vec3.scale( translation, translation, distance );
            matrix[12] = translation[0];
            matrix[13] = translation[1];
            matrix[14] = translation[2];
        };

        scene.mouseup =  function() {
            down = false;
        };

        window.addEventListener( 'mousedown', scene.mousedown );
        window.addEventListener( 'mousemove', scene.mousemove );
        window.addEventListener( 'wheel', scene.wheel );
        window.addEventListener( 'mouseup', scene.mouseup );
    }

    function addCameraChangeControls( scene ) {
        var current = 0;
        scene.keypress = function( event ) {
            if ( event.keyCode === C_KEYCODE ) {
                current = ( current + 1 ) % scene.cameraNodes.length;
                scene.activeCameraNode = scene.cameraNodes[ current ];
            }
        };
        window.addEventListener( 'keypress', scene.keypress );
    }

    function Scene( args ) {
        this.nodes = args.nodes;
        this.cameraNodes = args.cameras;
        if ( this.cameraNodes.length === 0 ) {
            var camera = new Node({
                camera: new Camera(),
                matrix: glm.mat4.fromTranslation( glm.mat4.create(), [ 0, 0, DEFAULT_DISTANCE ] )
            });
            this.cameraNodes.push( camera );
            this.nodes.push( camera );
            addMouseControls( this, camera );
        } else {
            addCameraChangeControls( this );
        }
        this.activeCameraNode = this.cameraNodes[0];
    }

    Scene.prototype.getGlobalViewMatrix = function( time ) {
        return this.activeCameraNode.getGlobalViewMatrix( time );
    };

    Scene.prototype.getProjectionMatrix = function() {
        return this.activeCameraNode.camera.getProjectionMatrix();
    };

    Scene.prototype.destroy = function() {
        if ( this.mousedown ) {
            window.removeEventListener( 'mousedown', this.mousedown );
        }
        if ( this.mousemove ) {
            window.removeEventListener( 'mousemove', this.mousemove );
        }
        if ( this.wheel ) {
            window.removeEventListener( 'wheel', this.wheel );
        }
        if ( this.mouseup ) {
            window.removeEventListener( 'mouseup', this.mouseup );
        }
        if ( this.keypress ) {
            window.removeEventListener( 'keypress', this.keypress );
        }
    };

    module.exports = Scene;

}());
