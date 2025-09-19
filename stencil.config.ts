import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'fab-components',
  globalStyle: 'src/style/global.css',

  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
      copy: [{ src: 'style/fonts', dest: 'fonts' }],
    },
    {
      type: 'dist-custom-elements',
      customElementsExportBehavior: 'auto-define-custom-elements',
      externalRuntime: false,
    },
    {
      type: 'docs-readme',
    },
    {
      type: 'www',
      serviceWorker: null, // disable service workers
      copy: [{ src: 'style/fonts', dest: 'fonts' }],
    },
  ],
  testing: {
    browserHeadless: 'shell',
  },
  plugins: [],
};
