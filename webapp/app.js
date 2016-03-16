(function() {

    'use strict';

    var esper = require('esper');
    var glTFLoader = require('./scripts/glTFLoader');

    window.start = function() {

        // get WebGL context, this automatically binds it globally and loads all available extensions
        var gl = esper.WebGLContext.get( 'glcanvas' );

        // only continue if WebGL is available
        if ( gl ) {

            glTFLoader.load('./models/monster/monster.gltf', function( err, scene ) {
                if (err) {
                    console.error(err);
                    return;
                }
                console.log(scene);
            });

        }
    };

}());
