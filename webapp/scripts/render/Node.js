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
        // matrix
        this.localMatrix = glm.mat4.create();
        this.globalMatrix = glm.mat4.create();
        this.jointMatrix = glm.mat4.create();
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
        if ( this.matrix ) {
            glm.mat4.copy( this.localMatrix, this.matrix );
        } else if ( this.animations ) {
            this.getAnimation().getPose( this.localMatrix, this, time );
        } else {
            glm.mat4.identity( this.localMatrix );
        }
        return this.localMatrix;
    };

    Node.prototype.getGlobalMatrix = function( time ) {
        glm.mat4.copy( this.globalMatrix, this.getMatrix( time ) );
        if ( this.parent ) {
            var parentMatrix = this.parent.getGlobalMatrix( time );
            glm.mat4.multiply( this.globalMatrix, parentMatrix, this.globalMatrix );
        }
        return this.globalMatrix;
    };

    Node.prototype.getJointMatrix = function( time ) {
        glm.mat4.copy( this.jointMatrix, this.getMatrix( time ) );
        if ( this.parent && this.parent.jointName ) {
            var parentMatrix = this.parent.getJointMatrix( time );
            glm.mat4.multiply( this.jointMatrix, parentMatrix, this.jointMatrix );
        }
        return this.jointMatrix;
    };

    module.exports = Node;

}());
