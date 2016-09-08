# gltf-viewer

A minimalistic ES6 importer and renderer for the [Khronos glTF 1.0 format](https://github.com/KhronosGroup/glTF).

## Motivation

I really like the the glTF format. While attempting to familiarize myself with the specification I had difficulty finding any reference implementation that didn't involve incorporating an existing frameworks internal representation. This is my attempt at creating a bare bones feature complete importer and renderer.

## Usage

Install the dependencies:

```bash
npm install
```

Run the development server:

```bash
gulp
```

Set your browser to `http://localhost:8080`. The application will serve any glTF files found in the `webapp/models` directory.

## To-Do

- fix ambiguity in animation implementation
- add support for binary glb files
- add support for embedded gltf files  

## Known Issues

- `box-animated.gltf` sample model

    - Animation `TIME` input has different number of elements across `translation` and `rotation` paths and causes animation delay
        - Not sure if model error or implementation error
        - Referenced in [Issue #574](https://github.com/KhronosGroup/glTF/issues/573) and [Issue #569](https://github.com/KhronosGroup/glTF/issues/569)

- `monster.gltf` sample model

    - scale does not seem right, abnormally large compared to other sample models
        - Not sure if model error or implementation error

- `vc.gltf` sample model

    - Erroneous 'cubes' are being rendered and cars / train orientations do not seem to be correct
        - Not sure if model error or implementation error
        - Referenced in [Issue #556](https://github.com/KhronosGroup/glTF/issues/556) and [Issue #576](https://github.com/KhronosGroup/glTF/issues/576)
    - Car and train orientations are not correct, animations only contain translation channel.
        - Not sure if model error or implementation error
