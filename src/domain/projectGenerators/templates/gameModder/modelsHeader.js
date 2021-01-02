module.exports = (rules, metadata) => `#pragma once
#include "pch.h"

//En este struct se puede agregar punteros a otros objetos/metodos. Ej uintptr_t oSetCooldownTimer, anotherPlayer;
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