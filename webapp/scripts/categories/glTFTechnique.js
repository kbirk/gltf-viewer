(function () {

    'use strict';

    var ENABLE_TYPES = {
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

    var BLEND_EQUATIONS = {
        '32774': 'FUNC_ADD',
        '32778': 'FUNC_SUBTRACT',
        '32779': 'FUNC_REVERSE_SUBTRACT'
    };

    var BLEND_FUNCTIONS = {
        '0': 'ZERO',
        '1': 'ONE',
        '768': 'SRC_COLOR',
        '769': 'ONE_MINUS_SRC_COLOR',
        '770': 'SRC_ALPHA',
        '771': 'ONE_MINUS_SRC_ALPHA',
        '772': 'DST_ALPHA',
        '773': 'ONE_MINUS_DST_ALPHA',
        '774': 'DST_COLOR',
        '775': 'ONE_MINUS_DST_COLOR',
        '776': 'SRC_ALPHA_SATURATE',
        '32769': 'CONSTANT_COLOR',
        '32770': 'ONE_MINUS_CONSTANT_COLOR',
        '32771': 'CONSTANT_ALPHA',
        '32772': 'ONE_MINUS_CONSTANT_ALPHA'
    };

    var CULL_FACES = {
        '1028': 'FRONT',
        '1029': 'BACK',
        '1032': 'FRONT_AND_BACK'
    };

    var DEPTH_FUNCTIONS = {
        '512': 'NEVER',
        '513': 'LESS',
        '515': 'LEQUAL',
        '514': 'EQUAL',
        '516': 'GREATER',
        '517': 'NOTEQUAL',
        '518': 'GEQUAL',
        '519': 'ALWAYS'
    };

    var FRONT_FACES = {
        '2304': 'CW',
        '2305': 'CCW'
    };

    function parseStateFunctions(functions) {
        if ( functions.blendEquationSeparate ) {
            functions.blendEquationSeparate = [
                BLEND_EQUATIONS[ functions.blendEquationSeparate[0] ],
                BLEND_EQUATIONS[ functions.blendEquationSeparate[1] ]
            ];
        }
        if ( functions.blendFuncSeparate ) {
            functions.blendFuncSeparate = [
                BLEND_FUNCTIONS[ functions.blendFuncSeparate[0] ],
                BLEND_FUNCTIONS[ functions.blendFuncSeparate[1] ],
                BLEND_FUNCTIONS[ functions.blendFuncSeparate[2] ],
                BLEND_FUNCTIONS[ functions.blendFuncSeparate[3] ]
            ];
        }
        if ( functions.cullFace ) {
            functions.cullFace = [
                CULL_FACES[ functions.cullFace[0] ]
            ];
        }
        if ( functions.depthFunc ) {
            functions.depthFunc = [
                DEPTH_FUNCTIONS[ functions.depthFunc[0] ]
            ];
        }
        if ( functions.frontFace ) {
            functions.frontFace = [
                FRONT_FACES[ functions.frontFace[0] ]
            ];
        }
        return functions;
    }

    module.exports = function( gltf, description, done ) {
        description.program = gltf.programs[description.program];
        Object.keys(description.parameters).map(function(key) {
            var parameter = description.parameters[key];
            if (parameter.node) {
                parameter.node = gltf.nodes[parameter.node];
            }
            parameter.type = PARAMETER_TYPES[ parameter.type ];
        });
        var states = description.states;
        states.enable = states.enable.map( function(state) {
            return ENABLE_TYPES[ state ];
        });
        if (states.functions) {
            states.functions = parseStateFunctions(states.functions);
        }
        done( null );
    };

}());
