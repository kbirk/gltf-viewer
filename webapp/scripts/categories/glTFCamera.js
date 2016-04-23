(function () {

    'use strict';

    var Camera = require('../render/Camera');

    module.exports = function( gltf, description, done ) {
        var projection = description[ description.type ];
        projection.type = description.type;
        // create instance
        description.instance = new Camera({
            projection: projection
        });
        // no-op
        done( null );
    };

}());
