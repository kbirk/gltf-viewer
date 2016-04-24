(function () {

    'use strict';

    var glm = require('gl-matrix');

    function findKeyFrame( time, frames ) {
        var len = frames.length;
        var last = frames[ len - 1 ];
        var mod = time % last;
        var i = 0;
        while ( i < len &&
            ( frames[i] > mod || frames[ (i+1) % len ] < mod ) ) {
            i++;
        }
        if ( i === len ) {
            // no frame matches time
            return null;
        }
        var j = (i+1) % len;
        var t0 = frames[ i ];
        var t1 = frames[ j ];
        var range = ( t1 - t0 );
        return {
            from: i,
            to: j,
            t: ( ( mod - t0 ) / range )
        };
    }

    function interpolateQuat( time, channel ) {
        var frames = findKeyFrame( time, channel.input );
        if ( !frames ) {
            return null;
        }
        var a = channel.values[ frames.from ];
        var b = channel.values[ frames.to ];
        return glm.quat.slerp( glm.quat.create(), a, b, frames.t );
    }

    function interpolateVec3( time, channel ) {
        var frames = findKeyFrame( time, channel.input );
        if ( !frames ) {
            return null;
        }
        var a = channel.values[ frames.from ];
        var b = channel.values[ frames.to ];
        return glm.vec3.lerp( glm.vec3.create(), a, b, frames.t );
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

    Animation.prototype.getPose = function( node, time ) {
        // rotation
        var rotation;
        if ( this.rotation ) {
            rotation = interpolateQuat( time, this.rotation );
        }
        if ( !rotation ) {
            rotation = node.rotation;
        }
        // translation
        var translation;
        if ( this.translation ) {
            translation = interpolateVec3( time, this.translation );
        }
        if ( !translation ) {
            translation = node.translation;
        }
        // scale
        var scale;
        if ( this.scale ) {
            scale = interpolateVec3( time, this.scale );
        }
        if ( !scale ) {
            scale = node.scale;
        }
        return glm.mat4.fromRotationTranslationScale( glm.mat4.create(), rotation, translation, scale );
    };

    module.exports = Animation;

}());
