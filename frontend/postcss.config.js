module.exports = {
  plugins: [
    require('autoprefixer'),
    require('postcss-preset-env')({
      features: {
        'nesting-rules': true,
        'custom-properties': false
      },
      browsers: 'last 2 versions'
    })
  ]
}