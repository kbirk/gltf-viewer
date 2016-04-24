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

The server will serve any gltf files found in the `webapp/models` directory.

## TODO

- add support for binary glb files
- add support for embedded gltf files  

## Known Issues

- box-animated.gltf sample animation TIME input currently causes animation delay
    - Not sure if model error or implementation error
    - Referenced in [Issue #574](https://github.com/KhronosGroup/glTF/issues/573) and [Issue #569](https://github.com/KhronosGroup/glTF/issues/569)
- vc.gltf model has erroneous 'cubes' being renderered and cars / train orientations do not seem to be correct
    - Not sure if model error or implementation error
