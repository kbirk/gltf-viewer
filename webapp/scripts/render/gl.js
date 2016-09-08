(function () {

    'use strict';

    let CANVAS_ID = 'glcanvas';
    let EXTENSIONS = [
        // ratified
        'OES_texture_float',
        'OES_texture_half_float',
        'WEBGL_lose_context',
        'OES_standard_derivatives',
        'OES_vertex_array_object',
        'WEBGL_debug_renderer_info',
        'WEBGL_debug_shaders',
        'WEBGL_compressed_texture_s3tc',
        'WEBGL_depth_texture',
        'OES_element_index_uint',
        'EXT_texture_filter_anisotropic',
        'EXT_frag_depth',
        'WEBGL_draw_buffers',
        'ANGLE_instanced_arrays',
        'OES_texture_float_linear',
        'OES_texture_half_float_linear',
        'EXT_blend_minmax',
        'EXT_shader_texture_lod',
        // community
        'WEBGL_compressed_texture_atc',
        'WEBGL_compressed_texture_pvrtc',
        'EXT_color_buffer_half_float',
        'WEBGL_color_buffer_float',
        'EXT_sRGB',
        'WEBGL_compressed_texture_etc1'
    ];

    let loaded = false;
    let gl;

    module.exports = function() {
        if (!loaded) {
            // get context
            let canvas = document.getElementById(CANVAS_ID);
            gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            // load extensions
            if (gl) {
                EXTENSIONS.forEach(ext => {
                    gl.getExtension(ext);
                });
            }
            loaded = true;
        }
        return gl;
    };

}());
