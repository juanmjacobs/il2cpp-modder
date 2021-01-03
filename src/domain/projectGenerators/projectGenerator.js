const fs = require("fs");
const path = require("path");
const Promise = require("bluebird");
const mkdirp = require('mkdirp')
Promise.promisifyAll(fs);

module.exports = class ProjectGenerator {
  constructor(rules) {
    this.rules = rules;
    this.output = rules.output || "output";
    ; //possible race condition
  }

  generate(it) {
    console.log("Generating project with metadata", JSON.stringify(it));
  }

  writeFile(directory, name, content) {
    console.log("About to write", directory, name)
    return this._createOutputDirectory(directory)
    .then(directoryPath => path.join(directoryPath, name))
    .then(filePath => fs.writeFileAsync(filePath, content));
  }

  _createOutputDirectory(directory) {
    const outputPath = path.join(this.output, directory);
    return Promise.try(() => mkdirp(outputPath))
    .thenReturn(outputPath);
  }


}