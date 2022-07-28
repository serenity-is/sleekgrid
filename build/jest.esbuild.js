import { relative, extname, basename } from 'path'
import fs from 'fs'
import { createHash } from 'crypto'
import { fileURLToPath } from 'url'
import { transformSync } from 'esbuild'

const __filename = fileURLToPath(import.meta.url)
const THIS_FILE = fs.readFileSync(__filename)

const loaders = ["js", "jsx", "ts", "tsx", "json"];

const getExt = (str) => {
    const baseName = basename(str);
    const firstDot = baseName.indexOf('.');
    const lastDot = baseName.lastIndexOf('.');
    const ext = extname(baseName).replace(/(\.[a-z0-9]+).*/i, '$1');

    if (firstDot === lastDot) return ext;

    return baseName.slice(firstDot, lastDot) + ext;
}

export function resolveOptions(userOptions) {
    return {
        format: 'cjs',
        target: 'es2019',
        sourcemap: true,
        ...userOptions,
    }
}

const createTransformer = (userOptions = {}) => {
    const options = resolveOptions(userOptions)

    return {
        canInstrument: true,
        getCacheKey(fileData, filePath, transformOptions) {
            const { config, instrument, configString } = transformOptions

            return createHash('md5')
                .update(THIS_FILE)
                .update('\0', 'utf8')
                .update(JSON.stringify(options))
                .update('\0', 'utf8')
                .update(fileData)
                .update('\0', 'utf8')
                .update(relative(config.rootDir, filePath))
                .update('\0', 'utf8')
                .update(configString)
                .update('\0', 'utf8')
                .update(filePath)
                .update('\0', 'utf8')
                .update(instrument ? 'instrument' : '')
                .update('\0', 'utf8')
                .update(process.env.NODE_ENV || '')
                .digest('hex')
        },
        process(content, filename, opts) {
            // adapted from https://github.com/aelbore/esbuild-jest without jest.spy fix using babel
            // see https://github.com/kulshekhar/ts-jest/issues/90 for jest.spy workaround (evanw's second comment from end)

            const sources = { code: content }
            const ext = getExt(filename), extName = extname(filename).slice(1)

            const enableSourcemaps = options?.sourcemap || false
            const loader = (options?.loaders && options?.loaders[ext]
                ? options.loaders[ext]
                : loaders.includes(extName) ? extName : 'text'
            )
            const sourcemaps = enableSourcemaps
                ? { sourcemap: true, sourcesContent: false, sourcefile: filename }
                : {}

            const result = transformSync(sources.code, {
                loader,
                format: options?.format || 'cjs',
                target: options?.target || 'es2018',
                ...(options?.jsxFactory ? { jsxFactory: options.jsxFactory } : {}),
                ...(options?.jsxFragment ? { jsxFragment: options.jsxFragment } : {}),
                ...sourcemaps
            })

            let { map, code } = result;
            if (enableSourcemaps) {
                map = {
                    ...JSON.parse(result.map),
                    sourcesContent: null,
                }

                // Append the inline sourcemap manually to ensure the "sourcesContent"
                // is null. Otherwise, breakpoints won't pause within the actual source.
                code = code + '\n//# sourceMappingURL=data:application/json;base64,' + Buffer.from(JSON.stringify(map)).toString('base64')
            } else {
                map = null
            }

            return { code, map }
        }
    }
}

export default {
    createTransformer
}