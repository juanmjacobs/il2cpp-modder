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
  }

  methodHook({ className, name, mods }) {

  }

  pathHook({ name, entry }) {
    
  }
}