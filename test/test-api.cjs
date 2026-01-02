let {getRoots, compileRoots} = require("less-compile-roots");

getRoots({pattern: "less/**/*.less"})
    .then(rootEntries => {
        console.info("Found root files:");
        console.info(rootEntries.join("\n"));
    })
    .then(() => compileRoots({
        pattern: "less/**/*.less",
        lessOptions: {
            sourceMap: {}
        }
    }))
    .then(rootEntries => {
        console.info("\nCompiled root files:");
        console.info(rootEntries.join("\n"));
    })
    .catch(reason => {
        console.error(reason);
    });
