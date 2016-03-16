(function() {

    'use strict';

    var CATEGORY_DEP_ORDER = [
        'extensions',
        'buffers',
        'bufferViews',
        'images',
        'videos',
        'samplers',
        'textures',
        'shaders',
        'programs',
        'techniques',
        'materials',
        'accessors',
        'meshes',
        'cameras',
        'lights',
        'skins',
        'nodes',
        'animations',
        'scenes'
    ];

    var CATEGORIES_TO_RESOLVE = [
        'buffers',
        'shaders',
        'images',
        'videos'
    ];

    var ABSOLUTE_PATH_REGEX = new RegExp('^' + window.location.protocol, 'i');
    var DATA_URI_REGEX = new RegExp('^data:');

    function isAbsolutePath(path) {
        return ABSOLUTE_PATH_REGEX.test(path);
    }

    function getBaseURL(path) {
        var i = path.lastIndexOf('/');
        return(i !== 0) ? path.substring(0, i + 1) : '';
    }

    function resolvePathIfNeeded(baseURL, path) {
        if (isAbsolutePath(path)) {
            return path;
        }
        if (DATA_URI_REGEX.test(path)) {
            return path;
        }
        return baseURL + path;
    }

    function resolvePathsForCategories(json, baseURL) {
        CATEGORIES_TO_RESOLVE.forEach( function(category) {
            var descriptions = json[category];
            if (descriptions) {
                Object.keys(descriptions).forEach( function(key) {
                    var description = descriptions[key];
                    // resolve and replace uri
                    description.uri = resolvePathIfNeeded(baseURL, description.uri);
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

    function getCategories(json) {
        return CATEGORY_DEP_ORDER.filter( function(categoryId) {
            return (json[categoryId]) ? true : false;
        });
    }

    function parseJSON(json, handlers) {
        // get the category IDs that are in the glTF blob
        var categoryIds = getCategories(json);
        categoryIds.forEach( function(categoryId) {
            // for each category entry, execute handler
            var category = json[categoryId];
            Object.keys(category).forEach( function(key) {
                var description = category[key];
                var handler = handlers[categoryId];
                if (handler) {
                    handler(key, description);
                }
            });
        });
        if (handlers.success) {
            handlers.success(json);
        }
    }

    var glTFParser = {

        load: function(path, handlers) {
            var baseURL = getBaseURL(path);
            loadJSON(path, function(err, json) {
                if (err) {
                    handlers.error(err);
                    return;
                }
                json = resolvePathsForCategories(json, baseURL);
                parseJSON(json, handlers);
            });
        }

    };

    module.exports = glTFParser;

}());
