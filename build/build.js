
import esbuild from "esbuild";
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join, resolve } from "path";
import { fileURLToPath } from 'url';

export function globalExternals(filter, externals) {
    return {
        name: "global-externals",
        setup(build) {
            build.onResolve({ filter }, (args) => {
                return {
                    path: '_',
                    namespace: 'global-externals'
                };
            });

            build.onLoad(
                {
                    filter: /^\_$/,
                    namespace: "global-externals",
                },
                async (args) => {
                    return {
                        contents: Object.keys(externals).map(k => `const { ${externals[k].join(', ')} } = ${k};`).join('\n') +
                            'export {\n ' + Object.keys(externals).map(k => '    ' + externals[k].join(', ')).join(',\n') + '\n};',
                        loader: "js"
                    };
                }
            );
        },
    };
}

const compatDefaults = {
    bundle: true,
    target: 'es6',
    format: 'iife',
    globalName: 'Slick._',
    color: true,
    logLevel: 'info',
    sourcemap: true,    
    footer: {
        js: '["Data", "Editors", "Formatters", "Plugins"].forEach(ns => Slick._[ns] && (Slick[ns] = Object.assign(Slick[ns] || {}, Slick._[ns])) && delete Slick._[ns]); Object.assign(Slick, Slick._); delete Slick._;'
    }
}

const compatCore = {
    ...compatDefaults,
    entryPoints: ['./src/core/index.ts'],
    outfile: './dist/compat/slick.core.js',
    footer: {
        js: compatDefaults.footer.js + " Slick.Event = Slick.EventEmitter; Slick.EventHandler = Slick.EventSubscriber; typeof Map !== 'undefined' && (Slick.Map = Map);"
    }    
}

const compatGrid = {
    ...compatDefaults,
    entryPoints: ['./src/grid/index.ts'],
    outfile: './dist/compat/slick.grid.js',
    plugins: [globalExternals(/\.\.\/core/, {
        Slick: ["addClass", "applyFormatterResultToCellNode", "columnDefaults", "convertCompatFormatter", "ensureUniqueColumnIds", "escape", "defaultColumnFormat", "disableSelection", "EventEmitter", "EventData", "GlobalEditorLock", "initializeColumns", "H", "keyCode", "NonDataRow", "parsePx", "preClickClassName", "Range", "removeClass", "RowCell", "spacerDiv", "titleize"]
    })]
}

const compatFormatters = {
    ...compatDefaults,
    entryPoints: ['./src/formatters/index.ts'],
    outfile: './dist/compat/slick.formatters.js',
    plugins: [globalExternals(/\.\.\/core/, {
        Slick: [ "escape" ]
    })]
}

const compatEditors = {
    ...compatDefaults,
    entryPoints: ['./src/editors/index.ts'],
    outfile: './dist/compat/slick.editors.js',
    plugins: [globalExternals(/\.\.\/core/, {
        Slick: [ "escape", "H", "keyCode", "parsePx" ]
    })]
}

const compatLayoutsFrozen = {
    ...compatDefaults,
    entryPoints: ['./src/layouts/frozenlayout.ts'],
    outfile: './dist/compat/layouts/slick.frozenlayout.js',
    plugins: [globalExternals(/\.\.\/core/, {
        Slick: ["disableSelection", "H", "parsePx", "spacerDiv"]
    })]
}

const compatPluginsAutoTooltips = {
    ...compatDefaults,
    entryPoints: ['./src/plugins/autotooltips.ts'],
    outfile: './dist/compat/plugins/slick.autotooltips.js',
    plugins: [globalExternals(/\.\.\/(core|grid)/, {
        Slick: []
    })]
}

const compatPluginsRowMoveManager = {
    ...compatDefaults,
    entryPoints: ['./src/plugins/rowmovemanager.ts'],
    outfile: './dist/compat/plugins/slick.rowmovemanager.js',
    plugins: [globalExternals(/\.\.\/(core|grid)/, {
        Slick: ["EventEmitter", "EventSubscriber", "H"]
    })]
}

const compatPluginsRowSelectionModel = {
    ...compatDefaults,
    entryPoints: ['./src/plugins/rowselectionmodel.ts'],
    outfile: './dist/compat/plugins/slick.rowselectionmodel.js',
    plugins: [globalExternals(/\.\.\/(core|grid)/, {
        Slick: ["EventEmitter", "EventSubscriber", "Range"]
    })]
}

const compatDataGroupItemMetadataProvider = {
    ...compatDefaults,
    entryPoints: ['./src/data/groupitemmetadataprovider.ts'],
    outfile: './dist/compat/slick.groupitemmetadataprovider.js',
    plugins: [globalExternals(/\.\.\/(core|grid)/, {
        Slick: [ "convertCompatFormatter", "Group" ]
    })],
    footer: {
        js: compatDefaults.footer.js + " Slick.Data = Slick.Data || {}; Slick.Data.GroupItemMetadataProvider = Slick.GroupItemMetadataProvider;"
    }
}

const sleekDefaults = {
    bundle: true,
    entryPoints: ['./src/index.ts'],
    color: true,
    logLevel: 'info',
    target: 'es6',
    sourcemap: true
}

const sleekIndex = {
    ...sleekDefaults,
    format: 'esm',
    minify: true,
    outfile: './dist/index.js'
}

const sleekGlobal = {
    ...sleekDefaults,
    globalName: compatCore.globalName,
    format: 'iife',
    footer: compatCore.footer,
    outfile: './wwwroot/index.global.js'
}

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

function writeIfDifferent(target, content) {
    if (!existsSync(target) ||
        readFileSync(target, 'utf8') != content) {
        writeFileSync(target, content);
    }
}

function copyIfDifferent(source, target) {
    var content = readFileSync(source, 'utf8').replace(/^\/\/#\s*sourceMappingURL=.*\.map\s*$/mg, '');
    writeIfDifferent(target, content);
}

const assetsSlick = resolve(join(root, '..', '..', 'src', 'Serenity.Assets', 'wwwroot', 'Scripts', 'SlickGrid'));

if (existsSync(join(assetsSlick, 'slick.core.js'))) {
    const minify = true;
    for (var esmOpt of [
        { file: 'layouts/slick.frozenlayout.js' },
        { file: 'plugins/slick.autotooltips.js', minify },
        { file: 'plugins/slick.rowmovemanager.js' },
        { file: 'plugins/slick.rowselectionmodel.js' },
        { file: 'slick.core.js', minify },
        { file: 'slick.editors.js' },
        { file: 'slick.formatters.js' },
        { file: 'slick.grid.js', minify },
        { file: 'slick.groupitemmetadataprovider.js', minify }
    ]) {
        var shouldMinify = esmOpt.minify;
        var sourceFile = join('./dist/compat/' + esmOpt.file);
        var targetFile = join(assetsSlick, esmOpt.file).replace('/plugins/', '/Plugins/');
        copyIfDifferent(sourceFile, targetFile);
        if (shouldMinify)
            copyIfDifferent(sourceFile.replace(/\.js$/, '.min.js'), targetFile.replace(/\.js$/, '.min.js'));
    }
}