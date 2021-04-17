'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var fs = require('fs');
var path = require('path');
var fastGlob = require('fast-glob');

function _interopNamespaceDefaultOnly(e) {
    return Object.freeze({__proto__: null, 'default': e});
}

let setExt = (path, ext, oldExtRE = /\.less$/) => path.replace(oldExtRE, "") + ext;

let flat = Array.prototype.flat ? list => list.flat() : list => [].concat(...list);

async function getImports(entries) {
    let commentRE = /\/\*[\s\S]*?\*\/|\/\/\s*@import[^;]+;/g;
    let importRE = /(?<=@import\s[^"']*["']).+?(?=['"]\s*;)/g;
    let promises = entries.map(async entry => {
        let data = await fs.promises.readFile(entry, "utf8");
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
    return new Set(flat(importLists));
}

async function compile(entries, lessOptions) {
    let less = (await Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespaceDefaultOnly(require('less')); })).default;
    let inlineMap = lessOptions.sourceMap && lessOptions.sourceMap.sourceMapFileInline;
    let promises = entries.map(async entry => {
        let data = await fs.promises.readFile(entry, "utf8");
        let {css, map} = await less.render(data, {
            ...lessOptions,
            filename: entry
        });
        let writeCSS = fs.promises.writeFile(setExt(entry, ".css"), css);
        if (!map || inlineMap) {
            return writeCSS;
        }
        let writeMap = fs.promises.writeFile(setExt(entry, ".css.map"), map);
        return Promise.all([writeCSS, writeMap]);
    });
    return Promise.all(promises);
}

async function getRoots({pattern, globOptions = {}}) {
    let entries = await fastGlob(pattern, globOptions);
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
