# il2cpp-modder
Generate DLL injection templates for modding il2cpp games.

# Usage

- Get `dump.cs` from your il2cpp game via [IL2CppDumper](https://github.com/perfare/il2cppdumper). You can also use `il2cpp-modder` to [generate the dump.cs](#generate-dump) 
- Set up your [rules](#rules)
- Run the template generator `node il2cpp-modder.js "./path/to/rules.js"`
- Get your output files ready to compile with the tool of your choice! 
	- `injector.cpp`: Source for a simple c++ console app project that will inject our DLL in the game executable (`exe` in rules.js). 
		- Always run as administrator! (properties -> Linker -> Manifest File -> UAC Execution Level -> requireAdministrator)
		- If using vs, set string to multibyte (properties -> Advanced -> Character Set -> Use Multi-Byte Character Set)
	- `gameModder`: Sources for a c++ DLL project with the mods you want!
- Of course, you can modify the output files if you need to!
- Compile the output files to get an `injector.exe` and a `gameModder.dll`. I used Visual Studio!
  - For `injector.exe`
    - Create a new C++ console project and name it `injector`.
    - Add the `output/injector` files to the project. 
    - Compile it and the `injector.exe` will be in the `Debug` folder.
  - For `gameModder.dll`
    - Create a new C++ Dynamic Linked Library project and name it `gameModder`.
    - Add the `output/gameModder` files to the project. 
    - Compile it and the `gameModder.dll` will be in the `Debug` folder.
- copy the `injector.exe` and `gameModder.dll` to the game folder
- Run the game as usual
- Run the injector.exe
- Your methods will be automatically hooked as per your rule definitions.
- A modding console will appear for memory hacks and monitoring. 
- Hack away!


# Generate dump
You can generate the `dump.cs` of your game running
`node il2cpp-modder generate-dump [game folder] [output directory]`
If parameters are not supplied or not found, you will be prompted for them.
A base `rules.js` will also be generated for you!

# Rules
You need to write a `rules.js` file telling `il2cpp-modder` what you'd like to mod! Here's an example file.
```
module.exports = {
	"game": {
		path: "path/to/game", //optional
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
		}]
	},
}
```
## Mod Types

- fixedReturnValue: 
	- Description: Always return a fixed value. (eg, always return true, false, 0, 9999, etc)
	- args: the value to return (String) (ex 'true', '0.0f', '"some string"')

- replaceArguments:
 	- Description: Call original method with replaced arguments. (ex, always call setter with true, false, 0, etc)
 	- args: the replaced arguments (Array) (ex `["firstArgument", "0f", "true"]`)

- replaceImplementation:
	- Description: Just replace the whole thing
	- args: the new c++ implementation (String) (ex `"return theOriginalParameter + 10;"`)

- pathMemoryHack:
  - Description: Saves the reference to the `this` and the property paths you'd like to hack in the [HookedData](#hooked-data) struct. Useful for memory hacks!
  - args: An array of paths to memory hack! Values can be set automatically or via the mod console. Example:
  ```
    paths: [{ 
      name: "Player speed",
      path: "MyPhysics.Speed",
      value: "90" //optional: if `value` is set, the mod will constantly write it to the path. If it is not set, a console prompt will allow you to supply a value manually.
    }]
  ```

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
il2cpp-modder will generate a struct name HookedData with all the saved references for further modding or more advanced hacks.