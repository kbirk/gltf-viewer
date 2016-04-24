(function () {

    'use strict';

    var context = require('./gl');

    var MIPMAP_MIN_FILTERS = {
        9984: true,
        9985: true,
        9986: true,
        9987: true
    };

    function Texture( args ) {
        var gl = this.gl = context();
        this.target = args.target;
        this.internalFormat = args.internalFormat;
        this.format = args.format;
        this.type = args.type;
        this.texture = gl.createTexture();
        gl.bindTexture( this.target, this.texture );
        // buffer the texture
        gl.texImage2D(
            this.target,
            0, // mip-map level
            this.internalFormat,
            this.format,
            this.type,
            args.image );
        // generate mip-maps if using a mip-mapping min filter
        if ( MIPMAP_MIN_FILTERS[ args.sampler.minFilter ] ) {
            gl.generateMipmap( this.target );
        }
        // set sampler parameters
        gl.texParameteri( this.target, gl.TEXTURE_WRAP_S, args.sampler.wrapS );
        gl.texParameteri( this.target, gl.TEXTURE_WRAP_T, args.sampler.wrapT );
        gl.texParameteri( this.target, gl.TEXTURE_MIN_FILTER, args.sampler.minFilter );
        gl.texParameteri( this.target, gl.TEXTURE_MAG_FILTER, args.sampler.magFilter );
    }

    Texture.prototype.bind = function( location ) {
        var gl = this.gl;
        gl.activeTexture( gl[ 'TEXTURE' + location ] );
        gl.bindTexture( this.target, this.texture );
    };

    module.exports = Texture;

}());
