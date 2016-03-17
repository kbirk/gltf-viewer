(function () {

    'use strict';

    var STATES = {
        '3042': 'BLEND',
        '2884': 'CULL_FACE',
        '2929': 'DEPTH_TEST',
        '32823': 'POLYGON_OFFSET_FILL',
        '32926': 'SAMPLE_ALPHA_TO_COVERAGE',
        '3089': 'SCISSOR_TEST'
    };

    var PARAMETER_TYPES = {
        '5122': 'SHORT',
        '5123': 'UNSIGNED_SHORT',
        '5124': 'INT',
        '5125': 'UNSIGNED_INT',
        '5126': 'FLOAT',
        '35664': 'FLOAT_VEC2',
        '35665': 'FLOAT_VEC3',
        '35666': 'FLOAT_VEC4',
        '35667': 'INT_VEC2',
        '35668': 'INT_VEC3',
        '35669': 'INT_VEC4',
        '35670': 'BOOL',
        '35671': 'BOOL_VEC2',
        '35672': 'BOOL_VEC3',
        '35673': 'BOOL_VEC4',
        '35674': 'FLOAT_MAT2',
        '35675': 'FLOAT_MAT3',
        '35676': 'FLOAT_MAT4',
        '35678': 'SAMPLER_2D'
    };

    module.exports = function( gltf, description, done ) {
        description.program = gltf.programs[description.program];
        Object.keys(description.parameters).map(function(key) {
            var parameter = description.parameters[key];
            if (parameter.node) {
                parameter.node = gltf.nodes[parameter.node];
            }
            parameter.type = PARAMETER_TYPES[ parameter.type ];
        });
        description.states.enable = description.states.enable.map( function(state) {
            return STATES[ state ];
        });
        // TODO: add description.states.functions
        done( null );
    };

}());
