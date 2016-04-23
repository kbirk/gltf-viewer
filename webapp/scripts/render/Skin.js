(function () {

    'use strict';

    var glm = require('gl-matrix');

    function getBindPose( joint ) {
        return glm.mat4.fromRotationTranslationScale( glm.mat4.create(), joint.rotation, joint.translation, joint.scale );
    }

    function computeJointMatrices( skin, joint, time, parentMatrix ) {
        var matrix;
        if ( joint.animations ) {
            var animationId = Object.keys( joint.animations )[0];
            matrix = joint.animations[ animationId ].getPose( joint, time );
        } else {
            matrix = getBindPose( joint );
        }
        // get global matrix
        var globalMatrix;
        if ( parentMatrix ) {
            globalMatrix = glm.mat4.multiply( glm.mat4.create(), parentMatrix, matrix );
        } else {
            globalMatrix = matrix;
        }
        var jointIndex = skin.jointIndices[ joint.jointName ] * 16;
        // extract inverse matrix from flat array
        var inverse = skin.inverseBindMatrices.subarray( jointIndex, jointIndex + 16 );
        // multiply inverse by bind shape matrix
        var bindInverse = glm.mat4.multiply( glm.mat4.create(), inverse, skin.bindShapeMatrix );
        // extract joint matrix from flat output array
        var jointMatrix = skin.arraybuffer.subarray( jointIndex, jointIndex + 16 );
        // get joint matrix
        glm.mat4.multiply( jointMatrix, globalMatrix, bindInverse );
        // recurse
        joint.children.forEach( function( child ) {
            computeJointMatrices( skin, child, time, globalMatrix );
        });
    }

    function Skin( args ) {
        this.bindShapeMatrix = args.bindShapeMatrix;
        this.inverseBindMatrices = args.inverseBindMatrices;
        this.joints = args.joints;
        this.jointIndices = args.jointIndices;
        this.arraybuffer = new Float32Array( this.joints.length * 16 );
    }

    Skin.prototype.getJointArray = function( time ) {
        computeJointMatrices(
            this,
            this.joints[0],
            time );
        return this.arraybuffer;
    };

    module.exports = Skin;

}());
