const fs = require('fs');
const path = require('path');

const dir = "./app/components/lib";
fs.readdir(dir, (err, files) => {
  files.forEach(f => {
    const fp = path.join(dir, f);
    console.log(f);
    const [name] = f.split('.');
    let count = 0;
    const lines = []
    if (true) {
      fs.readFileSync(fp).toString().split('\n').forEach(function (line) { 
        lines.push(line);
        if (count === 0) {
          const comment =`/**
* @module app/lib/${name}
* @author Darryl Cousins <darryljcousins@gmail.com>
*/`
          lines.push(comment);
        }
        count += 1;
        //fs.appendFileSync("./output.txt", line.toString() + "\n");
      });
      console.log(lines.join('\n'));
      fs.writeFileSync(fp, lines.join('\n'));
    }
  });
});
