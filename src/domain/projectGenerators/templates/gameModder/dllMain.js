module.exports = (rules, metadata) => `#include "pch.h"
#include "commandLoop.h"
#include <iostream>


BOOL APIENTRY DllMain(HMODULE hModule, DWORD  ul_reason_for_call, LPVOID lpReserved)
{
    switch (ul_reason_for_call)
    {
    case DLL_PROCESS_ATTACH:
    {
        DisableThreadLibraryCalls(hModule);
        // Spawn a new thread for our console/cheats when we attach to the process
        HANDLE hThread = CreateThread(nullptr, 0, (LPTHREAD_START_ROUTINE)insertConsole, hModule, 0, 0);
        if (hThread != nullptr)
            CloseHandle(hThread);
        break;
    }
    case DLL_THREAD_ATTACH:
    case DLL_THREAD_DETACH:
    case DLL_PROCESS_DETACH:
        break;
    }
    return TRUE;
}
`
