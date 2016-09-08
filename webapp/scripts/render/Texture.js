(function () {

    'use strict';

    let context = require('./gl');

    let MIPMAP_MIN_FILTERS = {
        9984: true,
        9985: true,
        9986: true,
        9987: true
    };

    function nextHighestPowerOfTwo(num) {
        let i;
        if (num !== 0) {
            num = num-1;
        }
        for (i=1; i<32; i<<=1) {
            num = num | num >> i;
        }
        return num + 1;
    }

    function isPowerOfTwo(num) {
        return (num !== 0) ? (num & (num - 1)) === 0 : false;
    }

    function resizeToPowerOfTwo(img) {
        if (isPowerOfTwo(img.width) && isPowerOfTwo(img.height)) {
            return img;
        }
        // create an empty canvas element
        let canvas = document.createElement('canvas');
        canvas.width = nextHighestPowerOfTwo(img.width);
        canvas.height = nextHighestPowerOfTwo(img.height);
        // copy the image contents to the canvas
        let ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
        return canvas;
    }

    class Texture {
        constructor(args) {
            let gl = this.gl = context();
            this.target = args.target;
            this.internalFormat = args.internalFormat;
            this.format = args.format;
            this.type = args.type;
            this.texture = gl.createTexture();
            gl.bindTexture(this.target, this.texture);
            // resize to POT
            args.image = resizeToPowerOfTwo(args.image);
            // buffer the texture
            gl.texImage2D(
                this.target,
                0, // mip-map level
                this.internalFormat,
                this.format,
                this.type,
                args.image);
            // generate mip-maps if using a mip-mapping min filter
            if (MIPMAP_MIN_FILTERS[ args.sampler.minFilter ]) {
                gl.generateMipmap(this.target);
            }
            // set sampler parameters
            gl.texParameteri(this.target, gl.TEXTURE_WRAP_S, args.sampler.wrapS);
            gl.texParameteri(this.target, gl.TEXTURE_WRAP_T, args.sampler.wrapT);
            gl.texParameteri(this.target, gl.TEXTURE_MIN_FILTER, args.sampler.minFilter);
            gl.texParameteri(this.target, gl.TEXTURE_MAG_FILTER, args.sampler.magFilter);
        }
        bind(location) {
            let gl = this.gl;
            gl.activeTexture(gl[ 'TEXTURE' + location ]);
            gl.bindTexture(this.target, this.texture);
        }
    }

    module.exports = Texture;

}());
