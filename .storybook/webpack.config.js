module.exports = {
  module: {
    loaders: [
      /*{
        test: /\.(jpe?g|png|gif|svg)$/i,
        loaders: [
            'file?hash=sha512&digest=hex&name=[hash].[ext]',
            'image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false'
        ]
      },
      {
        test: /\.scss$/,
        loaders: ['style', 'css', 'sass']
      },*/
      {
        test: /\.css$/,
        loaders: ['style', 'css']
      },
      /*{
        test   : /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
        loader : 'file-loader'
      },*/
      { test: /\.md$/, loader: 'null' },
      {
          test: /epub-gen/,
          loader: 'file-loader'
      }
    ]
  },
  node: {
    child_process: 'empty'
  }
};
