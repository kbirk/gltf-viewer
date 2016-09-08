(function () {

    'use strict';

    let glTFParser = require('./glTFParser');
    let glTFAccessor = require('./categories/glTFAccessor');
    let glTFAnimation = require('./categories/glTFAnimation');
    let glTFBuffer = require('./categories/glTFBuffer');
    let glTFBufferView = require('./categories/glTFBufferView');
    let glTFCamera = require('./categories/glTFCamera');
    let glTFImage = require('./categories/glTFImage');
    let glTFMaterial = require('./categories/glTFMaterial');
    let glTFMesh = require('./categories/glTFMesh');
    let glTFNode = require('./categories/glTFNode');
    let glTFProgram = require('./categories/glTFProgram');
    let glTFSampler = require('./categories/glTFSampler');
    let glTFScene = require('./categories/glTFScene');
    let glTFShader = require('./categories/glTFShader');
    let glTFSkin = require('./categories/glTFSkin');
    let glTFTechnique = require('./categories/glTFTechnique');
    let glTFTexture = require('./categories/glTFTexture');

    module.exports = {

        load: function(url, callback) {

            glTFParser.load(url, {
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
                success: gltf => {
                    callback(null, gltf);
                },
                error: err => {
                    callback(err);
                }
            });
        }

    };

}());
