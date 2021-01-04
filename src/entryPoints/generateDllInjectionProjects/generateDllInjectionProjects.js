const fs = require("fs");
const path = require("path");
const Promise = require("bluebird");
const DumpReader = require("../../domain/dumpReader");
const ProjectGenerators = require("../../domain/projectGenerators");
Promise.promisifyAll(fs);

module.exports = generateDllInjectionProjects = (rulesPath) => {

  console.log("__dirname",__dirname);
  const absolutePath = path.join(process.cwd(), rulesPath);
  const rules = require(absolutePath);

  const dllInjectorGenerator = new ProjectGenerators.DllInjector(rules);
  const gameModderGenerator = new ProjectGenerators.GameModderDll(rules);

  DumpReader.load(rules)
  .then(dumpReader => {
    return Promise.props({
      methodHooks: Promise.map(rules.hooks.methods, dumpReader.methodInfo)
    }) 
  })
  .tap(it => dllInjectorGenerator.generate(it))
  .tap(it => gameModderGenerator.generate(it))
}
