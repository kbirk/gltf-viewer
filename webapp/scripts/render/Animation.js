(function () {

    'use strict';

    var glm = require('gl-matrix');
    var rotationOut = glm.quat.create();
    var translationOut = glm.vec3.create();
    var scaleOut = glm.vec3.create();

    function findKeyFrame( time, frames ) {
        var len = frames.length;
        var last = frames[ len - 1 ];
        var mod = time % last;
        var half = Math.floor( len / 2 );
        var i = half;
        var frame;
        var j;
        while ( half !== 1 ) {
            frame = frames[i];
            half = Math.round( half / 2 );
            if ( frame > mod ) {
                i -= half;
            } else {
                i += half;
            }
        }
        // clamp off by one error in binary search
        // TODO: fix this?
        i = Math.max( 0, Math.min( i, len - 1 ) );
        frame = frames[i];
        if ( frame > mod ) {
            j = i;
            i -= 1;
        } else {
            j = ( i + 1 ) % len;
        }
        if ( mod < frames[i] || mod > frames[j] ) {
            // time is outside of a frame, ignore
            return null;
        }
        var t0 = frames[ i ];
        var t1 = frames[ j ];
        var range = ( t1 - t0 );
        return {
            from: i,
            to: j,
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
