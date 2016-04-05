(function() {

    'use strict';

    var _ = require('lodash');
    var esper = require('esper');
    var geometry = require('esper-geometry');
    var alfador = require('alfador');
    var glTFLoader = require('./scripts/glTFLoader');
    var glTFConstructor = require('./scripts/glTFConstructor');

    var gl;
    var viewport;
    var scene;
    var camera;
    var projection;
    var flat;
    var cube;
    var line;
    var shapes;

    function renderPrimitive( matrix, primitive ) {
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
                    //console.log('set', uniform, camera.viewMatrix() );
                    shader.setUniform( uniform, camera.viewMatrix() );
                    break;
                case 'PROJECTION':
                    //console.log('set', uniform, projection );
                    shader.setUniform( uniform, projection );
                    break;
                case 'MODELVIEW':
                    //console.log('set', uniform, camera.viewMatrix().multMat44( model ) );
                    shader.setUniform( uniform, camera.viewMatrix().multMat44( model ) );
                    break;
                case 'MODELVIEWPROJECTION':
                    //console.log('set', uniform, projection.multMat44( camera.viewMatrix() ).multMat44( model ) );
                    shader.setUniform( uniform, projection.multMat44( camera.viewMatrix() ).multMat44( model ) );
                    break;
                case 'MODELINVERSE':
                    //console.log('set', uniform, new alfador.Mat44( model ).inverse() );
                    shader.setUniform( uniform, new alfador.Mat44( model ).inverse() );
                    break;
                case 'VIEWINVERSE':
                    //console.log('set', uniform, camera.viewMatrix().inverse() );
                    shader.setUniform( uniform, camera.viewMatrix().inverse() );
                    break;
                case 'PROJECTIONINVERSE':
                    //console.log('set', uniform, projection.inverse() );
                    shader.setUniform( uniform, projection.inverse() );
                    break;
                case 'MODELVIEWINVERSE':
                    //console.log('set', uniform, camera.viewMatrix().multMat44( model ).inverse() );
                    shader.setUniform( uniform, camera.viewMatrix().multMat44( model ).inverse() );
                    break;
                case 'MODELVIEWPROJECTIONINVERSE':
                    //console.log('set', uniform, projection.multMat44( camera.viewMatrix() ).multMat44( model ).inverse() );
                    shader.setUniform( uniform, projection.multMat44( camera.viewMatrix() ).multMat44( model ).inverse() );
                    break;
                case 'MODELINVERSETRANSPOSE':
                    //console.log('set', uniform, new alfador.Mat44( model ).toMat33().inverse().transpose() );
                    shader.setUniform( uniform, new alfador.Mat44( model ).toMat33().inverse().transpose() );
                    break;
                case 'MODELVIEWINVERSETRANSPOSE':
                    var view = camera.viewMatrix();
                    //console.log('set', uniform, new alfador.Mat44( view ).toMat33().multMat33( new alfador.Mat44( model ).toMat33().inverse().transpose() ) );
                    shader.setUniform( uniform, new alfador.Mat44( view ).toMat33().multMat33( new alfador.Mat44( model ).toMat33().inverse().transpose() ) );
                    break;
                case 'JOINTMATRIX':
                    break;
                default:
                    // attribute semantic
                    if ( material.values[ parameter ] ) {
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
            matrix = node.matrix;
        } else {
            matrix = alfador.Mat44.identity().toArray();
        }
        if ( parentMatrix ) {
            matrix = new alfador.Mat44( parentMatrix ).multMat44( matrix ).toArray();
        }
        if ( node.meshes ) {
            node.meshes.forEach( function( mesh ) {
                mesh.primitives.forEach( function( primitive ) {
                    // draw
                    renderPrimitive( matrix, primitive );
                });
            });
        }
        node.children.forEach( function( child ) {
            renderHierarchy( child, matrix );
        });
    }

    // function renderShape( shape, matrix, color ) {
    //     if ( !flat ) {
    //         return;
    //     }
    //
    //     flat.push();
    //     viewport.push();
    //
    //     flat.setUniform( 'uModelMatrix', matrix );
    //     flat.setUniform( 'uViewMatrix', camera.viewMatrix() );
    //     flat.setUniform( 'uProjectionMatrix', projection );
    //     flat.setUniform( 'uColor', color );
    //
    //     shape.draw();
    //
    //     viewport.pop();
    //     flat.pop();
    // }

    function renderTransform( matrix ) {
        if ( !flat ) {
            return;
        }

        flat.push();
        viewport.push();

        flat.setUniform( 'uViewMatrix', camera.viewMatrix() );
        flat.setUniform( 'uProjectionMatrix', projection );

        var transform = new alfador.Mat44( matrix ).decompose();

        var x = transform.rotation.xAxis();
        var y = transform.rotation.yAxis();
        var z = transform.rotation.zAxis();

        flat.setUniform( 'uModelMatrix', new alfador.Transform({ translation: transform.translation }).rotateZTo( x ).matrix() );
        flat.setUniform( 'uColor', [ 1, 0, 0 ] );
        line.draw();

        flat.setUniform( 'uModelMatrix', new alfador.Transform({ translation: transform.translation }).rotateZTo( y ).matrix() );
        flat.setUniform( 'uColor', [ 0, 1, 0 ] );
        line.draw();

        flat.setUniform( 'uModelMatrix', new alfador.Transform({ translation: transform.translation }).rotateZTo( z ).matrix() );
        flat.setUniform( 'uColor', [ 0, 0, 1 ] );
        line.draw();

        viewport.pop();
        flat.pop();
    }

    function render() {
        // render scene
        scene.nodes.forEach( function( node ) {
            renderHierarchy( node );
        });

        // render origin
        renderTransform([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);

        // continue to next frame
    	requestAnimationFrame( render );
    }

    function firstPass( node ) {
        if ( node.camera ) {
            camera = new alfador.Transform( new alfador.Mat44( node.matrix ) );
            // var proj = node.camera[ node.camera.type ];
            // if ( node.camera.type === 'perspective' ) {
            //     // perspective
            //     projection = alfador.Mat44.perspective(
            //         proj.yfov,
            //         proj.aspect_ratio,
            //         proj.znear,
            //         proj.zfar );
            // } else {
            //     // orthographic
            //     projection = alfador.Mat44.ortho(
            //         -proj.xmag, proj.xmag,
            //         -proj.ymag, proj.ymag,
            //         proj.znear, proj.zfar );
            // }
        }
        node.children.forEach( function( child ) {
            firstPass( child );
        });
    }

    function initCameraControls() {

        if ( !camera ) {
            camera = new alfador.Transform({
                translation: [ 0, 0, -10 ]
            });
        }

        var lastPos;
        var down;
        var distance = camera.translation.length();
        var MAX_DISTANCE = distance * 2;
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
                var pos = {
                    x: event.screenX,
                    y: event.screenY
                };
                var delta = {
                    x: pos.x - lastPos.x,
                    y: pos.y - lastPos.y
                };
                camera.translation = new alfador.Vec3( 0, 0, 0 );
                camera.rotateWorld( delta.x * -0.2 * ( Math.PI / 180 ), [ 0, 1, 0 ] );
                camera.rotateLocal( delta.y * -0.1 * ( Math.PI / 180 ), [ 1, 0, 0 ] );
                camera.translateLocal([ 0, 0, distance ]);
                lastPos = pos;
            }
        };
        window.onwheel = function( event ) {
            var SCROLL_FACTOR = 0.0001;
            distance += ( event.deltaY * SCROLL_FACTOR * MAX_DISTANCE );
            distance = Math.min( Math.max( distance, MIN_DISTANCE ), MAX_DISTANCE );
            camera.translation = new alfador.Vec3( 0, 0, 0 );
            camera.translateLocal([ 0, 0, distance ]);
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
            projection = alfador.Mat44.perspective(
                60 * ( Math.PI / 180 ),
                window.innerWidth / window.innerHeight,
                0.1,
                1000 );

            // resize viewport on window resize
            window.addEventListener( 'resize', function() {
            	viewport.resize( window.innerWidth, window.innerHeight );
                projection = alfador.Mat44.perspective(
                   60 * ( Math.PI / 180 ),
                   window.innerWidth / window.innerHeight,
                   0.1,
                   1000 );
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

            cube = new esper.Renderable({
                vertices: {
                    0: geometry.Cube.positions( 0.5 )
                },
                indices: geometry.Cube.indices()
            });

            shapes = [
                cube
            ];

            glTFLoader.load('./models/duck/duck.gltf', function( err, gltf ) {
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
