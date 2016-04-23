(function() {

    'use strict';

    var glm = require('gl-matrix');

    var ASPECT_RATIO = function() {
        return window.innerWidth / window.innerHeight;
    };
    var FOV = 60 * ( Math.PI / 180 );
    var NEAR = 0.1;
    var FAR = 10000;

    function Camera( args ) {
        args = args || {};
        this.parent = null;
        this.projection = args.projection || {
            type: 'perspective',
            yfov: FOV,
            znear: NEAR,
            zfar: FAR
        };
    }

    Camera.prototype.getProjectionMatrix = function() {
        var matrix = glm.mat4.create();
        if ( this.projection.type === 'perspective' ) {
            // perspective
            glm.mat4.perspective(
                matrix,
                this.projection.yfov,
                ASPECT_RATIO(),
                this.projection.znear,
                this.projection.zfar );
        } else {
            // orthographic
            glm.mat4.ortho(
                matrix,
                -this.projection.xmag, this.projection.xmag,
                -this.projection.ymag, this.projection.ymag,
                this.projection.znear, this.projection.zfar );
        }
        return matrix;
    };

    module.exports = Camera;

}());
