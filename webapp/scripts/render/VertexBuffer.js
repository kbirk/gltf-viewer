(function () {

    'use strict';

    let context = require('./gl');

    class VertexBuffer {
        constructor(args) {
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
        bind() {
            let gl = this.gl;
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
            gl.vertexAttribPointer(
                this.index,
                this.size,
                this.type,
                false,
                this.byteStride,
                this.byteOffset);
            gl.enableVertexAttribArray(this.index);
        }
        draw() {
            let gl = this.gl;
            gl.drawArrays(this.mode, 0, this.count);
        }
        unbind() {
            let gl = this.gl;
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
            gl.disableVertexAttribArray(this.index);
        }
    }

    module.exports = VertexBuffer;

}());
