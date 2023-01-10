# react-native-pixi

[![npm version](http://img.shields.io/npm/v/react-native-pixi.svg?style=flat-square)](https://npmjs.org/package/react-native-pixi "View this project on npm")
[![npm downloads](http://img.shields.io/npm/dm/react-native-pixi.svg?style=flat-square)](https://npmjs.org/package/react-native-pixi "View this project on npm")
[![npm licence](http://img.shields.io/npm/l/react-native-pixi.svg?style=flat-square)](https://npmjs.org/package/react-native-pixi "View this project on npm")
[![Platform](https://img.shields.io/badge/platform-ios%20%7C%20android-989898.svg?style=flat-square)](https://npmjs.org/package/react-native-pixi "View this project on npm")

Tools to use [Pixi.js](http://www.pixijs.com/) in React Native!

## Pixi projects ported to react-native-pixi
* [snakeRN](https://github.com/flyskywhy/snakeRN)

<img src="https://raw.githubusercontent.com/flyskywhy/snakeRN/master/assets/snakeRN.gif" width="480">

## Getting Started

    npm install react-native-pixi

## Functions

### `new PIXI.Application({ context, devicePixelRatio });`

A helper function to create a `PIXI.Application` from a WebGL context.

`context` comes from `canvas.getContext('webgl')` with `@flyskywhy/react-native-gcanvas` .

`devicePixelRatio` here should be same with the prop in `<GCanvasView/>` , ref to "Example As Usage" below.

[Learn more about PIXI.Application props](http://pixijs.download/dev/docs/PIXI.Application.html)

### Gesture
You need write gesture code by yourself, ref to `GestureView` used in https://github.com/flyskywhy/snakeRN/blob/master/GameScreen.js, or https://github.com/metafizzy/zdog/blob/master/js/dragger.js .

## Example As Usage
```js
import React from 'react';
import {GCanvasView} from '@flyskywhy/react-native-gcanvas';
import {PIXI} from 'react-native-pixi';
import {Asset} from 'expo-asset';
import Loader from 'resource-loader';

// for game, 1 is more better than PixelRatio.get() to code with physical pixels
const devicePixelRatio = 1;

export default () => {
  const onCanvasCreate = async (canvas) => {
    let context = canvas.getContext('webgl');
    const app = new PIXI.Application({
      context,
      devicePixelRatio,
      backgroundColor: '0x7ed321',
    });

    const imageHttpSrc =
      'https://gw.alicdn.com/tfs/TB1KwRTlh6I8KJjy0FgXXXXzVXa-225-75.png';
    // `await Asset.fromModule` needs `expo-file-system`, and `expo-file-system` needs
    // `expo-modules` or old `react-native-unimodules`.
    // https://github.com/expo/expo/tree/sdk-47/packages/expo-asset said it needs
    // https://docs.expo.dev/bare/installing-expo-modules/ which also described how to
    // migrating from `react-native-unimodules`.
    // The installation of old `react-native-unimodules` can ref to this commit
    // [expo -> react-native: add react-native-unimodules]
    // (https://github.com/flyskywhy/snakeRN/commit/90983816de3ad2a4da47ffa0f6d1659c2688be3e).
    let imageRequireAsset = await Asset.fromModule(
      require('@flyskywhy/react-native-gcanvas/tools/build_website/assets/logo-gcanvas.png'),
    );
    let spriteHttpLoader;
    let spriteRequireLoader;

    // you can see how to use PIXI.loader in it
    // spriteByResourceLoader();

    // or, use new Image() not PIXI.loader in it
    // spriteByNewImage();

    // or, just use PIXI.Sprite.from() in it
    spriteByFrom();

    function spriteByResourceLoader() {
      // ref to [Pixi教程](https://github.com/Zainking/learningPixi)
      PIXI.loader.add(imageHttpSrc); // imageHttpSrc can be simple string url
      PIXI.loader
        .add({
          url: imageRequireAsset.uri,
          // imageRequireAsset must set loadType in this object when build release
          loadType: Loader.Resource._loadTypeMap[imageRequireAsset.type],
        })
        .load(setup);

      function setup(loader, resources) {
        spriteHttpLoader = new PIXI.Sprite(
          PIXI.loader.resources[imageHttpSrc].texture,
        );

        app.stage.addChild(spriteHttpLoader);
        spriteHttpLoader.y = 700;

        spriteRequireLoader = new PIXI.Sprite(
          PIXI.loader.resources[imageRequireAsset.uri].texture,
        );
        app.stage.addChild(spriteRequireLoader);

        spriteRequireLoader.x = 500;
        spriteRequireLoader.y = 700;

        app.ticker.add((delta) => gameLoop(delta));
      }

      function gameLoop(delta) {
        spriteHttpLoader.y -= 1;
      }
    }

    function spriteByNewImage() {
      const imageRequire = new Image();
      imageRequire.onload = setup;
      imageRequire.src = imageRequireAsset.uri;

      function setup(loader, resources) {
        new PIXI.Texture.fromLoader(imageRequire, imageRequire.src);
        spriteRequireLoader = new PIXI.Sprite(
          PIXI.utils.TextureCache[imageRequireAsset.uri],
        );
        app.stage.addChild(spriteRequireLoader);

        spriteRequireLoader.x = 500;
        spriteRequireLoader.y = 700;
      }
    }

    async function spriteByFrom() {
      spriteRequireLoader = PIXI.Sprite.from(imageRequireAsset.uri);
      app.stage.addChild(spriteRequireLoader);

      spriteRequireLoader.x = 500;
      spriteRequireLoader.y = 700;
    }
  };

  return (
    <GCanvasView
      style={{flex: 1, height: '100%'}}
      onCanvasCreate={onCanvasCreate}
      devicePixelRatio={devicePixelRatio}
    />
  );
};
```

## `Pixi.Sketch` (TODO)

A component used for drawing smooth signatures and sketches.

**See the sketch example on how to save the images!**

> Notice: the edges and ends are not rounded as this is not supported in PIXI yet: [Issue](https://github.com/pixijs/pixi.js/issues/1637)

#### Props

| Property    |            Type             | Default  | Description                                     |
| ----------- | :-------------------------: | :------: | ----------------------------------------------- |
| strokeColor |           number            | 0x000000 | Color of the lines                              |
| strokeWidth |           number            |    10    | Weight of the lines                             |
| strokeAlpha |           number            |    1     | Opacity of the lines                            |
| onChange    |     () => PIXI.Renderer     |   null   | Invoked whenever a user is done drawing a line  |
| onReady     | () => WebGLRenderingContext |   null   | Invoked when the GL context is ready to be used |

## `Pixi.FilterImage` (TODO)

A Image component that uses PIXI.Filter

#### Props

| Property   |            Type            | Default | Description                                                                  |
| ---------- | :------------------------: | :-----: | ---------------------------------------------------------------------------- |
| resizeMode |           string           |  null   | Currently only supports `cover`, and `contain`                               |
| filters    |     Array<PIXI.Filter>     |  null   | Array of filters to apply to the image                                       |
| source     | number, string, Expo.Asset |  null   | Source can be a static resource, image url (not `{uri}`), or an `Expo.Asset` |
