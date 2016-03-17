(function () {

    'use strict';

    var PRIMITIVE_MODES = {
        '0': 'POINTS',
        '1': 'LINES',
        '2': 'LINE_LOOP',
        '3': 'LINE_STRIP',
        '4': 'TRIANGLES',
        '5': 'TRIANGLE_STRIP',
        '6': 'TRIANGLE_FAN',
        'default': 'TRIANGLES'
    };

    module.exports = function( gltf, description, done ) {
        description.primitives = description.primitives.map(function(primitive) {
            var attributes = primitive.attributes;
            Object.keys(attributes).forEach( function(key) {
                attributes[key] = gltf.accessors[attributes[key]];
            });
            primitive.indices = gltf.accessors[primitive.indices];
            primitive.material = gltf.materials[primitive.material];
            primitive.mode = PRIMITIVE_MODES[ primitive.mode ];
            return primitive;
        });
        done( null );
    };

}());
