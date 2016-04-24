(function () {

    'use strict';

    var context = require('./gl');
    var Shader = require('./Shader');
    var VertexBuffer = require('./VertexBuffer');

    var shader;
    var x;
    var y;
    var z;
    var red = new Float32Array([ 1, 0, 0 ]);
    var green = new Float32Array([ 0, 1, 0 ]);
    var blue = new Float32Array([ 0, 0, 1 ]);

    var uModelMatrix = {
        type: 35676,
        name: 'uModelMatrix'
    };
    var uViewMatrix = {
        type: 35676,
        name: 'uViewMatrix'
    };
    var uProjectionMatrix = {
        type: 35676,
        name: 'uProjectionMatrix'
    };
    var uColor = {
        type: 35665,
        name: 'uColor'
    };

    var initialized = false;

    function initVertexBuffer( data ) {
        var gl = context();
        var buffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, buffer );
        gl.bufferData( gl.ARRAY_BUFFER, data, gl.STATIC_DRAW );
        return new VertexBuffer({
            buffer: buffer,
            index: 0,
            size: 3,
            type: 5126, // FLOAT
            byteStride: 0,
            byteOffset: 0,
            count: 2,
            mode: 1 // LINES
        });
    }

    function initShader() {
        var vert = [
            'attribute highp vec3 aVertexPosition;',
            'uniform highp mat4 uModelMatrix;',
            'uniform highp mat4 uViewMatrix;',
            'uniform highp mat4 uProjectionMatrix;',
            'void main() {',
                'gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4( aVertexPosition, 1.0 );',
            '}'
        ].join('\n');
        var frag = [
            'uniform highp vec3 uColor;',
            'void main() {',
                'gl_FragColor = vec4( uColor, 1.0 );',
            '}'
        ].join('\n');
        var attributes = [
            'aVertexPosition'
        ];
        return new Shader({
            vertex: vert,
            fragment: frag,
            attributes: attributes
        });
    }

    function init() {
        x = initVertexBuffer( new Float32Array([ 0, 0, 0, 1, 0, 0 ]) );
        y = initVertexBuffer( new Float32Array([ 0, 0, 0, 0, 1, 0 ]) );
        z = initVertexBuffer( new Float32Array([ 0, 0, 0, 0, 0, 1 ]) );
        shader = initShader();
        initialized = true;
    }

    module.exports = {

        renderNode: function( model, view, projection ) {
            if ( !initialized ) {
                init();
            }
            // use shader
            shader.use();
            // transform matrices
            shader.setUniform( uModelMatrix, model );
            shader.setUniform( uViewMatrix, view );
            shader.setUniform( uProjectionMatrix, projection );
            // draw x-axis
            shader.setUniform( uColor, red );
            x.bind();
            x.draw();
            x.unbind();
            // draw y-axis
            shader.setUniform( uColor, green );
            y.bind();
            y.draw();
            y.unbind();
            // draw z-axis
            shader.setUniform( uColor, blue );
            z.bind();
            z.draw();
            z.unbind();
        }

    };

}());
