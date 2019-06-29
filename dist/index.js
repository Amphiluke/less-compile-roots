'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

let fs = require("fs");

function readFile(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, "utf8", (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}

function writeFile(path, data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(path, data, err => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

function setExt(path, ext, oldExtRE = /\.less$/) {
    return path.replace(oldExtRE, "") + ext;
}

let path = require("path");
let fastGlob = require("fast-glob");

let flat = Array.prototype.flat ? list => list.flat() : list => [].concat(...list);

async function getImports(entries) {
    let commentRE = /\/\*[\s\S]*?\*\/|\/\/\s*@import[^;]+;/g;
    let importRE = /(?<=@import\s[^"']*["']).+?(?=['"]\s*;)/g;
    let promises = entries.map(entry =>
        readFile(entry)
            .then(data => {
                data = data.replace(commentRE, "");
                let dir = path.dirname(entry);
                return (data.match(importRE) || []).map(importPath => {
                    importPath = path.join(dir, importPath);
                    if (!path.extname(importPath)) {
                        importPath += ".less";
                    }
                    return importPath;
                });
            })
    );
    let importLists = await Promise.all(promises);
    return new Set(flat(importLists));
}

function compile(entries, lessOptions) {
    let less = require("less");
    let inlineMap = lessOptions.sourceMap && lessOptions.sourceMap.sourceMapFileInline;
    let promises = entries.map(entry =>
        readFile(entry)
            .then(data => less.render(data, {
                ...lessOptions,
                filename: entry
            }))
            .then(({css, map}) => {
                let writeCSS = writeFile(setExt(entry, ".css"), css);
                if (!map || inlineMap) {
                    return writeCSS;
                }
                let writeMap = writeFile(setExt(entry, ".css.map"), map);
                return Promise.all([writeCSS, writeMap]);
            })
    );
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
