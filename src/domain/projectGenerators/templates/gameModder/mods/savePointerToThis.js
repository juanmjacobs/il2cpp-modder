const { buildHook, hookDataProperty } = require("./hookUtils");

const savePointerToThis = (options, mod) => {
    const { className, name, rva } = options;
    const property = hookDataProperty(options);;
    const hackedBody = () => `uintptr_t ${name}This = (uintptr_t)thisReference;
    if ((*myHookedData).${property} != thisReference) 
    {
        printf("Reassigning ${property} from %x to %x\\n", (*myHookedData).${property}, thisReference);
        (*myHookedData).${property} = thisReference;
    }
    return original${name}(thisReference);`;

    const definition =  buildHook(options, hackedBody)
    return definition;
}

module.exports = savePointerToThis;