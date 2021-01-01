const fs = require("fs");
const Promise = require("bluebird");
const mkdirp = require('mkdirp')
Promise.promisifyAll(fs);

module.exports = class ProjectGenerator {
  constructor(rules) {
    this.rules = rules;
  }

  generate(it) {
    console.log("Generating project with metadata", JSON.stringify(it));
  }

  writeFile(name, content) {
//    return fs.writeFileAsync("d")
  }

  _outputPath(path) {
    return `${this.rules.output || "output"}\\${path}`
  }


}