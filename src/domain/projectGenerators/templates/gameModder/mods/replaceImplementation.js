const { buildHook } = require("./hookUtils");

const replaceImplementation = (options, mod, functionName) => {
    const { name } = options;
    const hackedBody = () => mod.args;
    const definition = buildHook(options, hackedBody);
    return definition;
}

module.exports = replaceImplementation;