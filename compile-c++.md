1. Install Visual Studio C++ support
2. Set all environment variables required for `cl` to work by running
"C:\Program Files (x86)\Microsoft Visual Studio\2019\Community\Common7\Tools\vsdevcmd.bat"
Replace 2019 with your version and Communitiy with your distribution (might be Enterprise)
3. `cl file.cpp anotherFile.cpp` builds an exe
4. `cl /DL file.cpp anotherFile.cpp` builds a DLL