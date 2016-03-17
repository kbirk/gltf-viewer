(function(){

    'use strict';

    function noop() {}

    function _setImmediate(fn) {
        setTimeout(fn, 0);
    }

    function _parallel(eachfn, tasks, callback) {
        callback = callback || noop;
        var results = Array.isArray(tasks) ? [] : {};
        eachfn(tasks, function( task, key, callback ) {
            task(function (err, res) {
                results[key] = res;
                callback(err);
            });
        }, function (err) {
            callback(err, results);
        });
    }

    function _once(fn) {
        return function() {
            if (fn === null) {
                return;
            }
            fn.apply(this, arguments);
            fn = null;
        };
    }

    function _keyIterator(coll) {
        var i = -1;
        var len;
        var keys;
        if (Array.isArray(coll)) {
            len = coll.length;
            return function next() {
                i++;
                return i < len ? i : null;
            };
        } else {
            keys = Object.keys(coll);
            len = keys.length;
            return function next() {
                i++;
                return i < len ? keys[i] : null;
            };
        }
    }

    var _eachOf = function (object, iterator, callback) {
        var key, completed = 0;

        function done(err) {
            completed--;
            if (err) {
                callback(err);
            }
            // Check key is null in case iterator isn't exhausted
            // and done resolved synchronously.
            else if (key === null && completed <= 0) {
                callback(null);
            }
        }

        callback = _once(callback || noop);
        object = object || [];
        var iter = _keyIterator(object);
        while ((key = iter()) !== null) {
            completed += 1;
            iterator(object[key], key, _once(done));
        }
        if (completed === 0) {
            callback(null);
        }
    };


    var _eachOfSeries = function (obj, iterator, callback) {
        callback = _once(callback || noop);
        obj = obj || [];
        var nextKey = _keyIterator(obj);
        var key = nextKey();
        function iterate() {
            var sync = true;
            if (key === null) {
                return callback(null);
            }
            iterator(obj[key], key, _once(function (err) {
                if (err) {
                    callback(err);
                }
                else {
                    key = nextKey();
                    if (key === null) {
                        return callback(null);
                    } else {
                        if (sync) {
                            _setImmediate(iterate);
                        } else {
                            iterate();
                        }
                    }
                }
            }));
            sync = false;
        }
        iterate();
    };

    module.exports = {

        parallel: function( tasks, callback ) {
            _parallel(_eachOf, tasks, callback);
        },

        series: function( tasks, callback ) {
            _parallel(_eachOfSeries, tasks, callback);
        }

    };

}());
