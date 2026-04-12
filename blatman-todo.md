# Blatman Game Development Todo List

## Game Overview
Blatman is a 2D overhead dungeon maze game inspired by Adventure (Atari 2600). Player explores a 5-room dungeon to collect BLAT sandwich components: Bacon, Lettuce, Avocado, Tomato, Bread.

## Core Features
- [x] Player character that moves with cursor keys
- [x] Main screen with rectangular wall and bottom opening
- [x] 5-room dungeon layout with room transitions
- [x] BLAT sandwich components as collectible items (one per room)
- [x] Item collection mechanics (touch to pick up)
- [x] Win condition when all 5 items are collected

## Technical Implementation
- [x] Set up Phaser scene with player sprite
- [x] Implement keyboard input for movement (arrow keys)
- [x] Create wall collision system
- [x] Design room layouts with walls and doors
- [x] Add item sprites in each room
- [x] Implement room transition logic
- [x] Track collected items
- [x] Display win message when all items collected
- [x] Add game state management (current room, inventory)

## Assets Needed
- [x] Player sprite/representation (blue rectangle)
- [x] Wall graphics or use rectangles (black rectangles)
- [x] Item sprites for BLAT components (colored rectangles)
- [x] Background graphics for rooms (black background)

## Testing & Polish
- [ ] Test movement and collision
- [ ] Test room transitions
- [ ] Test item collection
- [ ] Test win condition
- [ ] Add sound effects (optional)
- [ ] Add visual feedback for collected items