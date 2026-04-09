(function () {
  "use strict";

  // ---------------------------------------------------------------------------
  // Constants and data
  // ---------------------------------------------------------------------------

  const STORAGE_KEY = "super-cursor-bros-save-v1";
  const CANVAS_WIDTH = 840;
  const CANVAS_HEIGHT = 320;
  const GAME_STATES = {
    MAIN_MENU: "mainMenu",
    INSTRUCTIONS: "instructions",
    SKIN_SELECT: "skinSelect",
    PLAYING: "playing",
    PAUSED: "paused",
    CONFIRM_MENU: "confirmReturnToMenu"
  };

  const LAYOUT = {
    left: { x: 8, y: 8, w: 312, h: 304 },
    right: { x: 324, y: 8, w: 508, h: 304 },
    titleBarHeight: 20
  };

  const THEMES = {
    light: {
      desktopTop: "#31679e",
      desktopBottom: "#0f2744",
      panel: "#c0c0c0",
      panelAlt: "#d4d0c8",
      light: "#ffffff",
      lightSoft: "#f2f2f2",
      mid: "#9b9b9b",
      dark: "#3b3b3b",
      darkest: "#111111",
      text: "#111111",
      textMuted: "#414141",
      titleFill: "#0b4ea2",
      titleText: "#ffffff",
      buttonFace: "#c0c0c0",
      buttonHover: "#d8d8d8",
      buttonDisabled: "#aaaaaa",
      accent: "#0b4ea2",
      accentSoft: "#a7c6ff",
      success: "#1f7a1f",
      warn: "#8a4f00",
      danger: "#8d2020",
      clickPanel: "#d9dde4",
      platformSkyTop: "#7cb3ff",
      platformSkyBottom: "#b9d3ff",
      ground: "#6b6b6b",
      groundTop: "#9d9d9d",
      floppy: "#1f1f1f",
      floppyLabel: "#59b16a",
      tooltipFill: "#ffffe1"
    },
    dark: {
      desktopTop: "#060d13",
      desktopBottom: "#111d26",
      panel: "#0f1418",
      panelAlt: "#151c22",
      light: "#c8f7ff",
      lightSoft: "#7fd9e6",
      mid: "#30505a",
      dark: "#010304",
      darkest: "#000000",
      text: "#e5fdff",
      textMuted: "#8ac9d3",
      titleFill: "#123e4f",
      titleText: "#ffffff",
      buttonFace: "#172127",
      buttonHover: "#213038",
      buttonDisabled: "#1c2529",
      accent: "#1ae6ff",
      accentSoft: "#103743",
      success: "#5effa1",
      warn: "#ffe066",
      danger: "#ff7575",
      clickPanel: "#12191d",
      platformSkyTop: "#071318",
      platformSkyBottom: "#0d222a",
      ground: "#20363f",
      groundTop: "#3f6976",
      floppy: "#d0f8ff",
      floppyLabel: "#6dff9c",
      tooltipFill: "#0d1b1f"
    }
  };

  const CLICKER_UPGRADES = [
    { id: "clickPower", name: "Click Value", short: "Manual taps +1.", baseCost: 7, scale: 1.72, maxLevel: 8 },
    { id: "autoClick", name: "Auto Click", short: "Adds passive clicks/sec.", baseCost: 12, scale: 1.88, maxLevel: 7 },
    { id: "comboTimer", name: "Combo Buffer", short: "Fast clicks keep combo longer.", baseCost: 15, scale: 1.7, maxLevel: 6 },
    { id: "critChance", name: "Lucky Clicks", short: "Tiny chance for critical pops.", baseCost: 18, scale: 1.78, maxLevel: 6 },
    { id: "critMult", name: "Crit Boost", short: "Critical clicks hit harder.", baseCost: 22, scale: 1.82, maxLevel: 6 }
  ];

  const PLATFORM_UPGRADES = [
    { id: "moveSpeed", name: "Move Speed", short: "Cursor legs run faster.", baseCost: 18, scale: 1.55, maxLevel: 8 },
    { id: "jumpBoost", name: "Jump Lift", short: "Bigger hops for desk gaps.", baseCost: 20, scale: 1.58, maxLevel: 8 },
    { id: "diskValue", name: "Disk Value", short: "Each floppy is worth more.", baseCost: 24, scale: 1.6, maxLevel: 6 },
    { id: "spawnRate", name: "Disk Spread", short: "More floppy spawns per wave.", baseCost: 26, scale: 1.64, maxLevel: 5 },
    { id: "magnet", name: "Magnet Beam", short: "Pull nearby floppies inward.", baseCost: 28, scale: 1.66, maxLevel: 6 }
  ];

  const SKINS = [
    { id: "classic", name: "Classic Arrow", draw: "classic", description: "The office default. Crisp, polite, union approved.", unlock: { type: "default" }, bonusText: "No bonus. Pure heritage." },
    { id: "win95", name: "Win95 Arrow", draw: "win95", description: "Sharper edges for more executive pointing.", unlock: { type: "buy", currency: "disks", amount: 12 }, bonusText: "No bonus. Just extra swagger." },
    { id: "hourglass", name: "Busy Hourglass", draw: "hourglass", description: "Please wait while the clicking intensifies.", unlock: { type: "buy", currency: "cursorPoints", amount: 120 }, bonus: { autoClick: 0.15 }, bonusText: "+0.15 auto clicks/sec." },
    { id: "spin", name: "Spinner Cursor", draw: "spinner", description: "A deluxe loading icon for dramatic entrances.", unlock: { type: "milestone", metric: "lifetimeDisks", amount: 35, label: "Collect 35 floppy disks lifetime" }, bonus: { autoClick: 0.25 }, bonusText: "+0.25 auto clicks/sec." },
    { id: "invert", name: "Inverted Cursor", draw: "invert", description: "For the power user who reads manuals after midnight.", unlock: { type: "buy", currency: "disks", amount: 26 }, bonus: { critChance: 0.02 }, bonusText: "+2% crit chance." },
    { id: "hand", name: "Retro Hand", draw: "hand", description: "One finger, many ambitions.", unlock: { type: "buy", currency: "cursorPoints", amount: 220 }, bonus: { manualClick: 1 }, bonusText: "+1 manual click power." },
    { id: "crosshair", name: "Crosshair", draw: "crosshair", description: "Precision docking for floppy retrieval.", unlock: { type: "buy", currency: "cursorPoints", amount: 340 }, bonus: { magnet: 10 }, bonusText: "+10 pickup magnet radius." },
    { id: "ibeam", name: "I-Beam", draw: "ibeam", description: "Drafting memos and combo chains in equal measure.", unlock: { type: "buy", currency: "disks", amount: 42 }, bonus: { comboWindow: 0.25 }, bonusText: "+0.25s combo time." },
    { id: "thinking", name: "Thinking Cursor", draw: "thinking", description: "A pointer with ideas above its pay grade.", unlock: { type: "milestone", metric: "bestCursorPoints", amount: 160, label: "Earn 160 cursor points in one run" }, bonus: { jumpBoost: 10 }, bonusText: "+10 jump strength." },
    { id: "wizard", name: "System Wizard", draw: "wizard", description: "Installed from a suspiciously wonderful floppy.", unlock: { type: "buy", currency: "disks", amount: 68 }, bonus: { critMult: 0.2 }, bonusText: "+0.2 crit multiplier." },
    { id: "ghost", name: "Pixel Ghost", draw: "ghost", description: "Haunts old control panels and bargain bins.", unlock: { type: "milestone", metric: "comboPeak", amount: 2, label: "Reach a 2.0x click combo" }, bonusText: "Cosmetic only. Boo, but lovingly." },
    { id: "glitch", name: "Secret Glitch", draw: "glitch", description: "When the cursor stares back at the operating system.", unlock: { type: "milestone", metric: "dualMastery", amount: 1, label: "Own 250 cursor points earned and 80 floppy disks lifetime" }, bonus: { manualClick: 0.5, critChance: 0.01 }, bonusText: "+0.5 click power and +1% crit chance." }
  ];

  const canvas = document.getElementById("gameCanvas");
  const fullscreenButton = document.getElementById("fullscreenButton");
  const gameShell = document.getElementById("gameShell");

  if (!canvas || !fullscreenButton || !gameShell) {
    return;
  }

  const ctx = canvas.getContext("2d");

  // ---------------------------------------------------------------------------
  // Mutable state
  // ---------------------------------------------------------------------------

  const runtime = {
    now: performance.now(),
    elapsed: 0,
    uiRegions: [],
    mouse: { x: 0, y: 0, down: false },
    hoveredTooltip: "",
    hoveredTooltipPos: { x: 0, y: 0 },
    keys: {},
    pressedKeys: {},
    drag: null,
    saveDirty: false,
    saveTimer: 0
  };

  const gameState = {
    mode: GAME_STATES.MAIN_MENU,
    skinReturnState: GAME_STATES.MAIN_MENU,
    selectedSkinId: "classic",
    bootTicker: 0,
    notification: "",
    notificationTimer: 0
  };

  const settingsState = {
    darkMode: false,
    mute: false,
    volume: 0.42
  };

  const metaState = {
    unlockedSkins: ["classic"],
    equippedSkin: "classic",
    bestCursorPoints: 0,
    bestDisks: 0,
    lifetimeClicks: 0,
    lifetimeDisks: 0,
    comboPeak: 1,
    dualMastery: 0
  };

  const clickerState = {};
  const platformerState = {};
  const audioState = {
    context: null,
    masterGain: null,
    nextBeatTime: 0,
    beatIndex: 0,
    unlocked: false
  };

  loadPersistentState();
  checkSkinUnlocks();
  resetRunState();
  bindEvents();
  requestAnimationFrame(loop);

  // ---------------------------------------------------------------------------
  // Setup and persistence
  // ---------------------------------------------------------------------------

  function resetRunState() {
    Object.assign(clickerState, {
      cursorPoints: 0,
      totalEarned: 0,
      manualClicks: 0,
      lastClickAt: -99,
      comboStreak: 0,
      comboDisplay: 1,
      buttonPulse: 0,
      buttonOffset: 0,
      floatingTexts: [],
      particles: [],
      upgradeLevels: {
        clickPower: 0,
        autoClick: 0,
        comboTimer: 0,
        critChance: 0,
        critMult: 0
      }
    });

    Object.assign(platformerState, {
      disks: 0,
      totalEarned: 0,
      wave: 1,
      waveCollected: 0,
      collectibles: [],
      particles: [],
      goal: { x: 444, y: 110, w: 28, h: 30, active: false, bonus: 0 },
      upgradeLevels: {
        moveSpeed: 0,
        jumpBoost: 0,
        diskValue: 0,
        spawnRate: 0,
        magnet: 0
      },
      player: {
        x: 24,
        y: 115,
        w: 18,
        h: 24,
        vx: 0,
        vy: 0,
        facing: 1,
        onGround: false
      },
      navigation: {
        active: false,
        targetX: 24,
        targetY: 115,
        targetPlatformY: 138
      },
      world: { x: 0, y: 0, w: 480, h: 156 },
      platforms: createPlatforms(),
      hintFlash: 0
    });

    spawnCollectibles();
  }

  function createPlatforms() {
    return [
      { x: 0, y: 138, w: 480, h: 18 },
      { x: 60, y: 106, w: 88, h: 10 },
      { x: 184, y: 84, w: 96, h: 10 },
      { x: 308, y: 102, w: 88, h: 10 },
      { x: 390, y: 68, w: 70, h: 10 }
    ];
  }

  function loadPersistentState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return;
      }
      const saved = JSON.parse(raw);
      if (saved.settings) {
        settingsState.darkMode = !!saved.settings.darkMode;
        settingsState.mute = !!saved.settings.mute;
        settingsState.volume = clamp(Number(saved.settings.volume) || settingsState.volume, 0, 1);
      }
      if (saved.meta) {
        metaState.unlockedSkins = Array.isArray(saved.meta.unlockedSkins) && saved.meta.unlockedSkins.length
          ? saved.meta.unlockedSkins.filter(isKnownSkinId)
          : ["classic"];
        if (!metaState.unlockedSkins.includes("classic")) {
          metaState.unlockedSkins.unshift("classic");
        }
        metaState.equippedSkin = isKnownSkinId(saved.meta.equippedSkin) ? saved.meta.equippedSkin : "classic";
        if (!metaState.unlockedSkins.includes(metaState.equippedSkin)) {
          metaState.equippedSkin = "classic";
        }
        metaState.bestCursorPoints = Number(saved.meta.bestCursorPoints) || 0;
        metaState.bestDisks = Number(saved.meta.bestDisks) || 0;
        metaState.lifetimeClicks = Number(saved.meta.lifetimeClicks) || 0;
        metaState.lifetimeDisks = Number(saved.meta.lifetimeDisks) || 0;
        metaState.comboPeak = Number(saved.meta.comboPeak) || 1;
        metaState.dualMastery = Number(saved.meta.dualMastery) || 0;
      }
    } catch (error) {
      console.warn("Save data could not be loaded:", error);
    }
    gameState.selectedSkinId = metaState.equippedSkin;
  }

  function savePersistentState() {
    runtime.saveDirty = false;
    runtime.saveTimer = 0;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          settings: settingsState,
          meta: metaState
        })
      );
    } catch (error) {
      console.warn("Save data could not be written:", error);
    }
  }

  function markSaveDirty() {
    runtime.saveDirty = true;
  }

  // ---------------------------------------------------------------------------
  // Input and browser events
  // ---------------------------------------------------------------------------

  function bindEvents() {
    canvas.addEventListener("mousemove", handlePointerMove);
    canvas.addEventListener("mousedown", handlePointerDown);
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd, { passive: false });
    canvas.addEventListener("touchcancel", handleTouchEnd, { passive: false });
    window.addEventListener("mouseup", handlePointerUp);
    canvas.addEventListener("mouseleave", handlePointerUp);
    canvas.addEventListener("contextmenu", function (event) {
      event.preventDefault();
    });

    window.addEventListener("keydown", function (event) {
      const code = event.code;
      if (isGameControlKey(code)) {
        event.preventDefault();
      }
      runtime.keys[code] = true;
      if (!event.repeat) {
        runtime.pressedKeys[code] = true;
      }
      unlockAudio();
      if (code === "Escape") {
        handleEscape();
      }
    });

    window.addEventListener("keyup", function (event) {
      delete runtime.keys[event.code];
    });

    fullscreenButton.addEventListener("click", function () {
      toggleFullscreen();
      unlockAudio();
    });

    window.addEventListener("beforeunload", function () {
      if (runtime.saveDirty) {
        savePersistentState();
      }
    });
  }

  function isGameControlKey(code) {
    return ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "KeyA", "KeyD", "KeyW", "KeyS", "Space", "Escape"].includes(code);
  }

  function handleEscape() {
    if (gameState.mode === GAME_STATES.PLAYING) {
      gameState.mode = GAME_STATES.PAUSED;
    } else if (gameState.mode === GAME_STATES.PAUSED) {
      gameState.mode = GAME_STATES.PLAYING;
    } else if (gameState.mode === GAME_STATES.CONFIRM_MENU) {
      gameState.mode = GAME_STATES.PAUSED;
    } else if (gameState.mode === GAME_STATES.INSTRUCTIONS || gameState.mode === GAME_STATES.SKIN_SELECT) {
      gameState.mode = gameState.skinReturnState || GAME_STATES.MAIN_MENU;
    }
  }

  function handlePointerMove(event) {
    const point = getCanvasPoint(event);
    runtime.mouse.x = point.x;
    runtime.mouse.y = point.y;
    if (runtime.drag && runtime.drag.type === "volume") {
      updateVolumeFromSlider(point.x, runtime.drag.rect);
    }
  }

  function handlePointerDown(event) {
    const point = getCanvasPoint(event);
    runtime.mouse.x = point.x;
    runtime.mouse.y = point.y;
    runtime.mouse.down = true;
    unlockAudio();

    const region = findTopRegion(point.x, point.y);
    if (!region || region.disabled) {
      return;
    }

    if (region.type === "slider") {
      runtime.drag = { type: "volume", rect: region.rect };
      updateVolumeFromSlider(point.x, region.rect);
      return;
    }

    if (typeof region.onClick === "function") {
      region.onClick();
    }
  }

  function handlePointerUp() {
    runtime.mouse.down = false;
    runtime.drag = null;
  }

  function handleTouchStart(event) {
    event.preventDefault();
    runtime.mouse.down = true;
    unlockAudio();
    syncTouchPointer(event.touches);

    const touch = event.changedTouches[0];
    if (!touch) {
      return;
    }
    const point = getCanvasPoint(touch);
    const region = findTopRegion(point.x, point.y);
    if (!region || region.disabled) {
      return;
    }

    if (region.type === "slider") {
      runtime.drag = { type: "volume", rect: region.rect };
      updateVolumeFromSlider(point.x, region.rect);
      return;
    }

    if (typeof region.onClick === "function") {
      region.onClick();
    }
  }

  function handleTouchMove(event) {
    event.preventDefault();
    syncTouchPointer(event.touches);
    if (runtime.drag && runtime.drag.type === "volume" && event.touches[0]) {
      const point = getCanvasPoint(event.touches[0]);
      updateVolumeFromSlider(point.x, runtime.drag.rect);
    }
  }

  function handleTouchEnd(event) {
    event.preventDefault();
    syncTouchPointer(event.touches);
    if (!event.touches.length) {
      runtime.mouse.down = false;
      runtime.drag = null;
    }
  }

  function getCanvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  function findTopRegion(x, y) {
    for (let i = runtime.uiRegions.length - 1; i >= 0; i -= 1) {
      const region = runtime.uiRegions[i];
      if (pointInRect(x, y, region.rect)) {
        return region;
      }
    }
    return null;
  }

  function syncTouchPointer(touches) {
    if (!touches || !touches.length) {
      return;
    }
    const point = getCanvasPoint(touches[0]);
    runtime.mouse.x = point.x;
    runtime.mouse.y = point.y;
  }

  // ---------------------------------------------------------------------------
  // Main loop
  // ---------------------------------------------------------------------------

  function loop(timestamp) {
    const dt = Math.min(0.033, (timestamp - runtime.now) / 1000 || 0);
    runtime.now = timestamp;
    runtime.elapsed += dt;

    update(dt);
    render();

    runtime.pressedKeys = {};
    requestAnimationFrame(loop);
  }

  function update(dt) {
    gameState.bootTicker += dt;

    if (gameState.notificationTimer > 0) {
      gameState.notificationTimer = Math.max(0, gameState.notificationTimer - dt);
      if (gameState.notificationTimer === 0) {
        gameState.notification = "";
      }
    }

    if (gameState.mode === GAME_STATES.PLAYING) {
      updateClicker(dt);
      updatePlatformer(dt);
      checkSkinUnlocks();
    }

    if (runtime.saveDirty) {
      runtime.saveTimer += dt;
      if (runtime.saveTimer >= 1.2) {
        savePersistentState();
      }
    }

    scheduleMusic();
  }

  // ---------------------------------------------------------------------------
  // Game logic: clicker
  // ---------------------------------------------------------------------------

  function getSkin() {
    return getSkinById(metaState.equippedSkin);
  }

  function getSkinById(id) {
    return SKINS.find(function (skin) {
      return skin.id === id;
    }) || SKINS[0];
  }

  function getClickerStats() {
    const levels = clickerState.upgradeLevels;
    const bonus = getSkin().bonus || {};
    return {
      manualClick: 1 + levels.clickPower + (bonus.manualClick || 0),
      autoClick: levels.autoClick * 0.45 + (bonus.autoClick || 0),
      comboWindow: 0.82 + levels.comboTimer * 0.18 + (bonus.comboWindow || 0),
      critChance: levels.critChance * 0.04 + (bonus.critChance || 0),
      critMult: 1.6 + levels.critMult * 0.25 + (bonus.critMult || 0)
    };
  }

  function getPlatformerStats() {
    const levels = platformerState.upgradeLevels;
    const bonus = getSkin().bonus || {};
    return {
      speed: 135 + levels.moveSpeed * 14,
      jump: 246 + levels.jumpBoost * 18 + (bonus.jumpBoost || 0),
      diskValue: 1 + levels.diskValue * 0.4,
      spawnCount: 4 + levels.spawnRate,
      magnet: levels.magnet * 18 + (bonus.magnet || 0)
    };
  }

  function updateClicker(dt) {
    const stats = getClickerStats();

    clickerState.buttonPulse = Math.max(0, clickerState.buttonPulse - dt * 4);
    clickerState.buttonOffset = lerp(clickerState.buttonOffset, 0, dt * 14);

    if (stats.autoClick > 0) {
      addCursorPoints(stats.autoClick * dt, null, false);
    }

    if (clickerState.lastClickAt > 0 && runtime.elapsed - clickerState.lastClickAt > stats.comboWindow) {
      clickerState.comboStreak = 0;
      clickerState.comboDisplay = 1;
    }

    updateFloaters(clickerState.floatingTexts, dt);
    updateParticles(clickerState.particles, dt);
  }

  function clickCursorButton(x, y) {
    const stats = getClickerStats();
    const withinCombo = runtime.elapsed - clickerState.lastClickAt <= stats.comboWindow;

    clickerState.comboStreak = withinCombo ? clickerState.comboStreak + 1 : 1;
    clickerState.lastClickAt = runtime.elapsed;
    clickerState.comboDisplay = 1 + Math.min(1.2, Math.floor((clickerState.comboStreak - 1) / 3) * 0.2);
    metaState.comboPeak = Math.max(metaState.comboPeak, clickerState.comboDisplay);

    const crit = Math.random() < stats.critChance;
    const amount = stats.manualClick * clickerState.comboDisplay * (crit ? stats.critMult : 1);
    addCursorPoints(amount, { x: x, y: y }, true, crit ? "CRIT " + formatNumber(amount) : "+" + formatNumber(amount));
    clickerState.manualClicks += 1;
    clickerState.buttonPulse = 1;
    clickerState.buttonOffset = 2;

    for (let i = 0; i < 7; i += 1) {
      clickerState.particles.push({
        x: x + randomRange(-10, 10),
        y: y + randomRange(-10, 10),
        vx: randomRange(-34, 34),
        vy: randomRange(-70, -20),
        life: randomRange(0.25, 0.45),
        maxLife: 0.45,
        color: crit ? THEMES.light.warn : "#0b4ea2"
      });
    }

    markSaveDirty();
  }

  function addCursorPoints(amount, origin, showText, customText) {
    clickerState.cursorPoints += amount;
    clickerState.totalEarned += amount;
    metaState.lifetimeClicks += amount;
    metaState.bestCursorPoints = Math.max(metaState.bestCursorPoints, clickerState.totalEarned);
    updateDualMastery();

    if (showText && origin) {
      clickerState.floatingTexts.push({
        x: origin.x,
        y: origin.y,
        text: customText || "+" + formatNumber(amount),
        color: "#0b4ea2",
        life: 0.7,
        maxLife: 0.7
      });
    }

    markSaveDirty();
  }

  // ---------------------------------------------------------------------------
  // Game logic: platformer
  // ---------------------------------------------------------------------------

  function updatePlatformer(dt) {
    updateParticles(platformerState.particles, dt);

    const stats = getPlatformerStats();
    const player = platformerState.player;
    const nav = platformerState.navigation;
    const gravity = 650;

    if (nav.active) {
      const playerCenterX = player.x + player.w / 2;
      const dx = nav.targetX - playerCenterX;
      if (Math.abs(dx) > 5) {
        player.vx = Math.sign(dx) * stats.speed;
        player.facing = dx < 0 ? -1 : 1;
      } else {
        player.vx = lerp(player.vx, 0, dt * 10);
      }

      if (player.onGround && shouldAutoJumpToTarget(player, nav, stats)) {
        player.vy = -stats.jump;
        player.onGround = false;
      }
    } else {
      player.vx = lerp(player.vx, 0, dt * 10);
    }

    player.vy += gravity * dt;
    movePlayer(dt);

    if (nav.active && hasReachedNavigationTarget(player, nav)) {
      nav.active = false;
      player.vx = lerp(player.vx, 0, dt * 10);
    }

    if (player.y > platformerState.world.h + 32) {
      player.x = 24;
      player.y = 115;
      player.vx = 0;
      player.vy = 0;
      nav.active = false;
      platformerState.hintFlash = 1;
      setNotification("The desktop swallowed you. Rebooting position...");
    }

    updateCollectibles(dt, stats.magnet, stats.diskValue);

    if (platformerState.goal.active && rectsOverlap(player, platformerState.goal)) {
      const waveBonus = platformerState.goal.bonus;
      addDisks(waveBonus, { x: LAYOUT.right.x + 460, y: LAYOUT.right.y + 96 });
      platformerState.wave += 1;
      platformerState.waveCollected = 0;
      platformerState.goal.active = false;
      spawnCollectibles();
      setNotification("Wave synced. More floppies escaped the drawer.");
    }

    platformerState.hintFlash = Math.max(0, platformerState.hintFlash - dt * 2);
  }

  function shouldAutoJumpToTarget(player, nav, stats) {
    const playerCenterX = player.x + player.w / 2;
    const dx = nav.targetX - playerCenterX;
    const higherTarget = nav.targetY < player.y - 10;
    return higherTarget && Math.abs(dx) > 8 && Math.abs(dx) < Math.max(72, stats.speed * 0.58);
  }

  function hasReachedNavigationTarget(player, nav) {
    const playerCenterX = player.x + player.w / 2;
    const closeX = Math.abs(nav.targetX - playerCenterX) <= 6;
    const closeY = Math.abs(nav.targetY - player.y) <= 8;
    return closeX && (closeY || nav.targetY >= player.y - 6);
  }

  function movePlayer(dt) {
    const player = platformerState.player;
    player.x += player.vx * dt;
    player.x = clamp(player.x, 0, platformerState.world.w - player.w);

    player.y += player.vy * dt;
    player.onGround = false;

    for (let i = 0; i < platformerState.platforms.length; i += 1) {
      const platform = platformerState.platforms[i];
      if (
        player.vy >= 0 &&
        player.x + player.w > platform.x &&
        player.x < platform.x + platform.w &&
        player.y + player.h >= platform.y &&
        player.y + player.h <= platform.y + 14
      ) {
        player.y = platform.y - player.h;
        player.vy = 0;
        player.onGround = true;
      }
    }
  }

  function updateCollectibles(dt, magnetRadius, diskValue) {
    const player = platformerState.player;
    let remaining = 0;

    for (let i = 0; i < platformerState.collectibles.length; i += 1) {
      const disk = platformerState.collectibles[i];
      disk.bob += dt * 3.5;
      const dx = player.x + player.w / 2 - disk.x;
      const dy = player.y + player.h / 2 - disk.y;
      const dist = Math.hypot(dx, dy);

      if (magnetRadius > 0 && dist < magnetRadius + 16) {
        const pull = (1 - dist / (magnetRadius + 16)) * 55 * dt;
        disk.x += dx * pull * 0.05;
        disk.y += dy * pull * 0.05;
      }

      if (dist < 15) {
        addDisks(diskValue, { x: LAYOUT.right.x + 20 + disk.x, y: LAYOUT.right.y + 40 + disk.y });
        platformerState.waveCollected += 1;

        for (let j = 0; j < 6; j += 1) {
          platformerState.particles.push({
            x: LAYOUT.right.x + 20 + disk.x,
            y: LAYOUT.right.y + 40 + disk.y,
            vx: randomRange(-26, 26),
            vy: randomRange(-52, -18),
            life: randomRange(0.25, 0.45),
            maxLife: 0.45,
            color: "#59b16a"
          });
        }
        disk.collected = true;
      } else {
        remaining += 1;
      }
    }

    platformerState.collectibles = platformerState.collectibles.filter(function (disk) {
      return !disk.collected;
    });

    if (remaining === 0 && !platformerState.goal.active) {
      platformerState.goal.active = true;
      platformerState.goal.bonus = 3 + Math.floor(platformerState.wave / 2) + platformerState.upgradeLevels.spawnRate;
      setNotification("SYNC READY. Touch the save terminal for bonus disks.");
    }
  }

  function spawnCollectibles() {
    const stats = getPlatformerStats();
    const pads = [
      { x: 36, y: 126 },
      { x: 98, y: 94 },
      { x: 132, y: 94 },
      { x: 206, y: 72 },
      { x: 248, y: 72 },
      { x: 330, y: 90 },
      { x: 370, y: 90 },
      { x: 416, y: 56 },
      { x: 448, y: 126 }
    ];

    const count = Math.min(pads.length, stats.spawnCount + Math.floor((platformerState.wave - 1) / 2));
    const shuffled = pads.slice().sort(function () {
      return Math.random() - 0.5;
    });

    platformerState.collectibles = shuffled.slice(0, count).map(function (pad, index) {
      return {
        x: pad.x + (index % 2 === 0 ? -3 : 3),
        y: pad.y,
        bob: Math.random() * Math.PI * 2,
        collected: false
      };
    });

    platformerState.goal.active = false;
    platformerState.goal.bonus = 0;
  }

  function addDisks(amount, origin) {
    platformerState.disks += amount;
    platformerState.totalEarned += amount;
    metaState.lifetimeDisks += amount;
    metaState.bestDisks = Math.max(metaState.bestDisks, platformerState.totalEarned);
    updateDualMastery();

    platformerState.particles.push({
      x: origin.x,
      y: origin.y,
      vx: 0,
      vy: -26,
      life: 0.6,
      maxLife: 0.6,
      text: "+" + formatNumber(amount) + " disk"
    });

    markSaveDirty();
  }

  function updateDualMastery() {
    if (metaState.lifetimeClicks >= 250 && metaState.lifetimeDisks >= 80) {
      metaState.dualMastery = 1;
    }
  }

  // ---------------------------------------------------------------------------
  // Upgrades and skins
  // ---------------------------------------------------------------------------

  function getUpgradeCost(upgrade, level) {
    return Math.round(upgrade.baseCost * Math.pow(upgrade.scale, level));
  }

  function buyClickerUpgrade(id) {
    const upgrade = CLICKER_UPGRADES.find(function (item) {
      return item.id === id;
    });
    if (!upgrade) {
      return;
    }
    const level = clickerState.upgradeLevels[id];
    if (level >= upgrade.maxLevel) {
      return;
    }
    const cost = getUpgradeCost(upgrade, level);
    if (platformerState.disks < cost) {
      return;
    }
    platformerState.disks -= cost;
    clickerState.upgradeLevels[id] += 1;
    setNotification(upgrade.name + " upgraded. Your cursor union negotiated a raise.");
    markSaveDirty();
  }

  function buyPlatformUpgrade(id) {
    const upgrade = PLATFORM_UPGRADES.find(function (item) {
      return item.id === id;
    });
    if (!upgrade) {
      return;
    }
    const level = platformerState.upgradeLevels[id];
    if (level >= upgrade.maxLevel) {
      return;
    }
    const cost = getUpgradeCost(upgrade, level);
    if (clickerState.cursorPoints < cost) {
      return;
    }
    clickerState.cursorPoints -= cost;
    platformerState.upgradeLevels[id] += 1;
    if (id === "spawnRate") {
      spawnCollectibles();
    }
    setNotification(upgrade.name + " installed on the platformer side.");
    markSaveDirty();
  }

  function checkSkinUnlocks() {
    for (let i = 0; i < SKINS.length; i += 1) {
      const skin = SKINS[i];
      if (metaState.unlockedSkins.includes(skin.id)) {
        continue;
      }
      if (skin.unlock.type === "milestone" && meetsSkinMilestone(skin.unlock)) {
        metaState.unlockedSkins.push(skin.id);
        gameState.selectedSkinId = skin.id;
        setNotification("New cursor skin unlocked: " + skin.name);
        markSaveDirty();
      }
    }
  }

  function meetsSkinMilestone(unlock) {
    if (unlock.metric === "lifetimeDisks") {
      return metaState.lifetimeDisks >= unlock.amount;
    }
    if (unlock.metric === "bestCursorPoints") {
      return metaState.bestCursorPoints >= unlock.amount;
    }
    if (unlock.metric === "comboPeak") {
      return metaState.comboPeak >= unlock.amount;
    }
    if (unlock.metric === "dualMastery") {
      return metaState.dualMastery >= unlock.amount;
    }
    return false;
  }

  function tryBuySelectedSkin() {
    const skin = getSkinById(gameState.selectedSkinId);
    if (!skin || metaState.unlockedSkins.includes(skin.id) || skin.unlock.type !== "buy") {
      return;
    }
    const amount = skin.unlock.amount;
    if (skin.unlock.currency === "disks") {
      if (platformerState.disks < amount) {
        return;
      }
      platformerState.disks -= amount;
    } else {
      if (clickerState.cursorPoints < amount) {
        return;
      }
      clickerState.cursorPoints -= amount;
    }
    metaState.unlockedSkins.push(skin.id);
    metaState.equippedSkin = skin.id;
    setNotification("Skin purchased: " + skin.name);
    markSaveDirty();
  }

  function equipSelectedSkin() {
    const skin = getSkinById(gameState.selectedSkinId);
    if (!skin || !metaState.unlockedSkins.includes(skin.id)) {
      return;
    }
    metaState.equippedSkin = skin.id;
    setNotification("Equipped " + skin.name + ".");
    markSaveDirty();
  }

  // ---------------------------------------------------------------------------
  // Audio
  // ---------------------------------------------------------------------------

  function unlockAudio() {
    if (!window.AudioContext && !window.webkitAudioContext) {
      return;
    }
    if (!audioState.context) {
      try {
        const AudioCtor = window.AudioContext || window.webkitAudioContext;
        audioState.context = new AudioCtor();
        audioState.masterGain = audioState.context.createGain();
        audioState.masterGain.gain.value = settingsState.mute ? 0 : settingsState.volume * 0.12;
        audioState.masterGain.connect(audioState.context.destination);
        audioState.nextBeatTime = audioState.context.currentTime;
        audioState.unlocked = true;
      } catch (error) {
        console.warn("Audio initialization failed:", error);
        return;
      }
    }
    if (audioState.context && audioState.context.state === "suspended") {
      audioState.context.resume().catch(function () {
        return undefined;
      });
    }
  }

  function scheduleMusic() {
    if (!audioState.context || !audioState.masterGain || !audioState.unlocked || settingsState.mute) {
      if (audioState.masterGain) {
        audioState.masterGain.gain.value = 0;
      }
      return;
    }

    audioState.masterGain.gain.value = settingsState.volume * 0.12;
    const beatLength = 60 / 82;
    const lookAhead = 0.18;

    while (audioState.nextBeatTime < audioState.context.currentTime + lookAhead) {
      const step = audioState.beatIndex % 8;
      const bassLine = [164.81, 164.81, 196.0, 164.81, 146.83, 146.83, 196.0, 220.0];
      if (step % 2 === 0) {
        playKick(audioState.nextBeatTime);
      }
      playTone(bassLine[step], audioState.nextBeatTime, beatLength * 0.7, "triangle", 0.06);
      if (step === 2 || step === 6) {
        playTone(bassLine[step] * 2, audioState.nextBeatTime + 0.06, beatLength * 0.25, "sine", 0.035);
      }
      audioState.nextBeatTime += beatLength;
      audioState.beatIndex += 1;
    }
  }

  function playKick(time) {
    if (!audioState.context || settingsState.mute) {
      return;
    }
    const osc = audioState.context.createOscillator();
    const gain = audioState.context.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(140, time);
    osc.frequency.exponentialRampToValueAtTime(44, time + 0.12);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(0.08, time + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.13);
    osc.connect(gain);
    gain.connect(audioState.masterGain);
    osc.start(time);
    osc.stop(time + 0.16);
  }

  function playTone(frequency, time, duration, type, volume) {
    if (!audioState.context || settingsState.mute) {
      return;
    }
    const osc = audioState.context.createOscillator();
    const gain = audioState.context.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, time);
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.linearRampToValueAtTime(volume, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);
    osc.connect(gain);
    gain.connect(audioState.masterGain);
    osc.start(time);
    osc.stop(time + duration + 0.02);
  }

  function updateVolumeFromSlider(mouseX, rect) {
    const ratio = clamp((mouseX - rect.x) / rect.w, 0, 1);
    settingsState.volume = ratio;
    if (audioState.masterGain && !settingsState.mute) {
      audioState.masterGain.gain.value = settingsState.volume * 0.12;
    }
    markSaveDirty();
  }

  // ---------------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------------

  function render() {
    const theme = getTheme();
    runtime.uiRegions = [];
    runtime.hoveredTooltip = "";

    drawDesktop(theme);

    if (gameState.mode === GAME_STATES.MAIN_MENU) {
      renderMainMenu(theme);
    } else if (gameState.mode === GAME_STATES.INSTRUCTIONS) {
      renderInstructions(theme);
    } else if (gameState.mode === GAME_STATES.SKIN_SELECT) {
      renderSkinSelect(theme);
    } else if (gameState.mode === GAME_STATES.PLAYING) {
      renderPlaying(theme, false);
    } else if (gameState.mode === GAME_STATES.PAUSED) {
      renderPlaying(theme, true);
      renderPauseMenu(theme);
    } else if (gameState.mode === GAME_STATES.CONFIRM_MENU) {
      renderPlaying(theme, true);
      renderConfirmMenu(theme);
    }

    if (gameState.notification) {
      drawNotification(theme, gameState.notification);
    }
    if (runtime.hoveredTooltip) {
      drawTooltip(theme, runtime.hoveredTooltip, runtime.hoveredTooltipPos.x, runtime.hoveredTooltipPos.y);
    }
  }

  function renderPlaying(theme, dimmed) {
    renderClickerPanel(theme);
    renderPlatformerPanel(theme);

    if (dimmed) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
  }

  function renderClickerPanel(theme) {
    const panel = LAYOUT.left;
    drawWindow(panel.x, panel.y, panel.w, panel.h, "Click-O-Matic 95", theme);

    const contentX = panel.x + 8;
    const contentY = panel.y + 26;
    const contentW = panel.w - 16;

    drawFlatPanel(contentX, contentY, contentW, 36, theme.clickPanel, theme);
    drawText("Cursor Points", contentX + 10, contentY + 11, 12, true, theme.text);
    drawText(formatNumber(clickerState.cursorPoints), contentX + 10, contentY + 25, 16, true, theme.accent);
    drawText("Floppies: " + formatNumber(platformerState.disks), contentX + 158, contentY + 22, 11, false, theme.textMuted);

    registerButton(
      { x: panel.x + 218, y: panel.y + 3, w: 86, h: 16 },
      "Closet",
      function () {
        gameState.skinReturnState = gameState.mode;
        gameState.mode = GAME_STATES.SKIN_SELECT;
      },
      {
        theme: theme,
        small: true,
        tooltip: "Open the Cursor Closet to buy and equip skins."
      }
    );

    const stats = getClickerStats();
    const buttonRect = {
      x: contentX + 24,
      y: contentY + 48 + clickerState.buttonOffset,
      w: 240,
      h: 86
    };
    const hovered = pointInRect(runtime.mouse.x, runtime.mouse.y, buttonRect);
    drawButtonBase(buttonRect.x, buttonRect.y, buttonRect.w, buttonRect.h, hovered, false, theme, clickerState.buttonPulse > 0.1);
    drawText("Cursor Core", buttonRect.x + 12, buttonRect.y + 12, 12, true, theme.text);
    drawText("👉 +" + formatNumber(stats.manualClick), buttonRect.x + 148, buttonRect.y + 61, 19, true, theme.text);
    drawCursorSkin(getSkin(), buttonRect.x + 68, buttonRect.y + 42, 34, theme, runtime.elapsed, 1);
    drawText("Click here for tasteful productivity.", buttonRect.x + 12, buttonRect.y + 73, 10, false, theme.textMuted);

    addUiRegion({
      type: "button",
      rect: buttonRect,
      tooltip: "Manual clicks make cursor points. Faster clicks build combo.",
      onClick: function () {
        clickCursorButton(buttonRect.x + buttonRect.w / 2, buttonRect.y + 30);
      }
    });
    if (hovered) {
      setTooltip("Manual clicks make cursor points. Faster clicks build combo.", runtime.mouse.x + 8, runtime.mouse.y + 12);
    }

    drawFlatPanel(contentX, contentY + 140, contentW, 26, theme.panelAlt, theme);
    drawText("Combo x" + clickerState.comboDisplay.toFixed(1), contentX + 10, contentY + 157, 12, true, theme.warn);
    drawText("Auto " + formatNumber(stats.autoClick) + "/sec", contentX + 102, contentY + 157, 12, false, theme.text);
    drawText("Crit " + Math.round(stats.critChance * 100) + "%", contentX + 202, contentY + 157, 12, false, theme.text);

    drawFlatPanel(contentX, contentY + 172, contentW, 88, theme.panelAlt, theme);
    drawText("Disk Shop: clicker upgrades", contentX + 8, contentY + 185, 12, true, theme.text);

    const rowH = 14;
    CLICKER_UPGRADES.forEach(function (upgrade, index) {
      const level = clickerState.upgradeLevels[upgrade.id];
      const cost = getUpgradeCost(upgrade, level);
      const disabled = level >= upgrade.maxLevel || platformerState.disks < cost;
      const label = level >= upgrade.maxLevel ? "MAX" : formatNumber(cost) + " disks";
      registerButton(
        { x: contentX + 8, y: contentY + 194 + index * (rowH + 1), w: contentW - 16, h: rowH },
        upgrade.name + " Lv" + level,
        function () {
          buyClickerUpgrade(upgrade.id);
        },
        {
          theme: theme,
          rightText: label,
          small: true,
          disabled: disabled,
          tooltip: upgrade.short
        }
      );
    });

    renderFloatingTexts(clickerState.floatingTexts);
    renderParticles(clickerState.particles);
  }

  function renderPlatformerPanel(theme) {
    const panel = LAYOUT.right;
    drawWindow(panel.x, panel.y, panel.w, panel.h, "Platformer Desk Run", theme);

    registerButton(
      { x: panel.x + panel.w - 30, y: panel.y + 3, w: 22, h: 16 },
      "II",
      function () {
        gameState.mode = GAME_STATES.PAUSED;
      },
      {
        theme: theme,
        small: true,
        tooltip: "Pause the run."
      }
    );

    const inner = {
      x: panel.x + 10,
      y: panel.y + 28,
      w: panel.w - 20,
      h: panel.h - 38
    };

    drawFlatPanel(inner.x, inner.y, inner.w, 26, theme.panelAlt, theme);
    drawText("Floppy Disks", inner.x + 10, inner.y + 10, 12, true, theme.text);
    drawText(formatNumber(platformerState.disks), inner.x + 102, inner.y + 10, 14, true, theme.success);
    drawText("Wave " + platformerState.wave, inner.x + 210, inner.y + 10, 12, false, theme.text);
    drawText("Click or tap the stage to walk. Higher clicks auto-jump.", inner.x + 246, inner.y + 10, 11, false, theme.textMuted);

    const view = { x: inner.x, y: inner.y + 32, w: inner.w, h: 150 };
    addUiRegion({
      type: "button",
      rect: view,
      tooltip: "Click or tap inside the platformer to send the cursor there.",
      onClick: function () {
        setPlatformerDestinationFromView(view, runtime.mouse.x, runtime.mouse.y);
      }
    });
    drawPlatformWorld(theme, view);
    if (pointInRect(runtime.mouse.x, runtime.mouse.y, view)) {
      setTooltip("Click or tap inside the platformer to send the cursor there.", runtime.mouse.x + 8, runtime.mouse.y + 12);
    }

    drawFlatPanel(inner.x, inner.y + 188, inner.w, 68, theme.panelAlt, theme);
    drawText("Cursor Point Shop: platformer upgrades", inner.x + 8, inner.y + 200, 12, true, theme.text);

    PLATFORM_UPGRADES.forEach(function (upgrade, index) {
      const level = platformerState.upgradeLevels[upgrade.id];
      const cost = getUpgradeCost(upgrade, level);
      const col = index % 3;
      const row = Math.floor(index / 3);
      const rect = {
        x: inner.x + 8 + col * 160,
        y: inner.y + 208 + row * 22,
        w: 152,
        h: 18
      };
      const disabled = level >= upgrade.maxLevel || clickerState.cursorPoints < cost;
      const label = level >= upgrade.maxLevel ? "MAX" : formatNumber(cost) + " CP";
      registerButton(rect, upgrade.name + " Lv" + level, function () {
        buyPlatformUpgrade(upgrade.id);
      }, {
        theme: theme,
        rightText: label,
        small: true,
        disabled: disabled,
        tooltip: upgrade.short
      });
    });

    renderParticles(platformerState.particles);
  }

  function renderMainMenu(theme) {
    const x = 170;
    const y = 42;
    const w = 500;
    const h = 236;

    drawWindow(x, y, w, h, "Program Manager", theme);
    drawText("Super Cursor Bros", x + 24, y + 48, 28, true, theme.accent);
    drawText("A tiny clicker-platformer office merger.", x + 26, y + 70, 12, false, theme.textMuted);

    drawFlatPanel(x + 22, y + 88, 202, 112, theme.panelAlt, theme);
    drawText("Session Notes", x + 34, y + 103, 12, true, theme.text);
    drawText("Best cursor points: " + formatNumber(metaState.bestCursorPoints), x + 34, y + 124, 12, false, theme.text);
    drawText("Best floppy haul: " + formatNumber(metaState.bestDisks), x + 34, y + 143, 12, false, theme.text);
    drawText("Unlocked skins: " + metaState.unlockedSkins.length + "/" + SKINS.length, x + 34, y + 162, 12, false, theme.text);

    const bootMessage = [
      "Loading chunky window chrome...",
      "Defragmenting floppy-powered heroics...",
      "Requesting permission from the cursor union..."
    ][Math.floor(gameState.bootTicker * 0.9) % 3];
    drawText(bootMessage, x + 34, y + 185, 10, false, theme.textMuted);

    drawFlatPanel(x + 246, y + 88, 232, 112, theme.clickPanel, theme);
    drawText("Equipped Skin", x + 258, y + 103, 12, true, theme.text);
    drawCursorSkin(getSkin(), x + 314, y + 152, 42, theme, runtime.elapsed, 1.1);
    drawText(getSkin().name, x + 364, y + 148, 13, true, theme.text);
    drawText(getSkin().bonusText, x + 364, y + 168, 10, false, theme.textMuted);

    const buttons = [
      { label: "Start Game", onClick: function () { resetRunState(); gameState.mode = GAME_STATES.PLAYING; } },
      { label: "Instructions", onClick: function () { gameState.skinReturnState = GAME_STATES.MAIN_MENU; gameState.mode = GAME_STATES.INSTRUCTIONS; } },
      { label: "Cursor Skins", onClick: function () { gameState.skinReturnState = GAME_STATES.MAIN_MENU; gameState.mode = GAME_STATES.SKIN_SELECT; } },
      { label: "Toggle Fullscreen", onClick: function () { toggleFullscreen(); } }
    ];

    buttons.forEach(function (button, index) {
      registerButton(
        { x: x + 30 + index * 114, y: y + 206, w: 102, h: 20 },
        button.label,
        button.onClick,
        {
          theme: theme
        }
      );
    });
  }

  function renderInstructions(theme) {
    drawWindow(88, 24, 664, 264, "Instructions.txt", theme);
    const lines = [
      "Left panel: click the cursor core to earn Cursor Points.",
      "Spend floppy disks on the left shop to improve clicking power, auto-click, and crits.",
      "Right panel: click or tap where you want the cursor to walk.",
      "If you click higher platforms, the cursor auto-jumps up to them.",
      "Collect every floppy disk, then touch the SAVE terminal for a wave bonus.",
      "Spend Cursor Points on the right shop to improve movement, jumps, disk value, spawns, and magnet pull.",
      "Cursor skins are shared cosmetic gear with tiny flavor bonuses. Some are bought, some unlock by milestones.",
      "Escape pauses the game. The pause menu also handles audio, dark mode, and returning to menu.",
      "The whole point: both halves feed each other, so keep bouncing between clicking and platforming."
    ];

    lines.forEach(function (line, index) {
      drawText(line, 112, 62 + index * 24, 13, false, theme.text);
    });

    drawText("Tip: the hand skin helps clicking, crosshair helps collecting, and I-Beam is a combo nerd.", 112, 248, 11, false, theme.textMuted);
    registerButton(
      { x: 620, y: 254, w: 102, h: 20 },
      "Back",
      function () {
        gameState.mode = gameState.skinReturnState || GAME_STATES.MAIN_MENU;
      },
      { theme: theme }
    );
  }

  function renderSkinSelect(theme) {
    drawWindow(32, 22, 776, 276, "Cursor Closet", theme);
    drawText("Collectible cursor costumes for the discerning desktop athlete.", 50, 50, 12, false, theme.textMuted);

    const cardW = 182;
    const cardH = 54;
    SKINS.forEach(function (skin, index) {
      const col = index % 4;
      const row = Math.floor(index / 4);
      const rect = { x: 46 + col * (cardW + 8), y: 66 + row * (cardH + 8), w: cardW, h: cardH };
      const unlocked = metaState.unlockedSkins.includes(skin.id);
      const selected = gameState.selectedSkinId === skin.id;
      const hovered = pointInRect(runtime.mouse.x, runtime.mouse.y, rect);

      ctx.fillStyle = selected ? theme.accentSoft : theme.panelAlt;
      ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
      drawBevelRect(rect.x, rect.y, rect.w, rect.h, theme, false);
      if (!unlocked) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
        ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
      }

      drawCursorSkin(skin, rect.x + 26, rect.y + 28, 20, theme, runtime.elapsed, 0.7);
      drawText(skin.name, rect.x + 48, rect.y + 15, 12, true, unlocked ? theme.text : theme.textMuted);
      drawText(unlocked ? "Unlocked" : skinUnlockLabel(skin), rect.x + 48, rect.y + 30, 10, false, unlocked ? theme.success : theme.textMuted);
      if (metaState.equippedSkin === skin.id) {
        drawText("EQUIPPED", rect.x + 48, rect.y + 43, 10, true, theme.accent);
      } else if (selected) {
        drawText("SELECTED", rect.x + 48, rect.y + 43, 10, true, theme.warn);
      }

      addUiRegion({
        type: "button",
        rect: rect,
        tooltip: skin.description,
        onClick: function () {
          gameState.selectedSkinId = skin.id;
        }
      });
      if (hovered) {
        setTooltip(skin.description, runtime.mouse.x + 8, runtime.mouse.y + 12);
      }
    });

    const selectedSkin = getSkinById(gameState.selectedSkinId);
    drawFlatPanel(48, 246, 506, 34, theme.panelAlt, theme);
    drawText(selectedSkin.name + ": " + selectedSkin.bonusText, 60, 267, 11, false, theme.text);

    const affordable = selectedSkin.unlock.type !== "buy"
      || (selectedSkin.unlock.currency === "disks" ? platformerState.disks >= selectedSkin.unlock.amount : clickerState.cursorPoints >= selectedSkin.unlock.amount);
    const actionLabel = metaState.unlockedSkins.includes(selectedSkin.id)
      ? (metaState.equippedSkin === selectedSkin.id ? "Equipped" : "Equip")
      : (selectedSkin.unlock.type === "buy"
        ? ("Buy " + selectedSkin.unlock.amount + (selectedSkin.unlock.currency === "disks" ? "D" : "CP"))
        : "Locked");
    const actionDisabled = (!metaState.unlockedSkins.includes(selectedSkin.id) && selectedSkin.unlock.type !== "buy")
      || (!metaState.unlockedSkins.includes(selectedSkin.id) && !affordable);

    registerButton(
      { x: 572, y: 248, w: 90, h: 20 },
      actionLabel,
      function () {
        if (metaState.unlockedSkins.includes(selectedSkin.id)) {
          equipSelectedSkin();
        } else {
          tryBuySelectedSkin();
        }
      },
      {
        theme: theme,
        disabled: actionDisabled || actionLabel === "Equipped"
      }
    );

    registerButton(
      { x: 670, y: 248, w: 110, h: 20 },
      "Back",
      function () {
        gameState.mode = gameState.skinReturnState || GAME_STATES.MAIN_MENU;
      },
      { theme: theme }
    );
  }

  function renderPauseMenu(theme) {
    drawWindow(242, 54, 356, 212, "Pause Menu", theme);
    drawText("Retro lo-fi control deck", 264, 82, 12, false, theme.textMuted);

    registerButton(
      { x: 264, y: 98, w: 140, h: 22 },
      "Resume",
      function () {
        gameState.mode = GAME_STATES.PLAYING;
      },
      { theme: theme }
    );

    registerButton(
      { x: 264, y: 126, w: 140, h: 22 },
      settingsState.mute ? "Unmute Music" : "Mute Music",
      function () {
        settingsState.mute = !settingsState.mute;
        markSaveDirty();
      },
      { theme: theme }
    );

    registerButton(
      { x: 264, y: 154, w: 140, h: 22 },
      settingsState.darkMode ? "Light Theme" : "Dark Mode",
      function () {
        settingsState.darkMode = !settingsState.darkMode;
        markSaveDirty();
      },
      { theme: theme }
    );

    registerButton(
      { x: 264, y: 182, w: 140, h: 22 },
      "Cursor Skins",
      function () {
        gameState.skinReturnState = GAME_STATES.PAUSED;
        gameState.mode = GAME_STATES.SKIN_SELECT;
      },
      { theme: theme }
    );

    registerButton(
      { x: 264, y: 210, w: 140, h: 22 },
      "Return to Menu",
      function () {
        gameState.mode = GAME_STATES.CONFIRM_MENU;
      },
      { theme: theme }
    );

    drawText("Music volume", 430, 106, 12, true, theme.text);
    const sliderRect = { x: 430, y: 126, w: 138, h: 12 };
    drawSlider(sliderRect, settingsState.volume, theme);
    addUiRegion({ type: "slider", rect: sliderRect, disabled: false });

    drawText(Math.round(settingsState.volume * 100) + "%", 576, 137, 11, false, theme.textMuted);
    drawText("Escape also resumes from pause.", 430, 182, 11, false, theme.textMuted);
    drawText("Dark mode keeps the old-school contrast but swaps to a high-contrast desk.", 430, 204, 10, false, theme.textMuted);
  }

  function renderConfirmMenu(theme) {
    drawWindow(258, 96, 324, 122, "Confirm Return", theme);
    drawText("Abandon this current run and go back to the main menu?", 278, 132, 12, false, theme.text);
    drawText("Unlocked skins and best totals stay saved.", 278, 152, 11, false, theme.textMuted);

    registerButton(
      { x: 294, y: 176, w: 90, h: 20 },
      "Keep Playing",
      function () {
        gameState.mode = GAME_STATES.PAUSED;
      },
      { theme: theme }
    );

    registerButton(
      { x: 454, y: 176, w: 90, h: 20 },
      "Return",
      function () {
        resetRunState();
        gameState.mode = GAME_STATES.MAIN_MENU;
      },
      { theme: theme }
    );
  }

  function drawPlatformWorld(theme, view) {
    const world = platformerState.world;
    const scaleX = view.w / world.w;
    const scaleY = view.h / world.h;
    const toScreenX = function (value) { return view.x + value * scaleX; };
    const toScreenY = function (value) { return view.y + value * scaleY; };

    const skyGradient = ctx.createLinearGradient(view.x, view.y, view.x, view.y + view.h);
    skyGradient.addColorStop(0, theme.platformSkyTop);
    skyGradient.addColorStop(1, theme.platformSkyBottom);
    ctx.fillStyle = skyGradient;
    ctx.fillRect(view.x, view.y, view.w, view.h);

    for (let x = 0; x < view.w; x += 48) {
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = theme.accent;
      ctx.fillRect(view.x + x, view.y, 1, view.h);
      ctx.globalAlpha = 1;
    }

    platformerState.platforms.forEach(function (platform) {
      const sx = toScreenX(platform.x);
      const sy = toScreenY(platform.y);
      const sw = platform.w * scaleX;
      const sh = platform.h * scaleY;
      ctx.fillStyle = theme.ground;
      ctx.fillRect(sx, sy, sw, sh);
      ctx.fillStyle = theme.groundTop;
      ctx.fillRect(sx, sy, sw, Math.max(2, sh * 0.35));
      drawBevelRect(sx, sy, sw, sh, theme, true);
    });

    platformerState.collectibles.forEach(function (disk) {
      const bob = Math.sin(disk.bob) * 3;
      drawFloppyDisk(toScreenX(disk.x), toScreenY(disk.y + bob), 13, theme);
    });

    if (platformerState.goal.active) {
      const goal = platformerState.goal;
      const gx = toScreenX(goal.x);
      const gy = toScreenY(goal.y);
      const gw = goal.w * scaleX;
      const gh = goal.h * scaleY;
      ctx.fillStyle = theme.panelAlt;
      ctx.fillRect(gx, gy, gw, gh);
      drawBevelRect(gx, gy, gw, gh, theme, false);
      drawText("SAVE", gx + 3, gy + 10, 9, true, theme.accent);
      drawText("+" + formatNumber(goal.bonus), gx + 2, gy + 22, 9, false, theme.success);
    }

    if (platformerState.navigation.active) {
      const markerX = toScreenX(platformerState.navigation.targetX);
      const markerY = toScreenY(platformerState.navigation.targetPlatformY - 8);
      ctx.strokeStyle = theme.accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(markerX - 6, markerY);
      ctx.lineTo(markerX + 6, markerY);
      ctx.moveTo(markerX, markerY - 6);
      ctx.lineTo(markerX, markerY + 6);
      ctx.stroke();
    }

    const player = platformerState.player;
    drawPlayer(toScreenX(player.x + player.w / 2), toScreenY(player.y + player.h / 2), 1, theme, player.facing);

    if (platformerState.hintFlash > 0) {
      ctx.globalAlpha = platformerState.hintFlash;
      drawText("Mind the bottomless taskbar.", view.x + 140, view.y + 22, 11, false, theme.warn);
      ctx.globalAlpha = 1;
    }

    if (!platformerState.goal.active) {
      drawText("Collect every floppy, then touch SAVE.", view.x + 8, view.y + 14, 11, false, theme.text);
    } else {
      drawText("SAVE terminal ready. Cash in for a wave bonus.", view.x + 8, view.y + 14, 11, false, theme.success);
    }
  }

  function drawPlayer(x, y, scale, theme, facing) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(facing, 1);
    ctx.fillStyle = settingsState.darkMode ? theme.lightSoft : theme.darkest;
    ctx.fillRect(-4 * scale, 8 * scale, 3 * scale, 7 * scale);
    ctx.fillRect(1 * scale, 8 * scale, 3 * scale, 7 * scale);
    drawCursorSkin(getSkin(), 0, 0, 14 * scale, theme, runtime.elapsed, 0.55);
    ctx.restore();
  }

  function setPlatformerDestinationFromView(view, screenX, screenY) {
    const world = platformerState.world;
    const localX = clamp(screenX - view.x, 0, view.w);
    const localY = clamp(screenY - view.y, 0, view.h);
    const worldX = clamp((localX / view.w) * world.w, 8, world.w - 8);
    const worldY = clamp((localY / view.h) * world.h, 0, world.h);
    const targetPlatform = findPlatformForDestination(worldX, worldY);

    platformerState.navigation.active = true;
    platformerState.navigation.targetX = worldX;
    platformerState.navigation.targetPlatformY = targetPlatform.y;
    platformerState.navigation.targetY = targetPlatform.y - platformerState.player.h;
  }

  function findPlatformForDestination(worldX, worldY) {
    let best = platformerState.platforms[0];
    let bestScore = Number.POSITIVE_INFINITY;

    for (let i = 0; i < platformerState.platforms.length; i += 1) {
      const platform = platformerState.platforms[i];
      if (worldX < platform.x - 8 || worldX > platform.x + platform.w + 8) {
        continue;
      }
      const score = Math.abs(platform.y - worldY);
      if (score < bestScore) {
        best = platform;
        bestScore = score;
      }
    }

    return best;
  }

  // ---------------------------------------------------------------------------
  // Drawing helpers
  // ---------------------------------------------------------------------------

  function drawDesktop(theme) {
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, theme.desktopTop);
    gradient.addColorStop(1, theme.desktopBottom);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
    for (let i = 0; i < CANVAS_WIDTH; i += 28) {
      ctx.fillRect(i, 0, 1, CANVAS_HEIGHT);
    }
    for (let j = 0; j < CANVAS_HEIGHT; j += 20) {
      ctx.fillRect(0, j, CANVAS_WIDTH, 1);
    }
  }

  function drawWindow(x, y, w, h, title, theme) {
    ctx.fillStyle = theme.panel;
    ctx.fillRect(x, y, w, h);
    drawBevelRect(x, y, w, h, theme, false);

    ctx.fillStyle = theme.titleFill;
    ctx.fillRect(x + 3, y + 3, w - 6, LAYOUT.titleBarHeight - 2);
    drawText(title, x + 10, y + 16, 12, true, theme.titleText);
  }

  function drawFlatPanel(x, y, w, h, fill, theme) {
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, w, h);
    drawBevelRect(x, y, w, h, theme, true);
  }

  function drawBevelRect(x, y, w, h, theme, inset) {
    const light = inset ? theme.dark : theme.light;
    const dark = inset ? theme.light : theme.dark;
    ctx.strokeStyle = light;
    ctx.beginPath();
    ctx.moveTo(x + w - 1, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y + h - 1);
    ctx.stroke();
    ctx.strokeStyle = dark;
    ctx.beginPath();
    ctx.moveTo(x + w - 1, y);
    ctx.lineTo(x + w - 1, y + h - 1);
    ctx.lineTo(x, y + h - 1);
    ctx.stroke();
    ctx.strokeStyle = theme.darkest;
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
  }

  function drawButtonBase(x, y, w, h, hovered, disabled, theme, pressed) {
    ctx.fillStyle = disabled ? theme.buttonDisabled : hovered ? theme.buttonHover : theme.buttonFace;
    ctx.fillRect(x, y, w, h);
    drawBevelRect(x, y, w, h, theme, !!pressed);
  }

  function registerButton(rect, label, onClick, options) {
    const opts = options || {};
    const hovered = pointInRect(runtime.mouse.x, runtime.mouse.y, rect);
    const theme = opts.theme || getTheme();
    drawButtonBase(rect.x, rect.y, rect.w, rect.h, hovered, !!opts.disabled, theme, false);

    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x + 1, rect.y + 1, rect.w - 2, rect.h - 2);
    ctx.clip();
    drawText(label, rect.x + 6, rect.y + (opts.small ? 10 : 13), opts.small ? 10 : 11, true, opts.disabled ? theme.textMuted : theme.text);
    if (opts.rightText) {
      drawText(opts.rightText, rect.x + rect.w - 6, rect.y + (opts.small ? 10 : 13), opts.small ? 10 : 11, true, opts.disabled ? theme.textMuted : theme.text, "right");
    }
    ctx.restore();

    addUiRegion({ type: "button", rect: rect, disabled: !!opts.disabled, tooltip: opts.tooltip || "", onClick: onClick });
    if (hovered && opts.tooltip) {
      setTooltip(opts.tooltip, runtime.mouse.x + 8, runtime.mouse.y + 12);
    }
  }

  function drawSlider(rect, value, theme) {
    drawFlatPanel(rect.x, rect.y, rect.w, rect.h, theme.panelAlt, theme);
    ctx.fillStyle = theme.accent;
    ctx.fillRect(rect.x + 2, rect.y + 2, Math.max(4, (rect.w - 4) * value), rect.h - 4);
    ctx.fillStyle = theme.buttonFace;
    const knobX = rect.x + clamp(value, 0, 1) * rect.w;
    ctx.fillRect(knobX - 4, rect.y - 2, 8, rect.h + 4);
    drawBevelRect(knobX - 4, rect.y - 2, 8, rect.h + 4, theme, false);
  }

  function drawNotification(theme, message) {
    const width = Math.min(420, message.length * 6 + 20);
    const x = CANVAS_WIDTH / 2 - width / 2;
    const y = 4;
    ctx.fillStyle = theme.tooltipFill;
    ctx.fillRect(x, y, width, 18);
    drawBevelRect(x, y, width, 18, theme, false);
    drawText(message, x + width / 2, y + 12, 11, false, theme.text, "center");
  }

  function drawTooltip(theme, text, x, y) {
    ctx.font = "11px \"MS Sans Serif\", Tahoma, sans-serif";
    const width = Math.min(250, ctx.measureText(text).width + 12);
    const height = 18;
    const tx = clamp(x, 4, CANVAS_WIDTH - width - 4);
    const ty = clamp(y, 4, CANVAS_HEIGHT - height - 4);
    ctx.fillStyle = theme.tooltipFill;
    ctx.fillRect(tx, ty, width, height);
    drawBevelRect(tx, ty, width, height, theme, false);
    drawText(text, tx + 6, ty + 12, 10, false, theme.text);
  }

  function drawText(text, x, y, size, bold, color, align) {
    ctx.fillStyle = color;
    ctx.font = (bold ? "bold " : "") + size + "px \"MS Sans Serif\", Tahoma, sans-serif";
    ctx.textAlign = align || "left";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x, y);
    ctx.textAlign = "left";
  }

  function drawFloppyDisk(x, y, size, theme) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = theme.floppy;
    ctx.fillRect(-size / 2, -size / 2, size, size);
    ctx.fillStyle = theme.floppyLabel;
    ctx.fillRect(-size / 2 + 2, -size / 2 + 2, size - 4, size / 2);
    ctx.fillStyle = theme.panel;
    ctx.fillRect(-size / 2 + 4, 1, size - 8, 4);
    ctx.restore();
  }

  function drawCursorSkin(skin, x, y, size, theme, time, scale) {
    const s = (scale || 1) * size;
    ctx.save();
    ctx.translate(x, y);

    if (skin.draw === "glitch") {
      drawGlitchArrow(-2, 1, s, "#ff4c7b");
      drawGlitchArrow(2, -1, s, "#44e7ff");
      drawGlitchArrow(0, 0, s, theme.text);
      ctx.restore();
      return;
    }

    if (skin.draw === "classic" || skin.draw === "win95" || skin.draw === "invert") {
      const fill = skin.draw === "invert" ? theme.darkest : theme.light;
      const outline = skin.draw === "invert" ? theme.light : theme.darkest;
      drawArrow(fill, outline, s, skin.draw === "win95");
    } else if (skin.draw === "hourglass" || skin.draw === "spinner") {
      if (skin.draw === "spinner") {
        ctx.rotate(Math.sin(time * 3) * 0.2 + time * 1.8);
      }
      drawHourglass(s, theme);
    } else if (skin.draw === "hand") {
      drawHandPointer(s, theme);
    } else if (skin.draw === "crosshair") {
      drawCrosshair(s, theme, time);
    } else if (skin.draw === "ibeam") {
      drawIBeam(s, theme);
    } else if (skin.draw === "thinking") {
      drawArrow(theme.light, theme.darkest, s, false);
      ctx.fillStyle = theme.warn;
      ctx.beginPath();
      ctx.arc(s * 0.45, -s * 0.45, s * 0.1, 0, Math.PI * 2);
      ctx.arc(s * 0.63, -s * 0.6, s * 0.14, 0, Math.PI * 2);
      ctx.arc(s * 0.88, -s * 0.82, s * 0.18, 0, Math.PI * 2);
      ctx.fill();
    } else if (skin.draw === "wizard") {
      drawArrow(theme.light, theme.darkest, s, true);
      ctx.fillStyle = theme.warn;
      ctx.beginPath();
      ctx.moveTo(-s * 0.16, -s * 0.44);
      ctx.lineTo(s * 0.06, -s * 0.92);
      ctx.lineTo(s * 0.18, -s * 0.4);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = theme.accent;
      ctx.fillRect(-s * 0.16, -s * 0.44, s * 0.36, s * 0.08);
    } else if (skin.draw === "ghost") {
      drawGhost(s, theme, time);
    }

    ctx.restore();
  }

  function drawArrow(fill, outline, size, sharp) {
    ctx.fillStyle = fill;
    ctx.strokeStyle = outline;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-size * 0.35, -size * 0.45);
    ctx.lineTo(size * 0.2, size * 0.05);
    ctx.lineTo(size * 0.02, size * 0.08);
    ctx.lineTo(size * 0.22, size * 0.42);
    ctx.lineTo(size * 0.08, size * 0.5);
    ctx.lineTo(-size * 0.1, size * 0.14);
    ctx.lineTo(-size * 0.2, size * 0.28);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    if (sharp) {
      ctx.fillStyle = outline;
      ctx.fillRect(-size * 0.02, size * 0.12, size * 0.08, size * 0.1);
    }
  }

  function drawGlitchArrow(offsetX, offsetY, size, color) {
    ctx.save();
    ctx.translate(offsetX, offsetY);
    drawArrow(color, color, size, false);
    ctx.restore();
  }

  function drawHourglass(size, theme) {
    ctx.strokeStyle = theme.darkest;
    ctx.lineWidth = 2;
    ctx.fillStyle = theme.warn;
    ctx.strokeRect(-size * 0.22, -size * 0.44, size * 0.44, size * 0.88);
    ctx.beginPath();
    ctx.moveTo(-size * 0.16, -size * 0.34);
    ctx.lineTo(size * 0.16, -size * 0.34);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-size * 0.16, size * 0.34);
    ctx.lineTo(size * 0.16, size * 0.34);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();
  }

  function drawHandPointer(size, theme) {
    ctx.fillStyle = theme.light;
    ctx.strokeStyle = theme.darkest;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-size * 0.15, size * 0.45);
    ctx.lineTo(-size * 0.15, -size * 0.28);
    ctx.lineTo(0, -size * 0.28);
    ctx.lineTo(0, size * 0.03);
    ctx.lineTo(size * 0.1, size * 0.03);
    ctx.lineTo(size * 0.1, -size * 0.18);
    ctx.lineTo(size * 0.24, -size * 0.18);
    ctx.lineTo(size * 0.24, size * 0.08);
    ctx.lineTo(size * 0.34, size * 0.08);
    ctx.lineTo(size * 0.34, size * 0.22);
    ctx.lineTo(size * 0.18, size * 0.45);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  function drawCrosshair(size, theme, time) {
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.34 + Math.sin(time * 3) * 0.8, 0, Math.PI * 2);
    ctx.moveTo(-size * 0.5, 0);
    ctx.lineTo(size * 0.5, 0);
    ctx.moveTo(0, -size * 0.5);
    ctx.lineTo(0, size * 0.5);
    ctx.stroke();
  }

  function drawIBeam(size, theme) {
    ctx.fillStyle = theme.light;
    ctx.strokeStyle = theme.darkest;
    ctx.lineWidth = 2;
    ctx.fillRect(-size * 0.08, -size * 0.48, size * 0.16, size * 0.96);
    ctx.fillRect(-size * 0.28, -size * 0.48, size * 0.56, size * 0.08);
    ctx.fillRect(-size * 0.28, size * 0.4, size * 0.56, size * 0.08);
    ctx.strokeRect(-size * 0.28, -size * 0.48, size * 0.56, size * 0.08);
    ctx.strokeRect(-size * 0.08, -size * 0.48, size * 0.16, size * 0.96);
    ctx.strokeRect(-size * 0.28, size * 0.4, size * 0.56, size * 0.08);
  }

  function drawGhost(size, theme, time) {
    ctx.fillStyle = theme.lightSoft;
    ctx.strokeStyle = theme.darkest;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -size * 0.08, size * 0.28, Math.PI, 0);
    ctx.lineTo(size * 0.28, size * 0.26);
    ctx.lineTo(size * 0.12, size * 0.18 + Math.sin(time * 6) * 1.3);
    ctx.lineTo(0, size * 0.28);
    ctx.lineTo(-size * 0.12, size * 0.18 - Math.sin(time * 6) * 1.1);
    ctx.lineTo(-size * 0.28, size * 0.26);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = theme.darkest;
    ctx.fillRect(-size * 0.12, -size * 0.06, size * 0.06, size * 0.08);
    ctx.fillRect(size * 0.04, -size * 0.06, size * 0.06, size * 0.08);
  }

  // ---------------------------------------------------------------------------
  // Shared utilities
  // ---------------------------------------------------------------------------

  function addUiRegion(region) {
    runtime.uiRegions.push(region);
  }

  function setTooltip(text, x, y) {
    runtime.hoveredTooltip = text;
    runtime.hoveredTooltipPos.x = x;
    runtime.hoveredTooltipPos.y = y;
  }

  function setNotification(text) {
    gameState.notification = text;
    gameState.notificationTimer = 2.4;
  }

  function updateFloaters(items, dt) {
    for (let i = items.length - 1; i >= 0; i -= 1) {
      const item = items[i];
      if (item.life !== undefined) {
        item.life -= dt;
        if (item.life <= 0) {
          items.splice(i, 1);
          continue;
        }
      }
      if (item.y !== undefined) {
        item.y -= 22 * dt;
      }
    }
  }

  function updateParticles(particles, dt) {
    for (let i = particles.length - 1; i >= 0; i -= 1) {
      const particle = particles[i];
      if (particle.text) {
        particle.life -= dt;
        particle.y += particle.vy * dt;
        if (particle.life <= 0) {
          particles.splice(i, 1);
        }
        continue;
      }
      particle.life -= dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vy += 120 * dt;
      if (particle.life <= 0) {
        particles.splice(i, 1);
      }
    }
  }

  function renderFloatingTexts(items) {
    items.forEach(function (item) {
      ctx.globalAlpha = clamp(item.life / item.maxLife, 0, 1);
      drawText(item.text, item.x, item.y, 12, true, item.color);
      ctx.globalAlpha = 1;
    });
  }

  function renderParticles(particles) {
    particles.forEach(function (particle) {
      ctx.globalAlpha = clamp(particle.life / particle.maxLife, 0, 1);
      if (particle.text) {
        drawText(particle.text, particle.x, particle.y, 11, true, getTheme().success);
      } else {
        ctx.fillStyle = particle.color || getTheme().accent;
        ctx.fillRect(particle.x, particle.y, 3, 3);
      }
      ctx.globalAlpha = 1;
    });
  }

  function pointInRect(x, y, rect) {
    return x >= rect.x && y >= rect.y && x <= rect.x + rect.w && y <= rect.y + rect.h;
  }

  function rectsOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function lerp(a, b, t) {
    return a + (b - a) * clamp(t, 0, 1);
  }

  function randomRange(min, max) {
    return min + Math.random() * (max - min);
  }

  function isHeld() {
    for (let i = 0; i < arguments.length; i += 1) {
      if (runtime.keys[arguments[i]]) {
        return true;
      }
    }
    return false;
  }

  function isPressed() {
    for (let i = 0; i < arguments.length; i += 1) {
      if (runtime.pressedKeys[arguments[i]]) {
        return true;
      }
    }
    return false;
  }

  function formatNumber(value) {
    if (Math.abs(value) >= 1000) {
      return Math.round(value).toString();
    }
    const rounded = value >= 10 ? value.toFixed(1) : value.toFixed(2);
    return rounded.replace(/\.0+$/, "").replace(/(\.\d*[1-9])0+$/, "$1");
  }

  function getTheme() {
    return settingsState.darkMode ? THEMES.dark : THEMES.light;
  }

  function skinUnlockLabel(skin) {
    if (skin.unlock.type === "buy") {
      return "Buy: " + skin.unlock.amount + (skin.unlock.currency === "disks" ? " disks" : " CP");
    }
    if (skin.unlock.type === "milestone") {
      return skin.unlock.label;
    }
    return "Unlocked";
  }

  function isKnownSkinId(id) {
    return SKINS.some(function (skin) {
      return skin.id === id;
    });
  }

  function toggleFullscreen() {
    const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
    if (!fullscreenElement) {
      const target =
        (gameShell.requestFullscreen || gameShell.webkitRequestFullscreen || gameShell.msRequestFullscreen)
          ? gameShell
          : document.documentElement;
      const request = target.requestFullscreen || target.webkitRequestFullscreen || target.msRequestFullscreen;

      if (!request) {
        setNotification("Fullscreen is not supported on this browser.");
        return;
      }

      Promise.resolve(request.call(target))
        .catch(function () {
          setNotification("Fullscreen request was denied by the browser.");
        });
    } else {
      const exit = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
      if (!exit) {
        setNotification("Could not exit fullscreen on this browser.");
        return;
      }
      Promise.resolve(exit.call(document)).catch(function () {
        setNotification("Could not exit fullscreen cleanly.");
      });
    }
  }
})();
