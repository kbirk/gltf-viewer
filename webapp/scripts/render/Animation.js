(function () {

    'use strict';

    var glm = require('gl-matrix');
    var rotationOut = glm.quat.create();
    var translationOut = glm.vec3.create();
    var scaleOut = glm.vec3.create();

    function findKeyFrame( time, input ) {
        var mod = time % input.max;
        var frames = input.search( mod );
        if ( !frames ) {
            return null;
        }
        var t0 = frames.from.value;
        var t1 = frames.to.value;
        var range = ( t1 - t0 );
        return {
            from: frames.from.index,
            to: frames.to.index,
            t: ( mod - t0 ) / range
        };
    }

    function interpolateQuat( out, time, channel ) {
        var frames = findKeyFrame( time, channel.input );
        if ( !frames ) {
            return null;
        }
        var a = channel.values[ frames.from ];
        var b = channel.values[ frames.to ];
        return glm.quat.slerp( out, a, b, frames.t );
    }

    function interpolateVec3( out, time, channel ) {
        var frames = findKeyFrame( time, channel.input );
        if ( !frames ) {
            return null;
        }
        var a = channel.values[ frames.from ];
        var b = channel.values[ frames.to ];
        return glm.vec3.lerp( out, a, b, frames.t );
    }

    function Animation() {
        this.rotation = null;
        this.translation = null;
        this.scale = null;
    }

    Animation.prototype.addChannel = function( path, channel ) {
        this[ path ] = {
            input: channel.input,
            values: channel.values,
            interpolation: channel.interpolation,
        };
    };

    Animation.prototype.getPose = function( out, node, time ) {
        // rotation
        var rotation;
        if ( this.rotation ) {
            rotation = interpolateQuat( rotationOut, time, this.rotation );
        }
        if ( !rotation ) {
            rotation = node.rotation;
        }
        // translation
        var translation;
        if ( this.translation ) {
            translation = interpolateVec3( translationOut, time, this.translation );
        }
        if ( !translation ) {
            translation = node.translation;
        }
        // scale
        var scale;
        if ( this.scale ) {
            scale = interpolateVec3( scaleOut, time, this.scale );
        }
        if ( !scale ) {
            scale = node.scale;
        }
        return glm.mat4.fromRotationTranslationScale( out, rotation, translation, scale );
    };

    module.exports = Animation;

}());
