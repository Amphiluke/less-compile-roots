export default {
    input: "src/index.mjs",
    output: {
        file: "dist/index.cjs",
        format: "cjs",
        interop: false
    },
    external: () => true
};
