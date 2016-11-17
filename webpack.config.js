module.exports = {
  entry: './debugger/app.jsx',
  output: {
    path: __dirname,
    filename: 'debugger.js'
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  module: {
    loaders: [
      { test: /\.jsx$/, exclude: /node_modules/, loader: "babel-loader" }
    ]
  },
  target: 'electron'
}
