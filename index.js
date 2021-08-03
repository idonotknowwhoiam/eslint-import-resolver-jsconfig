const path = require("path");
const findRoot = require("find-root");
const fs = require("fs");
const resolve = require("resolve");
const globParent = require("glob-parent");

exports.interfaceVersion = 2;

exports.resolve = function (source, file, config) {
    const _configPath = config.config;
    let jsConfig;
    let packageDir;

    let configPath = typeof _configPath === "string" ? path.resolve(_configPath) : _configPath;

    if (!configPath || typeof configPath === "string") {
        if (!configPath || !path.isAbsolute(configPath)) {
            packageDir = findRoot(path.resolve(file));
            if (!packageDir) throw new Error("package not found above " + file);
        }

        configPath = findConfigPath(configPath, packageDir);

        if (configPath) {
            try {
                jsConfig = require(configPath);
            } catch (e) {
                console.log("Error resolving jsConfig", e);
                throw e;
            }
        } else {
            jsConfig = {};
        }
    } else {
        jsConfig = configPath;
        configPath = null;
    }

    const aliases = jsConfig.compilerOptions.paths;

    const packages = (config.packages || [])
        .map((pkg) => {
            const parent = path.resolve(process.cwd(), globParent(pkg));
            const dir = fs
                .readdirSync(parent)
                .map((name) => path.resolve(parent, name))
                .filter((name) => !fs.statSync(name).isFile());
            return dir;
        })
        .reduce((prev, curr) => prev.concat(curr), []);

    try {
        const modifiedSource = Object.keys(aliases || {}).reduce((currentSource, initPrefix) => {
            const prefix = initPrefix.replace(/\/\*/gm, "");
            let ret = currentSource;

            if (currentSource.indexOf(prefix) === 0 && currentSource[prefix.length] === "/") {
                const prefixPath = getPath(getAliasValue(aliases, initPrefix), file, packages);
                ret = `${prefixPath}${currentSource.substr(prefix.length)}`;
            } else if (currentSource === prefix) {
                ret = getPath(getAliasValue(aliases, initPrefix), file, packages);
            }

            return ret;
        }, source);

        const resolvedPath = resolve.sync(modifiedSource, getOptions(file, config));
        return { found: true, path: resolvedPath };
    } catch (e) {
        console.log(e);
        return { found: false };
    }
};

function getPath(configPath, filepath, packages) {
    const workspaces = packages.filter(
        (pkg) => filepath.indexOf(pkg) === 0 && filepath[pkg.length] === "/"
    );
    const relativeRoot = workspaces[0] || process.cwd();
    return path.resolve(relativeRoot, configPath);
}

function getAliasValue(aliases, prefix) {
    return aliases[prefix][0].replace(/\*/gm, "");
}

function findConfigPath(configPath, packageDir) {
    if (path.isAbsolute(configPath)) {
        return configPath;
    }
    configPath = path.join(packageDir, configPath);
    return configPath;
}

function getOptions(file, config) {
    return {
        extensions: config.extensions || [".js", ".jsx"],
        basedir: path.dirname(path.resolve(file)),
        packageFilter(pkg) {
            pkg.main = pkg["jsnext:main"] || pkg.main;
            return pkg;
        },
    };
}
