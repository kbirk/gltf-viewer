(function () {

    'use strict';

    function Primitive( args ) {
        this.vertexBuffers = args.vertexBuffers;
        this.indexBuffer = args.indexBuffer || null;
        this.material = args.material;
        this.technique = args.technique;
    }

    Primitive.prototype.draw = function() {
        if ( this.indexBuffer ) {
            this.vertexBuffers.forEach( function( buffer ) {
                buffer.bind();
            });
            this.indexBuffer.draw();
            this.vertexBuffers.forEach( function( buffer ) {
                buffer.unbind();
            });
        } else {
            this.vertexBuffers.forEach( function( buffer ) {
                buffer.bind();
                buffer.draw();
                buffer.unbind();
            });
        }
    };

    module.exports = Primitive;

}());
