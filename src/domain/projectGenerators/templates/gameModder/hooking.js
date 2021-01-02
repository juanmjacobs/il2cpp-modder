const _toHooks = (rules, metadata) => {
    const definitions = `//--------GetTruePosition hook------------
typedef void* (*tGetTruePosition)(void* PlayerControl);
uintptr_t getTruePositionRVA = 0x8E6360;
tGetTruePosition getTruePosition = (tGetTruePosition)(assemblyAddress + getTruePositionRVA);
tGetTruePosition originalGetTruePosition;
void* hackedGetTruePosition(void* playerControl)
{
    uintptr_t player = (uintptr_t)playerControl;
    if ((*myHookedData).player != player) 
    {
        printf("Reassigning player from %x to %x\\n", (*myHookedData).player, player);
        (*myHookedData).player = player;
    }
    return originalGetTruePosition(playerControl);
}

//--------SetCoolDown hook------------
typedef void (*tSetCoolDown)(void* killButton, float a, float b);
uintptr_t setCoolDownRVA = 0xFEF310;
tSetCoolDown setCoolDown = (tSetCoolDown)(assemblyAddress + setCoolDownRVA);
tSetCoolDown originalSetCoolDown;
void hackedSetCoolDown(void* killButton, float a, float b) 
{
    printf("hacked SetCoolDown button: %x original parameters a: %f | b: %f", killButton, a, b);
    originalSetCoolDown(killButton, a, 0.0f);
}
`
    const invocations = `
    originalGetTruePosition = (tGetTruePosition)TrampolineHook(getTruePosition, hackedGetTruePosition, 6);
    originalSetCoolDown = (tSetCoolDown)TrampolineHook(setCoolDown, hackedSetCoolDown, 11);
`
    return { definitions, invocations };
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