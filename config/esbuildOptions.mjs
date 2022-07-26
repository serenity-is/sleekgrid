export const esmTarget = {
    bundle: true,
    target: 'es6',
    color: true,
    logLevel: 'info'
}

export const compatTarget = {
    bundle: true,
    target: 'es6',
    format: 'iife',
    globalName: 'Slick',
    color: true,
    logLevel: 'info'
}

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

// coreExports = ["EditorLock", "Event", "EventData", "EventHandler", "GlobalEditorLock", "Group", "GroupTotals", "keyCode", "NonDataRow", "preClickClassName", "Range" ];
// gridExports = coreExports.concat(["Grid", "gridDefaults"]);

export const sleekgridEsmBuildOptions = {
    ...esmTarget,
    format: 'esm',
    entryPoints: ['./src/index.ts'],
    outfile: './dist/sleekgrid.esm.js'
}

export const sleekgridBuildOptions = {
    ...esmTarget,
    format: 'iife',
    globalName: 'Sleek',
    entryPoints: ['./src/index.ts'],
    outfile: './dist/sleekgrid.js'
}


export const slickCoreBuildOptions = {
    ...compatTarget,
    entryPoints: ['./src/core/index.ts'],
    outfile: './dist/slick.core.js'
}

export const slickGridBuildOptions = {
    ...compatTarget,
    entryPoints: ['./src/grid/index.ts'],
    globalName: 'Slick._',
    footer: {
        js: 'Object.assign(Slick, Slick._); delete Slick._'
    },
    outfile: './dist/slick.grid.js',
    plugins: [globalExternals(/\.\.\/core/, {
        Slick: ["Event", "EventData", "GlobalEditorLock", "keyCode", "NonDataRow", "preClickClassName", "Range"],
    })]
}