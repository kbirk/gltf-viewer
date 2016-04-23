(function () {

    'use strict';

    var context = require('./gl');

    function IndexBuffer( args ) {
        var gl = this.gl = context();
        this.buffer = args.buffer;
        // this.buffer = gl.createBuffer();
        // gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.buffer );
        // gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, args.source, gl.STATIC_DRAW );
        this.type = args.type;
        this.mode = args.mode;
        this.count = args.count;
        this.byteOffset = args.byteOffset;
    }

    IndexBuffer.prototype.draw = function() {
        var gl = this.gl;
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, this.buffer );
        gl.drawElements( this.mode, this.count, this.type, this.byteOffset );
    };

    module.exports = IndexBuffer;

}());