(function () {

    'use strict';

    let glm = require('gl-matrix');

    class Skin {
        constructor(args) {
            this.bindShapeMatrix = args.bindShapeMatrix;
            this.inverseBindMatrices = args.inverseBindMatrices;
            this.joints = args.joints;
            this.size = args.size;
            this.buffer = new Float32Array(this.joints.length * this.size);
        }
        getJointArray(time) {
            let size = this.size;
            let bindShapeMatrix = this.bindShapeMatrix;
            let inverseBindMatrices = this.inverseBindMatrices;
            let buffer = this.buffer;
            this.joints.forEach((joint, index) => {
                // get joint matrix
                let matrix = joint.getJointMatrix(time);
                // get joint index
                let jointIndex = index * size;
                // extract inverse matrix from flat array
                let inverse = inverseBindMatrices.subarray(jointIndex, jointIndex + size);
                // extract joint matrix from flat output array
                let jointMatrix = buffer.subarray(jointIndex, jointIndex + size);
                // multiply inverse by bind shape matrix
                glm.mat4.multiply(jointMatrix, inverse, bindShapeMatrix);
                // get joint matrix
                glm.mat4.multiply(jointMatrix, matrix, jointMatrix);
            });
            return this.buffer;
        }
    }

    module.exports = Skin;

}());
