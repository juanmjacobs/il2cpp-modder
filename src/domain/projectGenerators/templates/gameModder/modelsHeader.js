const _ = require("lodash");
const { hookDataThis, hookDataPath } = require("./mods/hookUtils");

const pathMemoryHackHooks = metadata => metadata.methodHooks.filter(it => _.some(it.mods, { type: "pathMemoryHack" }));

const savedThisPointers = hooks => hooks
  .map(hookDataThis)
  .map(it => `uintptr_t ${it};`)
  

const savedPaths = hooks => _(hooks)
  .flatMap(hook => hook.paths.map(({ fields }) => {
    const fieldType = `${_.last(fields).type}*`;
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