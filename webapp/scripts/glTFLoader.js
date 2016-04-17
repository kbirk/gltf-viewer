(function () {

    'use strict';

    var glTFParser = require('./glTFParser');
    var glTFAccessor = require('./categories/glTFAccessor');
    var glTFAnimation = require('./categories/glTFAnimation');
    var glTFBuffer = require('./categories/glTFBuffer');
    var glTFBufferView = require('./categories/glTFBufferView');
    var glTFCamera = require('./categories/glTFCamera');
    var glTFImage = require('./categories/glTFImage');
    var glTFMaterial = require('./categories/glTFMaterial');
    var glTFMesh = require('./categories/glTFMesh');
    var glTFNode = require('./categories/glTFNode');
    var glTFProgram = require('./categories/glTFProgram');
    var glTFSampler = require('./categories/glTFSampler');
    var glTFScene = require('./categories/glTFScene');
    var glTFShader = require('./categories/glTFShader');
    var glTFSkin = require('./categories/glTFSkin');
    var glTFTechnique = require('./categories/glTFTechnique');
    var glTFTexture = require('./categories/glTFTexture');

    module.exports = {

        load: function( url, callback ) {

            glTFParser.load( url, {
                buffers: glTFBuffer,
                images: glTFImage,
                shaders: glTFShader,
                samplers: glTFSampler,
                cameras: glTFCamera,
                bufferViews: glTFBufferView,
                programs: glTFProgram,
                accessors: glTFAccessor,
                textures: glTFTexture,
                skins: glTFSkin,
                meshes: glTFMesh,
                nodes: glTFNode,
                techniques: glTFTechnique,
                animations: glTFAnimation,
                materials: glTFMaterial,
                scenes: glTFScene,
                success: function( gltf ) {
                    callback( null, gltf );
                },
                error: function( err ) {
                    callback( err );
                }
            });
        }

    };

}());
