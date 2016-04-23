(function () {

    'use strict';

    var context = require('./gl');

    var UNIFORM_FUNCTIONS = {
        // uint / int
        5120: 'uniform1i',
        5121: 'uniform1i',
        5122: 'uniform1i',
        5123: 'uniform1i',
        5124: 'uniform1i',
        5125: 'uniform1i',
        // float
        5126: 'uniform1f',
        // vec
        35664: 'uniform2fv',
        35665: 'uniform3fv',
        35666: 'uniform4fv',
        // ivec
        35667: 'uniform2iv',
        35668: 'uniform3iv',
        35669: 'uniform4iv',
        // bvec
        // 35670: 'uniform2bv',
        // 35671: 'uniform2bv',
        // 35672: 'uniform2bv',
        // 35673: 'uniform2bv',
        // mat
        35674: 'uniformMatrix2fv',
        35675: 'uniformMatrix3fv',
        35676: 'uniformMatrix4fv',
        // sampler2D
        35678: 'uniform1i',
        // samplerCube
        35680: 'uniform1i'
    };

    function Shader( args ) {
        // create vertex shader
        var gl = this.gl = context();
        var vertexShader = gl.createShader( args.vertex.type );
        gl.shaderSource( vertexShader, args.vertex.source );
        gl.compileShader( vertexShader );
        // check for error
        if ( !gl.getShaderParameter( vertexShader, gl.COMPILE_STATUS ) ) {
            throw new Error( gl.getShaderInfoLog( vertexShader ) );
        }
        // create fragment shader
        var fragmentShader = gl.createShader( args.fragment.type );
        gl.shaderSource( fragmentShader, args.fragment.source );
        gl.compileShader( fragmentShader );
        // check for error
        if ( !gl.getShaderParameter( fragmentShader, gl.COMPILE_STATUS ) ) {
            throw new Error( gl.getShaderInfoLog( fragmentShader ) );
        }
        // create program
        var program = this.program = gl.createProgram();
        // attach vertex and fragment shaders
        gl.attachShader( program, vertexShader );
        gl.attachShader( program, fragmentShader );
        // bind vertex attribute locations BEFORE linking
        this.attributes = args.attributes;
        this.attributes.forEach( function( attribute, index ) {
            // bind the attribute location
            gl.bindAttribLocation( program, index, attribute );
        });
        // link shader
        gl.linkProgram( program );
        // check if  creating the shader program failed
        if ( !gl.getProgramParameter( program, gl.LINK_STATUS ) ) {
            throw new Error( gl.getProgramInfoLog( program ) );
        }
        // uniforms map
        this.uniforms = {};
    }

    Shader.prototype.use = function() {
        var gl = this.gl;
        gl.useProgram( this.program );
    };

    Shader.prototype.setUniform = function( uniform, value ) {
        var gl = this.gl;
        var name = uniform.name;
        var type = uniform.type;
        if ( !this.uniforms[ name ] ) {
            this.uniforms[ name ] = gl.getUniformLocation( this.program, name );
        }
        var location = this.uniforms[ name ];
        var func = UNIFORM_FUNCTIONS[type];
        if ( type === 35674 || type === 35675 || type === 35676 ) {
            gl[ func ]( location, false, value );
        } else {
            gl[ func ]( location, value );
        }
    };

    module.exports = Shader;

}());
