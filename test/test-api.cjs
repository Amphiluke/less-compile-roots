let {compileRoots} = require("less-compile-roots");

compileRoots({
    pattern: "less/**/*.less"
})
.then(rootEntries => {
    console.info("Compiled root files:");
    console.info(rootEntries.join("\n"));
})
.catch(reason => {
    console.error(reason);
});
