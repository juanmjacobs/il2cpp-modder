const Promise = require("bluebird");
const ProjectGenerator = require("./projectGenerator");
const dllMainTemplate = require("./templates/gameModder/dllMain");
const utilsTemplate = require("./templates/gameModder/utils");
const utilsHeaderTemplate = require("./templates/gameModder/utilsHeader");
const trampolineHookTemplate = require("./templates/gameModder/trampolineHook");
const trampolineHookHeaderTemplate = require("./templates/gameModder/trampolineHookHeader");
const hookingTemplate = require("./templates/gameModder/hooking");
const hookingHeaderTemplate = require("./templates/gameModder/hookingHeader");
const commandLoopTemplate = require("./templates/gameModder/commandLoop");
const commandLoopHeaderTemplate = require("./templates/gameModder/commandLoopHeader");
const modelsHeaderTemplate = require("./templates/gameModder/modelsHeader");

module.exports = class GameModderDll extends ProjectGenerator {
  constructor(rules) {
    super(rules)
  }  

  generate(metadata) {
    return Promise.map([
      { name: "dllmain.cpp", content: dllMainTemplate(this.rules, metadata) },
      { name: "utils.cpp", content: utilsTemplate(this.rules, metadata) },
      { name: "utils.h", content: utilsHeaderTemplate(this.rules, metadata) },
      { name: "trampolineHook.cpp", content: trampolineHookTemplate(this.rules, metadata) },
      { name: "trampolineHook.h", content: trampolineHookHeaderTemplate(this.rules, metadata) },
      { name: "hooking.cpp", content: hookingTemplate(this.rules, metadata)},
      { name: "hooking.h", content: hookingHeaderTemplate(this.rules, metadata)},
      { name: "commandLoop.cpp", content: commandLoopTemplate(this.rules, metadata)},
      { name: "commandLoop.h", content: commandLoopHeaderTemplate(this.rules, metadata)},
      { name: "models.h", content: modelsHeaderTemplate(this.rules, metadata)},
    ], ({ name, content }) => this.writeFile("gameModder", name, content));
  }
}