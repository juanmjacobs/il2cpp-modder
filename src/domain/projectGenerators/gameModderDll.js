const ProjectGenerator = require("./projectGenerator");

module.exports = class GameModderDll extends ProjectGenerator {
  constructor(rules) {
    super(rules)
  }  

  generate(metadata) {
    const consoleSource = consoleTemplate(this.rules, metadata);
    this.writeFile("injector", "injector.cpp", consoleSource);
  }
}