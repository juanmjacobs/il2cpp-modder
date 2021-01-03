module.exports = {
  game: {
    path: "C:\\Users\\juan\\Desktop\\jackbox\\Among.Us.v2020.12.9s.Incl.Pets\\Among.Us.v2020.12.9s.Incl.Pets\\Among Us",
    exeName: "Among Us"
  },
  dump: { 
    path: "C:\\Users\\juan\\producteca\\il2cpp-modder\\Among_Us-il2cppdumper-output\\dump.cs",
  },
  hooks: {
    methods: [{ 
      className: "SomeClass",
      name: "SomeMethod",
      trampolineHookBytes: 6,
      mods: [{ 
        type: "modType",
        args: "modArgs"
      }]
    }]
  },
  output: "output" //optional
}