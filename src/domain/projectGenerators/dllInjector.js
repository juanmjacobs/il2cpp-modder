const ProjectGenerator = require("./projectGenerator");
const utils = require("./templates/gameModder/utils");

module.exports = class DllInjector extends ProjectGenerator {
  constructor(rules) {
    super(rules)
  }  

  generate(metadata) {
    const consoleSource = consoleTemplate(this.rules, metadata);
    this.writeFile("injector", "injector.cpp", consoleSource);
  }

}