import esbuild from "esbuild";
import { compatCore, compatGrid, sleekIndex } from "./defines.js";

for (var esmOpt of [compatCore, compatGrid, sleekIndex]) {
    esbuild.build({
        ...esmOpt,
    }).catch(() => process.exit());

    esbuild.build({
        ...esmOpt,
        minify: true,
        outfile: esmOpt.outfile.replace(/\.js/, '.min.js')
    }).catch(() => process.exit());
}
