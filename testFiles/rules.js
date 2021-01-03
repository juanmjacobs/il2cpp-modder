module.exports = {
  "game": {
    path: "path/to/game",
    exeName: "Among Us"
  },
  //"output": "path/to/output/dir" //optional, default "output"
  "dump": { 
    path: __dirname + "/dump.cs",
  },
  "hooks": {
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
    }, { 
      className: "MLPJGKEACMM",
      name: "SetCoolDown",
      trampolineHookBytes: 11,
      mods: [{ 
        type: "replaceArguments",
        args: ["JECMPCICNEB", "0.0f"] 
      }]
    }, { 
      className: "SafeHandleZeroOrMinusOneIsInvalid",
      name: "get_IsInvalid",
      trampolineHookBytes: 11,
      mods: [{ 
        type: "fixedReturnValue",
        args: "true" 
      }]
    }]
  },
}