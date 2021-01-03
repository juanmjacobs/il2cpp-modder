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
      className: "FFGALNAPKCD",
      name: "GetTruePosition",
      trampolineHookBytes: 6,
      mods: [{ //See Mod Types
        type: "pathMemoryHack",
        args: { 
          paths: [{ 
            name: "Player speed",
            path: "MyPhysics.Speed"
          },{ 
            name: "Player is moveable",
            path: "moveable",
            value: "true"
          }]
        }
      }]
    }]
  },
  output: "output" //optional
}