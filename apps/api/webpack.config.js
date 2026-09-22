const path = require('path');

module.exports = function (options) {
  return {
    ...options,
    resolve: {
      ...options.resolve,
      alias: {
        ...(options.resolve && options.resolve.alias),
        '@fmr/shared': path.resolve(__dirname, '../../packages/shared/src/index.ts'),
      },
      extensions: ['.ts', '.js'],
    },
  };
};
