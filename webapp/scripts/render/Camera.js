(function() {

    'use strict';

    let glm = require('gl-matrix');

    let ASPECT_RATIO = function() {
        return window.innerWidth / window.innerHeight;
    };
    let FOV = 60 * (Math.PI / 180);
    let NEAR = 0.1;
    let FAR = 10000;

    class Camera {
        constructor(args) {
            args = args || {};
            this.parent = null;
            this.projection = args.projection || {
                type: 'perspective',
                yfov: FOV,
                znear: NEAR,
                zfar: FAR
            };
            this.projectionMatrix = glm.mat4.create();
        }
        getProjectionMatrix() {
            if (this.projection.type === 'perspective') {
                // perspective
                glm.mat4.perspective(
                    this.projectionMatrix,
                    this.projection.yfov,
                    ASPECT_RATIO(),
                    this.projection.znear,
                    this.projection.zfar);
            } else {
                // orthographic
                glm.mat4.ortho(
                    this.projectionMatrix,
                    -this.projection.xmag, this.projection.xmag,
                    -this.projection.ymag, this.projection.ymag,
                    this.projection.znear, this.projection.zfar);
            }
            return this.projectionMatrix;
        }
    }

    module.exports = Camera;

}());
