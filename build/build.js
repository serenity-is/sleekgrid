import esbuild from "esbuild";
import { compatCore, compatFormatters, compatGrid, compatLayoutsFrozen, sleekIndex } from "./defines.js";
import { existsSync, cpSync, mkdirSync } from "fs";
import { resolve, join } from "path";
import { fileURLToPath } from 'url';

for (var esmOpt of [compatCore, compatGrid, compatFormatters, compatLayoutsFrozen, sleekIndex]) {
    await esbuild.build({
        ...esmOpt,
    }).catch(() => process.exit());

    await esbuild.build({
        ...esmOpt,
        minify: true,
        outfile: esmOpt.outfile.replace(/\.js/, '.min.js')
    }).catch(() => process.exit());
}

const root = resolve(join(fileURLToPath(new URL('.', import.meta.url)), '../'));
if (existsSync(join(root, "docs/_config.yml"))) {
    const target = join(root, 'docs/assets/local');
    if (!existsSync(target)) {
        mkdirSync(target);
    }

    existsSync(join(root, 'css')) && cpSync(join(root, 'css'), join(target, 'css'), { force: true, recursive: true });
    existsSync(join(root, 'dist')) && cpSync(join(root, 'dist'), join(target, 'dist'), { force: true, recursive: true });
    existsSync(join(root, 'lib')) && cpSync(join(root, 'lib'), join(target, 'lib'), { force: true, recursive: true });
}
