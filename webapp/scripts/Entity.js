(function () {

    'use strict';

    var alfador = require('alfador');

    function Entity( spec ) {
        spec = spec || {};
        // call base constructor for transform
        alfador.Transform.call( this, spec );
        // set id
        this.id = spec.id;
        // set parent
        this.parent = spec.parent || null;
        // set children
        this.children = [];
        var that = this;
        if ( spec.children ) {
            spec.children.forEach( function( child ) {
                that.addChild( child );
            });
        }
        this.meshes = spec.meshes || null;
    }

    Entity.prototype = Object.create( alfador.Transform.prototype );

    Entity.prototype.globalMatrix = function() {
        if ( this.parent ) {
            return this.parent.globalMatrix().multMat44( this.matrix() );
        }
        return this.matrix();
    };

    Entity.prototype.globalViewMatrix = function() {
        if ( this.parent ) {
            return this.parent.multMat44( this.matrix() ).viewMatrix();
        }
        return this.viewMatrix();
    };

    Entity.prototype.addChild = function( child ) {
        if ( !( child instanceof Entity ) ) {
            child = new Entity( child );
        }
        child.parent = this;
        this.children.push( child );
        return this;
    };

    Entity.prototype.removeChild = function( child ) {
        var index = this.children.indexOf( child );
        if ( index !== -1 ) {
            this.children.splice( index, 1 );
            child.parent = null;
        }
        return this;
    };

    Entity.prototype.depthFirst = function( callback ) {
        callback( this );
        this.children.forEach( function( child ) {
            child.depthFirst( callback );
        });
    };

    Entity.prototype.breadthFirst = function( callback ) {
        var queue = [ this ];
        while ( queue.length > 0 ) {
            var top = queue.shift();
            queue = queue.concat( top.children );
            callback( top );
        }
    };

    module.exports = Entity;

}());
