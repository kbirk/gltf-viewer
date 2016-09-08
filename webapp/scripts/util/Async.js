/**
 * Copyright (c) 2010-2016 Caolan McMahon
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

(function(){

    'use strict';

    function noop() {}

    function setImmediate(fn) {
        setTimeout(fn, 0);
    }

    function parallel(eachfn, tasks, callback) {
        callback = callback || noop;
        let results = Array.isArray(tasks) ? [] : {};
        eachfn(tasks, function(task, key, callback) {
            task(function (err, res) {
                results[key] = res;
                callback(err);
            });
        }, function (err) {
            callback(err, results);
        });
    }

    function once(fn) {
        return function() {
            if (fn === null) {
                return;
            }
            fn.apply(this, arguments);
            fn = null;
        };
    }

    function keyIterator(coll) {
        let i = -1;
        let len;
        let keys;
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

    let eachOf = function (object, iterator, callback) {
        let key, completed = 0;

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

        callback = once(callback || noop);
        object = object || [];
        let iter = keyIterator(object);
        while ((key = iter()) !== null) {
            completed += 1;
            iterator(object[key], key, once(done));
        }
        if (completed === 0) {
            callback(null);
        }
    };

    let eachOfSeries = function (obj, iterator, callback) {
        callback = once(callback || noop);
        obj = obj || [];
        let nextKey = keyIterator(obj);
        let key = nextKey();
        function iterate() {
            let sync = true;
            if (key === null) {
                return callback(null);
            }
            iterator(obj[key], key, once(function (err) {
                if (err) {
                    callback(err);
                }
                else {
                    key = nextKey();
                    if (key === null) {
                        return callback(null);
                    } else {
                        if (sync) {
                            setImmediate(iterate);
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

        parallel: function(tasks, callback) {
            parallel(eachOf, tasks, callback);
        },

        series: function(tasks, callback) {
            parallel(eachOfSeries, tasks, callback);
        }

    };

}());
