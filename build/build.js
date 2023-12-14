import esbuild from "esbuild";
import { cpSync, existsSync, mkdirSync } from "fs";
import { join, resolve } from "path";
import { fileURLToPath } from 'url';
import {
    compatCore, compatDataGroupItemMetadataProvider, compatEditors, compatFormatters, compatGrid, compatLayoutsFrozen,
    compatPluginsAutoTooltips, compatPluginsRowMoveManager, compatPluginsRowSelectionModel,
    sleekIndex, sleekGlobal
} from "./defines.js";

for (var esmOpt of [
    compatCore,
    compatGrid,
    compatFormatters,
    compatEditors,
    compatLayoutsFrozen,
    compatDataGroupItemMetadataProvider,
    compatPluginsAutoTooltips,
    compatPluginsRowMoveManager,
    compatPluginsRowSelectionModel,
    sleekIndex,
    sleekGlobal
]) {
    await esbuild.build({
        ...esmOpt,
    }).catch(() => process.exit());

    if (!esmOpt.minify) {
        await esbuild.build({
            ...esmOpt,
            minify: true,
            outfile: esmOpt.outfile.replace(/\.js/, '.min.js')
        }).catch(() => process.exit());
    }
}

const root = resolve(join(fileURLToPath(new URL('.', import.meta.url)), '../'));
if (existsSync(join(root, "docs/_config.yml"))) {
    const target = join(root, 'docs/assets/local');
    !existsSync(target) && mkdirSync(target);
    existsSync(join(root, 'css')) && cpSync(join(root, 'css'), join(target, 'css'), { force: true, recursive: true });
    existsSync(join(root, 'dist')) && cpSync(join(root, 'dist'), join(target, 'dist'), { force: true, recursive: true });
    existsSync(join(root, 'lib')) && cpSync(join(root, 'lib'), join(target, 'lib'), { force: true, recursive: true });
}
