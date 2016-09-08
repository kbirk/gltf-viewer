(function () {

    'use strict';

    let context = require('./gl');

    let UNIFORM_FUNCTIONS = {
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
        35670: 'uniform1i',
        35671: 'uniform2iv',
        35672: 'uniform3iv',
        35673: 'uniform4iv',
        // mat
        35674: 'uniformMatrix2fv',
        35675: 'uniformMatrix3fv',
        35676: 'uniformMatrix4fv',
        // sampler2D
        35678: 'uniform1i',
        // samplerCube
        35680: 'uniform1i'
    };

    class Shader {
        constructor(args) {
            // create vertex shader
            let gl = this.gl = context();
            let vertexShader = gl.createShader(gl.VERTEX_SHADER);
            gl.shaderSource(vertexShader, args.vertex);
            gl.compileShader(vertexShader);
            // check for error
            if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
                throw new Error(gl.getShaderInfoLog(vertexShader));
            }
            // create fragment shader
            let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
            gl.shaderSource(fragmentShader, args.fragment);
            gl.compileShader(fragmentShader);
            // check for error
            if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
                throw new Error(gl.getShaderInfoLog(fragmentShader));
            }
            // create program
            let program = this.program = gl.createProgram();
            // attach vertex and fragment shaders
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            // bind vertex attribute locations BEFORE linking
            this.attributes = args.attributes;
            this.attributes.forEach(function(attribute, index) {
                // bind the attribute location
                gl.bindAttribLocation(program, index, attribute);
            });
            // link shader
            gl.linkProgram(program);
            // check if  creating the shader program failed
            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                throw new Error(gl.getProgramInfoLog(program));
            }
            // uniforms map
            this.uniforms = {};
        }
        use() {
            let gl = this.gl;
            gl.useProgram(this.program);
        }
        setUniform(uniform, value) {
            let gl = this.gl;
            let name = uniform.name;
            let type = uniform.type;
            if (!this.uniforms[ name ]) {
                this.uniforms[ name ] = gl.getUniformLocation(this.program, name);
            }
            let location = this.uniforms[ name ];
            let func = UNIFORM_FUNCTIONS[type];
            if (type === 35674 || type === 35675 || type === 35676) {
                gl[ func ](location, false, value);
            } else {
                gl[ func ](location, value);
            }
        }
    }

    module.exports = Shader;

}());
