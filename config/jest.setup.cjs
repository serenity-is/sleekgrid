const fs = require("fs");

for (var url of [
    "node_modules/jquery/dist/jquery.slim.min.js",
    "lib/jquery.event.drag-2.3.0.js"
]) {
    var content = fs.readFileSync(url, 'utf-8');
    window.eval(content);
}
