import '@flyskywhy/react-native-browser-polyfill';

import * as PixiInstance from 'pixi.js';
import { PixelRatio, Platform } from 'react-native';
import { resolveAsync } from 'expo-asset-utils';

global.PIXI = global.PIXI || PixiInstance;
let PIXI = global.PIXI;
import * as filters from 'pixi-filters';
PIXI.filters = { ...(PIXI.filters || {}), ...filters };

class ExpoPIXIApplication extends PIXI.Application {
  constructor({ width, height, scale, backgroundColor, context, ...props }) {
    if (!context)
      throw new Error(
        'expo-pixi: new Application({ context: null }): context must be a valid WebGL context.'
      );

    if (Platform.OS !== 'web') {
      // Shim stencil buffer attribute
      const getAttributes = context.getContextAttributes || (() => ({}));
      context.getContextAttributes = () => {
        const contextAttributes = getAttributes();
        return {
          ...contextAttributes,
          stencil: true,
        };
      };
    }

    // since PixelRatio is already setted in @flyskywhy/react-native-gcanvas
    // e.g. setDevicePixelRatio() in node_modules/@flyskywhy/react-native-gcanvas/android/src/main/java/com/taobao/gcanvas/bridges/rn/GReactModule.java
    // so resolution default to 1 but not `PixelRatio.get()`; and width default to `context.drawingBufferWidth / PixelRatio.get()`
    const resolution = scale || 1; //PixelRatio.get();
    super({
      context,
      resolution,
      width: width || context.drawingBufferWidth / PixelRatio.get(),
      height: height || context.drawingBufferHeight / PixelRatio.get(),
      backgroundColor,
      ...props,
    });
  }
}

const isAsset = input => {
  return (
    input &&
    typeof input.width === 'number' &&
    typeof input.height === 'number' &&
    typeof input.localUri === 'string'
  );
};

if (!(PIXI.Application instanceof ExpoPIXIApplication)) {
  const { HTMLImageElement } = global;

  const textureFromExpoAsync = async resource => {
    let asset = resource;
    if (Platform.OS !== 'web') {
      asset = await resolveAsync(resource);
    }
    return PIXI.Texture.from(asset);
  };

  const spriteFromExpoAsync = async resource => {
    const texture = await textureFromExpoAsync(resource);
    return PIXI.Sprite.from(texture);
  };

  const originalSpriteFrom = PIXI.Sprite.from;
  const originalTextureFrom = PIXI.Texture.from;
  PIXI = {
    ...PIXI,
    Application: ExpoPIXIApplication,
    Texture: {
      ...PIXI.Texture,
      from: (...props) => {
        if (Platform.OS === 'web') {
          return originalTextureFrom(...props);
        }
        if (props.length && props[0]) {
          let asset = props[0];
          if (isAsset(asset)) {
            if (asset instanceof HTMLImageElement) {
              return originalTextureFrom(asset);
            } else {
              return originalTextureFrom(new HTMLImageElement(asset));
            }
          } else if (typeof asset === 'string' || typeof asset === 'number') {
            console.warn(
              `PIXI.Texture.from(asset: ${typeof asset}) is not supported. Returning a Promise!`
            );
            return textureFromExpoAsync(asset);
          }
        }
        return originalTextureFrom(...props);
      },
      fromExpoAsync: textureFromExpoAsync,
    },
    Sprite: {
      ...PIXI.Sprite,
      fromExpoAsync: spriteFromExpoAsync,
      from: (...props) => {
        if (Platform.OS === 'web') {
          return originalSpriteFrom(...props);
        }
        if (props.length && props[0]) {
          let asset = props[0];
          if (isAsset(asset)) {
            const image = new HTMLImageElement(asset);
            return originalSpriteFrom(image);
          } else if (typeof asset === 'string' || typeof asset === 'number') {
            console.warn(
              `PIXI.Sprite.from(asset: ${typeof asset}) is not supported. Returning a Promise!`
            );
            return spriteFromExpoAsync(asset);
          }
        }

        return originalSpriteFrom(...props);
      },
    },
  };
}

export default PIXI;
