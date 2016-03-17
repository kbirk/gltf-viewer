(function () {

    'use strict';

    var FORMATS = {
        '6406': 'ALPHA',
        '6407': 'RGB',
        '6408': 'RGBA',
        '6409': 'LUMINANCE',
        '6410': 'LUMINANCE_ALPHA',
        'default': 'RGBA'
    };

    var INTERNAL_FORMATS = {
        '6406': 'ALPHA',
        '6407': 'RGB',
        '6408': 'RGBA',
        '6409': 'LUMINANCE',
        '6410': 'LUMINANCE_ALPHA',
        'default': 'RGBA'
    };

    var TARGETS = {
        '3553': 'TEXTURE_2D',
        'default': 'TEXTURE_2D'
    };

    var TYPES = {
        '5121': 'UNSIGNED_BYTE',
        '33635': 'UNSIGNED_SHORT_5_6_5',
        '32819': 'UNSIGNED_SHORT_4_4_4_4',
        '32820': 'UNSIGNED_SHORT_5_5_5_1',
        'default': 'UNSIGNED_BYTE'
    };

    module.exports = function( gltf, description, done ) {
        description.sampler = gltf.samplers[ description.sampler ];
        description.source = gltf.images[ description.source ];
        description.type = TYPES[ description.type ];
        description.target = TARGETS[ description.target ];
        description.format = FORMATS[ description.format ];
        description.internalFormat = INTERNAL_FORMATS[ description.internalFormat ];
        done( null );
    };

}());
