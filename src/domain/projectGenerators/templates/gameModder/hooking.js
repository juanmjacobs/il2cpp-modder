const _ = require("lodash");

const savePointerToThis = ({ className, name, rva }, mod) => {
    const hookDataProperty = `${className}_${name}_this`;
    const definition = `//--------${name} hook------------
typedef void* (*t${name})(void* thisReference);
uintptr_t ${name}RVA = ${rva};
t${name} ${name} = (t${name})(assemblyAddress + ${name}RVA);
t${name} original${name};
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
    return '//TODO IMPL REPLACE ARGUMENTS';
}
const fixedReturnValue = (options, mod) => {
    return '//TODO IML fixedReturnValue';
}
const replaceImplementation = (options, mod) => {
    return '//TODO IMPL replaceImplementation';
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