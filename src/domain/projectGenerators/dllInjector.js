const ProjectGenerator = require("./projectGenerator");
const consoleTemplate = require("./templates/injector/console");

module.exports = class DllInjector extends ProjectGenerator {
  constructor(rules) {
    super(rules)
  }  

  generate(metadata) {
    const consoleSource = consoleTemplate(this.rules, metadata);
    this.writeFile("injector", "injector.cpp", consoleSource);
  }

}