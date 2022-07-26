const fs = require("fs");

for (var url of [
    "node_modules/jquery/dist/jquery.slim.min.js"
]) {
    var content = fs.readFileSync(url, 'utf-8');
    window.eval(content);
}
