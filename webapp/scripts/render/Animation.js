(function () {

    'use strict';

    let glm = require('gl-matrix');
    let rotationOut = glm.quat.create();
    let translationOut = glm.vec3.create();
    let scaleOut = glm.vec3.create();

    function findKeyFrame(time, input) {
        let mod = time % input.max;
        let frames = input.search(mod);
        if (!frames) {
            return null;
        }
        let t0 = frames.from.value;
        let t1 = frames.to.value;
        let range = (t1 - t0);
        return {
            from: frames.from.index,
            to: frames.to.index,
            t: (mod - t0) / range
        };
    }

    function interpolateQuat(out, time, channel) {
        let frames = findKeyFrame(time, channel.input);
        if (!frames) {
            return null;
        }
        let a = channel.values[ frames.from ];
        let b = channel.values[ frames.to ];
        return glm.quat.slerp(out, a, b, frames.t);
    }

    function interpolateVec3(out, time, channel) {
        let frames = findKeyFrame(time, channel.input);
        if (!frames) {
            return null;
        }
        let a = channel.values[ frames.from ];
        let b = channel.values[ frames.to ];
        return glm.vec3.lerp(out, a, b, frames.t);
    }

    class Animation {
        constructor() {
            this.rotation = null;
            this.translation = null;
            this.scale = null;
        }
        addChannel(path, channel) {
            this[ path ] = {
                input: channel.input,
                values: channel.values,
                interpolation: channel.interpolation,
            };
        }
        getPose(out, node, time) {
            // rotation
            let rotation;
            if (this.rotation) {
                rotation = interpolateQuat(rotationOut, time, this.rotation);
            }
            if (!rotation) {
                rotation = node.rotation;
            }
            // translation
            let translation;
            if (this.translation) {
                translation = interpolateVec3(translationOut, time, this.translation);
            }
            if (!translation) {
                translation = node.translation;
            }
            // scale
            let scale;
            if (this.scale) {
                scale = interpolateVec3(scaleOut, time, this.scale);
            }
            if (!scale) {
                scale = node.scale;
            }
            return glm.mat4.fromRotationTranslationScale(out, rotation, translation, scale);
        }
    }

    module.exports = Animation;

}());
