const { buildHook, hookDataThis } = require("./hookUtils");

const pathMemoryHack = (options, mod, functionName) => {
    const { className, name, rva } = options;
    const property = hookDataThis(options);
    const thisName = `${name}This`;
    const hackedBody = () => `
    uintptr_t ${thisName} = (uintptr_t)thisReference;
    if ((*myHookedData).${property} != ${thisName}) 
    {
        printf("\\n(Reassigning ${property} from %x to %x)\\n", (*myHookedData).${property}, ${thisName});
        (*myHookedData).${property} = ${thisName};
    }
    return original_${functionName}(thisReference);`;

    const definition =  buildHook(options, hackedBody)
    return definition;
}

module.exports = pathMemoryHack;