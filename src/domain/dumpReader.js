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
    const classDefinition = `public class ${className} `;
    const classIndex = _.findIndex(this.dumpLines, it => _.includes(it, classDefinition));
    console.log(`Found class ${className} in line ${classIndex + 1}`);
    const classBody = this.dump.split(classDefinition)[1];
    const lines = classBody.split("\n");
    const relativeMethodIndex = _.findIndex(lines, it => _.includes(it, `${name}(`)); //ex index for GetTruePosition(. Line above is RVA: 0x8E6360 Offset: 0x8E4B60 VA: 0x108E6360
    const relativeRvaIndex = relativeMethodIndex - 1;
    const rva = lines[relativeRvaIndex].split(":")[1].split(" ")[1].trim();
    console.log(`Found method ${name} in line ${classIndex + relativeMethodIndex + 1}. RVA: ${rva}`);
    return { className, name, mods, rva };
  }

  pathHook({ name, entry }) {

  }
}