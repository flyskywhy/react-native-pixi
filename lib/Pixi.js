import '@flyskywhy/react-native-browser-polyfill';

import * as PixiInstance from 'pixi.js';
import {PixelRatio, Platform} from 'react-native';

global.PIXI = global.PIXI || PixiInstance;
let PIXI = global.PIXI;
import * as filters from 'pixi-filters';
PIXI.filters = {...(PIXI.filters || {}), ...filters};

class ExpoPIXIApplication extends PIXI.Application {
  constructor({
    devicePixelRatio = 1,
    context,
    view,
    ...props
  }) {
    if (context && Platform.OS !== 'web') {
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

    // "this" also be called "app" in pixi
    // app.renderer.width === width * resolution , seems pixi will use resolution just like
    // ctx.scale(resolution, resolution) in canvas.getContext('2d') , since pixi default
    // is canvas.getContext('webgl'), so estimate pixi will use resolution in gl.viewport()
    let clientWidth = 300;
    let clientHeight = 150;
    if (context) {
      clientWidth = context.canvas.clientWidth;
      clientHeight = context.canvas.clientHeight;
    }
    if (view) {
      clientWidth = view.clientWidth;
      clientHeight = view.clientHeight;
    }
    const width = props.width || (clientWidth * PixelRatio.get() / devicePixelRatio | 0);
    const height = props.height || (clientHeight * PixelRatio.get() / devicePixelRatio | 0);

    super({
      ...props,
      context,
      view,
      resolution: 1,
      width,
      height,
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
