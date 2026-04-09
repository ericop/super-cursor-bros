# Super Cursor Bros

Super Cursor Bros is a tiny retro hybrid game where a clicker and a platformer share one screen, one canvas, and one progression loop. You click on the left to earn Cursor Points that power up the platformer on the right, then you platform for Floppy Disks that come back and upgrade your clicker. The result is meant to feel like an old Windows desktop utility accidentally became a game and then got a little too ambitious.

Try the game at [https://ericop.github.io/super-cursor-bro/](https://ericop.github.io/super-cursor-bro/).

## Elevator Pitch

`Super Cursor Bros` is a single-screen HTML5 canvas prototype that merges two satisfying loops into one:

- Click the cursor core in a fake Windows 95 utility pane to build `Cursor Points`
- Spend those points on movement, jump, magnet, and floppy value upgrades for the platformer pane
- Run and jump through the platformer pane to collect `Floppy Disks`
- Spend those disks on click power, auto-click, combo, and crit upgrades for the clicker pane
- Unlock and equip collectible cursor skins that visually change the mascot across the game

It is designed to feel like one connected machine instead of two separate mini-games.

## Features

- Single `840x320` HTML5 canvas playfield
- Plain JavaScript with one HTML file and one JS file
- Retro Windows 3.1 / Windows 95 inspired UI styling
- Clicker and platformer systems with cross-fed currencies
- Cursor skin closet with cosmetic unlocks and small flavor bonuses
- Main menu, instructions, pause menu, fullscreen toggle, and return confirmation
- High contrast dark mode option
- Local save data for settings, best totals, and unlocked skins
- Lightweight generated lo-fi music system with mute and volume controls

## Files

- `index.html`: app shell, canvas, and fullscreen button
- `super-cursor-bros.js`: full game logic, rendering, input, audio, saving, menus, and data tables

## How To Play

### Goal

Grow both halves of the game by constantly feeding one side into the other:

- Earn `Cursor Points` on the left
- Spend `Cursor Points` on platformer upgrades on the right
- Earn `Floppy Disks` on the right
- Spend `Floppy Disks` on clicker upgrades on the left

### Controls

- `Mouse`: click buttons and the cursor core
- `Mouse` or `Touch`: click or tap inside the platformer pane to send the cursor there
- Higher clicks or taps in the platformer trigger auto-jumps toward upper platforms
- `Escape`: pause or resume

### Clicker Side

- Click the large cursor button to gain `Cursor Points`
- Fast repeated clicks build a combo multiplier
- Spend `Floppy Disks` in the left-side shop to improve:
- `Click Value`
- `Auto Click`
- `Combo Buffer`
- `Lucky Clicks`
- `Crit Boost`

### Platformer Side

- Click or tap where you want the cursor to walk
- Aim higher when you want to climb, and the cursor will auto-jump toward upper platforms
- Move through the desktop platforms and collect every floppy disk in the current wave
- Once all floppies are collected, a `SAVE` terminal appears
- Touch the `SAVE` terminal to cash in a wave bonus and start the next wave
- Spend `Cursor Points` in the right-side shop to improve:
- `Move Speed`
- `Jump Lift`
- `Disk Value`
- `Disk Spread`
- `Magnet Beam`

### Cursor Closet

- Open the `Cursor Closet` from the main menu, clicker pane, or pause menu
- Some skins are purchased with `Cursor Points` or `Floppy Disks`
- Some skins unlock from milestones like combo records or lifetime totals
- Equipped skins are mostly cosmetic, with a few very small bonus traits

### Pause Menu

The pause menu includes:

- Resume
- Mute toggle
- Music volume slider
- High contrast dark mode toggle
- Cursor skin access
- Return to main menu confirmation

## Running The Game

No build step is required.

1. Open `index.html` in a modern browser.
2. Click once anywhere to allow browser audio playback if you want music.
3. Play directly inside the canvas.

## Saving

The game stores persistent data with `localStorage`, including:

- unlocked cursor skins
- equipped skin
- best totals
- lifetime resource counts
- dark mode and audio settings

## License

This project is licensed under the MIT License. See `LICENSE`.
