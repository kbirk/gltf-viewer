(function () {

    'use strict';

    let Technique = require('../render/Technique');

    module.exports = function(gltf, description, done) {
        // get shader instance
        let shader = gltf.programs[ description.program ].instance;
        // convert uniforms to array of the values
        let uniforms = Object.keys(description.uniforms).map(name => {
            let id = description.uniforms[ name ];
            let parameter = description.parameters[ id ];
            parameter.name = name;
            parameter.id = id;
            if (Array.isArray(parameter.value)) {
                parameter.value = new Float32Array(parameter.value);
            }
            return parameter;
        });
        // convert state function to array
        let functions;
        if (description.states.functions) {
            functions = Object.keys(description.states.functions).map(key => {
                let values = description.states.functions[ key ];
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
