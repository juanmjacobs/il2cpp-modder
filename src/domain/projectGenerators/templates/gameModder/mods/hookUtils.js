const _ = require("lodash");

const TYPE_MAPPINGS = {
    boolean: "bool",
    string: "char*",
    object: "void*",
    byte: "BYTE"
}
const startsWithUpperCase = text => text[0] == text[0].toUpperCase()

const cppParameterType = type => { //TODO: improve type mappings
    const mappedType = TYPE_MAPPINGS[type];
    if(mappedType) return mappedType;
    if(startsWithUpperCase(type)) return "void*";
    return type;
}

const buildHook = ({ name, rva, parameters, returnType }, hackedBody) => {
    const cppReturnType = cppParameterType(returnType);
    const cppParameters = !_.isEmpty(parameters)? parameters.map(parameter => `${cppParameterType(parameter.type)} ${parameter.name}`) : [];
    const allCppParameters = ["void* thisReference"].concat(cppParameters).join(", ");
    return `//--------${name} hook------------
typedef ${cppReturnType} (*t${name})(${allCppParameters});
uintptr_t ${name}RVA = ${rva};
t${name} ${name} = (t${name})(assemblyAddress + ${name}RVA);
t${name} original${name};
${cppReturnType} hacked${name}(${allCppParameters}) 
{
    ${hackedBody()}
}
`;
}

const _hookDataSuffix = ({ className }, properties) => [ className ].concat(properties).join("_");
const hookDataThis = (options) => _hookDataSuffix(options, [options.name, "this"]);
const hookDataPath = (options, fields) => _hookDataSuffix(options, fields.map(it => it.field));
const isPathMemoryHack = it =>_.some(it.mods, { type: "pathMemoryHack" });
const pathMemoryHackHooks = metadata => metadata.methodHooks.filter(isPathMemoryHack);

module.exports = { buildHook, hookDataThis, hookDataPath, cppParameterType, isPathMemoryHack, pathMemoryHackHooks};