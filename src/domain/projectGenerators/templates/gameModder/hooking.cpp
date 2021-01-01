#include "pch.h"
#include "models.h"
#include <iostream>

HookedData *myHookedData = nullptr;
uintptr_t assemblyAddress = (uintptr_t) GetModuleHandleW(L"GameAssembly.dll");
//Function declarations, tName, oName, hName. t = Template, o = original, h = hooked.

//--------GetTruePosition hook------------
typedef void* (*tGetTruePosition)(void* PlayerControl);
uintptr_t getTruePositionRVA = 0x8E6360;
tGetTruePosition oGetTruePosition = (tGetTruePosition)(assemblyAddress + getTruePositionRVA);
tGetTruePosition originalGetTruePosition;
//Get myPlayerControl.
void* hGetTruePosition(void* PlayerControl)
{
    //printf("calling hack hGetTruePosition! hookdata: %x -- found player: %x\n", myHookedData, PlayerControl);
    uintptr_t player = (uintptr_t)PlayerControl;
    if ((*myHookedData).player != player) 
    {
        printf("Reassigning player from %x to %x\n", (*myHookedData).player, player);
        (*myHookedData).player = player;
    }
    return originalGetTruePosition(PlayerControl);
}

//----------------------------------------

//--------SetCoolDown hook------------
typedef void (*tSetCoolDown)(void* killButton, float a, float b);
uintptr_t setCoolDownRVA = 0xFEF310;
tSetCoolDown oSetCoolDown = (tSetCoolDown)(assemblyAddress + setCoolDownRVA);
tSetCoolDown originalSetCoolDown;

void hSetCoolDown(void* killButton, float a, float b) 
{
    printf("hacked SetCoolDown original parameters a: %f | b: %f", a, b);
    originalSetCoolDown(killButton, 0.f, 0.f);
}
//-------------------------------------


void Hook(void* src, void* dst, unsigned int len)
{
    if (len < 5) return;

    DWORD curProtection;
    bool funco = VirtualProtect(src, len, PAGE_EXECUTE_READWRITE, &curProtection);

    memset(src, 0x90, len);

    uintptr_t relativeAddress = (uintptr_t)dst - (uintptr_t)src - 5;

    *(BYTE*)src = 0xE9;

    *(uintptr_t*)((BYTE*)src + 1) = relativeAddress;
    VirtualProtect(src, len, curProtection, &curProtection);
}

BYTE* TrampHook(void* src, void* dst, unsigned int len)
{
    if (len < 5) return 0;

    //Create Gateway.
    BYTE* gateway = (BYTE*)VirtualAlloc(0, len, MEM_COMMIT | MEM_RESERVE, PAGE_EXECUTE_READWRITE);

    //Write stolen bytes.
    memcpy_s(gateway, len, src, len);

    //Get the gateway to destination address.
    uintptr_t gatewayRelativeAddr = (BYTE*)src - gateway - 5;
    *(gateway + len) = 0xE9;

    //Write address of gateway to jmp.
    *(uintptr_t*)((uintptr_t)gateway + len + 1) = gatewayRelativeAddr;

    //Perform HOOK.
    Hook(src, dst, len);
    return gateway;
}


void hookData(HookedData* hookedData) {
    printf("received hookeddata %x - myhookeddata %x\n", hookedData, myHookedData);
    myHookedData = hookedData;
    (*hookedData).assembly = assemblyAddress;
    printf("received hookeddata %x - assigned myhookeddata %x\n", myHookedData);
    originalGetTruePosition = (tGetTruePosition)TrampHook(oGetTruePosition, hGetTruePosition, 6);
    originalSetCoolDown = (tSetCoolDown)TrampHook(oSetCoolDown, hSetCoolDown, 6);
    
}