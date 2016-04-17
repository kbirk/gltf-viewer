(function () {

    'use strict';

    module.exports = function( gltf, description, done ) {
        // get parameter accessors
        var parameters = description.parameters;
        Object.keys(parameters).forEach( function(key) {
            parameters[key] = gltf.accessors[parameters[key] ];
        });
        // attach samplers to channels, and nodes to targets
        description.channels.forEach( function( channel ) {
            channel.sampler = description.samplers[ channel.sampler ];
        });
        //
        // attach animation targets to the
        done( null );
    };

}());
