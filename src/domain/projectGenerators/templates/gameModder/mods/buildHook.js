const _ = require("lodash");

const TYPE_MAPPINGS = {
    boolean: "bool",
    string: "char*",
    object: "void*",
    byte: "BYTE"
}
const startsWithUpperCase = text => text[0] == text[0].toUpperCase()

const parameterType = type => {
    const mappedType = TYPE_MAPPINGS[type];
    if(mappedType) return mappedType;
    if(startsWithUpperCase(type)) return "void*";
    return type;
}

const buildHook = ({ name, rva, parameters }, hackedBody) => {
    const signatureParameters = !_.isEmpty(parameters)? parameters.map(parameter => `${parameterType(parameter.type)} ${parameter.name}`) : [];
    const signature = ["void* thisReference"].concat(signatureParameters).join(", ");
    return `//--------${name} hook------------
typedef void* (*t${name})(${signature});
uintptr_t ${name}RVA = ${rva};
t${name} ${name} = (t${name})(assemblyAddress + ${name}RVA);
t${name} original${name};
void* hacked${name}(${signature}) 
{
    ${hackedBody()}
}
`;
}


module.exports = buildHook;