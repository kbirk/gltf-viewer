(function () {

    'use strict';

    let context = require('./gl');

    class IndexBuffer {
        constructor(args) {
            this.gl = context();
            this.buffer = args.buffer;
            this.type = args.type;
            this.mode = args.mode;
            this.count = args.count;
            this.byteOffset = args.byteOffset;
        }
        draw() {
            let gl = this.gl;
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer);
            gl.drawElements(this.mode, this.count, this.type, this.byteOffset);
        }
    }

    module.exports = IndexBuffer;

}());
