(function () {

    'use strict';

    var glm = require('gl-matrix');
    var context = require('./gl');

    var UNIFORM_TYPES = {
        // sampler2D
        35678: 'SAMPLER_2D',
        // samplerCube
        35680: 'SAMPLER_CUBE'
    };

    var DEFAULT_FUNCTIONS = {
        blendColor: [ 0.0, 0.0, 0.0, 0.0 ],
        blendEquationSeparate: [ 32774, 32774 ],
        blendFuncSeparate: [ 1, 1, 0, 0 ],
        colorMask: [ true, true, true, true ],
        cullFace: [ 1029 ],
        depthFunc: [ 513 ],
        depthMask: [ true ],
        depthRange: [ 0.0, 1.0 ],
        frontFace: [ 2305 ],
        lineWidth: [ 1.0 ],
        polygonOffset: [ 0.0, 0.0 ],
        scissor: [ 0, 0, 0, 0 ]
    };

    function mult2( a, b ) {
        return glm.mat4.multiply( glm.mat4.create(), a, b );
    }

    function mult3( a, b, c ) {
        var out = glm.mat4.create();
        glm.mat4.multiply( out, a, b );
        return glm.mat4.multiply( out, out, c );
    }

    function invert( mat ) {
        return glm.mat4.invert( glm.mat4.create(), mat );
    }

    function transposeInverse( mat ) {
        var out = glm.mat3.fromMat4( glm.mat3.create(), mat );
        glm.mat3.invert( out, mat );
        return glm.mat3.transpose( out, out );
    }

    function multInverseTranspose( view, model ) {
        var view3 = glm.mat3.fromMat4( glm.mat3.create(), view );
        var model3 = glm.mat3.fromMat4( glm.mat3.create(), model );
        return transposeInverse( glm.mat3.multiply( glm.mat3.create(), view3, model3 ) );
    }

    function Technique( args ) {
        this.gl = context();
        this.shader = args.shader;
        this.attributes = args.attributes;
        this.uniforms = args.uniforms;
        this.enables = args.enables || [];
        this.functions = args.functions || [];
    }

    Technique.prototype.enableState = function() {
        var gl = this.gl;
        // use shader
        this.shader.use();
        // enables
        this.enables.forEach( function( state ) {
            gl.enable( state );
        });
        // functions
        this.functions.forEach( function( func ) {
            gl[ func.name ].apply( gl, func.values );
        });
        // reset texture unit
        this.textureUnit = 0;
    };

    Technique.prototype.setUniform = function( uniform, node, material, view, projection, time ) {
        if ( uniform.node ) {
            node = uniform.node;
        }
        switch ( uniform.semantic || UNIFORM_TYPES[ uniform.type ] ) {
            case 'SAMPLER_2D':
                material.values[ uniform.id ].bind( this.textureUnit );
                this.shader.setUniform( uniform, this.textureUnit++ );
                break;
            case 'LOCAL':
                this.shader.setUniform( uniform, node.getMatrix() );
                break;
            case 'MODEL':
                this.shader.setUniform( uniform, node.getGlobalMatrix() );
                break;
            case 'VIEW':
                this.shader.setUniform( uniform, view );
                break;
            case 'PROJECTION':
                this.shader.setUniform( uniform, projection );
                break;
            case 'MODELVIEW':
                this.shader.setUniform( uniform, mult2( view, node.getGlobalMatrix() ) );
                break;
            case 'MODELVIEWPROJECTION':
                this.shader.setUniform( uniform, mult3( projection, view, node.getGlobalMatrix() ) );
                break;
            case 'MODELINVERSE':
                this.shader.setUniform( uniform, invert( node.getGlobalMatrix() ) );
                break;
            case 'VIEWINVERSE':
                this.shader.setUniform( uniform, invert( view ) );
                break;
            case 'PROJECTIONINVERSE':
                this.shader.setUniform( uniform, invert( projection ) );
                break;
            case 'MODELVIEWINVERSE':
                this.shader.setUniform( uniform, invert( mult2( view, node.getGlobalMatrix() ) ) );
                break;
            case 'MODELVIEWPROJECTIONINVERSE':
                this.shader.setUniform( uniform, invert( mult3( projection, view, node.getGlobalMatrix() ) ) );
                break;
            case 'MODELINVERSETRANSPOSE':
                this.shader.setUniform( uniform, transposeInverse( node.getGlobalMatrix() ) );
                break;
            case 'MODELVIEWINVERSETRANSPOSE':
                this.shader.setUniform( uniform, multInverseTranspose( view, node.getGlobalMatrix() ) );
                break;
            case 'VIEWPORT':
                // Not implemented currently
                break;
            case 'JOINTMATRIX':
                this.shader.setUniform( uniform, node.skin.getJointArray( time ) );
                break;
            default:
                if ( uniform.value !== undefined ) {
                    this.shader.setUniform( uniform, uniform.value );
                } else {
                    this.shader.setUniform( uniform, material.values[ uniform.id ] );
                }
                break;
        }
    };

    Technique.prototype.setUniforms = function( node, material, view, projection, time ) {
        var that = this;
        this.uniforms.forEach( function( uniform ) {
            that.setUniform( uniform, node, material, view, projection, time );
        });
    };

    Technique.prototype.disableState = function() {
        var gl = this.gl;
        // disables
        this.enables.forEach( function( state ) {
            gl.disable( state );
        });
        // restore defaults
        this.functions.forEach( function( func ) {
            gl[ func.name ].apply( gl, DEFAULT_FUNCTIONS[ func.name ] );
        });
    };

    module.exports = Technique;

}());
