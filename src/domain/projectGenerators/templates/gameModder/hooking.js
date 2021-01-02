const _ = require("lodash");

const baseHook = ({ name, rva }) => {  //TODO: signature?
    return `//--------${name} hook------------
typedef void* (*t${name})(void* thisReference);
uintptr_t ${name}RVA = ${rva};
t${name} ${name} = (t${name})(assemblyAddress + ${name}RVA);
t${name} original${name};`;
}

const savePointerToThis = ({ className, name, rva }, mod) => {
    const hookDataProperty = `${className}_${name}_this`;
    const definition =  `${baseHook({ name, rva })}

void* hacked${name}(void* thisReference)
{
    uintptr_t ${name}This = (uintptr_t)thisReference;
    if ((*myHookedData).${hookDataProperty} != thisReference) 
    {
        printf("Reassigning ${name}This from %x to %x\\n", (*myHookedData).${hookDataProperty}, thisReference);
        (*myHookedData).${hookDataProperty} = thisReference;
    }
    return original${name}(thisReference);
}`;
    return definition;
}

const replaceArguments = (options, mod) => {
    const { name } = options;
    const definition =  `${baseHook(options)}
    
void* hacked${name}(void* thisReference)
{
    return original${name}(thisReference, ${mod.args.join(", ")});
}`;
    return definition;
}
const fixedReturnValue = (options, mod) => {
    const { name } = options;
    const definition =  `${baseHook(options)}
    
${mod.args.type} hacked${name}(void* thisReference)
{
    return ${mod.args.value};
}`;
    return definition;
}
const replaceImplementation = (options, mod) => {
    const { name } = options;
    const definition =  `${baseHook(options)}
    
${mod.args.type} hacked${name}(void* thisReference)
{
    ${mod.args};
}`;
    return definition;
}

const MODS = { savePointerToThis, replaceArguments, fixedReturnValue, replaceImplementation }

const _toHook = (options) => {
    const { name, mods, trampolineHookBytes } = options;
    const mod = mods[0]; //only one mod supported at the time
    console.log("mod",mod)
    const definition = MODS[mod.type](options, mod);
    const invocation = `original${name} = (t${name})TrampolineHook(${name}, hacked${name}, ${trampolineHookBytes || "6"});`;
    return { definition, invocation };
}
const _toHooks = (rules, metadata) => {
    const hooks = metadata.methodHooks.map(_toHook);
    const __join = property => _.map(hooks, property).join("\n");
    return { definitions: __join("definition"), invocations: __join("invocation") };
}

module.exports = (rules, metadata) => {
    const { definitions, invocations } = _toHooks(rules, metadata);
    return `#include "pch.h"
#include "models.h"
#include "trampolineHook.h"
#include <iostream>

HookedData *myHookedData = nullptr;
uintptr_t assemblyAddress = (uintptr_t) GetModuleHandleW(L"GameAssembly.dll");
${definitions}

void hookData(HookedData* hookedData) {
    myHookedData = hookedData;
    (*hookedData).assembly = assemblyAddress;
${invocations}
}
`;
}