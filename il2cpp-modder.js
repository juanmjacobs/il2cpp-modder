const generateDump = require("./src/entryPoints/generateDump");
const generateDllInjectionProjects = require("./src/entryPoints/generateDllInjectionProjects");

const cliArgument = process.argv[2];

if(cliArgument == "generate-dump") {
  return generateDump();
} else {
  return generateDllInjectionProjects(cliArgument);
}