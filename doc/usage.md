# Usage steps
This steps will guide you to generate your DLL injection solution! You will end up with two files
- `injector.exe`: Performs DLL injection in the game
- `gameModder.dll`: Contains all the logic for your mods

To generate the files, you need to follow this steps
1. [Generate a dump.cs](#generate-dump)
2. [Define your rules and run the il2cpp-modder generator](#rules)
3. [Compile the output](#compiling)
4. [Execute your mod](#executing)

## Generate dump
In this step we are going to run the Il2CppDumper to get our `dump.cs` file.
You can generate the `dump.cs` and a base [rules.js](#rules) by running
```bash
il2cpp-modder generate-dump
```
You will be prompted for the game folder (where the game `.exe` is located).

If you don't want to be prompted, you can supply the game folder as an argument
```bash
il2cpp-modder generate-dump [game folder]
```
If everything is where it should be, that's it! You should now have an output directory called `[game]-il2cppdumper-output` including the `dump.cs`. Also, a base `rules.js` will be generated for you!

If a file needed for the Il2CppDumper analysis is missing from its usual location, you will be prompted for it
- Il2CppDumper.exe: Only if it is not on PATH. It is located on your Il2CppDumper installation folder
- GameAssembly.dll: It is usually in the game folder
- global-metadata.dat : It is usually in the [game folder]/[gameName_Data]/il2cpp_data/Metadata


## Rules
You need a [rules](https://github.com/juanmjacobs/il2cpp-modder/tree/main/doc/rules.md) file telling `il2cpp-modder` what you'd like to mod! 
Once you have your rules ready, run the generator!
```bash
il2cpp-modder rules.js
```
You should now have all your dll and dll injection code in your defined output folder.

## Compiling
You can compile the files with the tool of your choice. Here are the steps for Visual Studio!
  - To get the `injector.exe`
    - Create a new C++ console project and name it `injector`.
    - Add the `output/injector` files to the project. 
    - Compile it and the `injector.exe` will be in the `Debug` folder.
  - To get the `gameModder.dll`
    - Create a new C++ Dynamic Linked Library project and name it `gameModder`.
    - Add the `output/gameModder` files to the project. 
    - Compile it and the `gameModder.dll` will be in the `Debug` folder.

_TIP: Be sure to add the `.cpp` as source files and the `.h` files as header files_
_TIP: In some versions of visual studio pch.h is not included. Just delete the include "pch.h" from the sources_


## Executing
- Copy the `injector.exe` and `gameModder.dll` to the game folder
- Run the game executable as usual
- Run the injector.exe

That's it! Your methods will be automatically hooked as per your rule definitions. A modding console will appear for manual memory hacks and monitoring.
