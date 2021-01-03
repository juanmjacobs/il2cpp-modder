const buildHook = require("./buildHook");

const replaceImplementation = (options, mod) => {
    const { name } = options;
    const hackedBody = mod.args;
    const definition = buildHook(options, args);
    return definition;
}

module.exports = replaceImplementation;