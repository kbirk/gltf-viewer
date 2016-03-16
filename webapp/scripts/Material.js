(function () {

    'use strict';

    function Material( spec ) {
        spec = spec || {};
        this.id = spec.id;
        this.diffuseTexture = spec.diffuseTexture;
        this.diffuseColor = spec.diffuseColor || [ 1, 0, 1, 1 ];
        this.ambientTexture = spec.ambientTexture;
        this.ambientColor = spec.ambientColor || [ 0, 0, 0, 1 ];
        this.specularTexture = spec.specularTexture;
        this.specularColor = spec.specularColor || [ 0, 0, 0, 1 ];
        this.specularComponent = spec.specularComponent || 10;
    }

    module.exports = Material;

}());
