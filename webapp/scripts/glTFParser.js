(function() {

    'use strict';

    let Async = require('./util/Async');
    let XHRLoader = require('./util/XHRLoader');

    let CATEGORY_DEP_ORDER = [
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

    let CATEGORIES_TO_RESOLVE = [
        'buffers',
        'shaders',
        'images'
    ];

    let DATA_URI_REGEX = new RegExp('^data:');

    function getBaseURL(path) {
        let i = path.lastIndexOf('/');
        return path.substring(0, i + 1);
    }

    function resolvePath(baseURL, path) {
        if (DATA_URI_REGEX.test(path)) {
            return path;
        }
        return baseURL + path;
    }

    function resolvePaths(json, baseURL) {
        CATEGORIES_TO_RESOLVE.forEach(category => {
            let descriptions = json[category];
            if (descriptions) {
                Object.keys(descriptions).forEach(key => {
                    let description = descriptions[key];
                    // resolve and replace uri
                    description.uri = resolvePath(baseURL, description.uri);
                });
            }
        });
        return json;
    }

    function getDependencyGroups(json) {
        let groups = [];
        CATEGORY_DEP_ORDER.forEach(group => {
            let filtered = group.filter(categoryId => {
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
            let tasks = [];
            categoryIds.forEach(categoryId => {
                let handler = handlers[categoryId];
                if (handler) {
                    let category = json[categoryId];
                    Object.keys(category).map(key => {
                        tasks.push(done => {
                            //console.log('Loading ' + categoryId + ': ' + key);
                            handler(json, category[key], done);
                        });
                    });
                }
            });
            //console.log('Loading dependency group', JSON.stringify(categoryIds));
            // execute all categories within the same dependency level
            // in parallel
            Async.parallel(tasks, done);
        };
    }

    function parseJSON(json, handlers) {
        // get the category IDs that are in the glTF blob
        let groups = getDependencyGroups(json);
        // create batches for each dependency level
        let batches = groups.map(categoryIds => {
            // return a batch for each category dependency group
            return createParallelHandlers(json, categoryIds, handlers);
        });
        Async.series(batches, err => {
            if (err) {
                handlers.error(err);
            } else {
                handlers.success(json);
            }
        });
    }

    module.exports = {

        load: function(path, handlers) {
            let baseURL = getBaseURL(path);
            XHRLoader.load({
                url: path,
                responseType: 'json',
                success: json => {
                    parseJSON(resolvePaths(json, baseURL), handlers);
                },
                error: err => {
                    handlers.error(err);
                }
            });
        },

        parse: function(json, handlers) {
            parseJSON(json, handlers);
        }

    };

}());
