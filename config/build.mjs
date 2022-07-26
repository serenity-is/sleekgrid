import esbuild from "esbuild";
import { sleekgridBuildOptions, sleekgridEsmBuildOptions, slickCoreBuildOptions, slickGridBuildOptions } from "./esbuildOptions.mjs";

for (var esmOpt of [sleekgridEsmBuildOptions, sleekgridBuildOptions, slickCoreBuildOptions, slickGridBuildOptions]) {
    esbuild.build(esmOpt).catch(() => process.exit());
}
