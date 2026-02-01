// webpack.config.js
const path = require('path');

module.exports = {
  entry: './src/index.js', // 👈 point d'entrée de VOTRE app
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react', '@babel/preset-env']
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  // 👇 Supprime le warning des source maps
  ignoreWarnings: [/Failed to parse source map/]
};