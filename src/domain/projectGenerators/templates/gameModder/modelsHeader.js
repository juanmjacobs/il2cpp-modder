const _ = require("lodash");
const { hookDataProperty } = require("./mods/hookUtils");

module.exports = (rules, metadata) => {
  const hookedPointers = metadata.methodHooks
  .filter(it => _.some(it.mods, { type: "savePointerToThis" }))
  .map(hookDataProperty)
  .map(it => `uintptr_t ${it};`)
  .join("\n\t");

return `#pragma once
#include "pch.h"

struct HookedData {
	uintptr_t assembly;
	${hookedPointers}
};

struct PlayerAddresses
{
	float* speed;
	bool* moveable;
};
`
}