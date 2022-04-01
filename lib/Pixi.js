import '@flyskywhy/react-native-browser-polyfill';

import * as PixiInstance from 'pixi.js';
import {Platform} from 'react-native';

global.PIXI = global.PIXI || PixiInstance;
let PIXI = global.PIXI;
import * as filters from 'pixi-filters';
PIXI.filters = {...(PIXI.filters || {}), ...filters};

class ExpoPIXIApplication extends PIXI.Application {
  constructor({
    width,
    height,
    devicePixelRatio = 1,
    backgroundColor,
    context,
    ...props
  }) {
    if (!context)
      throw new Error(
        'react-native-pixi: new Application({ context: null }): context must be a valid WebGL context.',
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

    // "this" also called "app" in pixi
    // app.renderer.width === width * resolution , seems pixi will use resolution just like
    // ctx.scale(resolution, resolution) in canvas.getContext('2d') , since pixi default
    // is canvas.getContext('webgl'), so estimate pixi will use resolution in gl.viewport()
    super({
      context,
      resolution: 1,
      width: width || context.drawingBufferWidth / devicePixelRatio,
      height: height || context.drawingBufferHeight / devicePixelRatio,
      backgroundColor,
      ...props,
    });
  }
}

if (!(PIXI.Application instanceof ExpoPIXIApplication)) {
  PIXI = {
    ...PIXI,
    Application: ExpoPIXIApplication,
  };
}

export default PIXI;
