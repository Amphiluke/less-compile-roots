'use strict';

var promises = require('node:fs/promises');
var path = require('node:path');

let setExt = (path, ext, oldExtRE = /\.less$/) => path.replace(oldExtRE, "") + ext;

let flat = Array.prototype.flat ? list => list.flat() : list => [].concat(...list);

async function getImports(entries) {
    let commentRE = /\/\*[\s\S]*?\*\/|\/\/\s*@import[^;]+;/g;
    let importRE = /(?<=@import\s[^"']*["']).+?(?=['"]\s*;)/g;
    let promises$1 = entries.map(async entry => {
        let data = await promises.readFile(entry, "utf8");
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
    let importLists = await Promise.all(promises$1);
    return new Set(flat(importLists));
}

async function compile(entries, lessOptions) {
    let less = (await import('less')).default;
    let inlineMap = lessOptions.sourceMap && lessOptions.sourceMap.sourceMapFileInline;
    let promises$1 = entries.map(async entry => {
        let data = await promises.readFile(entry, "utf8");
        let {css, map} = await less.render(data, {
            ...lessOptions,
            filename: entry
        });
        let writeCSS = promises.writeFile(setExt(entry, ".css"), css);
        if (!map || inlineMap) {
            return writeCSS;
        }
        let writeMap = promises.writeFile(setExt(entry, ".css.map"), map);
        return Promise.all([writeCSS, writeMap]);
    });
    return Promise.all(promises$1);
}

async function getRoots({pattern, globOptions = {}}) {
    let entries = await Array.fromAsync(promises.glob(pattern, globOptions));
    let importSet = await getImports(entries);
    return entries.filter(entry => !importSet.has(path.normalize(entry)));
}

async function compileRoots({pattern, lessOptions = {}, globOptions = {}}) {
    let rootEntries = await getRoots({pattern, globOptions});
    await compile(rootEntries, lessOptions);
    return rootEntries;
}

exports.compileRoots = compileRoots;
exports.getRoots = getRoots;
