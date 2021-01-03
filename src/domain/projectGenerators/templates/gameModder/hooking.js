const _ = require("lodash");
const MODS = require("./mods");

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