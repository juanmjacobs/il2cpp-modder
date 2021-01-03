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
            //mode: "automatic: 90" TODO: while(true) speed = 90
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