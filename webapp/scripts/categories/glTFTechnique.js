(function () {

    'use strict';

    var Technique = require('../render/Technique');

    module.exports = function(gltf, description, done) {
        // get shader instance
        var shader = gltf.programs[ description.program ].instance;
        // convert uniforms to array of the values
        var uniforms = Object.keys(description.uniforms).map(function(name) {
            var id = description.uniforms[ name ];
            var parameter = description.parameters[ id ];
            parameter.name = name;
            parameter.id = id;
            if (Array.isArray(parameter.value)) {
                parameter.value = new Float32Array(parameter.value);
            }
            return parameter;
        });
        // convert state function to array
        var functions;
        if (description.states.functions) {
            functions = Object.keys(description.states.functions).map(function(key) {
                var values = description.states.functions[ key ];
                return {
                    name: key,
                    values: Array.isArray(values) ? values : [ values ]
                };
            });
        }
        // create instance
        description.instance = new Technique({
            shader: shader,
            attributes: description.attributes,
            uniforms: uniforms,
            enables: description.states.enable,
            functions: functions
        });
        done(null);
    };

}());
