(function () {

    'use strict';

    var _ = require('lodash');
    var glTFUtil = require('./glTFUtil');

    var TEXTURE_FORMATS = {
        '6406': 'ALPHA',
        '6407': 'RGB',
        '6408': 'RGBA',
        '6409': 'LUMINANCE',
        '6410': 'LUMINANCE_ALPHA',
        'default': 'RGBA'
    };

    var TEXTURE_TARGETS = {
        '3553': 'TEXTURE_2D',
        'default': 'TEXTURE_2D'
    };

    var TEXTURE_INTERNAL_FORMATS = {
        '6406': 'ALPHA',
        '6407': 'RGB',
        '6408': 'RGBA',
        '6409': 'LUMINANCE',
        '6410': 'LUMINANCE_ALPHA',
        'default': 'RGBA'
    };

    var TEXTURE_TYPES = {
        '5121': 'UNSIGNED_BYTE',
        '33635': 'UNSIGNED_SHORT_5_6_5',
        '32819': 'UNSIGNED_SHORT_4_4_4_4',
        '32820': 'UNSIGNED_SHORT_5_5_5_1',
        'default': 'UNSIGNED_BYTE'
    };

    var TECHNIQUE_PARAMETER_TYPES = {
        '5122': 'SHORT',
        '5123': 'UNSIGNED_SHORT',
        '5124': 'INT',
        '5125': 'UNSIGNED_INT',
        '5126': 'FLOAT',
        '35664': 'FLOAT_VEC2',
        '35665': 'FLOAT_VEC3',
        '35666': 'FLOAT_VEC4',
        '35667': 'INT_VEC2',
        '35668': 'INT_VEC3',
        '35669': 'INT_VEC4',
        '35670': 'BOOL',
        '35671': 'BOOL_VEC2',
        '35672': 'BOOL_VEC3',
        '35673': 'BOOL_VEC4',
        '35674': 'FLOAT_MAT2',
        '35675': 'FLOAT_MAT3',
        '35676': 'FLOAT_MAT4',
        '35678': 'SAMPLER_2D'
    };

    /**
     * Instantiates and returns a map of all Material objects
     * defined in the glTF JSON.
     *
     * @param {Object} materials - The glTF materials node.
     * @param {Object} techniques - The glTF techniques node.
     * @param {Object} textures - The map of Texture2D objects.
     *
     * @returns {Object} The map of Material objects.
     */
    function createMaterials( materials, techniques, textures ) {
        _.forIn( materials, function( material ) {
            var technique = techniques[ material.technique ];
            _.forIn( material.values, function( value, id ) {
                var param = technique.parameters[ id ];
                if ( TECHNIQUE_PARAMETER_TYPES[ param.type ] === 'SAMPLER_2D' ) {
                    material.values[ id ] = textures[ value ];
                }
            });
        });
        return materials;
    }

    /**
     * Instantiates and returns a map of all Texture2D objects defined in
     * the glTF JSON.
     *
     * @param {Object} textures - The glTF textures node.
     * @param {Object} images - The map of Image objects.
     *
     * @returns {Object} The map of Texture2D objects.
     */
    function createTextures( textures, images ) {
        var results = {};
        // for each texture
        _.forIn( textures, function( texture, id ) {
            // create Texture2D object from image
            results[ id ] = {
                image: images[ texture.source ],
                format: TEXTURE_FORMATS[ texture.format ] || TEXTURE_FORMATS.default,
                internalFormat: TEXTURE_INTERNAL_FORMATS[ texture.format ] || TEXTURE_INTERNAL_FORMATS.default,
                type: TEXTURE_TYPES[ texture.type ] || TEXTURE_TYPES.default,
                target: TEXTURE_TARGETS[ texture.target ] || TEXTURE_TARGETS.default,
                sampler: texture.sampler
            };
        });
        return results;
    }

    module.exports = {

        /**
         * Load and create all Material objects stored in the glTF JSON. Upon
         * completion, executes callback function passing material map as
         * first argument.
         *
         * @param {Object} json - The glTF JSON.
         * @param {Function} callback - The callback function.
         */
        loadMaterials: function( json, callback ) {
            // send requests for images
            glTFUtil.requestImages( json.images, function( err, images ) {
                if ( err ) {
                    callback( err );
                    return;
                }
                // create textures from images, then create materials
                var textures = createTextures( json.textures, images );
                var materials = createMaterials( json.materials, json.techniques, textures );
                callback( null, materials );
            });
        }

    };

}());
