(function () {

    'use strict';

    let glm = require('gl-matrix');
    let Node = require('./Node');
    let Camera = require('./Camera');

    let C_KEYCODE = 99;
    let DEFAULT_DISTANCE = 10;
    let MAX_DISTANCE = DEFAULT_DISTANCE * 10;
    let MIN_DISTANCE = DEFAULT_DISTANCE / 10;
    let SCROLL_FACTOR = 0.00005;
    let X_FACTOR = -0.1;
    let Y_FACTOR = -0.2;

    function addMouseControls(scene, node) {

        let last;
        let down;
        let distance = glm.vec3.length(
            glm.vec3.fromValues(
                node.matrix[12],
                node.matrix[13],
                node.matrix[14]));

        let x = glm.vec3.create();
        let y = glm.vec3.create();
        let z = glm.vec3.create();
        let translation = glm.vec3.create();
        let rotation = glm.mat4.create();

        scene.mousedown = function(event) {
            last = {
                x: event.screenX,
                y: event.screenY
            };
            down = true;
        };

        scene.mousemove = function(event) {
            if (down) {
                let pos = {
                    x: event.screenX,
                    y: event.screenY
                };
                let dx = pos.x - last.x;
                let dy = pos.y - last.y;

                let matrix = node.matrix;

                // get axes
                // x
                x[0] = matrix[0];
                x[1] = matrix[1];
                x[2] = matrix[2];
                glm.vec3.normalize(x, x);
                // y
                y[0] = matrix[4];
                y[1] = matrix[5];
                y[2] = matrix[6];
                glm.vec3.normalize(y, y);
                // z
                z[0] = matrix[8];
                z[1] = matrix[9];
                z[2] = matrix[10];
                glm.vec3.normalize(z, z);
                // translation
                translation[0] = matrix[12];
                translation[1] = matrix[13];
                translation[2] = matrix[14];

                // rotate along world y-axis
                let angle = dx * X_FACTOR * (Math.PI / 180);
                glm.mat4.fromRotation(rotation, angle, [ 0, 1, 0 ]);
                // rotate along local x-axis
                angle = dy * Y_FACTOR * (Math.PI / 180);
                glm.mat4.rotate(rotation, rotation, angle, x);

                glm.vec3.transformMat4(x, x, rotation);
                glm.vec3.transformMat4(y, y, rotation);
                glm.vec3.transformMat4(z, z, rotation);
                glm.vec3.transformMat4(translation, translation, rotation);

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

        scene.wheel = function(event) {
            distance += (event.deltaY * SCROLL_FACTOR * MAX_DISTANCE);
            distance = Math.min(Math.max(distance, MIN_DISTANCE), MAX_DISTANCE);
            let matrix = node.matrix;
            // get normalized translation vector
            translation[0] = matrix[12];
            translation[1] = matrix[13];
            translation[2] = matrix[14];
            glm.vec3.normalize(translation, translation);
            // scale it by the updated distance
            glm.vec3.scale(translation, translation, distance);
            matrix[12] = translation[0];
            matrix[13] = translation[1];
            matrix[14] = translation[2];
        };

        scene.mouseup =  function() {
            down = false;
        };

        window.addEventListener('mousedown', scene.mousedown);
        window.addEventListener('mousemove', scene.mousemove);
        window.addEventListener('wheel', scene.wheel);
        window.addEventListener('mouseup', scene.mouseup);
    }

    function addCameraChangeControls(scene) {
        let current = 0;
        scene.keypress = function(event) {
            if (event.keyCode === C_KEYCODE) {
                current = (current + 1) % scene.cameraNodes.length;
                scene.activeCameraNode = scene.cameraNodes[ current ];
            }
        };
        window.addEventListener('keypress', scene.keypress);
    }

    class Scene {
        constructor(args) {
            this.nodes = args.nodes;
            this.cameraNodes = args.cameras;
            if (this.cameraNodes.length === 0) {
                let camera = new Node({
                    camera: new Camera(),
                    matrix: glm.mat4.fromTranslation(glm.mat4.create(), [ 0, 0, DEFAULT_DISTANCE ])
                });
                this.cameraNodes.push(camera);
                this.nodes.push(camera);
                addMouseControls(this, camera);
            } else {
                addCameraChangeControls(this);
            }
            this.activeCameraNode = this.cameraNodes[0];
            this.cameraX = glm.vec3.create();
            this.cameraY = glm.vec3.create();
            this.cameraZ = glm.vec3.create();
            this.cameraOrigin = glm.vec3.create();
            this.globalViewMatrix = glm.mat4.create();
        }
        getGlobalViewMatrix(time) {
            let globalMatrix = this.activeCameraNode.getGlobalMatrix(time);
            // x-axis
            this.cameraX[0] = globalMatrix[0];
            this.cameraX[1] = globalMatrix[1];
            this.cameraX[2] = globalMatrix[2];
            glm.vec3.normalize(this.cameraX, this.cameraX);
            // y-axis
            this.cameraY[0] = globalMatrix[4];
            this.cameraY[1] = globalMatrix[5];
            this.cameraY[2] = globalMatrix[6];
            glm.vec3.normalize(this.cameraY, this.cameraY);
            // z-axis
            this.cameraZ[0] = globalMatrix[8];
            this.cameraZ[1] = globalMatrix[9];
            this.cameraZ[2] = globalMatrix[10];
            glm.vec3.normalize(this.cameraZ, this.cameraZ);
            // translation
            this.cameraOrigin[0] = -globalMatrix[12];
            this.cameraOrigin[1] = -globalMatrix[13];
            this.cameraOrigin[2] = -globalMatrix[14];
            // create view matrix
            this.globalViewMatrix[0] = this.cameraX[0];
            this.globalViewMatrix[1] = this.cameraY[0];
            this.globalViewMatrix[2] = this.cameraZ[0];
            this.globalViewMatrix[3] = 0;
            this.globalViewMatrix[4] = this.cameraX[1];
            this.globalViewMatrix[5] = this.cameraY[1];
            this.globalViewMatrix[6] = this.cameraZ[1];
            this.globalViewMatrix[7] = 0;
            this.globalViewMatrix[8] = this.cameraX[2];
            this.globalViewMatrix[9] = this.cameraY[2];
            this.globalViewMatrix[10] = this.cameraZ[2];
            this.globalViewMatrix[11] = 0;
            this.globalViewMatrix[12] = glm.vec3.dot(this.cameraOrigin, this.cameraX);
            this.globalViewMatrix[13] = glm.vec3.dot(this.cameraOrigin, this.cameraY);
            this.globalViewMatrix[14] = glm.vec3.dot(this.cameraOrigin, this.cameraZ);
            this.globalViewMatrix[15] = 1;
            return this.globalViewMatrix;
        }
        getProjectionMatrix() {
            return this.activeCameraNode.camera.getProjectionMatrix();
        }
        destroy() {
            if (this.mousedown) {
                window.removeEventListener('mousedown', this.mousedown);
            }
            if (this.mousemove) {
                window.removeEventListener('mousemove', this.mousemove);
            }
            if (this.wheel) {
                window.removeEventListener('wheel', this.wheel);
            }
            if (this.mouseup) {
                window.removeEventListener('mouseup', this.mouseup);
            }
            if (this.keypress) {
                window.removeEventListener('keypress', this.keypress);
            }
        }
    }

    module.exports = Scene;

}());
