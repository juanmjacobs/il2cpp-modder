const { buildHook } = require("./hookUtils");

const fixedReturnValue = (options, mod) => {
    const { name } = options;
    const hackedBody = () => `return ${mod.args};`;
    const definition =  buildHook(options, hackedBody);
    return definition;
}

module.exports = fixedReturnValue;