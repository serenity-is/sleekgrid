const fs = require("fs");

for (var url of [
]) {
    var content = fs.readFileSync(url, 'utf-8');
    window.eval(content);
}
