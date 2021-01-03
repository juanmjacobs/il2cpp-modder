const { buildHook, hookDataThis } = require("./hookUtils");

const pathMemoryHack = (options, mod) => {
    const { className, name, rva } = options;
    const property = hookDataThis(options);
    const thisName = `${name}This`;
    const hackedBody = () => `
    uintptr_t ${thisName} = (uintptr_t)thisReference;
    if ((*myHookedData).${property} != ${thisName}) 
    {
        printf("Reassigning ${property} from %x to %x\\n", (*myHookedData).${property}, ${thisName});
        (*myHookedData).${property} = ${thisName};
    }
    return original${name}(thisReference);`;

    const definition =  buildHook(options, hackedBody)
    return definition;
}

module.exports = pathMemoryHack;