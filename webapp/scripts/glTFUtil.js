(function () {

    'use strict';

    var _ = require('lodash');
    var async = require('async');
    var alfador = require('alfador');

    module.exports = {

        /**
         * Returns a nodes matrix from either an array or translation,
         * rotation, and scale components.
         *
         * @param {Object} node - A node from the glTF JSON.
         *
         * @returns {Object} The transform matrix.
         */
        getNodeMatrix: function( node ) {
            var translation, rotation, scale;

            // decompose transform components from matrix
            if ( node.matrix ) {
                return new alfador.Mat44( node.matrix );
            }

            // get translation
            if ( node.translation ) {
                translation = alfador.Mat44.translation( new alfador.Vec3( node.translation ) );
            } else {
                translation = alfador.Mat44.identity();
            }

            // get rotation
            if ( node.rotation ) {
                rotation = alfador.Mat44.rotationRadians( node.rotation[3], new alfador.Vec3( node.rotation ) );
            } else {
                rotation = alfador.Mat44.identity();
            }

            // get orientation
            if ( node.orientation ) {
                rotation = new alfador.Quaternion( node.orientation ).matrix();
            }

            // get scale
            if ( node.scale ) {
                scale = alfador.Mat44.scale( new alfador.Vec3( node.scale ) );
            } else {
                scale = alfador.Mat44.identity();
            }

            return translation.multMat44( rotation ).multMat44( scale );
        },

        /**
         * Request a map of arraybuffers from the server. Executes callback
         * function passing a map of loaded arraybuffers keyed by id.
         *
         * @param {Object} buffers - The map of buffers.
         * @param {Function} callback - The callback function.
         */
        requestBuffers: function( buffers, callback ) {

            function loadBuffer( url ) {
                return function( done ) {
                    var xhr = new XMLHttpRequest();
                    xhr.open( 'GET', url, true );
                    xhr.responseType = 'arraybuffer';
                    xhr.onload = function() {
                        if ( this.status === 200 ) {
                            done( null, xhr.response );
                        } else {
                            var err = 'GET ' + xhr.responseURL + ' ' + xhr.status + ' (' + xhr.statusText + ')';
                            done( err );
                        }

                    };
                    xhr.send();
                };
            }

            var jobs = {};
            _.forIn( buffers, function( buffer, id ) {
                jobs[ id ] = loadBuffer( buffer.uri );
            });
            async.parallel( jobs, callback );
        },

        /**
         * Request a map of images from the server. Executes callback
         * function passing a map of Image objects keyed by path.
         *
         * @param {Object} images - The map of images.
         * @param {Function} callback - The callback function.
         */
        requestImages: function( images, callback ) {

            function loadImage( url ) {
                return function( done ) {
                    var image = new Image();
                    image.onload = function() {
                        done( null, image );
                    };
                    image.onerror = function( event ) {
                        var err = 'Unable to load image from URL: `' + event.path[0].currentSrc + '`';
                        done( err );
                    };
                    image.src = url;
                };
            }

            var jobs = {};
            _.forIn( images, function( image, id ) {
                jobs[ id ] = loadImage( image.uri );
            });
            async.parallel( jobs, callback );
        }

    };

}());
