const { ModuleFederationPlugin } = require('webpack').container;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { whenDev } = require('@craco/craco');
const { dependencies } = require('../package.json');

const namespace = 'mfe-1';

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      webpackConfig.output.publicPath = 'auto';

      // Thanks to: https://github.com/webpack/webpack-dev-server/issues/3038
      whenDev(() => {
        webpackConfig.plugins.push(
          new HtmlWebpackPlugin({
            excludeChunks: [namespace],
            inject: true,
            template: paths.appHtml,
          }),
        );
      }, []);

      return webpackConfig;
    },
    plugins: {
      remove: [whenDev(() => 'HtmlWebpackPlugin')],
      add: [
        new ModuleFederationPlugin({
          name: namespace,
          filename: 'remoteEntry.js',
          exposes: {
            './ContactForm': './src/mfe/ContactForm.tsx',
          },
          remotes: {},
          shared: {
            ...dependencies,
            react: {
              singleton: true,
              import: 'react', // fallback is also react
              shareScope: 'default',
              requiredVersion: dependencies.react,
            },
            'react-dom': {
              singleton: true,
              requiredVersion: dependencies['react-dom'],
            },
          },
        }),
      ],
    },
  },
};
