#!/usr/bin/env node

let lessCompileRoots = require("less-compile-roots");
let {name, version, description, homepage} = require("../package.json");

let handlers = {
    help() {
        console.info(`
${name} v${version}
${description}
${homepage}

Usage:
  less-compile-roots --pattern=<glob>
  less-compile-roots --config=<path>
  less-compile-roots --help
  less-compile-roots --version

Options:
  --pattern=<glob>   Glob pattern (or several comma-separated patterns)
  --config=<path>    Use config from the specified file
  -h, --help         Display usage info
  -v, --version      Print the installed package version`);
    },

    version() {
        console.info(version);
    },

    compile(config) {
        console.info("Compiling, please wait...");
        lessCompileRoots.compileRoots(config)
            .then(() => {
                console.info("Done!");
            })
            .catch(reason => {
                console.error(reason);
            });
    }
};

let [,, ...args] = process.argv;
function getArg(name) {
    for (let arg of args) {
        if (arg === name) {
            return true;
        }
        if (arg.startsWith(name + "=")) {
            return arg.slice(name.length + 1);
        }
    }
    return undefined;
}

(() => {
    if (getArg("--help") || getArg("-h")) {
        handlers.help();
        return;
    }

    if (getArg("--version") || getArg("-v")) {
        handlers.version();
        return;
    }

    let pattern = getArg("--pattern");
    let configPath = getArg("--config");
    if (pattern) {
        if (configPath) {
            console.warn("The ‘--config’ option is ignored when the ‘--pattern’ option is present!");
        }
        handlers.compile({pattern: pattern.split(",")});
    } else if (configPath) {
        let path = require("path");
        configPath = path.join(process.cwd(), configPath);
        let config = require(configPath);
        if (config[Symbol.toStringTag] === "Module") { // ES module?
            config = config.default;
        }
        handlers.compile(config);
    } else {
        console.error("You must either specify the file pattern or provide the config file path");
        console.info("Run ‘less-compile-roots --help’ to get usage info");
        process.exitCode = 1;
    }
})();
