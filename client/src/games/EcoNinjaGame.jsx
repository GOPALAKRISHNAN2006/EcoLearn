import React, { useEffect } from "react";

const EcoNinjaGame = () => {
  useEffect(() => {
    // Game state
    let score = 0;
    let level = 1;
    let combo = 0;
    let comboTimer = null;
    let gameRunning = false;
    let spawnInterval = null;
    let spawnAdjustInterval = null;
    let lastMousePos = { x: 0, y: 0 };
    let isSlicing = false;
    let slicePoints = [];

    // Eco stats
    let waterSaved = 0;
    let treesPlanted = 0;
    let energySaved = 0;
    let recycled = 0;

    // Eco items (good to slice)
    const ecoItems = [
      { emoji: "💧", points: 10, eco: "water", ecoValue: 5 },
      { emoji: "🌳", points: 15, eco: "trees", ecoValue: 1 },
      { emoji: "🌱", points: 10, eco: "trees", ecoValue: 1 },
      { emoji: "☀", points: 20, eco: "energy", ecoValue: 10 },
      { emoji: "🔋", points: 15, eco: "energy", ecoValue: 5 },
      { emoji: "♻", points: 10, eco: "recycle", ecoValue: 1 },
      { emoji: "🍃", points: 10, eco: "trees", ecoValue: 1 },
      { emoji: "🌿", points: 10, eco: "trees", ecoValue: 1 },
      { emoji: "💚", points: 25, eco: "all", ecoValue: 1 },
      { emoji: "🌍", points: 30, eco: "all", ecoValue: 2 },
    ];

    // Danger items (lose game if sliced now)
    const dangerItems = [
      { emoji: "☠", points: -50 },
      { emoji: "🏭", points: -30 },
      { emoji: "💨", points: -20 },
      { emoji: "🛢", points: -25 },
    ];

    // DOM elements
    const gameContainer = document.getElementById("gameContainer");
    const ninjaContainer = document.getElementById("ninjaContainer");
    const startScreen = document.getElementById("startScreen");
    const gameOverScreen = document.getElementById("gameOverScreen");
    const comboDisplay = document.getElementById("comboDisplay");
    const levelUpDisplay = document.getElementById("levelUp");
    const scoreEl = document.getElementById("score");
    const levelEl = document.getElementById("level");
    const waterSavedEl = document.getElementById("waterSaved");
    const treesPlantedEl = document.getElementById("treesPlanted");
    const energySavedEl = document.getElementById("energySaved");
    const recycledEl = document.getElementById("recycled");
    const finalScoreEl = document.getElementById("finalScore");
    const startBtn = document.getElementById("startBtn");
    const restartBtn = document.getElementById("restartBtn");

    if (!gameContainer || !ninjaContainer) {
      return;
    }

    // Create background particles
    function createBgParticles() {
      for (let i = 0; i < 50; i++) {
        const particle = document.createElement("div");
        particle.className = "bg-particle";
        particle.style.left = Math.random() * 100 + "%";
        particle.style.top = Math.random() * 100 + "%";
        particle.style.animationDelay = Math.random() * 15 + "s";
        particle.style.animationDuration = 10 + Math.random() * 10 + "s";
        gameContainer.appendChild(particle);
      }
    }

    // Move ninja to position
    function moveNinja(x, y) {
      ninjaContainer.style.left = x + "px";
      ninjaContainer.style.top = y + "px";
    }

    // Create slice trail effect
    function createSliceTrail(x1, y1, x2, y2) {
      const distance = Math.hypot(x2 - x1, y2 - y1);
      if (distance < 5) return;

      const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;

      const trail = document.createElement("div");
      trail.className = "trail-segment";
      trail.style.left = x1 + "px";
      trail.style.top = y1 + "px";
      trail.style.width = distance + "px";
      trail.style.transform = `rotate(${angle}deg)`;

      gameContainer.appendChild(trail);

      setTimeout(() => trail.remove(), 300);
    }

    // Show points popup
    function showPoints(x, y, points, isDanger) {
      const popup = document.createElement("div");
      popup.className = "points-popup";
      popup.textContent = (points > 0 ? "+" : "") + points;
      popup.style.left = x + "px";
      popup.style.top = y + "px";
      popup.style.color = isDanger ? "#e74c3c" : "#00f260";
      gameContainer.appendChild(popup);
      setTimeout(() => popup.remove(), 1000);
    }

    // Update score display
    function updateScore() {
      if (scoreEl) scoreEl.textContent = String(score);
    }

    // Update combo display
    function updateCombo() {
      if (combo >= 2 && comboDisplay) {
        comboDisplay.textContent = `COMBO x${Math.min(combo, 10)}`;
        comboDisplay.classList.remove("show");
        // Force reflow for animation restart
        void comboDisplay.offsetWidth;
        comboDisplay.classList.add("show");
      }
    }

    // Update eco stats
    function updateEcoStats(type, value) {
      switch (type) {
        case "water":
          waterSaved += value;
          if (waterSavedEl) waterSavedEl.textContent = String(waterSaved);
          break;
        case "trees":
          treesPlanted += value;
          if (treesPlantedEl) treesPlantedEl.textContent = String(treesPlanted);
          break;
        case "energy":
          energySaved += value;
          if (energySavedEl) energySavedEl.textContent = String(energySaved);
          break;
        case "recycle":
          recycled += value;
          if (recycledEl) recycledEl.textContent = String(recycled);
          break;
        case "all":
          waterSaved += value;
          treesPlanted += value;
          energySaved += value;
          recycled += value;
          if (waterSavedEl) waterSavedEl.textContent = String(waterSaved);
          if (treesPlantedEl) treesPlantedEl.textContent = String(treesPlanted);
          if (energySavedEl) energySavedEl.textContent = String(energySaved);
          if (recycledEl) recycledEl.textContent = String(recycled);
          break;
        default:
          break;
      }
    }

    // Show level up animation
    function showLevelUp() {
      if (!levelUpDisplay) return;
      levelUpDisplay.textContent = `LEVEL ${level}! 🎉`;
      levelUpDisplay.classList.remove("show");
      void levelUpDisplay.offsetWidth;
      levelUpDisplay.classList.add("show");
    }

    // Check for level up
    function checkLevelUp() {
      const newLevel = Math.floor(score / 500) + 1;
      if (newLevel > level) {
        level = newLevel;
        if (levelEl) levelEl.textContent = String(level);
        showLevelUp();
      }
    }

    // Create sparkle effect
    function createSparkles(x, y) {
      for (let i = 0; i < 8; i++) {
        const sparkle = document.createElement("div");
        sparkle.className = "sparkle";
        const angle = (i / 8) * Math.PI * 2;
        const distance = 30 + Math.random() * 20;
        sparkle.style.left = x + Math.cos(angle) * distance + "px";
        sparkle.style.top = y + Math.sin(angle) * distance + "px";
        sparkle.style.background = ["#00f260", "#0575e6", "#f5af19", "white"][
          Math.floor(Math.random() * 4)
        ];
        gameContainer.appendChild(sparkle);
        setTimeout(() => sparkle.remove(), 600);
      }
    }

    // Create slice halves
    function createSliceHalves(emoji, x, y) {
      const leftHalf = document.createElement("div");
      leftHalf.className = "slice-half left";
      leftHalf.textContent = emoji;
      leftHalf.style.left = x + "px";
      leftHalf.style.top = y + "px";

      const rightHalf = document.createElement("div");
      rightHalf.className = "slice-half right";
      rightHalf.textContent = emoji;
      rightHalf.style.left = x + "px";
      rightHalf.style.top = y + "px";

      gameContainer.appendChild(leftHalf);
      gameContainer.appendChild(rightHalf);

      setTimeout(() => {
        leftHalf.remove();
        rightHalf.remove();
      }, 800);
    }

    // Game over
    function gameOver() {
      if (!gameRunning) return; // avoid double calls
      gameRunning = false;
      isSlicing = false;
      clearInterval(spawnInterval);
      clearInterval(spawnAdjustInterval);
      if (finalScoreEl) finalScoreEl.textContent = String(score);
      if (gameOverScreen) gameOverScreen.style.display = "flex";
      
      // Dispatch game completion event
      window.dispatchEvent(new CustomEvent('gameComplete', {
        detail: { finalScore: score }
      }));
    }

    // Slice an item
    function sliceItem(item) {
      if (item.classList.contains("sliced")) return;

      const isDanger = item.classList.contains("danger-item");
      const emoji = item.dataset.emoji;
      const points = parseInt(item.dataset.points || "0", 10) || 0;
      const rect = item.getBoundingClientRect();

      item.classList.add("sliced");

      // Create sparkles
      createSparkles(rect.left + rect.width / 2, rect.top + rect.height / 2);

      // Create slice halves
      createSliceHalves(
        emoji,
        rect.left + rect.width / 2,
        rect.top + rect.height / 2
      );

      if (isDanger) {
        // ❌ Pollution sliced: instant game over
        showPoints(rect.left, rect.top, points, true);
        score = Math.max(0, score + points);
        updateScore();
        // End the game immediately
        gameOver();
      } else {
        // ✅ Eco item sliced
        combo++;
        const comboMultiplier = Math.min(combo, 10);
        const totalPoints = points * comboMultiplier;
        score += totalPoints;

        updateScore();
        updateCombo();
        showPoints(rect.left, rect.top, totalPoints, false);

        // Update eco stats
        const ecoType = item.dataset.eco;
        const ecoValue = parseInt(item.dataset.ecoValue || "0", 10) || 0;
        if (ecoType) {
          updateEcoStats(ecoType, ecoValue * comboMultiplier);
        }

        // Reset combo timer
        clearTimeout(comboTimer);
        comboTimer = setTimeout(() => {
          combo = 0;
        }, 2000);

        // Check level up
        checkLevelUp();
      }

      setTimeout(() => item.remove(), 500);
    }

    // Check collision with items
    function checkSliceCollision(x, y) {
      const items = document.querySelectorAll(".eco-item:not(.sliced)");
      items.forEach((item) => {
        const rect = item.getBoundingClientRect();
        const itemX = rect.left + rect.width / 2;
        const itemY = rect.top + rect.height / 2;
        const distance = Math.hypot(x - itemX, y - itemY);

        if (distance < 50) {
          sliceItem(item);
        }
      });
    }

    // Spawn eco/danger item
    function spawnItem() {
      if (!gameRunning) return;

      // ⚖️ Equal chance: 50% danger, 50% eco
      const isDanger = Math.random() < 0.5;

      const itemData = isDanger
        ? dangerItems[Math.floor(Math.random() * dangerItems.length)]
        : ecoItems[Math.floor(Math.random() * ecoItems.length)];

      const item = document.createElement("div");
      item.className = "eco-item" + (isDanger ? " danger-item" : "");
      item.textContent = itemData.emoji;
      item.dataset.emoji = itemData.emoji;
      item.dataset.points = String(itemData.points);

      if (!isDanger) {
        item.dataset.eco = itemData.eco;
        item.dataset.ecoValue = String(itemData.ecoValue);
      }

      // Random starting position at bottom
      const startX = Math.random() * (window.innerWidth - 100) + 50;
      item.style.left = startX + "px";
      item.style.bottom = "-80px";

      gameContainer.appendChild(item);

      // Throw animation
      const targetY = 100 + Math.random() * 200;
      const curveX = (Math.random() - 0.5) * 300;
      const duration = 2000 + Math.random() * 1000 - level * 50;

      animateItem(item, startX, curveX, targetY, duration);
    }

    // Animate item (throw arc)
    function animateItem(item, startX, curveX, peakY, duration) {
      const startTime = Date.now();
      const startBottom = -80;

      function animate() {
        if (!gameRunning || item.classList.contains("sliced")) {
          return;
        }

        const elapsed = Date.now() - startTime;
        const progress = elapsed / duration;

        if (progress >= 1) {
          // Item fell without being sliced - just remove it
          item.remove();
          return;
        }

        // Parabolic motion
        const x = startX + curveX * progress;
        const y =
          startBottom +
          4 * peakY * progress * (1 - progress) +
          window.innerHeight * 0.3 * progress;

        item.style.left = x + "px";
        item.style.bottom = y + "px";
        item.style.transform = `rotate(${progress * 720}deg)`;

        requestAnimationFrame(animate);
      }

      animate();
    }

    // Start game
    function startGameFn() {
      if (startScreen) startScreen.style.display = "none";
      gameRunning = true;

      const spawnRate = Math.max(500, 1500 - level * 100);
      clearInterval(spawnInterval);
      spawnInterval = setInterval(spawnItem, spawnRate);

      // Increase spawn rate over time
      clearInterval(spawnAdjustInterval);
      spawnAdjustInterval = setInterval(() => {
        if (gameRunning) {
          clearInterval(spawnInterval);
          const newRate = Math.max(300, 1500 - level * 100);
          spawnInterval = setInterval(spawnItem, newRate);
        }
      }, 10000);
    }

    // Restart game
    function restartGameFn() {
      score = 0;
      level = 1;
      combo = 0;
      waterSaved = 0;
      treesPlanted = 0;
      energySaved = 0;
      recycled = 0;

      updateScore();
      if (levelEl) levelEl.textContent = String(level);
      if (waterSavedEl) waterSavedEl.textContent = "0";
      if (treesPlantedEl) treesPlantedEl.textContent = "0";
      if (energySavedEl) energySavedEl.textContent = "0";
      if (recycledEl) recycledEl.textContent = "0";

      // Remove all items
      document.querySelectorAll(".eco-item").forEach((item) => item.remove());

      if (gameOverScreen) gameOverScreen.style.display = "none";
      gameRunning = true;

      clearInterval(spawnInterval);
      clearInterval(spawnAdjustInterval);
      const spawnRate = Math.max(500, 1500 - level * 100);
      spawnInterval = setInterval(spawnItem, spawnRate);
      spawnAdjustInterval = setInterval(() => {
        if (gameRunning) {
          clearInterval(spawnInterval);
          const newRate = Math.max(300, 1500 - level * 100);
          spawnInterval = setInterval(spawnItem, newRate);
        }
      }, 10000);
    }

    // Handle mouse movement
    const handleMouseMove = (e) => {
      const x = e.clientX;
      const y = e.clientY;

      moveNinja(x, y);

      if (isSlicing) {
        createSliceTrail(lastMousePos.x, lastMousePos.y, x, y);
        checkSliceCollision(x, y);
      }

      lastMousePos = { x, y };
    };

    const handleMouseDown = () => {
      if (!gameRunning) return;
      isSlicing = true;
    };
    const handleMouseUpLeave = () => {
      isSlicing = false;
      slicePoints = [];
    };

    // Handle touch movement
    const handleTouchMove = (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const x = touch.clientX;
      const y = touch.clientY;

      moveNinja(x, y);

      if (isSlicing) {
        createSliceTrail(lastMousePos.x, lastMousePos.y, x, y);
        checkSliceCollision(x, y);
      }

      lastMousePos = { x, y };
    };

    const handleTouchStart = (e) => {
      if (!gameRunning) return;
      isSlicing = true;
      handleTouchMove(e);
    };
    const handleTouchEnd = () => {
      isSlicing = false;
      slicePoints = [];
    };

    // Init
    function init() {
      createBgParticles();

      gameContainer.addEventListener("mousemove", handleMouseMove);
      gameContainer.addEventListener("mousedown", handleMouseDown);
      gameContainer.addEventListener("mouseup", handleMouseUpLeave);
      gameContainer.addEventListener("mouseleave", handleMouseUpLeave);

      gameContainer.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      gameContainer.addEventListener("touchstart", handleTouchStart, {
        passive: false,
      });
      gameContainer.addEventListener("touchend", handleTouchEnd);

      if (startBtn) startBtn.addEventListener("click", startGameFn);
      if (restartBtn) restartBtn.addEventListener("click", restartGameFn);
    }

    init();

    return () => {
      // Cleanup
      clearInterval(spawnInterval);
      clearInterval(spawnAdjustInterval);
      clearTimeout(comboTimer);

      gameContainer.removeEventListener("mousemove", handleMouseMove);
      gameContainer.removeEventListener("mousedown", handleMouseDown);
      gameContainer.removeEventListener("mouseup", handleMouseUpLeave);
      gameContainer.removeEventListener("mouseleave", handleMouseUpLeave);
      gameContainer.removeEventListener("touchmove", handleTouchMove);
      gameContainer.removeEventListener("touchstart", handleTouchStart);
      gameContainer.removeEventListener("touchend", handleTouchEnd);

      if (startBtn) startBtn.removeEventListener("click", startGameFn);
      if (restartBtn) restartBtn.removeEventListener("click", restartGameFn);
    };
  }, []);

  return (
    <>
      <style>{`
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            user-select: none;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            overflow: hidden;
            cursor: none;
        }

        #gameContainer {
            width: 100vw;
            height: 100vh;
            background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
            position: relative;
            overflow: hidden;
        }

        .bg-particle {
            position: absolute;
            width: 4px;
            height: 4px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            animation: float 15s infinite ease-in-out;
        }

        @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.3; }
            50% { transform: translateY(-100px) rotate(180deg); opacity: 0.8; }
        }

        #header {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            padding: 15px 25px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 100%);
            z-index: 100;
        }

        .stat-box {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 15px;
            padding: 10px 20px;
            display: flex;
            align-items: center;
            gap: 10px;
            color: white;
            font-weight: bold;
            transition: transform 0.3s, box-shadow 0.3s;
        }

        .stat-box:hover {
            transform: scale(1.05);
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
        }

        .stat-icon {
            font-size: 24px;
        }

        .stat-value {
            font-size: 22px;
            background: linear-gradient(135deg, #00f260, #0575e6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        #comboDisplay {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 80px;
            font-weight: bold;
            color: transparent;
            background: linear-gradient(135deg, #f12711, #f5af19);
            -webkit-background-clip: text;
            background-clip: text;
            text-shadow: 0 0 30px rgba(241, 39, 17, 0.5);
            opacity: 0;
            pointer-events: none;
            z-index: 200;
            transition: all 0.3s;
        }

        #comboDisplay.show {
            animation: comboPop 0.5s ease-out;
        }

        @keyframes comboPop {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
            50% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
            100% { opacity: 0; transform: translate(-50%, -50%) scale(1); }
        }

        .eco-item {
            position: absolute;
            width: 70px;
            height: 70px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 50px;
            border-radius: 50%;
            background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), transparent);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3), inset 0 -5px 20px rgba(0,0,0,0.2);
            cursor: none;
            transition: transform 0.1s;
            z-index: 50;
        }

        .eco-item.sliced {
            animation: sliceEffect 0.5s ease-out forwards;
        }

        @keyframes sliceEffect {
            0% { transform: scale(1) rotate(0deg); opacity: 1; }
            50% { transform: scale(1.3) rotate(180deg); opacity: 0.5; }
            100% { transform: scale(0) rotate(360deg); opacity: 0; }
        }

        .slice-half {
            position: absolute;
            font-size: 40px;
            pointer-events: none;
            z-index: 60;
        }

        .slice-half.left {
            animation: sliceLeft 0.8s ease-out forwards;
        }

        .slice-half.right {
            animation: sliceRight 0.8s ease-out forwards;
        }

        @keyframes sliceLeft {
            0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
            100% { transform: translate(-80px, 150px) rotate(-45deg); opacity: 0; }
        }

        @keyframes sliceRight {
            0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
            100% { transform: translate(80px, 150px) rotate(45deg); opacity: 0; }
        }

        #ninjaContainer {
            position: absolute;
            width: 120px;
            height: 120px;
            pointer-events: none;
            z-index: 150;
            transform: translate(-50%, -50%);
            transition: left 0.05s, top 0.05s;
        }

        #ninjaBoy {
            width: 100%;
            height: 100%;
            filter: drop-shadow(0 5px 15px rgba(0, 0, 0, 0.5));
        }

        .slice-trail {
            position: absolute;
            pointer-events: none;
            z-index: 140;
        }

        .trail-segment {
            position: absolute;
            height: 4px;
            background: linear-gradient(90deg, #00f260, #0575e6, #f12711);
            border-radius: 2px;
            box-shadow: 0 0 10px #00f260, 0 0 20px #0575e6;
            transform-origin: left center;
            animation: trailFade 0.3s ease-out forwards;
        }

        @keyframes trailFade {
            0% { opacity: 1; width: 100%; }
            100% { opacity: 0; width: 0%; }
        }

        .points-popup {
            position: absolute;
            font-size: 28px;
            font-weight: bold;
            color: #00f260;
            text-shadow: 0 0 10px #00f260, 2px 2px 0 #000;
            pointer-events: none;
            z-index: 200;
            animation: pointsFloat 1s ease-out forwards;
        }

        @keyframes pointsFloat {
            0% { opacity: 1; transform: translateY(0) scale(1); }
            100% { opacity: 0; transform: translateY(-80px) scale(1.5); }
        }

        #ecoPanel {
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 20px;
            padding: 15px 30px;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(10px);
            border-radius: 25px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            z-index: 100;
        }

        .eco-stat {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 5px;
        }

        .eco-stat-icon {
            font-size: 30px;
        }

        .eco-stat-value {
            color: white;
            font-size: 16px;
            font-weight: bold;
        }

        .eco-stat-label {
            color: rgba(255, 255, 255, 0.6);
            font-size: 10px;
            text-transform: uppercase;
        }

        #startScreen {
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 500;
        }

        #startScreen h1 {
            font-size: 60px;
            color: transparent;
            background: linear-gradient(135deg, #00f260, #0575e6);
            -webkit-background-clip: text;
            background-clip: text;
            margin-bottom: 20px;
            text-shadow: 0 0 30px rgba(0, 242, 96, 0.3);
            animation: titlePulse 2s ease-in-out infinite;
        }

        @keyframes titlePulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }

        #startScreen p {
            color: rgba(255, 255, 255, 0.7);
            font-size: 18px;
            margin-bottom: 40px;
        }

        #startBtn {
            padding: 20px 60px;
            font-size: 24px;
            font-weight: bold;
            color: white;
            background: linear-gradient(135deg, #00f260, #0575e6);
            border: none;
            border-radius: 50px;
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: 0 10px 30px rgba(0, 242, 96, 0.3);
        }

        #startBtn:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 40px rgba(0, 242, 96, 0.4);
        }

        #gameOverScreen {
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.9);
            display: none;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 500;
        }

        #gameOverScreen h1 {
            font-size: 50px;
            color: #f12711;
            margin-bottom: 20px;
        }

        #finalScore {
            font-size: 80px;
            color: transparent;
            background: linear-gradient(135deg, #00f260, #0575e6);
            -webkit-background-clip: text;
            background-clip: text;
            margin-bottom: 30px;
        }

        #restartBtn {
            padding: 15px 50px;
            font-size: 20px;
            font-weight: bold;
            color: white;
            background: linear-gradient(135deg, #f12711, #f5af19);
            border: none;
            border-radius: 50px;
            cursor: pointer;
            transition: all 0.3s;
        }

        #restartBtn:hover {
            transform: scale(1.1);
        }

        #levelUp {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 60px;
            font-weight: bold;
            color: #f5af19;
            text-shadow: 0 0 30px #f5af19;
            opacity: 0;
            pointer-events: none;
            z-index: 300;
        }

        #levelUp.show {
            animation: levelUpAnim 1.5s ease-out;
        }

        @keyframes levelUpAnim {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
            20% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
            80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        }

        .danger-item {
            background: radial-gradient(circle at 30% 30%, rgba(255,100,100,0.3), rgba(100,0,0,0.3)) !important;
            box-shadow: 0 10px 30px rgba(255, 0, 0, 0.3), inset 0 -5px 20px rgba(100,0,0,0.3) !important;
        }

        .sparkle {
            position: absolute;
            width: 8px;
            height: 8px;
            background: white;
            border-radius: 50%;
            pointer-events: none;
            animation: sparkleAnim 0.6s ease-out forwards;
        }

        @keyframes sparkleAnim {
            0% { transform: scale(1); opacity: 1; }
            100% { transform: scale(0); opacity: 0; }
        }
      `}</style>

      {/* Start Screen */}
      <div id="startScreen">
        <h1>🥷 ECO NINJA</h1>
        <p>Slice eco-friendly items • Avoid pollution! • Save the planet!</p>
        <button id="startBtn">START SLICING!</button>
      </div>

      {/* Game Container */}
      <div id="gameContainer">
        {/* Header Stats */}
        <div id="header">
          <div className="stat-box">
            <span className="stat-icon">⭐</span>
            <span className="stat-value" id="score">
              0
            </span>
          </div>
          <div className="stat-box">
            <span className="stat-icon">🎯</span>
            <span className="stat-value">
              LV <span id="level">1</span>
            </span>
          </div>
        </div>

        {/* Combo Display */}
        <div id="comboDisplay">COMBO x1</div>

        {/* Level Up Notification */}
        <div id="levelUp">LEVEL UP! 🎉</div>

        {/* Ninja Boy */}
        <div id="ninjaContainer">
          <svg id="ninjaBoy" viewBox="0 0 100 100">
            {/* Body */}
            <ellipse cx="50" cy="70" rx="20" ry="25" fill="#2d3436" />

            {/* Cape */}
            <path
              d="M30 55 Q25 80 35 95 L50 85 L65 95 Q75 80 70 55"
              fill="#e74c3c"
            >
              <animate
                attributeName="d"
                values="M30 55 Q25 80 35 95 L50 85 L65 95 Q75 80 70 55;
                                M30 55 Q20 85 30 95 L50 88 L70 95 Q80 85 70 55;
                                M30 55 Q25 80 35 95 L50 85 L65 95 Q75 80 70 55"
                dur="0.5s"
                repeatCount="indefinite"
              />
            </path>

            {/* Head */}
            <circle cx="50" cy="35" r="22" fill="#ffeaa7" />

            {/* Ninja mask */}
            <rect x="25" y="28" width="50" height="15" rx="5" fill="#2d3436" />

            {/* Eyes */}
            <ellipse cx="40" cy="35" rx="5" ry="4" fill="white" />
            <ellipse cx="60" cy="35" rx="5" ry="4" fill="white" />
            <circle cx="41" cy="35" r="2" fill="#2d3436" />
            <circle cx="61" cy="35" r="2" fill="#2d3436" />

            {/* Eye shine */}
            <circle cx="42" cy="34" r="1" fill="white" />
            <circle cx="62" cy="34" r="1" fill="white" />

            {/* Hair */}
            <path
              d="M30 25 Q35 10 50 12 Q65 10 70 25"
              fill="#2d3436"
              stroke="#2d3436"
              strokeWidth="3"
            />

            {/* Sword arm */}
            <g id="swordArm">
              <ellipse cx="75" cy="60" rx="8" ry="6" fill="#ffeaa7" />
              {/* Sword */}
              <rect x="78" y="45" width="4" height="35" rx="2" fill="#bdc3c7">
                <animate
                  attributeName="fill"
                  values="#bdc3c7;#ecf0f1;#bdc3c7"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </rect>
              <rect x="75" y="55" width="10" height="5" rx="2" fill="#f39c12" />
              {/* Sword glow */}
              <rect
                x="78"
                y="45"
                width="4"
                height="35"
                rx="2"
                fill="url(#swordGlow)"
                opacity="0.5"
              />
            </g>

            {/* Gradient for sword glow */}
            <defs>
              <linearGradient id="swordGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#00f260" stopOpacity="1" />
                <stop offset="100%" stopColor="#0575e6" stopOpacity="1" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Eco Stats Panel */}
        <div id="ecoPanel">
          <div className="eco-stat">
            <span className="eco-stat-icon">💧</span>
            <span className="eco-stat-value" id="waterSaved">
              0
            </span>
            <span className="eco-stat-label">Liters Saved</span>
          </div>
          <div className="eco-stat">
            <span className="eco-stat-icon">🌳</span>
            <span className="eco-stat-value" id="treesPlanted">
              0
            </span>
            <span className="eco-stat-label">Trees Planted</span>
          </div>
          <div className="eco-stat">
            <span className="eco-stat-icon">⚡</span>
            <span className="eco-stat-value" id="energySaved">
              0
            </span>
            <span className="eco-stat-label">kWh Saved</span>
          </div>
          <div className="eco-stat">
            <span className="eco-stat-icon">♻</span>
            <span className="eco-stat-value" id="recycled">
              0
            </span>
            <span className="eco-stat-label">Items Recycled</span>
          </div>
        </div>
      </div>

      {/* Game Over Screen */}
      <div id="gameOverScreen">
        <h1>GAME OVER</h1>
        <div id="finalScore">0</div>
        <p style={{ color: "rgba(255,255,255,0.7)", marginBottom: "20px" }}>
          You made a difference! 🌍
        </p>
        <button id="restartBtn">PLAY AGAIN</button>
      </div>
    </>
  );
};

export default EcoNinjaGame;
