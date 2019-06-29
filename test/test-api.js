let lessCompileRoots = require("less-compile-roots");

lessCompileRoots.compileRoots({
    pattern: "less/**/*.less"
})
.then(rootEntries => {
    console.info("Compiled root files:");
    console.info(rootEntries.join("\n"));
})
.catch(reason => {
    console.error(reason);
});
