(function () {

    'use strict';

    let Camera = require('../render/Camera');

    module.exports = function(gltf, description, done) {
        let projection = description[ description.type ];
        projection.type = description.type;
        // create instance
        description.instance = new Camera({
            projection: projection
        });
        // no-op
        done(null);
    };

}());
