const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      inject: false,
      supabaseUrl: process.env.SUPABASE_URL || '',
      supabaseKey: process.env.SUPABASE_PUBLISHABLE_KEY || '',
    }),
    new CopyPlugin({
      patterns: [
        { from: 'Horizontal ID.jpg', to: 'Horizontal ID.jpg' },
        { from: 'Horizontal ID Updated Back with QR.jpg', to: 'Horizontal ID Updated Back with QR.jpg' },
        { from: 'Horizontal ID Back with QR.jpg', to: 'Horizontal ID Back with QR.jpg' },
        { from: 'icon.svg', to: 'icon.svg' },
        { from: 'favicon.ico', to: 'favicon.ico' },
        { from: 'robots.txt', to: 'robots.txt' },
        { from: 'icon.png', to: 'icon.png' },
        { from: '404.html', to: '404.html' },
        { from: 'site.webmanifest', to: 'site.webmanifest' },
      ],
    }),
  ],
});
