module.exports = (rules, metadata) => `#pragma once
#include "pch.h"

struct HookedData {
	uintptr_t player;
	uintptr_t assembly;
};

struct PlayerAddresses
{
	float* speed;
	bool* moveable;
};
`