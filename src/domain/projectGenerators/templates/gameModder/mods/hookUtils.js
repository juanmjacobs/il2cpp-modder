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

const hookFunctionName = ({ className, name }) => `${className}_${name}`

const buildHook = (options, hackedBody) => {
    const { name, rva, parameters, returnType } = options;
    const functionName = hookFunctionName(options);
    const cppReturnType = cppParameterType(returnType);
    const cppParameters = !_.isEmpty(parameters)? parameters.map(parameter => `${cppParameterType(parameter.type)} ${parameter.name}`) : [];
    const allCppParameters = ["void* thisReference"].concat(cppParameters).join(", ");
    return `//--------${functionName} hook------------
typedef ${cppReturnType} (*t${functionName})(${allCppParameters});
uintptr_t ${functionName}RVA = ${rva};
t${functionName} ${functionName} = (t${functionName})(assemblyAddress + ${functionName}RVA);
t${functionName} original_${functionName};
${cppReturnType} hacked_${functionName}(${allCppParameters}) 
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
const pathFinalType = ({ fields }) => _.last(fields).type;

module.exports = { buildHook, hookDataThis, hookDataPath, cppParameterType, isPathMemoryHack, pathMemoryHackHooks, pathFinalType, hookFunctionName };