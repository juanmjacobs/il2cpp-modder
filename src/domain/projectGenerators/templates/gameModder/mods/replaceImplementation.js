const { buildHook } = require("./hookUtils");

const replaceImplementation = (options, mod) => {
    const { name } = options;
    const hackedBody = () => mod.args;
    const definition = buildHook(options, hackedBody);
    return definition;
}

module.exports = replaceImplementation;