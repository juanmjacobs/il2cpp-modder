const _ = require("lodash");
const { hookDataThis, hookDataPath, pathMemoryHackHooks, pathFinalType } = require("./mods/hookUtils");

const savedThisPointers = hooks => hooks
  .map(hookDataThis)
  .map(it => `uintptr_t ${it};`)
  

const savedPaths = hooks => _(hooks)
  .flatMap(hook => hook.paths.map(({ fields }) => {
    const fieldType = `${pathFinalType({ fields })}*`;
    const fieldName = hookDataPath(hook, fields);
    return `${fieldType} ${fieldName};`;
  }))
  .value()

module.exports = (rules, metadata) => {
  const hooks = pathMemoryHackHooks(metadata);

return `#pragma once
#include "pch.h"

struct HookedData {
	uintptr_t assembly;
	${savedThisPointers(hooks).join("\n\t")}
  ${savedPaths(hooks).join("\n\t")}
};
`
}