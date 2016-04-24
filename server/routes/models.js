( function() {

    'use strict';

    var fs = require('fs');

    var EXT = '.gltf';

    function get( dir, files_ ){
        files_ = files_ || [];
        var files = fs.readdirSync( dir );
        Object.keys( files ).forEach( function( key ) {
            var file = files[ key ];
            var name = dir + '/' + file;
            if ( fs.statSync( name ).isDirectory() ){
                get( name, files_ );
            } else {
                var ext = file.substr( file.length - EXT.length );
                if ( ext === EXT ) {
                    files_.push( name );
                }
            }
        });
        return files_;
    }

    module.exports = {

        get: get

    };

}());
