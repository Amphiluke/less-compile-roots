#!/usr/bin/env node

import {default as process, argv, cwd} from "node:process";
import {join} from "node:path";
import {styleText} from "node:util";
import {compileRoots} from "less-compile-roots";
import pkg from "../package.json" with {type: "json"};

function help() {
    console.info(`
${pkg.name} v${pkg.version}
${styleText("dim", pkg.description)}
${styleText("dim", pkg.homepage)}

${styleText("bold", "Usage:")}
  less-compile-roots --pattern=<glob>
  less-compile-roots --config=<path>
  less-compile-roots --help
  less-compile-roots --version

${styleText("bold", "Options:")}
  --pattern=<glob>   Glob pattern (or several comma-separated patterns)
  --config=<path>    Use config from the specified file
  -h, --help         Display usage info
  -v, --version      Print the installed package version`);
}

function version() {
    console.info(pkg.version);
}

async function compile(config) {
    console.info("Compiling, please wait...");
    try {
        await compileRoots(config);
        console.info("Done!");
    } catch (error) {
        console.error(error);
    }
}

function getArg(name) {
    for (let arg of argv.slice(2)) {
        if (arg === name) {
            return true;
        }
        if (arg.startsWith(name + "=")) {
            return arg.slice(name.length + 1);
        }
    }
    return undefined;
}

(async () => {
    if (getArg("--help") || getArg("-h")) {
        help();
        return;
    }

    if (getArg("--version") || getArg("-v")) {
        version();
        return;
    }

    let pattern = getArg("--pattern");
    let configPath = getArg("--config");
    if (pattern) {
        if (configPath) {
            console.warn("The ‘--config’ option is ignored when the ‘--pattern’ option is present!");
        }
        compile({pattern: pattern.split(",")});
    } else if (configPath) {
        configPath = join(cwd(), configPath);
        compile((await import(configPath)).default);
    } else {
        console.error("You must either specify the file pattern or provide the config file path");
        console.info("Run ‘less-compile-roots --help’ to get usage info");
        process.exitCode = 1;
    }
})();
