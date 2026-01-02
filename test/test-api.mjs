import {getRoots, compileRoots} from "less-compile-roots";

console.info("Found root files:");
console.info((await getRoots({pattern: "less/**/*.less"})).join("\n"));

let rootEntries = await compileRoots({
    pattern: "less/**/*.less",
    lessOptions: {
        sourceMap: {}
    }
});
console.info("\nCompiled root files:");
console.info(rootEntries.join("\n"));
