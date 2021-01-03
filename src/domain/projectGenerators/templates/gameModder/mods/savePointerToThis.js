const buildHook = require("./buildHook");

const savePointerToThis = (options, mod) => {
    const { className, name, rva } = options;
    const hookDataProperty = `${className}_${name}_this`;
    const hackedBody = () => `uintptr_t ${name}This = (uintptr_t)thisReference;
    if ((*myHookedData).${hookDataProperty} != thisReference) 
    {
        printf("Reassigning ${name}This from %x to %x\\n", (*myHookedData).${hookDataProperty}, thisReference);
        (*myHookedData).${hookDataProperty} = thisReference;
    }
    return original${name}(thisReference);`;

    const definition =  buildHook(options, hackedBody)
    return definition;
}

module.exports = savePointerToThis;