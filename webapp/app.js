(function() {

    'use strict';

    var _ = require('lodash');
    var glm = require('gl-matrix');
    var esper = require('esper');
    //var geometry = require('esper-geometry');
    var glTFLoader = require('./scripts/glTFLoader');
    var glTFConstructor = require('./scripts/glTFConstructor');

    var FOV = 60 * ( Math.PI / 180 );
    var ASPECT_RATIO = function() { return window.innerWidth / window.innerHeight; };
    var NEAR = 0.1;
    var FAR = 10000;

    var gl;
    var viewport;
    var scene;
    var camera;
    var view = glm.mat4.create();
    var projection = glm.mat4.create();
    var flat;
    //var sphere;
    var line;

    var start = Date.now();
    var time;

    function findKeyFrame( time, frames ) {
        var len = frames.length;
        var last = frames[ len - 1 ];
        var mod = time % last;
        var i = 0;
        while ( frames[ (i+1) % len ] < mod ) {
            i++;
        }
        var j = (i+1) % len;
        var t0 = frames[ i ];
        var t1 = frames[ j ];
        var range = ( t1 - t0 );
        return {
            from: i,
            to: j,
            t: ( ( mod - t0 ) / range )
        };
    }

    function interpolateQuat( time, channel ) {
        var frames = findKeyFrame( time, channel.input );
        var a = channel.values[ frames.from ];
        var b = channel.values[ frames.to ];
        return glm.quat.slerp( glm.quat.create(), a, b, frames.t );
    }

    function interpolateVec3( time, channel ) {
        var frames = findKeyFrame( time, channel.input );
        var a = channel.values[ frames.from ];
        var b = channel.values[ frames.to ];
        return glm.vec3.lerp( glm.vec3.create(), a, b, frames.t );
    }

    function getAnimationPose( joint, time ) {
        var animation = joint.animations[ Object.keys( joint.animations )[0] ];
        var rotation = interpolateQuat( time, animation.rotation );
        var scale = interpolateVec3( time, animation.scale );
        var translation = interpolateVec3( time, animation.translation );
        return glm.mat4.fromRotationTranslationScale( glm.mat4.create(), rotation, translation, scale );
    }

    function getBindPose( joint ) {
        return glm.mat4.fromRotationTranslationScale( glm.mat4.create(), joint.rotation, joint.translation, joint.scale );
    }

    function copyJointMatrix( matrices, matrix, index ) {
        var j = index * 16;
        matrices[ j ] = matrix[0];
        matrices[ j + 1 ] = matrix[1];
        matrices[ j + 2 ] = matrix[2];
        matrices[ j + 3 ] = matrix[3];
        matrices[ j + 4 ] = matrix[4];
        matrices[ j + 5 ] = matrix[5];
        matrices[ j + 6 ] = matrix[6];
        matrices[ j + 7 ] = matrix[7];
        matrices[ j + 8 ] = matrix[8];
        matrices[ j + 9 ] = matrix[9];
        matrices[ j + 10 ] = matrix[10];
        matrices[ j + 11 ] = matrix[11];
        matrices[ j + 12 ] = matrix[12];
        matrices[ j + 13 ] = matrix[13];
        matrices[ j + 14 ] = matrix[14];
        matrices[ j + 15 ] = matrix[15];
    }

    function computeJointMatrices( matrices, bindShapeMatrix, inverseBinds, parentMatrix, joint ) {
        var matrix;
        if ( joint.animations ) {
            matrix = getAnimationPose( joint, time );
        } else {
            matrix = getBindPose( joint );
        }
        var inverse = inverseBinds[ joint.jointIndex ];
        var globalMatrix;
        if ( parentMatrix ) {
            globalMatrix = glm.mat4.multiply( glm.mat4.create(), parentMatrix, matrix );
        } else {
            globalMatrix = matrix;
        }
        var jointMatrix = glm.mat4.multiply( glm.mat4.create(), inverse, bindShapeMatrix );
        jointMatrix = glm.mat4.multiply( jointMatrix, globalMatrix, jointMatrix );
        copyJointMatrix( matrices, jointMatrix, joint.jointIndex );
        joint.children.forEach( function( child ) {
            computeJointMatrices( matrices, bindShapeMatrix, inverseBinds, globalMatrix, child );
        });
    }

    function getJointArray( skin ) {
        var matrices = new Float32Array( skin.joints.length * 16 );
        computeJointMatrices( matrices, skin.bindShapeMatrix, skin.inverseBindMatrices, null, skin.joints[0] );
        return matrices;
    }

    function mult() {
        var i;
        var out = glm.mat4.create();
        for ( i=0; i<arguments.length-1; i++ ) {
            out = glm.mat4.multiply( out, arguments[i], arguments[i+1] );
        }
        return out;
    }

    function invert( mat ) {
        return glm.mat4.invert( glm.mat4.create(), mat );
    }

    function transposeInverse( mat ) {
        var out = glm.mat3.fromMat4( glm.mat4.create(), mat );
        glm.mat3.invert( out, mat );
        return glm.mat3.transpose( out, out );
    }

    function multInverseTranspose( view, model ) {
        var out = glm.mat3.create();
        var view3 = glm.mat3.fromMat4( out, view );
        return glm.mat3.multiply( out, view3, transposeInverse( model ) );
    }

    function renderPrimitive( node, matrix, primitive ) {
        var material = primitive.material;
        var technique = material.technique;
        var shader = technique.program.instance;
        shader.push();
        viewport.push();
        // enable states
        technique.states.enable.forEach( function( state ) {
            // console.log('enable', state);
            gl.enable( gl[ state ] );
        });
        var textureUnit = 0;
        var texturesByUnit = [];
        _.forIn( technique.uniforms, function( parameter, uniform ) {
            var description = technique.parameters[ parameter ];
            var model = description.node ? description.node.matrix : matrix;
            //console.log(description.semantic || description.type);
            switch ( description.semantic || description.type ) {
                case 'SAMPLER_2D':
                    material.values[ parameter ].instance.push( textureUnit );
                    //console.log('set', uniform, textureUnit);
                    shader.setUniform( uniform, textureUnit );
                    texturesByUnit.push( material.values[ parameter ].instance );
                    textureUnit++;
                    break;
                case 'MODEL':
                    //console.log('set', uniform, model );
                    shader.setUniform( uniform, model );
                    break;
                case 'VIEW':
                    //console.log('set', uniform, view );
                    shader.setUniform( uniform, view );
                    break;
                case 'PROJECTION':
                    //console.log('set', uniform, projection );
                    shader.setUniform( uniform, projection );
                    break;
                case 'MODELVIEW':
                    //console.log('set', uniform, mult( view, model ) );
                    shader.setUniform( uniform, mult( view, model ) );
                    break;
                case 'MODELVIEWPROJECTION':
                    //console.log('set', uniform, mult( projection, view, model ) );
                    shader.setUniform( uniform, mult( projection, view, model ) );
                    break;
                case 'MODELINVERSE':
                    //console.log('set', uniform, invert( model ) );
                    shader.setUniform( uniform, invert( model ) );
                    break;
                case 'VIEWINVERSE':
                    //console.log('set', uniform, invert( view ) );
                    shader.setUniform( uniform, invert( view ) );
                    break;
                case 'PROJECTIONINVERSE':
                    //console.log('set', uniform, invert( projection ) );
                    shader.setUniform( uniform, invert( projection ) );
                    break;
                case 'MODELVIEWINVERSE':
                    //console.log('set', uniform, invert( mult( view, model ) ) );
                    shader.setUniform( uniform, invert( mult( view, model ) ) );
                    break;
                case 'MODELVIEWPROJECTIONINVERSE':
                    //console.log('set', uniform, invert( mult( projection, view, model ) ) );
                    shader.setUniform( uniform, invert( mult( projection, view, model ) ) );
                    break;
                case 'MODELINVERSETRANSPOSE':
                    //console.log('set', uniform, transposeInverse( model ) );
                    shader.setUniform( uniform, transposeInverse( model ) );
                    break;
                case 'MODELVIEWINVERSETRANSPOSE':
                    //console.log('set', uniform,  multInverseTranspose( view, model ) );
                    shader.setUniform( uniform, multInverseTranspose( view, model ) );
                    break;
                case 'JOINTMATRIX':
                    shader.setUniform( uniform, getJointArray( node.skin ) );
                    break;
                default:
                    // attribute semantic
                    if ( material.values[ parameter ] !== undefined ) {
                        //console.log('set', uniform, material.values[ parameter ]);
                        shader.setUniform( uniform, material.values[ parameter ] );
                    } else {
                        //console.log('set', uniform, technique.parameters[ parameter ].value);
                        shader.setUniform( uniform, technique.parameters[ parameter ].value );
                    }
                    break;
            }
        });

        // draw the primitive
        primitive.instance.draw();

        // pop any textures
        texturesByUnit.forEach( function( texture, unit ) {
            texture.pop( unit );
        });

        // disable states
        technique.states.enable.forEach( function( state ) {
            gl.disable( gl[ state ] );
        });
        viewport.pop();
        shader.pop();
    }

    function renderHierarchy( node, parentMatrix ) {
        var matrix;
        if ( node.matrix ) {
            matrix = glm.mat4.clone( node.matrix );
        } else {
            matrix = glm.mat4.create();
        }

        // check if node has animations
        // if ( node.animations ) {
        //     var poseMatrix = getAnimationPose( node, time );
        //     matrix = poseMatrix; //glm.mat4.multiply( matrix, poseMatrix, matrix );
        // }

        if ( parentMatrix ) {
            matrix = glm.mat4.multiply( matrix, parentMatrix, matrix );
        }
        if ( node.meshes ) {
            node.meshes.forEach( function( mesh ) {
                mesh.primitives.forEach( function( primitive ) {
                    // draw
                    renderPrimitive( node, matrix, primitive );
                });
            });
        }
        node.children.forEach( function( child ) {
            renderHierarchy( child, matrix );
        });
    }

    // function renderShape( shape, position, color ) {
    //     if ( !flat ) {
    //         return;
    //     }
    //
    //     flat.push();
    //     viewport.push();
    //
    //     flat.setUniform( 'uModelMatrix', glm.mat4.fromTranslation( glm.mat4.create(), position ) );
    //     flat.setUniform( 'uViewMatrix', view );
    //     flat.setUniform( 'uProjectionMatrix', projection );
    //     flat.setUniform( 'uColor', color );
    //
    //     shape.draw();
    //
    //     viewport.pop();
    //     flat.pop();
    // }

    function renderAxes() {
        if ( !flat ) {
            return;
        }

        flat.push();
        viewport.push();

        flat.setUniform( 'uViewMatrix', view );
        flat.setUniform( 'uProjectionMatrix', projection );

        var matrix = glm.mat4.create();
        flat.setUniform( 'uModelMatrix', matrix );
        flat.setUniform( 'uColor', [ 1, 0, 0 ] );
        line.draw();

        matrix = glm.mat4.fromRotation( matrix, -Math.PI / 2, [ 1, 0, 0 ] );
        flat.setUniform( 'uModelMatrix', matrix );
        flat.setUniform( 'uColor', [ 0, 1, 0 ] );
        line.draw();

        matrix = glm.mat4.fromRotation( matrix, -Math.PI / 2, [ 0, 1, 0 ] );
        flat.setUniform( 'uModelMatrix', matrix );
        flat.setUniform( 'uColor', [ 0, 0, 1 ] );
        line.draw();

        viewport.pop();
        flat.pop();
    }

    function render() {

        time = ( Date.now() - start ) / 1000;

        view = glm.mat4.lookAt( view, camera.eye, camera.center, camera.up );

        // render scene
        scene.nodes.forEach( function( node ) {
            renderHierarchy( node );
        });

        // render origin
        renderAxes();

        // continue to next frame
    	requestAnimationFrame( render );
    }

    var bounds = {
        min: glm.vec3.create(),
        max: glm.vec3.create()
    };

    function firstPass( node, parentMatrix ) {
        var matrix;
        if ( node.matrix ) {
            matrix = glm.mat4.clone( node.matrix );
        } else {
            matrix = glm.mat4.create();
        }
        if ( parentMatrix ) {
            matrix = glm.mat4.multiply( matrix, parentMatrix, matrix );
        }

        if ( node.meshes ) {
            node.meshes.forEach( function( mesh ) {
                mesh.primitives.forEach( function( primitive ) {
                    var min = glm.vec3.transformMat4( glm.vec3.create(), primitive.attributes.POSITION.min, matrix );
                    var max = glm.vec3.transformMat4( glm.vec3.create(), primitive.attributes.POSITION.max, matrix );
                    // min
                    bounds.min[0] = Math.min( bounds.min[0], min[0] );
                    bounds.min[1] = Math.min( bounds.min[1], min[1] );
                    bounds.min[2] = Math.min( bounds.min[2], min[2] );
                    // max
                    bounds.max[0] = Math.max( bounds.max[0], max[0] );
                    bounds.max[1] = Math.max( bounds.max[1], max[1] );
                    bounds.max[2] = Math.max( bounds.max[2], max[2] );
                });
            });
        }

        // if ( node.camera ) {
        //     camera = new alfador.Transform( new alfador.Mat44( node.matrix ) );
        //     var proj = node.camera[ node.camera.type ];
        //     if ( node.camera.type === 'perspective' ) {
        //         // perspective
        //         projection = alfador.Mat44.perspective(
        //             proj.yfov,
        //             proj.aspect_ratio,
        //             proj.znear,
        //             proj.zfar );
        //     } else {
        //         // orthographic
        //         projection = alfador.Mat44.ortho(
        //             -proj.xmag, proj.xmag,
        //             -proj.ymag, proj.ymag,
        //             proj.znear, proj.zfar );
        //     }
        // }

        node.children.forEach( function( child ) {
            firstPass( child );
        });
    }

    function getSceneSummary() {
        var center = glm.vec3.create();
        center[0] = ( bounds.max[0] + bounds.min[0] ) / 2;
        center[1] = ( bounds.max[1] + bounds.min[1] ) / 2;
        center[2] = ( bounds.max[2] + bounds.min[2] ) / 2;
        var radius = Math.max( glm.vec3.length( bounds.min ), glm.vec3.length( bounds.max ) );
        return {
            center: center,
            radius: radius
        };
    }

    function initCameraControls() {

        if ( !camera ) {
            var sphere = getSceneSummary();
            // camera position
            var eye = glm.vec3.create();
            eye[2] = sphere.radius * 2;
            // camera up
            var up = glm.vec3.create();
            up[1] = 1.0;
            // center of scene
            var center = sphere.center;
            camera = {
                up: up,
                eye: eye,
                center: center
            };
        }

        var lastPos;
        var down;
        var diff = glm.vec3.sub( glm.vec3.create(), camera.center, camera.eye );
        var distance = glm.vec3.length( diff );
        var MAX_DISTANCE = distance * 10;
        var MIN_DISTANCE = distance / 10;

        window.onmousedown = function( event ) {
            lastPos = {
                x: event.screenX,
                y: event.screenY
            };
            down = true;
        };
        window.onmousemove = function( event ) {
            if ( down ) {
                var X_FACTOR = 0.1;
                var Y_FACTOR = 0.2;
                var pos = {
                    x: event.screenX,
                    y: event.screenY
                };
                var delta = {
                    x: pos.x - lastPos.x,
                    y: pos.y - lastPos.y
                };
                // get difference vector
                var diff = glm.vec3.sub( glm.vec3.create(), camera.eye, camera.center );
                // normalize it
                diff = glm.vec3.normalize( diff, diff );
                // rotate along world y-axis
                var angle = delta.x * -X_FACTOR * ( Math.PI / 180 );
                var rot = glm.mat4.fromRotation( glm.mat4.create(), angle, [ 0, 1, 0 ] );
                // rotate along local x-axis
                angle = delta.y * Y_FACTOR * ( Math.PI / 180 );
                var x = glm.vec3.create();
                x = glm.vec3.cross( x, diff, up );
                rot = glm.mat4.rotate( rot, rot, angle, x );
                // rotate camera direction
                diff = glm.vec3.transformMat4(diff, diff, rot);
                diff = glm.vec3.normalize( diff, diff );
                // scale it by the distance
                diff = glm.vec3.scale( diff, diff, distance );
                // add it to center to get new eye pos
                camera.eye = glm.vec3.add( camera.eye, center, diff );
                camera.up = glm.vec3.transformMat4(camera.up, camera.up, rot);
                camera.up = glm.vec3.normalize( camera.up, camera.up );
                lastPos = pos;
            }
        };
        window.onwheel = function( event ) {
            var SCROLL_FACTOR = 0.0001;
            distance += ( event.deltaY * SCROLL_FACTOR * MAX_DISTANCE );
            distance = Math.min( Math.max( distance, MIN_DISTANCE ), MAX_DISTANCE );
            // get difference vector
            var diff = glm.vec3.sub( glm.vec3.create(), camera.eye, camera.center );
            // normalize it
            diff = glm.vec3.normalize( diff, diff );
            // scale it by the updated distance
            diff = glm.vec3.scale( diff, diff, distance );
            // add it to center to get new eye pos
            camera.eye = glm.vec3.add( camera.eye, center, diff );
        };
        window.onmouseup = function() {
            down = false;
        };
    }

    window.start = function() {

        // get WebGL context, this automatically binds it globally and loads all available extensions
        gl = esper.WebGLContext.get( 'glcanvas' );

        // only continue if WebGL is available
        if ( gl ) {

            viewport = new esper.Viewport({
                width: window.innerWidth,
                height: window.innerHeight
            });

            projection = glm.mat4.perspective(
                projection,
                FOV, ASPECT_RATIO(), NEAR, FAR );

            // resize viewport on window resize
            window.addEventListener( 'resize', function() {
            	viewport.resize( window.innerWidth, window.innerHeight );
                projection = glm.mat4.perspective(
                    projection,
                    FOV, ASPECT_RATIO(), NEAR, FAR );
            });

            new esper.Shader({
                vert: 'shaders/flat.vert',
                frag: 'shaders/flat.frag'
            }, function( err, shader ) {
                if ( err ) {
                    console.error( err );
                    return;
                }
                flat = shader;
            });

            line = new esper.Renderable({
                vertices: {
                    0: [
                        [ 0, 0, 0 ],
                        [ 0, 0, 1 ]
                    ]
                },
                indices: [ 0, 1 ],
                mode: 'LINES'
            });

            // sphere = new esper.Renderable({
            //     vertices: {
            //         0: geometry.Sphere.positions( 0.1 )
            //     },
            //     indices: geometry.Sphere.indices()
            // });

            glTFLoader.load('./models/vc/vc.gltf', function( err, gltf ) {
                if ( err ) {
                    console.error( err );
                    return;
                }
                glTFConstructor.construct( gltf, function( err, gltf ) {
                    if (err) {
                        console.error(err);
                        return;
                    }
                    scene = gltf.scenes[ gltf.scene ];

                    // detect camera
                    scene.nodes.forEach( function( node ) {
                        firstPass( node );
                    });

                    initCameraControls();

                    render();

                });
            });

        }
    };

}());
