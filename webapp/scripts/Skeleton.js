(function () {

    'use strict';

    var _ = require('lodash');
    var alfador = require('alfador');

    function getJointCount( jointsById, joints ) {
        var count = joints.length;
        joints.forEach( function( joint ) {
            jointsById[ joint.id ] = joint;
            count += getJointCount( jointsById, joint.children );
        });
        return count;
    }

    function Skeleton( that ) {
        // root can be either a single node, or an array of root nodes
        this.root = ( that.root instanceof Array ) ? that.root : [ that.root ];
        this.bindShapeMatrix = that.bindShapeMatrix || alfador.Mat44.identity();
        this.joints = {};
        this.jointCount = getJointCount( this.joints, this.root );
        this.buffer = new Float32Array( new ArrayBuffer( 4 * 16 * this.jointCount ) );
    }

    Skeleton.prototype.toFloat32Array = function() {
        var bindShapeMatrix = this.bindShapeMatrix;
        var buffer = this.buffer;
        // allocate arraybuffer to store all joint matrices
        _.forIn( this.joints, function( joint ) {
            var matrix = joint.skinningMatrix( bindShapeMatrix );
            buffer.set( matrix, joint.index * 16 );
        });
        // return array as arraybuffer object
        return this.buffer;
    };

    module.exports = Skeleton;

}());
