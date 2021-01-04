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