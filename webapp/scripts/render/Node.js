(function () {

    'use strict';

    var glm = require('gl-matrix');

    function Node( args ) {
        // matrix
        this.matrix = args.matrix;
        // animation
        this.rotation = args.rotation;
        this.translation = args.translation;
        this.scale = args.scale;
        // camera
        this.camera = args.camera;
        if ( this.camera ) {
            this.camera.parent = this;
        }
        // skin
        this.skin = args.skin;
        this.jointName = args.jointName;
        // primitives
        this.primitives = args.primitives;
        // animation
        this.animations = args.animations;
        // hierarchy
        this.parent = null;
        this.children = [];

    }

    Node.prototype.addChild = function( node ) {
        node.parent = this;
        this.children.push( node );
    };

    Node.prototype.getAnimation = function( name ) {
        if ( !name || !this.animations[ name ] ) {
            name = Object.keys( this.animations )[0];
        }
        return this.animations[ name ];
    };

    Node.prototype.getMatrix = function( time ) {
        var matrix;
        if ( this.matrix ) {
            matrix = glm.mat4.clone( this.matrix );
        } else if ( this.animations ) {
            matrix = this.getAnimation().getPose( this, time );
        } else {
            matrix = glm.mat4.create();
        }
        return matrix;
    };

    Node.prototype.getGlobalMatrix = function( time ) {
        var matrix = this.getMatrix( time );
        if ( this.parent ) {
            var parentMatrix = this.parent.getGlobalMatrix( time );
            glm.mat4.multiply( matrix, parentMatrix, matrix );
        }
        return matrix;
    };

    Node.prototype.getJointMatrix = function( time ) {
        var matrix = this.getMatrix( time );
        if ( this.parent && this.parent.jointName ) {
            var parentMatrix = this.parent.getJointMatrix( time );
            glm.mat4.multiply( matrix, parentMatrix, matrix );
        }
        return matrix;
    };

    Node.prototype.getGlobalViewMatrix = function( time ) {
        var globalMatrix = this.getGlobalMatrix( time );
        var x = glm.vec3.fromValues( globalMatrix[0], globalMatrix[1], globalMatrix[2] );
        var y = glm.vec3.fromValues( globalMatrix[4], globalMatrix[5], globalMatrix[6] );
        var z = glm.vec3.fromValues( globalMatrix[8], globalMatrix[9], globalMatrix[10] );
        var t = glm.vec3.fromValues( -globalMatrix[12], -globalMatrix[13], -globalMatrix[14] );
        glm.vec3.normalize( x, x );
        glm.vec3.normalize( y, y );
        glm.vec3.normalize( z, z );
        return glm.mat4.fromValues(
            x[0], y[0], z[0], 0,
            x[1], y[1], z[1], 0,
            x[2], y[2], z[2], 0,
            glm.vec3.dot( t, x ), glm.vec3.dot( t, y ), glm.vec3.dot( t, z ), 1 );
    };

    module.exports = Node;

}());
