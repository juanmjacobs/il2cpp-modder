const { buildHook } = require("./hookUtils");

const replaceArguments = (options, mod, functionName) => {
    const { name } = options;
    const hackedBody = () => `return original_${functionName}(thisReference, ${mod.args.join(", ")});`
    const definition =  buildHook(options, hackedBody);
    return definition;
}

module.exports = replaceArguments;