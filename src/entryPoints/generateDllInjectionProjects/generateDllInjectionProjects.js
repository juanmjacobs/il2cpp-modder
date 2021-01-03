const fs = require("fs");
const _ = require("lodash");
const path = require("path");
const Promise = require("bluebird");
const DumpReader = require("../../domain/dumpReader");
const ProjectGenerators = require("../../domain/projectGenerators");
Promise.promisifyAll(fs);

module.exports = generateDllInjectionProjects = (rulesPath) => {

  const absolutePath = path.join(process.cwd(), rulesPath);
  const rules = require(absolutePath);

  const dllInjectorGenerator = new ProjectGenerators.DllInjector(rules);
  const gameModderGenerator = new ProjectGenerators.GameModderDll(rules);

  DumpReader.load(rules)
  .then(dumpReader => {
    return Promise.props({
      methodHooks: Promise.map(rules.hooks.methods, methodHook => Promise.try(() => dumpReader.methodInfo(methodHook)).reflect())
      .filter(it => it.isFulfilled())
      .map(it => it.value())
    }) 
  })
  .tap(({ methodHooks }) => {
    if(_.isEmpty(methodHooks)) { 
      console.log(`No valid method hooks found in ${absolutePath}. Aborting.`);
      process.exit(0);
    }
  })
  .tap(it => dllInjectorGenerator.generate(it))
  .tap(it => gameModderGenerator.generate(it))
}
