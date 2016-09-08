(function() {

    'use strict';

    let glm = require('gl-matrix');
    let Stats = require('stats.js');
    let context = require('./scripts/render/gl');
    let glTFLoader = require('./scripts/glTFLoader');
    let Debug = require('./scripts/render/Debug');
    let XHRLoader = require('./scripts/util/XHRLoader');

    let model;
    let models;

    let stats;

    let gl;
    let origin = glm.mat4.create();
    let scene;
    let view;
    let projection;

    let start = Date.now();
    let time;

    function renderPrimitive(node, primitive) {
        let material = primitive.material;
        let technique = primitive.technique;
        // enable state
        technique.enableState();
        // set uniforms
        technique.setUniforms(node, material, view, projection, time);
        // draw the primitive
        primitive.draw();
        // disable state
        technique.disableState();
    }

    // function renderHierarchyDepthFirst(node) {
    //     if (node.primitives) {
    //         node.primitives.forEach(function(primitive) {
    //             renderPrimitive(node, primitive);
    //         });
    //     }
    //     node.children.forEach(function(child) {
    //         renderHierarchyDepthFirst(child);
    //     });
    // }

    function renderHierarchyBreadthFirst(node) {
        let queue = [ node ];
        while (queue.length > 0) {
            node = queue.shift();
            if (node.primitives) {
                let primitives = node.primitives;
                for (let i=0; i<primitives.length; i++) {
                    renderPrimitive(node, primitives[i]);
                }
            }
            queue = queue.concat(node.children);
        }
    }

    function renderHierarchy(node) {
        renderHierarchyBreadthFirst(node);
    }

    function render() {
        if (scene) {
            stats.begin();
            // get timestamp
            time = (Date.now() - start) / 1000;
            // update view matrix based on camera position
            view = scene.getGlobalViewMatrix(time);
            // get projection matrix
            projection = scene.getProjectionMatrix();
            // render origin
            Debug.renderNode(origin, view, projection);
            // render scene
            scene.nodes.forEach(node => {
                renderHierarchy(node);
            });
            stats.end();
        }
        // continue to next frame
    	requestAnimationFrame(render);
    }

    function resizeCanvas() {
        let pixelRatio = window.devicePixelRatio;
        let width = pixelRatio * window.innerWidth;
        let height = pixelRatio * window.innerHeight;
        gl.canvas.width = width;
        gl.canvas.height = height;
        gl.viewport(0, 0, width, height);
    }

    function loadModel(path) {
        console.log('Loading ' + path);
        // load and parse glTF model into runtime format
        glTFLoader.load(path, (err, gltf) => {
            if (err) {
                console.error(err);
                return;
            }
            if (scene) {
                scene.destroy();
            }
            // get scene instance
            scene = gltf.scenes[ gltf.scene ].instance;
        });
    }

    function changeModel(event) {
        let M_CODE = 109;
        let modelIndex = models.indexOf(model);
        if (event.keyCode === M_CODE) {
            modelIndex = (modelIndex + 1) % models.length;
            // switch model
            model = models[ modelIndex ];
            // load the model
            loadModel(model);
        }
    }

    function addStats() {
        stats = new Stats();
        document.body.appendChild(stats.dom);
    }

    window.start = function() {
        // get WebGL context
        gl = context();
        // only continue if WebGL is available
        if (gl) {
            // size the canvas according to the window
            resizeCanvas();
            // resize viewport on window resize
            window.addEventListener('resize', resizeCanvas);
            // get all models
            XHRLoader.load({
                url: 'models',
                responseType: 'json',
                success: res => {
                    if (res.length === 0) {
                        console.error('There are no models to render');
                        return;
                    }
                    models = res;
                    model = models[0];
                    // add model change listener
                    window.addEventListener('keypress', changeModel);
                    // load the model
                    loadModel(model);
                    // add stats element
                    addStats();
                    // start rendering
                    render();
                },
                error: err => {
                    console.error(err);
                }
            });
        }
    };

}());
