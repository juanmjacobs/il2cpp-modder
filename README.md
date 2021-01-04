# il2cpp-modder
Generate DLL injection templates for reverse engineering and modding Unity il2cpp games.

# Motivation
So you've been researching how to do some hacky stuff in Unity games and stumbled upon the amazing [IL2CppDumper](https://github.com/perfare/il2cppdumper).
You have learned how to get and analyze the `dump.cs` and now **you know exactly _what_ you want to do, but you do not know _how_ to do it**. 
You know that you have to override some method, replace the value of some field in an object or something like that, but your low level programming skills with all that nasty pointer arithmetic and assembly are not quite there yet (don't worry, mine barely are, you'll get better!).

Well this is the project for you! il2cpp-modder lets you describre **what** to do and it will generate all the code to do it. That's it, **you don't have to program at all!**

# Examples
- [Make a method return a fixed value](https://github.com/juanmjacobs/il2cpp-modder/tree/main/doc/examples.md#fixed-return-value). Cool usages: Make a validation always `return true;`, a getter always `return 0;` or a really high number or just skip a void function replacing it for a `return;`
- [Replace the arguments for a method call](https://github.com/juanmjacobs/il2cpp-modder/tree/main/doc/examples.md#replace-arguments) Cool usages: Make a setter always set the same value (original `setCooldown(aVariable)` --> hooked `setCooldown(0)`)
- [Set the value of an object field](https://github.com/juanmjacobs/il2cpp-modder/tree/main/doc/examples.md#path-memory-hack). Cool usages: keep your health in always in 100 and your money always in 9999999.
- [Replace the implementation of a method](https://github.com/juanmjacobs/il2cpp-modder/tree/main/doc/examples.md#replace-implementation). If the other mods just don't cut it, you can just replace the whole thing for something different that suits your needs! The sky is the limit. You do need to program C++ for this though...

# Requirements
- NodeJS
- [IL2CppDumper](https://github.com/perfare/il2cppdumper) (add to PATH!)
- Visual Studio (Or any C++ compiler)

# Installation
```
git clone https://github.com/juanmjacobs/il2cpp-modder
cd il2cpp-modder
sh install.sh
```

# Usage
See the [usage documentation](https://github.com/juanmjacobs/il2cpp-modder/tree/main/doc/usage.md)

# Contributing

Issues and PRs are welcome!
