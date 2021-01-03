const buildHook = require("./buildHook");

const replaceArguments = (options, mod) => {
    const { name } = options;
    const hackedBody = () => `return original${name}(thisReference, ${mod.args.join(", ")});`
    const definition =  buildHook(options, hackedBody);
    return definition;
}

module.exports = replaceArguments;