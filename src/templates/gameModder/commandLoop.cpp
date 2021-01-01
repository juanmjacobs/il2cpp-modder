#include "pch.h"
#include "models.h"
#include "hooking.h"
#include "utils.h"
#include <iostream>
using namespace std;

PlayerAddresses getPlayer(HookedData* hookedData) 
{
    PlayerAddresses playerAddresses = PlayerAddresses();
    uintptr_t player = (*hookedData).player;
    printf("[] Player located at: %x\n", player);

    //log(std::string("[] Player located at ") + std::to_string((uintptr_t)myPlayerControl));
    uintptr_t* physics = (uintptr_t*)(player + 0x5c);
    printf("[] Player Physics located at: %x\n", physics);
    float* speed = (float*)(*physics + 0x24);
    printf("[*] Speed located at: %x \n", speed);

    bool* moveable = (bool*)(player + 0x30);
    printf("[*] moveable located at: %x \n", moveable);
    
    playerAddresses.speed = speed;
    playerAddresses.moveable = moveable;

    return playerAddresses;
}
void commandLoop(HookedData* hookedData)
{
    printf("[] Assembly located at: %x\n", (*hookedData).assembly);
    while (!(*hookedData).player) { printf("hookedData %x - Player control not found yet\n", hookedData); Sleep(1000); }
    
    int command = 0;
    while (true)
    {
        command = 0;
        printf("Available commands:\n  1 - change speed\n\n  2 - toggle freeze\n\n");
        printf("Enter a command: ");
        cin >> command;
        PlayerAddresses player = getPlayer(hookedData);
        if (command != 0)
        {
            switch (command)
            {
            case 1: // Change speed
            {
                printf("Your current speed is: %f\n", *(float*)player.speed);
                int new_speed = 0;
                printf("Enter new speed: ");
                scanf_s("%d", &new_speed);
                // We know from dnSpy that this variable is a float. Make it so.
                *(float*)player.speed = (float)new_speed;
                break;
            }
            case 2: // Toggle freeze
            {
                bool isMoveable = *player.moveable;
                auto from = isMoveable ? "moving" : "freezed";
                auto to = !isMoveable ? "moving" : "freezed";
                printf("Changing from ");
                printf(from);
                printf(" to ");
                printf(to);
                printf("\n");
                *(bool*)player.moveable = !(*player.moveable);
                break;
            }
            default:
                printf("Invalid command\n");
                break;
            }
        }
    }

}

void insertConsole()
{
    AllocConsole();
    FILE* f = new FILE();
    freopen_s(&f, "CONOUT$", "w", stdout);
    freopen_s(&f, "CONIN$", "r", stdin);
    printf("[*] Injected...\n");
    uintptr_t* player = nullptr;
    HookedData hookedData = HookedData();
    printf("[*] hookedData... %x\n", &hookedData);

    hookData(&hookedData);
    commandLoop(&hookedData);
}