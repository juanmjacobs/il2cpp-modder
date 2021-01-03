const _ = require("lodash");
const { pathMemoryHackHooks, hookDataThis, hookDataPath, pathFinalType, cppParameterType } = require("./mods/hookUtils");

const _variableName = sentence => sentence.split("=")[0].split(" ")[1].trim();
const _pathName = ({ name, path }) => name || `${path.entryClass}.${path}`;

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

const _availableCommand = (hook, path, i) => `${i+1}) Change ${_pathName(path)}`;

const _scanfFormat = (path) => {

}
const _commandCase = (hook, path, i) => {
    const name = _pathName(path);    
    const property = hookDataPath(hook, path.fields);
    const type = cppParameterType(pathFinalType(path));
    const inputType = type == "bool" ? "int" : type; 
    const scanfFormat = {
        float: "%f",
        int: "%d",
        "char*": "%s"
    }[inputType] || "%d";

    const hookedPointer = `populatedData.${property}`;
    const target = `*(${hookedPointer})`;
    return `
                case ${i + 1}: // Change ${name}
                {
                    if(!${hookedPointer}) 
                    {
                        printf("${name} not hooked yet!");
                        break;
                    }
                    printf("Your current ${name} is: ${scanfFormat}\\n", ${target});
                    ${inputType} newValue;
                    printf("Enter new ${name}: ");
                    scanf_s("${scanfFormat}", &newValue);
                    ${target} = newValue;
                    break;
                }`
}

const _autoValueSetterLogger = (hook, path, i) => {
    return `printf("Will keep '${_pathName(path)}' set at '${path.value}'");`;
}

const _autoValueSetter = (hook, path, i) => {
    const name = _pathName(path);    
    const property = hookDataPath(hook, path.fields);
    const type = cppParameterType(pathFinalType(path));
    const pointer = `populatedData.${property}`;
    return `
        if (${pointer})
        {
            *(${pointer}) = ${path.value};
        }`;     
}

module.exports = (rules, metadata) => {
    const hooks = pathMemoryHackHooks(metadata);
    const populateHookedPaths = _(hooks).flatMap(hook => hook.paths.map(path =>_traversePath(hook, path))).value();
    const availableCommands = _(hooks).flatMap(hook => hook.paths.map((path, i) => _availableCommand(hook, path, i))).value();
    const commandCases = _(hooks).flatMap(hook => hook.paths.filter(it => !it.value).map((path, i) => _commandCase(hook, path, i) )).value();
    const autoValueSetterLoggers = _(hooks).flatMap(hook => hook.paths.filter(it => it.value).map((path, i) => _autoValueSetterLogger(hook, path, i) )).value();
    const autoValueSetters = _(hooks).flatMap(hook => hook.paths.filter(it => it.value).map((path, i) => _autoValueSetter(hook, path, i) )).value();
    const inputLoop = !_.isEmpty(commandCases)? `int command = 0;
    while (true)
    {
        command = 0;
        printf("\\nAvailable commands:\\n  ${availableCommands.join("\\n\\n  ")}\\n");
        printf("\\n\\n\\nEnter a command: \\n");
        cin >> command;
        populateHookedPaths(hookedData);
        HookedData populatedData = *hookedData;
        if (command != 0)
        {
            switch (command)
            {
                ${commandCases.join("\n\t")}
                default:
                    printf("Invalid command\\n");
                    break;
                }
        }
    }` : "";

    return `#include "pch.h"
#include "models.h"
#include "hooking.h"
#include "utils.h"
#include <iostream>
#include <thread>
using namespace std;

void populateHookedPaths(HookedData* hookedData) 
{
    ${populateHookedPaths.join("\n\t")}
}

void autoSetValues(HookedData* hookedData) 
{
    ${autoValueSetterLoggers.join("\n\t")}
    while (true) 
    {
        populateHookedPaths(hookedData);
        HookedData populatedData = *hookedData;
        //Constantly set values
        ${autoValueSetters.join("\n\t")}
    }
}

void commandLoop(HookedData* hookedData)
{
    printf("[] Assembly located at: %x\\n", (*hookedData).assembly);
    printf("\\nCommands will not work until pointers are populated!\\n\\n");
    ${!_.isEmpty(autoValueSetters)? "thread autoSetValuesThread(autoSetValues, hookedData);" : ""}    
    ${inputLoop}

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
