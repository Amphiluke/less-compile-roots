import {readFile, writeFile, glob} from "node:fs/promises";
import path from "node:path";

let setExt = (path, ext, oldExtRE = /\.less$/) => path.replace(oldExtRE, "") + ext;

async function getImports(entries) {
    let commentRE = /\/\*[\s\S]*?\*\/|\/\/\s*@import[^;]+;/g;
    let importRE = /(?<=@import\s[^"']*["']).+?(?=['"]\s*;)/g;
    let promises = entries.map(async entry => {
        let data = await readFile(entry, "utf8");
        data = data.replace(commentRE, "");
        let dir = path.dirname(entry);
        return (data.match(importRE) || []).map(importPath => {
            importPath = path.join(dir, importPath);
            if (!path.extname(importPath)) {
                importPath += ".less";
            }
            return importPath;
        });
    });
    let importLists = await Promise.all(promises);
    return new Set(importLists.flat());
}

async function compile(entries, lessOptions) {
    let less = (await import("less")).default;
    let inlineMap = lessOptions.sourceMap && lessOptions.sourceMap.sourceMapFileInline;
    let promises = entries.map(async entry => {
        let data = await readFile(entry, "utf8");
        let {css, map} = await less.render(data, {
            ...lessOptions,
            filename: entry
        });
        let writeCSS = writeFile(setExt(entry, ".css"), css);
        if (!map || inlineMap) {
            return writeCSS;
        }
        let writeMap = writeFile(setExt(entry, ".css.map"), map);
        return Promise.all([writeCSS, writeMap]);
    });
    return Promise.all(promises);
}

export async function getRoots({pattern, globOptions = {}}) {
    let entries = await Array.fromAsync(glob(pattern, globOptions));
    let importSet = await getImports(entries);
    return entries.filter(entry => !importSet.has(path.normalize(entry)));
}

export async function compileRoots({pattern, lessOptions = {}, globOptions = {}}) {
    let rootEntries = await getRoots({pattern, globOptions});
    await compile(rootEntries, lessOptions);
    return rootEntries;
}
