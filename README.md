# less-compile-roots

It is a common practice to modularize Less files (on a component or similar base) and then combine (`@import`) them in several resulting bundles. In most cases you only want to compile those resulting bundles to get a few combined CSS files, while compiling every single component file is pointless and time-wasting.

Unfortunately, the official Less compiler does not currently provide a way to perform such selective compilation automatically. The `less-compile-roots` module was created to meet this lack. It is a simple tool for extracting and compiling root Less files (i.e. the files that are not being imported by other Less files).

## Installation

```
npm install less-compile-roots
```

:warning: Note that the `less-compile-roots` module uses [`less`](https://www.npmjs.com/package/less) as a peer dependency, and you need to have the `less` package installed explicitly in your project as well.

## Usage

Here is a basic programmatic usage example:

```javascript
let lessCompileRoots = require("less-compile-roots");

lessCompileRoots.compileRoots({
    // Glob pattern matching existing less files
    pattern: "src/**/*.less",
    // Pass any Less.js options you need
    lessOptions: {
        sourceMap: {sourceMapFileInline: true}
    }
})
.then(rootEntries => {
    console.log("Compiled root files:");
    console.log(rootEntries.join("\n"));
})
.catch(reason => {
    console.error(reason);
});
```

If you prefer using the tool through the command line, please refer the [Command line usage](#command-line-usage) section.

## API

The following methods are exported by the `less-compile-roots` module:

### `compileRoots(options)`

The method picks out the root Less files from all files matching the provided glob pattern (`options.pattern`), and compiles them with the Less pre-processor. It returns a Promise that resolves once all these root files have been successfully compiled. The list of compiled entries is the value the promise resolves to.

The supported options are:

* `pattern` _(required)_: a glob pattern (or a list of patterns) matching your source Less files. Please refer the [fast-glob docs](https://github.com/mrmlnc/fast-glob#patterns) for details;
* `lessOptions` _(optional)_: the options object to pass to the [`less.render` method](http://lesscss.org/usage/#programmatic-usage). The [available options](http://lesscss.org/usage/#less-options) are listed in the official Less documentation;
* `globOptions` _(optional)_: the options object to pass to the fast-glob function. See their [docs](https://github.com/mrmlnc/fast-glob#options-1) for details.

### `getRoots(options)`

This methods just returns a Promise that resolves with a list of the root file paths. It accepts the same options as the [`compileRoots`](#compilerootsoptions) method except the `lessOptions` parameter. This method may be useful if you just need to get the list of root Less files without compiling them.

## Command line usage

You may also use `less-compile-roots` through the command line interface:

```sh
# Compile root files using default options
less-compile-roots --pattern=src/**/*.less

# or use custom config from a specified file
less-compile-roots --config=less-compile-config.js
```

Available options:

* `--pattern=<glob>`: a glob pattern (or several comma-separated patterns) matching your source Less files;
* `--config=<path>`: path to a config module;
* `-h`, `--help`: print CLI usage info;
* `-v`, `--version`: print the installed package version.

Note that you cannot use the options `--pattern` and `--config` together. Specifying the `--pattern` option makes the module compile Less files using all default parameters. If you need to customize the parameters, create a config file and specify the path to it through the `--config` option (or just use the module [programmatically](#api) rather than in command line). Here is an example of such config file:

```javascript
let LessPlugin = require('less-plugin-myplugin');
module.exports = {
    pattern: ["project-1/css/**/*.less", "project-2/css/**/*.less"],
    lessOptions: {
        plugins: [LessPlugin],
        sourceMap: {sourceMapFileInline: true},
        urlArgs: "t=" + Date.now()
    }
};
```

In fact, the config module just exports an object which is then used as the `options` parameter for the [compileRoots](#compilerootsoptions) method.

## Requirements

* NodeJS engine v9.11.2+
* Less pre-processor v2.0.0+

## Caveats

`less-compile-roots` is a *very simple* and tiny tool built to be fast. It uses a single plain regular expression to extract all imports from a Less file, which proves to be sufficient in the majority of cases. It is worth noticing however that there is no way to take account of all possible syntactic edge cases with a simple regular expression. So if your Less files contain some really “peculiar” or unusual code involving the `@import` statements, or kind of uncommonly commented out code mixing the imports with other stuff on one line, then please pay greater attention to the results you get, and in case of need just simplify those confusing parts in the problem files.
