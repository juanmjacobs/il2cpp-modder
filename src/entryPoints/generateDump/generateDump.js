const fs = require("fs");
const _ = require("lodash");
const path = require("path");
const Promise = require("bluebird");
const { exec } = require("child_process");
const execAsync = Promise.promisify(exec);
Promise.promisifyAll(fs);

const promptChooseFolderDialog = () => execAsync(path.join(__dirname, "chooseFolder.bat"));
const promptChooseFileDialog = () => execAsync(path.join(__dirname, "chooseFile.bat"));

const fileExistsOrPrompt = (filePath) => {
  console.log("Searching for", filePath);
  return fs.existsAsync(filePath)
  .then(exists => exists? filePath : promptChooseFileDialog())
}

module.exports = () => {
  console.log("Will try to generate dump.cs using Il2CppDumper!")
  const $gameFolder = process.argv[3] ? Promise.resolve(process.argv[3]) : promptChooseFolderDialog();
  return $gameFolder
  .tap(folder => console.log("Game located at:", folder))
  .then(folder => {
    const gameName = _.last(folder.split(path.sep));
    const gameAssemblyDll = path.join(folder, "GameAssembly.dll"); 
    const globalMetadataDat = path.join(folder, `${gameName}_Data`, "il2cpp_data", "Metadata", "global-metadata.dat"); 
    return Promise.props({
      gameAssemblyDllPath: fileExistsOrPrompt(gameAssemblyDll),
      globalMetadataDatPath: fileExistsOrPrompt(globalMetadataDat) 
    })
    .tap(filePaths => console.log('Will use the following paths for Il2CppDumper', filePaths))
  })
}
