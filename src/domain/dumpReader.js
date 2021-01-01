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
    this.methodInfo = this.methodInfo.bind(this);
    this.pathInfo = this.pathInfo.bind(this);
  }

  methodInfo(options) {
    const { className, name } = options;
    const classIndex = this._findClassIndex(className);
    const { index, line, classLines } = this._findMethodInClass(className, name);
    const relativeRvaIndex = index - 1;
    const rva = classLines[relativeRvaIndex].split(":")[1].split(" ")[1].trim();
    console.log(`Found method ${line} in line ${classIndex + index + 1}. RVA: ${rva}`);
    return { ...options, methodIndex: index, rva, classIndex, relativeRvaIndex };
  }

  pathInfo(options) {
    const { entryClass, path } = options;
    const fieldNames = path.split(".");
    const fields = [];
    fieldNames.forEach((field, i) => { //TODO: To reduce?
      const className = i == 0 ? entryClass : fields[i - 1].type; 
      const fieldInfo = this._fieldInfo(className, field); 
      fields.push(fieldInfo);
    });
    return { ...options, fields };
  }

  _fieldInfo(className, field) {
    console.log(`Searching field ${field} of class ${className}`);
    const classIndex = this._findClassIndex(className);
    const { index, line } = this._findFieldInClass(className, field);
    console.log(`Found field ${field} of class ${className}: ${line} in line ${classIndex + index + 1}`)
    const offset = line.split("//")[1].trim();
    const type = _(line.split(field)[0].split(" ")).compact().last().trim();
    return { className, field, type, offset };
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