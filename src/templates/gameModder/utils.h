#pragma once
#include "pch.h"
#include <iostream>
#include <strsafe.h>

std::wstring s2ws(const std::string& s);
void ErrorExit(LPTSTR lpszFunction);
void log(std::string text);
