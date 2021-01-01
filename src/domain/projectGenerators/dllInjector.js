const ProjectGenerator = require("./projectGenerator");
const consoleTemplate = require("./templates/injector/console");

module.exports = class DllInjector extends ProjectGenerator {
  constructor(rules) {
    super(rules)
  }  
  generate(rules) {
    const consoleSource = consoleTemplate(rules);
    this.writeFile("injector/injector.cpp", consoleSource);
  }
}