# il2cpp-modder
Generate DLL injection templates for modding il2cpp games.

# Usage

- Get `dump.cs` from your il2cpp game via [IL2CppDumper](https://github.com/perfare/il2cppdumper)
- Set up your [rules](#rules)
- Run the template generator `node src/index.js "./path/to/rules.js"`
- Get your output files ready to compile with the tool of your choice! (I used visual studio)
	- `injector.cpp`: Source for a simple c++ console app project that will inject our DLL in the game executable (`exe` in rules.js). 
		- Always run as administrator!
		- If using vs, set string to multibyte
	- `gameModder`: Sources for a c++ DLL project with the mods you want!
- Compile the output files to get an `injector.exe` and a `gameModder.dll`
- Run the game as usual
- Run the injector.exe
- A modding console will appear for memory hacks and mod monitoring
- Hack away!


# Function mods
1) Hook the method you'd like to mod.
2) Use some mod type to change the behaviour as per your needs. You can 
	- fix a return value 
	- save some pointers 
	- replace the arguments of the original call
	- replace the whole implementation (c++ programming required)

# Memory hacks

1) Hook some methods to get the pointers to the objects you'd like to mod. Those pointers get saved to [HookedData](#hooked-data)
2) Define the paths you'd like to mod and the entry pointers (the ones you saved from your hooks in step 1!).
3) An interactive console will be generated and you can set the values you want


# Rules
You need to write a `rules.js` file telling `il2cpp-modder` what you'd like to mod! Here's an example file.
```
module.exports = {
	"game": {
		path: "path/to/game",
		exeName: "A Nice Game.exe"
	},
	"output": "path/to/output/dir" //optional, default "output"
	"dump": { 
		path: "path/to/dump.cs"
	},
	"hooks": {
		methods: [{ //Change some game functionality!
			className: "ClassToMod",
			name: "MethodToMod",
			trampolineHookBytes: 6, //See trampoline hook bytes
			mods: [{ //See Mod Types
				type: "aModType", 
				args: "modTypeArguments",
			}]
		}],
		"paths": [{ //Use this paths for memory hacking!
			name: "A descriptive name for the path", //Ex "Player speed"
			entryPath: "path.to.savedPointer",
			entryClass: "InitialClass", //Class starting the chain
			path: "MyPhysics.Speed"
		}]
	},
}
```
## Mod Types

- fixedReturnValue: 
	- Description: Always return a fixed value. (eg, always return true, false, 0, 9999, etc)
	- args: { type: "type", value: "value" } (ex { type: "bool", value: "true" })

- replaceArguments:
 	- Description: Call original method with replaced arguments. (ex, always call setter with true, false, 0, etc)
 	- args: the replaced arguments (Array) (ex `["firstArgument", "0f", "true"]`)

- savePointerToThis:
  - Description: save the reference to the parameters in the [HookedData](#hooked-data) struct. Useful for memory hacks!
  - args: No args required. (ex `SomeMethod(void* player, float amount)`, will save the `player` reference in `hookedData.SomeMethodThis` as an `uintptr_t`)

- replaceImplementation: 
	- Description: Just replace the whole thing
	- args: the new c++ implementation (String) (ex `"return theOriginalParameter + 10;"`)

## Trampoline hook bytes
[WTF is a trampoline hook?](https://stackoverflow.com/a/9336549)
A `jmp dir` instruction takes 5 bytes, 1 for the `jmp` and 4 for the `dir` (32 bits address).
So the `trampolineHookBytes` should be setted to the amount of bytes of complete assembly instructions (opcode + operands) of your function so that there is more than 5 bytes. 
I know, it sounds confusing! Lets see an example:
Fire up your [Cheat Engine](https://www.cheatengine.org/downloads.php) -> attach your process -> memory view -> CTRL G -> paste the `GameAssembly.dll + RVA of the function`. Remember, the RVA of the function is on dump.cs.
It should look something like this
![Cheat engine screenshot](https://i.imgur.com/ho5aAuw.png)
Now we should look at the `Bytes` column. We can see that our function starts with
```
55
8B EC
83 EC 14
80 3D 1DA7C205 00
...
```
Each line represents a complete assembly instruction. And remember, two characters = 1 byte. 
So let's add up the number of bytes of each line until we have more than 5!
```
55                     1 byte  --> 1. That's < 5, not enough bytes!
8B EC                  2 bytes --> 2 + 1 = 3. That's < 5, not enough bytes!
83 EC 14               3 bytes --> 2 + 1 + 3 = 6. 6 is > 5, so our magic number is 6!
80 3D 1DA7C205 00
...
```

## HookedData
il2cpp-modder will generate a struct name HookedData with all the saved parameter references for further modding