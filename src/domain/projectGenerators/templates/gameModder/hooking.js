const _ = require("lodash");

const _toHook = ({ name, rva, mods, trampolineHookBytes }) => {
    const definition = `//--------${name} hook------------
typedef void* (*t${name})(void* PlayerControl);
uintptr_t ${name}RVA = ${rva};
t${name} ${name} = (t${name})(assemblyAddress + ${name}RVA);
t${name} original${name};
void* hacked${name}(void* playerControl)
{
    uintptr_t player = (uintptr_t)playerControl;
    if ((*myHookedData).player != player) 
    {
        printf("Reassigning player from %x to %x\\n", (*myHookedData).player, player);
        (*myHookedData).player = player;
    }
    return original${name}(playerControl);
}`;
    
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