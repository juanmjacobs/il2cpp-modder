const fs = require("fs");
const _ = require("lodash");
const Promise = require("bluebird");

module.exports = class DumpReader {
  static load({ dump }) {
    return fs.readFileAsync(dump.path)
    .then(dumpFile => dumpFile.toString("utf-8"))
    .then(dump => new DumpReader({ dump }));
  }
  constructor(it) {
    _.assign(this, it);
    this.dumpLines = this.dump.split("\n");
    this.methodHook = this.methodHook.bind(this);
    this.pathHook = this.pathHook.bind(this);
  }

  methodHook({ className, name, mods }) {
    const classIndex = this._findClassIndex(className);
    const { index, line, classLines } = this._findMethodInClass(className, name);
    const relativeRvaIndex = index - 1;
    const rva = classLines[relativeRvaIndex].split(":")[1].split(" ")[1].trim();
    console.log(`Found method ${line} in line ${classIndex + index + 1}. RVA: ${rva}`);
    return { className, name, mods, rva, classIndex, relativeRvaIndex };
  }

  pathHook({ name, entry, path }) {
    const properties = path.split(".");
    const offsets = properties.map(property => this._propertyOffset({name, entry, path}, property));
    return { name, entry, path, offsets };
  }

  _propertyOffset() {
    return {} //TODO
  }

  _findClassIndex(className) {
    const classDefinition = this._classDefinition(className);
    const classIndex = _.findIndex(this.dumpLines, it => _.includes(it, classDefinition));
    console.log(`Found class ${className} in line ${classIndex + 1}`)
    return classIndex;
  }

  _findFieldInClass(className, field) {
    return this._findInClass(className, `${field};`);
  }
  
  _findMethodInClass(className, method) {
    return this._findInClass(className, `${method}(`);
  }

  _findInClass(className, search) {
    const classLines = this._classLines(className);
    const index = _.findIndex(classLines, it => _.includes(it, search));
    return { index, line: classLines[index], classLines };
  }

  _classLines(className) {
    const classDefinition = this._classDefinition(className);
    const classBody = this.dump.split(classDefinition)[1];
    const lines = classBody.split("\n");
    return lines;
  }

  _classDefinition(className) {
    return `public class ${className} `;
  }
}