const _ = require("lodash");
const { pathMemoryHackHooks, hookDataThis, hookDataPath } = require("./mods/hookUtils");

const _variableName = sentence => sentence.split("=")[0].split(" ")[1].trim()
const _traversePath = (hook, path) => {
    const { fields } = path;
    const fieldType = `${_.last(fields).type}*`; //TODO EXTRACT LOGIC MODELSHEADER.JS
    const fieldName = hookDataPath(hook, fields); //TODO EXTRACT LOGIC MODELSHEADER.JS
    const initialPointer = hookDataThis(hook);
    const hookedInitialPointer = `(*hookedData).${initialPointer}`;
    const indirectionSentences = [`uintptr_t ${initialPointer} = ${hookedInitialPointer};`]
    fields.forEach(({ field, offset, type }, i) => {
        const pointerType = i == fields.length - 1? type : "uintptr_t";
        const previousVariableName = _variableName(indirectionSentences[i]);
        const indirectionSentence = `${pointerType}* ${previousVariableName}_${field} = (${pointerType}*)(${i?"*":""}${previousVariableName} + ${offset});`;
        indirectionSentences.push(indirectionSentence);
    })
    return `
    //Traverse ${path.entryClass}.${path.path}
    if(${hookedInitialPointer}) {
        ${indirectionSentences.join("\n\t\t")}
        (*hookedData).${fieldName} = ${_variableName(_.last(indirectionSentences))};
    }
    `;
}

module.exports = (rules, metadata) => {
    const hooks = pathMemoryHackHooks(metadata);
    const populateHookedPaths = _(hooks).flatMap(hook => hook.paths.map(path =>_traversePath(hook, path))).value();
    
    return `#include "pch.h"
#include "models.h"
#include "hooking.h"
#include "utils.h"
#include <iostream>
using namespace std;

void populateHookedPaths(HookedData* hookedData) 
{
    ${populateHookedPaths.join("\t\n")}
}
void commandLoop(HookedData* hookedData)
{
    printf("[] Assembly located at: %x\\n", (*hookedData).assembly);
    printf("Commands will not work until pointers are populated);
    
    int command = 0;
    while (true)
    {
        command = 0;
        printf("Available commands:\\n  1 - change speed\\n\\n  2 - toggle freeze\\n\\n");
        printf("Enter a command: ");
        cin >> command;
        populateHookedPaths(hookedData);
        HookedData populatedData = *hookedData;
        if (command != 0)
        {
            switch (command)
            {
            case 1: // Change speed
            {
                printf("Your current speed is: %f\\n", *(float*)populatedData.speed);
                int new_speed = 0;
                printf("Enter new speed: ");
                scanf_s("%d", &new_speed);
                // We know from dnSpy that this variable is a float. Make it so.
                *(float*)populatedData.speed = (float)new_speed;
                break;
            }
            case 2: // Toggle freeze
            {
                bool isMoveable = *populatedData.moveable;
                auto from = isMoveable ? "moving" : "freezed";
                auto to = !isMoveable ? "moving" : "freezed";
                printf("Changing from ");
                printf(from);
                printf(" to ");
                printf(to);
                printf("\\n");
                *(bool*)populatedData.moveable = !(*populatedData.moveable);
                break;
            }
            default:
                printf("Invalid command\\n");
                break;
            }
        }
    }

}

void insertConsole()
{
    AllocConsole();
    FILE* f = new FILE();
    freopen_s(&f, "CONOUT$", "w", stdout);
    freopen_s(&f, "CONIN$", "r", stdin);
    printf("[*] Injected...\\n");
    uintptr_t* player = nullptr;
    HookedData hookedData = HookedData();
    printf("[*] hookedData... %x\\n", &hookedData);

    hookData(&hookedData);
    commandLoop(&hookedData);
}
`
}
