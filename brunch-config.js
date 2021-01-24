// See http://brunch.io for documentation.
exports.files = {
  javascripts: {
    joinTo: {
      'vendor.js': /^(?!app)/,
      'app.js': /^app/
    }
  },
  stylesheets: {
    joinTo: {
      'app.css': /^app/,
      'vendor.css': /^node_modules/
    }
  }
};

exports.npm = {
  styles: {
    tachyons: ['css/tachyons.css']
  }
};

exports.plugins = {
  babel: {
    presets: [
      ['latest', {
        'targets': {
          'browsers': ['last 2 versions', 'safari >= 7']
        },
        //'debug': true,
        'useBuiltIns': 'usage',
        //'modules': true
        'include': [
          'plugin-transform-spread'
        ],
      }], 
      'react',
      'stage-3'
    ],
    plugins: []
  },
  sass: {
    options: {
      includePaths: [
        'app/styles', 'node_modules/'
      ]
    }
  }
};
