const _ = require("lodash");
const MODS = require("./mods");
const { hookFunctionName } = require("./mods/hookUtils");

const _toHook = (options) => {
    const { className, name, mods, trampolineHookBytes } = options;
    const functionName = hookFunctionName(options);
    const mod = mods[0]; //only one mod supported at the time
    console.log("mod",JSON.stringify(mod))
    const definition = MODS[mod.type](options, mod, functionName);
    const invocation = `original_${functionName} = (t${functionName})TrampolineHook(${functionName}, hacked_${functionName}, ${trampolineHookBytes || "6"});`;
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