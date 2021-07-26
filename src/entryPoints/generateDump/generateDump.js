const fs = require("fs");
const _ = require("lodash");
const path = require("path");
const Promise = require("bluebird");
const { exec } = require("child_process");
const execAsync = command => {
  if(!command.startsWith("\"") && !command.endsWith("\"")) {
    command = "\"" + command + "\"";
  }
  console.log("Executing:\n "+ command+"\n");
  return Promise.promisify(exec)(command);
};
Promise.promisifyAll(fs);

const promptChooseFolderDialog = () => execAsync(path.join(__dirname, "chooseFolder.bat")).then(it => it.trim());
const promptChooseFileDialog = () => execAsync(path.join(__dirname, "chooseFile.bat")).then(it => it.trim());
const lastPart = aPath => _.last(aPath.split(path.sep));

const fileExistsOrPrompt = (gameName, filePath) => {
  console.log("Searching for", filePath);
  const fileName = lastPart(filePath);
  return Promise.try(() => fs.existsSync(filePath))
  .then(exists => {
    if(exists)  {
      console.log(filePath, "found!")
      return filePath;
    }
    console.log(filePath, `not found, please select a the ${fileName} for ${gameName}!`);
    return promptChooseFileDialog();
  })
}

const generateRules = (gamePath, gameName, dumpPath) => { 
  console.log("Generating rules.js!");
  const __escapePath = aPath => aPath.replace(/\\/g,"\\\\");
  const rulesContent = `module.exports = {
  game: {
    path: "${__escapePath(gamePath)}",
    exeName: "${gameName}"
  },
  dump: { 
    path: "${__escapePath(dumpPath)}",
  },
  hooks: {
    methods: [{ 
      className: "SomeClass",
      name: "SomeMethod",
      trampolineHookBytes: 6,
      mods: [{ 
        type: "modType",
        args: "modArgs"
      }]
    }]
  },
  output: "output" //optional
}`
  return fs.writeFileAsync("rules.js", rulesContent);
}

const il2CppDumper = (gameName, { gameAssemblyDllPath, globalMetadataDatPath }) => {
  console.log("Trying to execute Il2CppDumper.exe in PATH");
  const dumperOutput = process.argv[4] || `${gameName.replace(/ /g, "_")}-il2cppdumper-output`;
  const execDumper =  il2CppDumperExe => {
    if(!il2CppDumperExe) { return Promise.reject("No Il2CppDumper executable supplied!"); }
    console.log("Creating output directory", dumperOutput);
    return execAsync(`rm -rf "${dumperOutput}"`).reflect()
    .then(() => execAsync(`mkdir "${dumperOutput}"` ).reflect())
    .then(inspection => console.log(`output directory ${dumperOutput} ${inspection.isFulfilled()? "" :" not "}created`))
    .then(() => execAsync(`${il2CppDumperExe} "${gameAssemblyDllPath}" "${globalMetadataDatPath}" "${dumperOutput}"`))
    .tap(it => console.log(`\nIl2CppDumper output: \n${it}\n`));
    
  };
  return execDumper("Il2CppDumper.exe")
  .catch(e => /not recognized|no se reconoce/gi.test(e.toString()), () => {
    console.log('Il2CppDumper.exe not found in PATH! Please select your Il2CppDumper.exe');
    return promptChooseFileDialog()
    .then(it => `"${it.trim()}"`)
    .tap(execDumper)
  })
  .catch(e => {})
  .thenReturn(path.join(process.cwd(), dumperOutput, "dump.cs"))
  .finally(() => console.log(`Done! Check ${dumperOutput} for the results`));
}

module.exports = () => {
  console.log("Will try to generate dump.cs using Il2CppDumper!")
  const $gameFolder = process.argv[3] ? Promise.resolve(process.argv[3]) : promptChooseFolderDialog();
  let gameName, gameFolder;
  return $gameFolder
  .tap(folder => console.log("Game located at:", folder))
  .tap(folder => { 
    gameFolder = folder;
    gameName = _.last(folder.split(path.sep));
  })
  .tap(() => console.log('Game name', gameName))
  .then(folder => {
    const gameAssemblyDll = path.join(folder, "GameAssembly.dll"); 
    const globalMetadataDat = path.join(folder, `${gameName}_Data`, "il2cpp_data", "Metadata", "global-metadata.dat"); 
    return Promise.props({
      gameAssemblyDllPath: fileExistsOrPrompt(gameName, gameAssemblyDll),
      globalMetadataDatPath: fileExistsOrPrompt(gameName, globalMetadataDat) 
    })
  })
  .tap(filePaths => console.log('Will use the following paths for Il2CppDumper', filePaths))
  .then(filePaths => il2CppDumper(gameName, filePaths))
  .tap(dumpPath => generateRules(gameFolder, gameName, dumpPath))
}
