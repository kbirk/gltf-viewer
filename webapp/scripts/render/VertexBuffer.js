(function () {

    'use strict';

    var context = require('./gl');

    function VertexBuffer(args) {
        this.gl = context();
        this.buffer = args.buffer;
        this.index = args.index;
        this.size = args.size;
        this.type = args.type;
        this.byteStride = args.byteStride;
        this.byteOffset = args.byteOffset;
        this.mode = args.mode;
        this.count = args.count;
    }

    VertexBuffer.prototype.bind = function() {
        var gl = this.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.vertexAttribPointer(
            this.index,
            this.size,
            this.type,
            false,
            this.byteStride,
            this.byteOffset);
        gl.enableVertexAttribArray(this.index);
    };

    VertexBuffer.prototype.draw = function() {
        var gl = this.gl;
        // TODO: convert byteOffset to index
        gl.drawArrays(this.mode, this.byteOffset, this.count);
    };

    VertexBuffer.prototype.unbind = function() {
        var gl = this.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.disableVertexAttribArray(this.index);
    };

    module.exports = VertexBuffer;

}());
