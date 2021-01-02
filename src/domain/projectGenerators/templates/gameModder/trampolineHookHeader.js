#pragma once
#include "pch.h"

BYTE* TrampolineHook(void* sourceFunctionPointer, void* hackedFunctionPointer, unsigned int trampolineBytes);
