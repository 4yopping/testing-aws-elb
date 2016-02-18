'use strict'

const BrowserSyncPlugin = require('browser-sync-webpack-plugin')

module.exports = {
  entry: {
    monitor: './js/monitor.js'
  },
  output: {
    filename: './built/[name].js'
  },
  plugins: [
    new BrowserSyncPlugin({
      server: {
        baseDir: './'
      },
      ui: false,
      ghostMode: false,
      logConnections: false,
      notify: false
    })
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel'
      },
      {
        test: /\.less$/,
        loader: 'style!css!less'
      }
    ]
  }
}
