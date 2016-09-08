(function() {

    'use strict';

    const fs = require('fs');
    const EXT = '.gltf';

    function get(dir, files_){
        files_ = files_ || [];
        let files = fs.readdirSync(dir);
        Object.keys(files).forEach(key => {
            let file = files[ key ];
            let name = dir + '/' + file;
            if (fs.statSync(name).isDirectory()){
                get(name, files_);
            } else {
                let ext = file.substr(file.length - EXT.length);
                if (ext === EXT) {
                    files_.push(name);
                }
            }
        });
        return files_;
    }

    module.exports = {
        get: get
    };

}());
