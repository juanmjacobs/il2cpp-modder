module.exports = (rules, metadata) => `#include "pch.h"

BYTE JMP = 0xE9;
BYTE NOP = 0x90;

BYTE* CopyFunctionBeginningToGateway(void* sourceFunctionPointer, unsigned int trampolineBytes)
{
    //Create Gateway.
    BYTE* gateway = (BYTE*)VirtualAlloc(0, trampolineBytes, MEM_COMMIT | MEM_RESERVE, PAGE_EXECUTE_READWRITE);

    //Write stolen bytes.
    memcpy_s(gateway, trampolineBytes, sourceFunctionPointer, trampolineBytes);
    return gateway;
}

void AddJmpToRestOfOriginalFunction(BYTE* gateway, void* sourceFunctionPointer, unsigned int trampolineBytes)
{
    // Write jmp instruction
    *(gateway + trampolineBytes) = JMP;

    //Get the gateway to destination address (operand for jmp)
    uintptr_t gatewayRelativeAddr = (BYTE*)sourceFunctionPointer - gateway - 5;

    //Write address of gateway to jmp
    *(uintptr_t*)((uintptr_t)gateway + trampolineBytes + 1) = gatewayRelativeAddr;
}

void ReplaceOriginalFunctionForHackedFunction(void* sourceFunctionPointer, void* hackedFunctionPointer, unsigned int trampolineBytes)
{
    if (trampolineBytes < 5) return;
    //The original function should jump to our hacked function.

    //Make the sourceFunction beginning memory writable
    DWORD currentProtection;
    VirtualProtect(sourceFunctionPointer, trampolineBytes, PAGE_EXECUTE_READWRITE, &currentProtection);

    //Fill sourceFunction beginning memory with some good ol' NOPs
    memset(sourceFunctionPointer, NOP, trampolineBytes);

    //Write the jmp at the start of the source function
    *(BYTE*)sourceFunctionPointer = JMP;

    //Calculate the relaive address of our hacked function (operand for jmp)
    uintptr_t relativeAddress = (uintptr_t)hackedFunctionPointer - (uintptr_t)sourceFunctionPointer - 5;

    //Write address of hacked function to jmp
    *(uintptr_t*)((BYTE*)sourceFunctionPointer + 1) = relativeAddress;

    //Restore the original memory protection
    VirtualProtect(sourceFunctionPointer, trampolineBytes, currentProtection, &currentProtection);
}

BYTE* TrampolineHook(void* sourceFunctionPointer, void* hackedFunctionPointer, unsigned int trampolineBytes)
{
    if (trampolineBytes < 5) return 0;
    BYTE* gateway = CopyFunctionBeginningToGateway(sourceFunctionPointer, trampolineBytes);
    AddJmpToRestOfOriginalFunction(gateway, sourceFunctionPointer, trampolineBytes);
    ReplaceOriginalFunctionForHackedFunction(sourceFunctionPointer, hackedFunctionPointer, trampolineBytes);
    return gateway;
}`