(function () {

    'use strict';

    var glm = require('gl-matrix');
    var Node = require('./Node');
    var Camera = require('./Camera');

    var DEFAULT_DISTANCE = 10;
    var MAX_DISTANCE = DEFAULT_DISTANCE * 10;
    var MIN_DISTANCE = DEFAULT_DISTANCE / 10;
    var SCROLL_FACTOR = 0.00005;
    var X_FACTOR = -0.1;
    var Y_FACTOR = -0.2;

    function addMouseControls( node ) {

        var last;
        var down;
        var distance = glm.vec3.length( glm.vec3.fromValues(
            node.matrix[12],
            node.matrix[13],
            node.matrix[14] ) );

        window.onmousedown = function( event ) {
            last = {
                x: event.screenX,
                y: event.screenY
            };
            down = true;
        };

        window.onmousemove = function( event ) {
            if ( down ) {
                var pos = {
                    x: event.screenX,
                    y: event.screenY
                };
                var dx = pos.x - last.x;
                var dy = pos.y - last.y;

                var matrix = node.matrix;

                // get difference vector
                var x = glm.vec3.normalize( glm.vec3.create(), glm.vec3.fromValues( matrix[0], matrix[1], matrix[2] ) );
                var y = glm.vec3.normalize( glm.vec3.create(), glm.vec3.fromValues( matrix[4], matrix[5], matrix[6] ) );
                var z = glm.vec3.normalize( glm.vec3.create(), glm.vec3.fromValues( matrix[8], matrix[9], matrix[10] ) );
                var translation = glm.vec3.fromValues( matrix[12], matrix[13], matrix[14] );
                // rotate along world y-axis
                var angle = dx * X_FACTOR * ( Math.PI / 180 );
                var rot = glm.mat4.fromRotation( glm.mat4.create(), angle, [ 0, 1, 0 ] );
                // rotate along local x-axis
                angle = dy * Y_FACTOR * ( Math.PI / 180 );
                glm.mat4.rotate( rot, rot, angle, x );

                glm.vec3.transformMat4( x, x, rot );
                glm.vec3.transformMat4( y, y, rot );
                glm.vec3.transformMat4( z, z, rot );
                glm.vec3.transformMat4( translation, translation, rot );

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

        window.onwheel = function( event ) {
            distance += ( event.deltaY * SCROLL_FACTOR * MAX_DISTANCE );
            distance = Math.min( Math.max( distance, MIN_DISTANCE ), MAX_DISTANCE );
            var matrix = node.matrix;
            // get translation vector
            var translation = glm.vec3.normalize( glm.mat4.create(), glm.vec3.fromValues( matrix[12], matrix[13], matrix[14] ) );
            // scale it by the updated distance
            glm.vec3.scale( translation, translation, distance );
            matrix[12] = translation[0];
            matrix[13] = translation[1];
            matrix[14] = translation[2];
        };

        window.onmouseup = function() {
            down = false;
        };
    }

    function Scene( args ) {
        this.nodes = args.nodes;
        this.cameras = args.cameras;
        if ( this.cameras.length === 0 ) {
            var camera = new Node({
                camera: new Camera(),
                matrix: glm.mat4.fromTranslation( glm.mat4.create(), [ 0, 0, DEFAULT_DISTANCE ] )
            });
            this.cameras.push( camera );
            this.nodes.push( camera );
            addMouseControls( camera );
        }
    }

    module.exports = Scene;

}());
