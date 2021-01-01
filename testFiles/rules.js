module.exports = {
  "game": {
    path: "path/to/game",
    exeName: "Among Us.exe"
  },
  //"output": "path/to/output/dir" //optional, default "output"
  "dump": { 
    path: "./testFiles/dump.cs"
  },
  "hooks": {
    methods: [{
      className: "FFGALNAPKCD",
      name: "GetTruePosition",
      mods: [{ //See Mod Types
        type: "savePointerParameters", 
      }]
    }, { 
      className: "MLPJGKEACMM",
      name: "SetCoolDown",
      mods: [{ 
        type: "replaceArguments",
        args: ["0f", "0f"] 
      }]
    }],
    "paths": [{ 
      name: "Player speed",
      entry: "FFGALNAPKCD.GetTruePosition.pointer1",
      path: "MyPhysics.Speed"
    }]
  },
}