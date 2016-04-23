(function() {

    'use strict';

    var Async = require('./util/Async');

    var CATEGORY_DEP_ORDER = [
        [ 'extensions' ],
        [ 'buffers', 'shaders', 'images', 'samplers', 'cameras' ],
        [ 'bufferViews', 'textures', 'programs' ],
        [ 'accessors', 'techniques' ],
        [ 'materials' ],
        [ 'meshes' ],
        [ 'nodes' ],
        [ 'skins', 'animations' ],
        [ 'scenes' ],
        [ 'scene' ]
    ];

    var CATEGORIES_TO_RESOLVE = [
        'buffers',
        'shaders',
        'images'
    ];

    var DATA_URI_REGEX = new RegExp('^data:');

    function getBaseURL(path) {
        var i = path.lastIndexOf('/');
        return(i !== 0) ? path.substring(0, i + 1) : '';
    }

    function resolvePath(baseURL, path) {
        if (DATA_URI_REGEX.test(path)) {
            return path;
        }
        return baseURL + path;
    }

    function resolvePaths(json, baseURL) {
        CATEGORIES_TO_RESOLVE.forEach( function(category) {
            var descriptions = json[category];
            if (descriptions) {
                Object.keys(descriptions).forEach( function(key) {
                    var description = descriptions[key];
                    // resolve and replace uri
                    description.uri = resolvePath(baseURL, description.uri);
                });
            }
        });
        return json;
    }

    function loadJSON(path, callback) {
        var req = new XMLHttpRequest();
        req.open('GET', path, true);
        req.onreadystatechange = function(event) {
            if (req.readyState === 4) {
                if (req.status === 200) {
                    if (callback) {
                        var json = JSON.parse(req.responseText);
                        callback(null, json);
                    }
                } else {
                    if (callback) {
                        var err = 'Unable to load image from URL: `' + event.path[0].currentSrc + '`';
                        callback(err);
                    }
                }
            }
        };
        req.send(null);
    }

    function getDependencyGroups(json) {
        var groups = [];
        CATEGORY_DEP_ORDER.forEach( function(group) {
            var filtered = group.filter( function(categoryId) {
                return (json[categoryId]) ? true : false;
            });
            if (filtered.length > 0) {
                groups.push(filtered);
            }
        });
        return groups;
    }

    function createParallelHandlers(json, categoryIds, handlers) {
        return function(done) {
            var tasks = [];
            categoryIds.forEach( function(categoryId) {
                var handler = handlers[categoryId];
                if (handler) {
                    var category = json[categoryId];
                    Object.keys(category).map( function(key) {
                        tasks.push( function(done) {
                            //console.log('Loading ' + categoryId + ': ' + key);
                            handler(json, category[key], done);
                        });
                    });
                }
            });
            //console.log('Loading dependency group', JSON.stringify(categoryIds));
            // execute all categories within the same dependency level
            // in parallel
            Async.parallel( tasks, done );
        };
    }

    function parseJSON(json, handlers) {
        // get the category IDs that are in the glTF blob
        var groups = getDependencyGroups(json);
        // create batches for each dependency level
        var batches = groups.map( function(categoryIds) {
            // return a batch for each category dependency group
            return createParallelHandlers(json, categoryIds, handlers);
        });
        Async.series(batches, function(err) {
            if (err) {
                handlers.error(err);
            } else {
                handlers.success(json);
            }
        });
    }

    module.exports = {

        load: function(path, handlers) {
            var baseURL = getBaseURL(path);
            loadJSON(path, function(err, json) {
                if (err) {
                    handlers.error(err);
                    return;
                }
                json = resolvePaths(json, baseURL);
                parseJSON(json, handlers);
            });
        },

        parse: function(json, handlers) {
            parseJSON(json, handlers);
        }

    };

}());
