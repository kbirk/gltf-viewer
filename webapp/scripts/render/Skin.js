(function () {

    'use strict';

    var glm = require('gl-matrix');

    function Skin(args) {
        this.bindShapeMatrix = args.bindShapeMatrix;
        this.inverseBindMatrices = args.inverseBindMatrices;
        this.joints = args.joints;
        this.size = args.size;
        this.buffer = new Float32Array(this.joints.length * this.size);
    }

    Skin.prototype.getJointArray = function(time) {
        var size = this.size;
        var bindShapeMatrix = this.bindShapeMatrix;
        var inverseBindMatrices = this.inverseBindMatrices;
        var buffer = this.buffer;
        this.joints.forEach(function(joint, index) {
            // get joint matrix
            var matrix = joint.getJointMatrix(time);
            // get joint index
            var jointIndex = index * size;
            // extract inverse matrix from flat array
            var inverse = inverseBindMatrices.subarray(jointIndex, jointIndex + size);
            // extract joint matrix from flat output array
            var jointMatrix = buffer.subarray(jointIndex, jointIndex + size);
            // multiply inverse by bind shape matrix
            glm.mat4.multiply(jointMatrix, inverse, bindShapeMatrix);
            // get joint matrix
            glm.mat4.multiply(jointMatrix, matrix, jointMatrix);
        });
        return this.buffer;
    };

    module.exports = Skin;

}());
