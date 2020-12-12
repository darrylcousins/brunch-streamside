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
      ['env', {
        'targets': {
          'browsers': ['last 2 versions', 'safari >= 7']
        },
        //'debug': true,
        'useBuiltIns': 'usage',
        //'modules': false
      }], 
      'react'
    ]
  },
  sass: {
    options: {
      includePaths: [
        'app/styles', 'node_modules/'
      ]
    }
  }
};
