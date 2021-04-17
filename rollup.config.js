export default {
    input: "src/index.mjs",
    output: {
        file: "dist/index.cjs",
        format: "cjs",
        interop: id => id === "less" ? "defaultOnly" : "default"
    },
    external: () => true
};
