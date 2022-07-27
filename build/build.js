import esbuild from "esbuild";
import { compatCore, compatGrid, sleekIndex } from "./defines.js";

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
