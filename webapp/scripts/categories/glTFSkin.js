(function () {

    'use strict';

    module.exports = function( gltf, description, done ) {
        description.inverseBindMatrices = gltf.accessors[ description.inverseBindMatrices ];
        done( null );
    };

}());
