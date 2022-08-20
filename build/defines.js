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

export const compatDefaults = {
    bundle: true,
    target: 'es6',
    format: 'iife',
    globalName: 'Slick._',
    color: true,
    logLevel: 'info',
    sourcemap: true,
    footer: {
        js: '["Editors", "Formatters", "Plugins"].forEach(ns => Slick._[ns] && (Slick[ns] = Object.assign(Slick[ns] || {}, Slick._[ns])) && delete Slick._[ns]); Object.assign(Slick, Slick._); delete Slick._;'
    }
}

export const compatCore = {
    ...compatDefaults,
    entryPoints: ['./src/core/index.ts'],
    outfile: './dist/compat/slick.core.js'
}

export const compatGrid = {
    ...compatDefaults,
    entryPoints: ['./src/grid/index.ts'],
    outfile: './dist/compat/slick.grid.js',
    plugins: [globalExternals(/\.\.\/core/, {
        Slick: ["addClass", "applyFormatterResultToCellNode", "columnDefaults", "convertCompatFormatter", "escape", "defaultColumnFormat", "disableSelection", "Event", "EventData", "GlobalEditorLock", "H", "keyCode", "NonDataRow", "preClickClassName", "removeClass", "spacerDiv", "Range", "RowCell"],
    })]
}

export const compatFormatters = {
    ...compatDefaults,
    entryPoints: ['./src/formatters/index.ts'],
    outfile: './dist/compat/slick.formatters.js',
    plugins: [globalExternals(/\.\.\/core/, {
        Slick: [ "escape" ],
    })]
}

export const compatEditors = {
    ...compatDefaults,
    entryPoints: ['./src/editors/index.ts'],
    outfile: './dist/compat/slick.editors.js',
    plugins: [globalExternals(/\.\.\/core/, {
        Slick: [ "escape", "H", "keyCode" ],
    })]
}

export const compatLayoutsFrozen = {
    ...compatDefaults,
    entryPoints: ['./src/layouts/frozenlayout.ts'],
    outfile: './dist/compat/layouts/slick.frozenlayout.js',
    plugins: [globalExternals(/\.\.\/core/, {
        Slick: ["disableSelection", "H", "spacerDiv"],
    })]
}

export const sleekDefaults = {
    bundle: true,
    target: 'es6',
    color: true,
    logLevel: 'info'
}

export const sleekIndex = {
    ...sleekDefaults,
    format: 'esm',
    entryPoints: ['./src/index.ts'],
    outfile: './dist/index.js'
}
