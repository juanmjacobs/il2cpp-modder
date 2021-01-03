const fs = require("fs");
const _ = require("lodash");
const Promise = require("bluebird");
const { isPathMemoryHack } = require("./projectGenerators/templates/gameModder/mods/hookUtils");

const throwError = message => {
  console.log("\n\n", "[ERROR]", message, "\n\n");
  throw new Error(message);
}

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
  }

  methodInfo(options) {
    const { className, name, mods } = options;
    const classIndex = this._findClassIndex(className);
    const { index, line, classLines } = this._findMethodInClass(className, name);
    const relativeRvaIndex = index - 1;
    const rva = classLines[relativeRvaIndex].split(":")[1].split(" ")[1].trim();
    const methodParts = line.split("(");
    const returnType = methodParts[0].split(" ").map(it => it.trim())[1];
    
    const parameters = methodParts[1].split(")")[0].split(",")
    .map(it => it.trim())
    .map(it => {
      const [ type, name ] = it.split(" ");
      return { type, name };
    })
    .filter(it => it.type && it.name);
    
    console.log(`Found method ${line} in line ${classIndex + index + 1}. RVA: ${rva}`);
    const paths = isPathMemoryHack(options) ? this._paths(options) : [];
    return { ...options, methodIndex: index, rva, classIndex, relativeRvaIndex, parameters, returnType, paths };
  }

  _paths({ className, name, mods: [ { args: { paths }  } ] }) {
    const validPaths = paths.map((path) => {
      try {
        return this._pathInfo({ entryClass: className, ...path })
      } catch(e) {
        return null;
      }
    })
    .filter(it => it);

    if(_.isEmpty(validPaths)) {
      throwError(`No valid paths for mod ${className}.${name}`);
    }
    return validPaths;
  }

  _pathInfo(options) {
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
    const __notFound = () => { 
      throwError(`Class ${className} not found in dump.cs`); 
    };
    try {
      const classIndex = _.findIndex(this.dumpLines, it => 
        _([this._classDefinition(className), this._abstractClassDefinition(className)])
        .some(definition =>  _.includes(it, definition))
      );
      if(classIndex == -1) __notFound()
      console.log(`Found class ${className} in line ${classIndex + 1}`)
      return classIndex;
    } catch (e) {
      __notFound()
    }
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
    if(index == -1) {
      throwError(`${search} not found in ${className}`); 
    }
    return { index, line: classLines[index], classLines };
  }

  _classLines(className) {
    const classBody = this.dump.split(this._classDefinition(className))[1] || this.dump.split(this._abstractClassDefinition(className))[1];
    const lines = classBody.split("\n");
    return lines;
  }

  _classDefinition(className) {
    return `public class ${className} `;
  }

  _abstractClassDefinition(className) {
    return `public abstract class ${className} `;
  }

}