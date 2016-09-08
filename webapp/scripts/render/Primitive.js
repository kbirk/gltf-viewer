(function () {

    'use strict';

    class Primitive {
        constructor(args) {
            this.vertexBuffers = args.vertexBuffers;
            this.indexBuffer = args.indexBuffer || null;
            this.material = args.material;
            this.technique = args.technique;
        }
        draw() {
            if (this.indexBuffer) {
                this.vertexBuffers.forEach(buffer => {
                    buffer.bind();
                });
                this.indexBuffer.draw();
                this.vertexBuffers.forEach(buffer => {
                    buffer.unbind();
                });
            } else {
                this.vertexBuffers.forEach(buffer => {
                    buffer.bind();
                });
                if (this.vertexBuffers.length > 0 ) {
                    this.vertexBuffers[0].draw();
                }
                this.vertexBuffers.forEach(buffer => {
                    buffer.unbind();
                });
            }
        }
    }

    module.exports = Primitive;

}());
