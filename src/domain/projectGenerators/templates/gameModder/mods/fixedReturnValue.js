const buildHook = require("./buildHook");

const fixedReturnValue = (options, mod) => {
    const { name } = options;
    const hackedBody = () => `return ${mod.args.value};`;
    const definition =  buildHook(options, hackedBody);
    return definition;
}

module.exports = fixedReturnValue;