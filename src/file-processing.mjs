let fs = require("fs");

export function readFile(path) {
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

export function writeFile(path, data) {
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

export function setExt(path, ext, oldExtRE = /\.less$/) {
    return path.replace(oldExtRE, "") + ext;
}
