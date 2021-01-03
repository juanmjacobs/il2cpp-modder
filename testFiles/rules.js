module.exports = {
  "game": {
    path: "path/to/game",
    exeName: "Among Us"
  },
  //"output": "path/to/output/dir" //optional, default "output"
  "dump": { 
    path: "./testFiles/dump.cs"
  },
  "hooks": {
    methods: [{
      className: "FFGALNAPKCD",
      name: "GetTruePosition",
      trampolineHookBytes: 6,
      mods: [{ //See Mod Types
        type: "savePointerToThis",
        args: { 
          paths: [{ 
            name: "Player speed",
            path: "MyPhysics.Speed",
          },{ 
            name: "Player is movable",
            path: "moveable",
            //automatic: "true"
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
    }]
  },
}