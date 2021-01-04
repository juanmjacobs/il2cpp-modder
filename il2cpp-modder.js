const fs = require("fs");
const Promise = require("bluebird");
const _ = require("lodash");
const DumpReader = require("./src/domain/dumpReader");
const ProjectGenerators = require("./src/domain/projectGenerators");

Promise.promisifyAll(fs);
const cliArgument = process.argv[2];

const generateDllInjectionProjects = (rulesPath) => {

  const rules = require(rulesPath);

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

const generateDump = () => {
  console.log("Generating dump.cs using Il2CppDumper!")
}

if(cliArgument == "generate-dump") {
  return generateDump();
} else {
  return generateDllInjectionProjects(cliArgument);
}