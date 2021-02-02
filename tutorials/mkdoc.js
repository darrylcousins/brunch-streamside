const fs = require('fs');
const path = require('path');

//const comment =` * @author Darryl Cousins <darryljcousins@gmail.com>`
const dir = "./app/form/fields";

const doSo = (f) => {
    const fp = path.join(dir, f);
  //console.log(fp);
    let count = 0;
    const lines = []
    if (true) {
      fs.readFileSync(fp).toString().split('\n').forEach(function (line) { 
        if (line.match(/^function/) && count === 0) {
          let name = line.split(' ')[1];
          if (name.startsWith('*')) name = name.slice(1);
          name = name.split('(')[0];
          count = 1;
          const comment =`/**
*
* @function ${name}
* @param {object} props The property object
*/`
          lines.push(comment);
        }
        lines.push(line);
      });
      //console.log(lines.join('\n'));
      fs.writeFileSync(fp, lines.join('\n'));
    }
};

fs.readdir(dir, (err, files) => {
  files.forEach(f => {
    if (f.endsWith('.js')) {
      //console.log(f);
      doSo(f);
    }
  });
});
