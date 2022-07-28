import esbuild from "esbuild";
import { compatCore, compatGrid, sleekIndex } from "./defines.js";
import { existsSync, cpSync } from "fs";
import { resolve, join } from "path";
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

for (var esmOpt of [compatCore, compatGrid, sleekIndex]) {
    await esbuild.build({
        ...esmOpt,
    }).catch(() => process.exit());

    await esbuild.build({
        ...esmOpt,
        minify: true,
        outfile: esmOpt.outfile.replace(/\.js/, '.min.js')
    }).catch(() => process.exit());
}

var myDist = resolve(__dirname, '../dist');
var ghDist = resolve(__dirname, "../gh-pages/dist");
if (existsSync(myDist) && existsSync(join(ghDist, "../_config.yml"))) {
    cpSync(myDist, ghDist, { force: true, recursive: true });
}
