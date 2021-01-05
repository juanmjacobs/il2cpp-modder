const generateDump = require("./src/entryPoints/generateDump");
const generateDllInjectionProjects = require("./src/entryPoints/generateDllInjectionProjects");

const cliArgument = process.argv[2];
if(!cliArgument) {
  console.log("Please supply generate-dump or rules file.\nExamples\n  il2cpp-modder generate-dump\n  il2cpp-modder myRules.js");
  return;
}
if(cliArgument == "generate-dump") {
  return generateDump();
} else {
  return generateDllInjectionProjects(cliArgument);
}