const _ = require("lodash");
const { hookDataProperty } = require("./mods/hookUtils");

module.exports = (rules, metadata) => {
  const savePointerToThisHooks = metadata.methodHooks.filter(it => _.some(it.mods, { type: "savePointerToThis" }));
  const hookedPointers = savePointerToThisHooks
  .map(hookDataProperty)
  .map(it => `uintptr_t ${it};`)
  .join("\n\t");

  const hookedPaths = metadata.pathHooks;

return `#pragma once
#include "pch.h"

struct HookedData {
	uintptr_t assembly;
	${hookedPointers}
};

struct HookedPaths
{
	float* speed;
	bool* moveable;
};
`
}