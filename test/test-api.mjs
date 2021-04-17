import {compileRoots} from "less-compile-roots";

let rootEntries = await compileRoots({
    pattern: "less/**/*.less"
});
console.info("Compiled root files:");
console.info(rootEntries.join("\n"));
