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

    function mult() {
        var i;
        var out = glm.mat4.create();
        for ( i=0; i<arguments.length-1; i++ ) {
            out = glm.mat4.multiply( out, arguments[i], arguments[i+1] );
        }
        return out;
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
        var out = glm.mat3.create();
        var view3 = glm.mat3.fromMat4( out, view );
        return glm.mat3.multiply( out, view3, transposeInverse( model ) );
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
            // console.log( 'enable', state );
            gl.enable( state );
        });
        // functions
        this.functions.forEach( function( func ) {
            // console.log( func.name, func.value );
            gl[ func.name ].apply( gl, func.values );
        });
        // reset texture unit
        this.textureUnit = 0;
    };

    Technique.prototype.setUniform = function( uniform, node, material, model, view, projection, time ) {
        if ( uniform.node ) {
            model = uniform.node.getGlobalMatrix( time );
        }
        switch ( uniform.semantic || UNIFORM_TYPES[ uniform.type ] ) {
            case 'SAMPLER_2D':
                //console.log('set', uniform, textureUnit);
                material.values[ uniform.id ].bind( this.textureUnit );
                this.shader.setUniform( uniform, this.textureUnit++ );
                break;
            case 'MODEL':
                //console.log('set', uniform, model );
                this.shader.setUniform( uniform, model );
                break;
            case 'VIEW':
                //console.log('set', uniform, view );
                this.shader.setUniform( uniform, view );
                break;
            case 'PROJECTION':
                //console.log('set', uniform, projection );
                this.shader.setUniform( uniform, projection );
                break;
            case 'MODELVIEW':
                //console.log('set', uniform, mult( view, model ) );
                this.shader.setUniform( uniform, mult( view, model ) );
                break;
            case 'MODELVIEWPROJECTION':
                //console.log('set', uniform, mult( projection, view, model ) );
                this.shader.setUniform( uniform, mult( projection, view, model ) );
                break;
            case 'MODELINVERSE':
                //console.log('set', uniform, invert( model ) );
                this.shader.setUniform( uniform, invert( model ) );
                break;
            case 'VIEWINVERSE':
                //console.log('set', uniform, invert( view ) );
                this.shader.setUniform( uniform, invert( view ) );
                break;
            case 'PROJECTIONINVERSE':
                //console.log('set', uniform, invert( projection ) );
                this.shader.setUniform( uniform, invert( projection ) );
                break;
            case 'MODELVIEWINVERSE':
                //console.log('set', uniform, invert( mult( view, model ) ) );
                this.shader.setUniform( uniform, invert( mult( view, model ) ) );
                break;
            case 'MODELVIEWPROJECTIONINVERSE':
                //console.log('set', uniform, invert( mult( projection, view, model ) ) );
                this.shader.setUniform( uniform, invert( mult( projection, view, model ) ) );
                break;
            case 'MODELINVERSETRANSPOSE':
                //console.log('set', uniform, transposeInverse( model ) );
                this.shader.setUniform( uniform, transposeInverse( model ) );
                break;
            case 'MODELVIEWINVERSETRANSPOSE':
                //console.log('set', uniform,  multInverseTranspose( view, model ) );
                this.shader.setUniform( uniform, multInverseTranspose( view, model ) );
                break;
            case 'JOINTMATRIX':
                //console.log('set', uniform, node.skin.getJointArray( time ) );
                this.shader.setUniform( uniform, node.skin.getJointArray( time ) );
                break;
            default:
                if ( uniform.value !== undefined ) {
                    //console.log('set', uniform, uniform.value );
                    this.shader.setUniform( uniform, uniform.value );
                } else {
                    //console.log('set', uniform, material.values[ uniform.id ] );
                    this.shader.setUniform( uniform, material.values[ uniform.id ] );
                }
                break;
        }
    };

    Technique.prototype.setUniforms = function( node, material, model, view, projection, time ) {
        var that = this;
        this.uniforms.forEach( function( uniform ) {
            that.setUniform( uniform, node, material, model, view, projection, time );
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
            // console.log( func.name, func.value );
            gl[ func.name ].apply( gl, DEFAULT_FUNCTIONS[ func.name ] );
        });
    };

    module.exports = Technique;

}());
