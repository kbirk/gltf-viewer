# gltf-viewer

A minimalistic importer and renderer for the [Khronos glTF 1.0 format](https://github.com/KhronosGroup/glTF).

## Motivation

I really like the the glTF format. While attempting to familiarize myself with the specification I had difficulty finding any reference implementation that didn't shoehorn the model into an existing framework. This is my attempt at creating a bare bones feature complete importer and renderer.

## Usage

Install the dependencies:

```bash
npm install
```

Run the development server:

```bash
gulp
```

Set your browser to `http://localhost:8080`. The application will serve any gltf files found in the `webapp/models` directory.

## To-Do

- add support for binary glb files
- add support for embedded gltf files  

## Known Issues

- boxSemantics.gltf sample model
    - `modelInverseTransposeMatrix` uniform is of type `MODELINVERSETRANSPOSE` which should have corresponding type of `FLOAT_MAT3`, however type is `FLOAT_MAT4`
        - Not sure if model error or implementation error
    - `VIEWPORT` uniform semantic has no corresponding value `VEC4`
        - Not sure if model error or implementation error
- box-animated.gltf sample model
    - Animation `TIME` input has different number of elements across `translation` and `rotation` paths and causes animation delay
        - Not sure if model error or implementation error
        - Referenced in [Issue #574](https://github.com/KhronosGroup/glTF/issues/573) and [Issue #569](https://github.com/KhronosGroup/glTF/issues/569)
- brainsteam.gltf sample model
    - orientation is incorrect, -Z is the up vector rather than Y as with all other sample models
        - Not sure if model error or implementation error
    - Pistons in right arm are not rendering in the correct location
        - Not sure if model error or implementation error
- vc.gltf sample model
    - Erroneous 'cubes' are being rendered and cars / train orientations do not seem to be correct
        - Not sure if model error or implementation error
    - Car and train orientations do not seem to be correct
        - Not sure if model error or implementation error
