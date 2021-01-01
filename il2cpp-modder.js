const fs = require("fs");
const Promise = require("bluebird");
const _ = require("lodash");
const DumpReader = require("./src/domain/dumpReader");
const ProjectGenerators = require("./src/domain/projectGenerators");

Promise.promisifyAll(fs);
const rulesPath = process.argv[2];
const rules = require(rulesPath);

const dllInjectorGenerator = new ProjectGenerators.DllInjector(rules);
const gameModderGenerator = new ProjectGenerators.GameModderDll(rules);

DumpReader.load(rules)
.then(dumpReader => {
  return Promise.props({
    methodHooks: Promise.map(rules.hooks.methods, dumpReader.methodInfo),
    pathHooks: Promise.map(rules.hooks.paths, dumpReader.pathInfo)
  }) 
})
.tap(it => dllInjectorGenerator.generate(it))
.tap(it => gameModderGenerator.generate(it))
