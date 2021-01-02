const Promise = require("bluebird");
const ProjectGenerator = require("./projectGenerator");
const dllMainTemplate = require("./templates/gameModder/dllMain");
const utilsTemplate = require("./templates/gameModder/utils");
const utilsHeaderTemplate = require("./templates/gameModder/utilsHeader");
const trampolineHookTemplate = require("./templates/gameModder/trampolineHook");
const trampolineHookHeaderTemplate = require("./templates/gameModder/trampolineHookHeader");

module.exports = class GameModderDll extends ProjectGenerator {
  constructor(rules) {
    super(rules)
  }  

  generate(metadata) {
    return Promise.map([
      { name: "dllMain.cpp", content: dllMainTemplate(this.rules, metadata) },
      { name: "utils.cpp", content: utilsTemplate(this.rules, metadata) },
      { name: "utils.h", content: utilsHeaderTemplate(this.rules, metadata) },
      { name: "trampolineHook.cpp", content: trampolineHookTemplate(this.rules, metadata) },
      { name: "trampolineHook.h", content: trampolineHookHeaderTemplate(this.rules, metadata) }
    ], ({ name, content }) => this.writeFile("gameModder", name, content));
  }
}