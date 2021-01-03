const ProjectGenerator = require("./projectGenerator");
const injectorTemplate = require("./templates/injector/injector");

module.exports = class DllInjector extends ProjectGenerator {
  constructor(rules) {
    super(rules)
  }  

  generate(metadata) {
    this.writeFile("injector", "injector.cpp", injectorTemplate(this.rules, metadata));
  }

}