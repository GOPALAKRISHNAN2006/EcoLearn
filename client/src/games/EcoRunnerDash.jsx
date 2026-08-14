import React, { useEffect } from "react";

const EcoRunnerDash = () => {
  useEffect(() => {
    // ===== GAME CONFIG =====
    const LEVELS = {
      easy: {
        name: "Easy Eco Run",
        icon: "🌱",
        speed: 280,
        spawnInterval: 1100,
        greenChance: 0.5,
        shieldChance: 0.1,
        factChance: 0.15,
        maxCarbon: 170,
        pollutionHit: 10,
        greenReward: 10,
        greenCarbonCut: 8,
        distanceMultiplier: 1,
      },
      medium: {
        name: "City Climate Dash",
        icon: "🌿",
        speed: 340,
        spawnInterval: 950,
        greenChance: 0.45,
        shieldChance: 0.12,
        factChance: 0.18,
        maxCarbon: 160,
        pollutionHit: 13,
        greenReward: 12,
        greenCarbonCut: 9,
        distanceMultiplier: 1.2,
      },
      hard: {
        name: "Extreme Net-Zero Sprint",
        icon: "🔥",
        speed: 420,
        spawnInterval: 800,
        greenChance: 0.4,
        shieldChance: 0.14,
        factChance: 0.2,
        maxCarbon: 150,
        pollutionHit: 16,
        greenReward: 14,
        greenCarbonCut: 10,
        distanceMultiplier: 1.4,
      },
    };

    const pollutionEmojis = ["🏭", "🚗", "🚛", "🔥", "💨", "🛢"];
    const greenEmojis = ["🌳", "☀", "💧", "💨", "♻", "🚉", "🚲"];
    const shieldEmoji = "🛡";
    const factEmoji = "📘";

    const climateFacts = [
      "Planting trees absorbs CO₂ and cools cities.",
      "Cycling or walking instead of driving cuts pollution.",
      "Solar panels turn sunlight into clean energy.",
      "Saving water also saves energy used to pump and treat it.",
      "Public transport reduces traffic and emissions.",
      "Recycling saves resources and reduces landfill waste.",
      "Turning off lights when not needed saves electricity.",
      "Electric trains emit less CO₂ than diesel cars.",
      "Wetlands store large amounts of carbon naturally.",
      "Reducing food waste helps lower methane emissions.",
    ];

    // DOM elements
    const startScreen = document.getElementById("startScreen");
    const gameScreen = document.getElementById("gameScreen");
    const gameArea = document.getElementById("gameArea");
    const runnerEl = document.getElementById("runner");
    const runnerShadowEl = document.getElementById("runnerShadow");
    const speedTrailEl = document.getElementById("speedTrail");
    const messageBox = document.getElementById("messageBox");

    const carbonDisplay = document.getElementById("carbonDisplay");
    const scoreDisplay = document.getElementById("scoreDisplay");
    const distanceDisplay = document.getElementById("distanceDisplay");
    const carbonBarFill = document.getElementById("carbonBarFill");
    const maxCarbonLabel = document.getElementById("maxCarbonLabel");
    const levelTag = document.getElementById("levelTag");
    const livesDisplay = document.getElementById("livesDisplay");

    const comboPill = document.getElementById("comboPill");
    const shieldPill = document.getElementById("shieldPill");

    const gameOverScreen = document.getElementById("gameOverScreen");
    const gameOverTitle = document.getElementById("gameOverTitle");
    const finalLevelText = document.getElementById("finalLevelText");
    const finalScore = document.getElementById("finalScore");
    const finalCarbon = document.getElementById("finalCarbon");
    const finalDistance = document.getElementById("finalDistance");
    const finalFacts = document.getElementById("finalFacts");

    const easyBtn = document.getElementById("easyBtn");
    const mediumBtn = document.getElementById("mediumBtn");
    const hardBtn = document.getElementById("hardBtn");
    const restartLevelBtn = document.getElementById("restartLevelBtn");
    const backToMenuBtn = document.getElementById("backToMenuBtn");
    const mobileJumpBtn = document.getElementById("mobileJumpBtn");
    const overlayRestartBtn = document.getElementById("overlayRestartBtn");
    const overlayBackBtn = document.getElementById("overlayBackBtn");

    if (!gameArea || !runnerEl) return;

    // GAME STATE
    let currentLevelKey = "easy";
    let currentLevel = LEVELS.easy;
    let carbonLevel = 100;
    let score = 0;
    let distance = 0;
    let comboCount = 0;
    let shieldCount = 0;
    let factsUnlocked = 0;
    let lives = 3;

    let objects = [];
    let running = false;
    let lastFrameTime = 0;
    let spawnTimer = 0;

    const groundHeight = 90;
    let runnerY = 0;
    let runnerVelocity = 0;
    const gravity = -1200;
    const jumpForce = 520;
    const doubleJumpForce = 480;
    let isOnGround = true;
    let canDoubleJump = true;

    let animationFrameId = null;

    function setMessage(text) {
      if (messageBox) {
        messageBox.textContent = text;
      }
    }

    function applyLevelUI() {
      currentLevel = LEVELS[currentLevelKey];
      if (levelTag) {
        levelTag.textContent = `${currentLevel.name} ${currentLevel.icon}`;
      }
      if (maxCarbonLabel) {
        maxCarbonLabel.textContent = String(currentLevel.maxCarbon);
      }
    }

    function updateRunnerPosition() {
      const baseBottom = groundHeight;
      const bottom = baseBottom + runnerY;
      runnerEl.style.bottom = bottom + "px";

      const shadowScale = Math.max(0.6, 1 - runnerY / 220);
      runnerShadowEl.style.transform = `scale(${shadowScale}, ${shadowScale})`;
    }

    function resetRunner() {
      runnerY = 0;
      runnerVelocity = 0;
      isOnGround = true;
      canDoubleJump = true;
      updateRunnerPosition();
      runnerEl.classList.remove("jump");
      runnerEl.classList.add("run");
      speedTrailEl.classList.remove("show");
    }

    function updateHUD() {
      if (carbonDisplay) carbonDisplay.textContent = String(Math.round(carbonLevel));
      if (scoreDisplay) scoreDisplay.textContent = String(score);
      if (distanceDisplay)
        distanceDisplay.textContent = `${Math.floor(distance)} m`;

      const carbonRatio = Math.max(
        0,
        Math.min(1, carbonLevel / currentLevel.maxCarbon)
      );
      if (carbonBarFill) {
        carbonBarFill.style.width = `${carbonRatio * 100}%`;
      }

      if (carbonDisplay) {
        if (carbonLevel <= 0) {
          carbonDisplay.style.color = "#16a34a";
        } else if (carbonLevel > currentLevel.maxCarbon - 10) {
          carbonDisplay.style.color = "#b91c1c";
        } else {
          carbonDisplay.style.color = "#065f46";
        }
      }

      if (comboPill) {
        comboPill.textContent = `🔥 Combo: ${comboCount}`;
      }
      if (shieldPill) {
        shieldPill.textContent = `🛡 Shield: ${shieldCount}`;
      }

      if (livesDisplay) {
        livesDisplay.textContent = lives > 0 ? "❤".repeat(lives) : "💔";
      }

      // speed trail
      if (comboCount >= 3) {
        speedTrailEl.classList.add("show");
      } else {
        speedTrailEl.classList.remove("show");
      }
    }

    function resetGame(levelKey) {
      currentLevelKey = levelKey;
      applyLevelUI();

      carbonLevel = 100;
      score = 0;
      distance = 0;
      comboCount = 0;
      shieldCount = 0;
      factsUnlocked = 0;
      lives = 3;

      objects.forEach((o) => o.el.remove());
      objects = [];
      spawnTimer = 0;
      lastFrameTime = 0;

      resetRunner();
      updateHUD();
      setMessage(
        "🏃 Run along the eco track, avoid red pollution, collect green items and climate facts! You have 3 lives."
      );

      if (gameOverScreen) {
        gameOverScreen.classList.remove("show");
      }
    }

    function startGame(levelKey) {
      resetGame(levelKey);
      if (startScreen) startScreen.style.display = "none";
      if (gameScreen) gameScreen.classList.add("active");
      running = true;
      animationFrameId = requestAnimationFrame(gameLoop);
      window.scrollTo({
        top: gameScreen ? gameScreen.offsetTop - 10 : 0,
        behavior: "smooth",
      });
    }

    function backToMenu() {
      running = false;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (gameScreen) gameScreen.classList.remove("active");
      if (startScreen) startScreen.style.display = "block";
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function restartLevel() {
      running = false;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      resetGame(currentLevelKey);
      running = true;
      animationFrameId = requestAnimationFrame(gameLoop);
    }

    function jump() {
      if (!running) return;
      if (isOnGround) {
        runnerVelocity = jumpForce;
        isOnGround = false;
        canDoubleJump = true;
        runnerEl.classList.add("jump");
        setTimeout(() => runnerEl && runnerEl.classList.remove("jump"), 200);
      } else if (canDoubleJump) {
        runnerVelocity = doubleJumpForce;
        canDoubleJump = false;
        runnerEl.classList.add("jump");
        setTimeout(() => runnerEl && runnerEl.classList.remove("jump"), 200);
        setMessage(
          "✨ Double jump! Great for clearing tall pollution and catching high green orbs."
        );
      }
    }

    function spawnObject() {
      const rnd = Math.random();
      let type;
      if (rnd < currentLevel.shieldChance) {
        type = "shield";
      } else if (rnd < currentLevel.shieldChance + currentLevel.greenChance) {
        type = "green";
      } else if (
        rnd <
        currentLevel.shieldChance +
          currentLevel.greenChance +
          currentLevel.factChance
      ) {
        type = "fact";
      } else {
        type = "pollution";
      }

      const el = document.createElement("div");
      el.classList.add("object", type);

      if (type === "green") {
        el.textContent =
          greenEmojis[Math.floor(Math.random() * greenEmojis.length)];
      } else if (type === "pollution") {
        el.textContent =
          pollutionEmojis[Math.floor(Math.random() * pollutionEmojis.length)];
      } else if (type === "shield") {
        el.textContent = shieldEmoji;
      } else if (type === "fact") {
        el.textContent = factEmoji;
      }

      gameArea.appendChild(el);

      const areaWidth = gameArea.clientWidth;
      let bottom;
      if (type === "pollution") {
        bottom = groundHeight + 2;
      } else if (type === "green") {
        bottom = Math.random() < 0.5 ? groundHeight + 6 : groundHeight + 90;
      } else if (type === "shield" || type === "fact") {
        bottom = groundHeight + 70 + Math.random() * 40;
      } else {
        bottom = groundHeight;
      }

      el.style.bottom = `${bottom}px`;
      el.style.left = `${areaWidth + 40}px`;

      objects.push({
        el,
        type,
        x: areaWidth + 40,
        bottom,
        hit: false,
      });
    }

    function createFloatingText(text, color, xPx, bottomPx) {
      const ft = document.createElement("div");
      ft.className = "floating-text";
      ft.textContent = text;
      ft.style.left = xPx + "px";
      ft.style.bottom = bottomPx + "px";
      ft.style.color = color;
      gameArea.appendChild(ft);
      setTimeout(() => ft.remove(), 800);
    }

    function rectsOverlap(a, b) {
      return !(
        a.right < b.left ||
        a.left > b.right ||
        a.bottom < b.top ||
        a.top > b.bottom
      );
    }

    function checkCollisions() {
      const runnerRect = runnerEl.getBoundingClientRect();
      let gameOver = false;

      objects.forEach((obj) => {
        if (obj.hit || gameOver) return;

        const objRect = obj.el.getBoundingClientRect();
        if (rectsOverlap(runnerRect, objRect)) {
          obj.hit = true;

          const objCenterX = obj.x;
          const objBottom = parseFloat(obj.el.style.bottom) || groundHeight;

          if (obj.type === "pollution") {
            if (shieldCount > 0) {
              shieldCount--;
              setMessage(
                "🛡 Eco shield blocked the pollution hit – smart move!"
              );
              createFloatingText(
                "Shield!",
                "#1d4ed8",
                objCenterX,
                objBottom + 22
              );
            } else {
              lives--;
              carbonLevel += currentLevel.pollutionHit;
              score = Math.max(0, score - 3);
              comboCount = 0;
              if (lives > 0) {
                setMessage(
                  `⚠ Pollution hit! You lost a life. Lives left: ${lives}.`
                );
              } else {
                setMessage(
                  "💥 All 3 lives lost – the city took too much pollution."
                );
              }
              createFloatingText(
                "-1 Life",
                "#b91c1c",
                objCenterX,
                objBottom + 32
              );
              updateHUD();

              if (lives <= 0) {
                endGame("lives");
                gameOver = true;
              }
            }
          } else if (obj.type === "green") {
            carbonLevel = Math.max(
              0,
              carbonLevel - currentLevel.greenCarbonCut
            );
            score += currentLevel.greenReward;
            comboCount++;
            if (comboCount >= 3) {
              const bonus = 6;
              score += bonus;
              setMessage(
                "🔥 Eco combo! Several green actions in a row made a big impact."
              );
              createFloatingText(
                `Combo +${bonus}`,
                "#15803d",
                objCenterX,
                objBottom + 32
              );
            } else {
              setMessage(
                "✅ Nice! That action reduces emissions in real life too."
              );
            }
            createFloatingText("-CO₂", "#15803d", objCenterX, objBottom + 18);
            updateHUD();
          } else if (obj.type === "shield") {
            shieldCount++;
            setMessage(
              "🛡 Eco shield collected – the next pollution hit will be blocked."
            );
            createFloatingText(
              "Shield +1",
              "#1d4ed8",
              objCenterX,
              objBottom + 22
            );
            updateHUD();
          } else if (obj.type === "fact") {
            const fact =
              climateFacts[Math.floor(Math.random() * climateFacts.length)];
            factsUnlocked++;
            setMessage("📘 Climate Fact: " + fact);
            createFloatingText("Fact!", "#92400e", objCenterX, objBottom + 22);
          }

          setTimeout(() => obj.el && obj.el.remove(), 0);
        }
      });

      return gameOver;
    }

    function endGame(reason) {
      running = false;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);

      if (finalLevelText) {
        finalLevelText.textContent = `${currentLevel.name} ${currentLevel.icon}`;
      }
      if (finalScore) finalScore.textContent = String(score);
      if (finalCarbon) finalCarbon.textContent = String(Math.round(carbonLevel));
      if (finalDistance)
        finalDistance.textContent = `${Math.floor(distance)} m`;
      if (finalFacts) finalFacts.textContent = String(factsUnlocked);

      if (reason === "carbon") {
        gameOverTitle.textContent = "❌ Climate Crisis!";
      } else if (reason === "lives") {
        gameOverTitle.textContent = "❌ Out of Lives!";
      } else if (carbonLevel <= 0) {
        gameOverTitle.textContent = "✅ Carbon Neutral Hero!";
      } else {
        gameOverTitle.textContent = "🏆 Eco Distance Champion!";
      }

      if (gameOverScreen) {
        gameOverScreen.classList.add("show");
      }
      
      // Dispatch game completion event
      window.dispatchEvent(new CustomEvent('gameComplete', {
        detail: { finalScore: score }
      }));
    }

    function gameLoop(timestamp) {
      if (!running) return;

      if (!lastFrameTime) lastFrameTime = timestamp;
      const delta = timestamp - lastFrameTime;
      lastFrameTime = timestamp;
      const deltaSec = delta / 1000;

      // physics
      runnerVelocity += gravity * deltaSec;
      runnerY += runnerVelocity * deltaSec;
      if (runnerY <= 0) {
        runnerY = 0;
        runnerVelocity = 0;
        if (!isOnGround) {
          isOnGround = true;
          canDoubleJump = true;
        }
      } else {
        isOnGround = false;
      }
      updateRunnerPosition();

      // distance
      distance +=
        (currentLevel.speed * deltaSec * currentLevel.distanceMultiplier) / 10;

      // move objects
      const moveX = currentLevel.speed * deltaSec;
      objects.forEach((obj) => {
        obj.x -= moveX;
        obj.el.style.left = obj.x + "px";
      });

      objects = objects.filter((obj) => {
        if (obj.x < -80) {
          obj.el.remove();
          return false;
        }
        return true;
      });

      // spawn
      spawnTimer += delta;
      if (spawnTimer >= currentLevel.spawnInterval) {
        spawnTimer = 0;
        spawnObject();
      }

      // passive carbon decrease
      carbonLevel = Math.max(0, carbonLevel - 0.02);
      updateHUD();

      const gameOverByHit = checkCollisions();
      if (gameOverByHit) return;

      if (carbonLevel >= currentLevel.maxCarbon) {
        setMessage(
          "💥 Carbon got too high – try dodging more red pollution next time."
        );
        endGame("carbon");
        return;
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    }

    // KEYBOARD
    const keyHandler = (e) => {
      if (!running) return;
      if (e.code === "Space" || e.key === " " || e.key === "ArrowUp") {
        e.preventDefault();
        jump();
      }
    };
    document.addEventListener("keydown", keyHandler);

    // BUTTON HANDLERS
    const easyHandler = () => startGame("easy");
    const mediumHandler = () => startGame("medium");
    const hardHandler = () => startGame("hard");
    const restartHandler = () => restartLevel();
    const backHandler = () => backToMenu();
    const mobileJumpHandler = () => jump();
    const overlayRestartHandler = () => restartLevel();
    const overlayBackHandler = () => backToMenu();

    if (easyBtn) easyBtn.addEventListener("click", easyHandler);
    if (mediumBtn) mediumBtn.addEventListener("click", mediumHandler);
    if (hardBtn) hardBtn.addEventListener("click", hardHandler);
    if (restartLevelBtn)
      restartLevelBtn.addEventListener("click", restartHandler);
    if (backToMenuBtn) backToMenuBtn.addEventListener("click", backHandler);
    if (mobileJumpBtn)
      mobileJumpBtn.addEventListener("click", mobileJumpHandler);
    if (overlayRestartBtn)
      overlayRestartBtn.addEventListener("click", overlayRestartHandler);
    if (overlayBackBtn)
      overlayBackBtn.addEventListener("click", overlayBackHandler);

    // initial UI state
    applyLevelUI();
    resetRunner();
    updateHUD();

    // CLEANUP
    return () => {
      running = false;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      document.removeEventListener("keydown", keyHandler);
      if (easyBtn) easyBtn.removeEventListener("click", easyHandler);
      if (mediumBtn) mediumBtn.removeEventListener("click", mediumHandler);
      if (hardBtn) hardBtn.removeEventListener("click", hardHandler);
      if (restartLevelBtn)
        restartLevelBtn.removeEventListener("click", restartHandler);
      if (backToMenuBtn)
        backToMenuBtn.removeEventListener("click", backHandler);
      if (mobileJumpBtn)
        mobileJumpBtn.removeEventListener("click", mobileJumpHandler);
      if (overlayRestartBtn)
        overlayRestartBtn.removeEventListener("click", overlayRestartHandler);
      if (overlayBackBtn)
        overlayBackBtn.removeEventListener("click", overlayBackHandler);
      objects.forEach((o) => o.el.remove());
      objects = [];
    };
  }, []);

  return (
    <div className="eco-runner-game">
      <style>{`
        .eco-runner-game {
          width: 100%;
          min-height: 100vh;
          padding: 70px 16px 40px;
          background: radial-gradient(circle at 0% 0%, #e0f2fe 0, #f1f5f9 35%, #dcfce7 70%, #e0f2fe 100%);
          background-size: 200% 200%;
          animation: ecoBgFlow 18s ease-in-out infinite;
          color: #064e3b;
          font-family: "Segoe UI", system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif;
          box-sizing: border-box;
        }

        @keyframes ecoBgFlow {
          0% { background-position: 0% 0%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 0%; }
        }

        .eco-runner-game *,
        .eco-runner-game *::before,
        .eco-runner-game *::after {
          box-sizing: border-box;
        }

        .eco-runner-game .container {
          max-width: 1180px;
          margin: 0 auto;
        }

        /* TOP NAV BAR */
        .eco-runner-game .top-nav {
          max-width: 1180px;
          margin: 0 auto 12px;
          padding: 10px 16px;
          border-radius: 18px;
          background: rgba(15, 23, 42, 0.82);
          border: 1px solid rgba(148, 163, 184, 0.7);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          box-shadow: 0 18px 45px rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(16px);
          transform: translateY(0);
          animation: navDrop 0.6s ease-out;
        }

        @keyframes navDrop {
          from { opacity: 0; transform: translateY(-16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .eco-runner-game .brand {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 800;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          font-size: 0.82rem;
          color: #e0f2fe;
        }

        .eco-runner-game .brand-logo {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 10%, #bbf7d0, #16a34a);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.4);
          animation: logoPulse 2.4s ease-in-out infinite;
        }

        @keyframes logoPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.35); }
          50% { transform: scale(1.06); box-shadow: 0 0 0 7px rgba(34, 197, 94, 0.15); }
        }

        .eco-runner-game .nav-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: flex-end;
        }

        .eco-runner-game .nav-pill {
          border-radius: 999px;
          padding: 4px 11px;
          font-size: 0.75rem;
          background: rgba(15, 23, 42, 0.8);
          color: #dbeafe;
          border: 1px solid rgba(148, 163, 184, 0.9);
          display: inline-flex;
          align-items: center;
          gap: 4px;
          box-shadow: 0 10px 22px rgba(15, 23, 42, 0.6);
        }

        .eco-runner-game .nav-pill.alt {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(22, 163, 74, 0.5));
          color: #ecfdf3;
          border-color: rgba(34, 197, 94, 0.8);
        }

        .eco-runner-game .nav-pill span {
          font-size: 0.95rem;
        }

        /* HEADER */

        .eco-runner-game .header {
          text-align: center;
          margin-bottom: 20px;
          margin-top: 16px;
          position: relative;
          animation: ecoFadeDown 0.7s ease-out;
        }

        @keyframes ecoFadeDown {
          from { opacity: 0; transform: translateY(-16px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .eco-runner-game .header h1 {
          font-size: 2.8rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background: linear-gradient(90deg, #22c55e, #0ea5e9, #a855f7);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          text-shadow: 0 16px 40px rgba(15, 23, 42, 0.45);
        }

        .eco-runner-game .header p {
          margin-top: 8px;
          font-size: 1.02rem;
          color: #0369a1;
        }

        .tagline {
          margin-top: 10px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 18px;
          border-radius: 999px;
          background: rgba(15, 23, 42, 0.85);
          border: 1px solid rgba(148, 163, 184, 0.6);
          font-size: 0.88rem;
          color: #e5e7eb;
          box-shadow: 0 16px 30px rgba(15, 23, 42, 0.6);
        }

        .header-cloud {
          position: absolute;
          top: -6px;
          width: 110px;
          height: 46px;
          background: #ffffff;
          border-radius: 999px;
          box-shadow: 26px 6px 0 #ffffff, 10px -10px 0 #ffffff;
          opacity: 0.9;
          animation: floatCloud 18s linear infinite;
          z-index: -1;
        }

        .header-cloud.left { left: 5%; }
        .header-cloud.right { right: 5%; animation-delay: 5s; }

        @keyframes floatCloud {
          0% { transform: translateX(0); opacity: 0.9; }
          50% { transform: translateX(24px); opacity: 1; }
          100% { transform: translateX(0); opacity: 0.9; }
        }

        .sun-orbit {
          position: absolute;
          top: -30px;
          right: 16%;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: radial-gradient(circle, #fde68a 0%, #facc15 40%, #fb923c 100%);
          box-shadow: 0 0 25px rgba(250, 204, 21, 0.9);
          animation: spinSun 20s linear infinite;
          z-index: -1;
        }

        @keyframes spinSun {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* START SCREEN */

        .start-screen {
          background: radial-gradient(circle at top, #eff6ff 0, #ffffff 40%, #ecfdf5 100%);
          border-radius: 24px;
          border: 1px solid rgba(226, 232, 240, 0.9);
          padding: 18px 18px 20px;
          box-shadow: 0 24px 50px rgba(15, 23, 42, 0.35);
          animation: fadeIn 0.6s ease-out;
          position: relative;
          overflow: hidden;
        }

        .start-screen::before {
          content: "";
          position: absolute;
          inset: -40%;
          background:
            radial-gradient(circle at 10% 0%, rgba(59, 130, 246, 0.09) 0 35%, transparent 35%),
            radial-gradient(circle at 90% 100%, rgba(34, 197, 94, 0.12) 0 40%, transparent 40%);
          opacity: 0.7;
          z-index: -1;
        }

        .start-icon {
          font-size: 3rem;
          text-align: center;
          margin-bottom: 4px;
          animation: bounceIcon 2s infinite;
        }

        @keyframes bounceIcon {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        .start-screen h2 {
          text-align: center;
          font-size: 1.9rem;
          color: #047857;
          margin-bottom: 4px;
        }

        .start-screen p {
          text-align: center;
          font-size: 0.96rem;
          color: #111827;
          max-width: 760px;
          margin: 0 auto 12px;
          line-height: 1.6;
        }

        .start-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.7fr) minmax(0, 1.1fr);
          gap: 18px;
          margin-top: 8px;
        }

        .instructions {
          background: #ecfeff;
          border-radius: 18px;
          padding: 14px;
          border-left: 5px solid #0ea5e9;
          box-shadow: 0 16px 32px rgba(15, 23, 42, 0.25);
        }

        .instructions h3 {
          font-size: 0.95rem;
          color: #0369a1;
          margin-bottom: 6px;
        }

        .instructions ul { list-style: none; padding-left: 0; }

        .instructions li {
          display: flex;
          gap: 8px;
          font-size: 0.9rem;
          color: #0f172a;
          margin-bottom: 6px;
        }

        .instructions li::before {
          content: "•";
          color: #0ea5e9;
          font-size: 1.1rem;
          margin-top: -1px;
        }

        .controls-note {
          margin-top: 6px;
          font-size: 0.83rem;
          color: #0369a1;
        }

        .level-box {
          background: linear-gradient(135deg, #0f172a, #020617);
          border-radius: 18px;
          padding: 14px 12px;
          border: 1px solid rgba(15, 23, 42, 0.9);
          box-shadow: 0 20px 40px rgba(15, 23, 42, 0.5);
          color: #e5e7eb;
        }

        .level-box h3 {
          font-size: 0.98rem;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .level-sub {
          font-size: 0.78rem;
          color: #9ca3af;
        }

        .level-buttons {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .level-btn {
          border: none;
          border-radius: 999px;
          padding: 9px 14px;
          font-size: 0.9rem;
          font-weight: 700;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          background: #ffffff;
          box-shadow: 0 12px 24px rgba(15, 23, 42, 0.6);
          transition: transform 0.16s ease, box-shadow 0.16s ease, filter 0.16s ease;
          color: #0f172a;
        }

        .level-btn span {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .level-btn small {
          font-size: 0.76rem;
          opacity: 0.9;
        }

        .level-btn.easy {
          background: linear-gradient(135deg, #bbf7d0, #4ade80);
        }

        .level-btn.medium {
          background: linear-gradient(135deg, #bfdbfe, #60a5fa);
        }

        .level-btn.hard {
          background: linear-gradient(135deg, #fed7aa, #fb923c);
        }

        .level-btn:hover {
          transform: translateY(-2px) scale(1.02);
          filter: brightness(1.04);
          box-shadow: 0 18px 30px rgba(15, 23, 42, 0.75);
        }

        .level-btn:active {
          transform: translateY(0.5px) scale(0.99);
          box-shadow: 0 8px 18px rgba(15, 23, 42, 0.65);
        }

        /* GAME SCREEN */

        .game-screen {
          display: none;
          margin-top: 24px;
          animation: fadeIn 0.5s ease-out;
        }

        .game-screen.active { display: block; }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .game-header {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 12px;
        }

        .info-box {
          position: relative;
          background: rgba(15, 23, 42, 0.9);
          border-radius: 18px;
          padding: 9px 11px;
          border: 1px solid rgba(30, 64, 175, 0.6);
          box-shadow: 0 16px 32px rgba(15, 23, 42, 0.8);
          overflow: hidden;
          backdrop-filter: blur(12px);
          transition: transform 0.16s ease, box-shadow 0.16s ease;
        }

        .info-box::after {
          content: "";
          position: absolute;
          right: -20px;
          top: -20px;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.4), transparent 60%);
          opacity: 0.7;
        }

        .info-box:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 40px rgba(15, 23, 42, 0.9);
        }

        .info-label {
          font-size: 0.76rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #9ca3af;
          margin-bottom: 4px;
          font-weight: 700;
        }

        .info-value {
          font-size: 1.4rem;
          font-weight: 800;
          color: #bbf7d0;
        }

        .info-value.small {
          font-size: 0.96rem;
          font-weight: 600;
        }

        .level-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 999px;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(34, 197, 94, 0.3));
          border: 1px solid rgba(191, 219, 254, 0.8);
          color: #e0f2fe;
          font-size: 0.82rem;
        }

        .carbon-label-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          margin-bottom: 4px;
          color: #1f2933;
        }

        .carbon-bar-wrapper {
          margin-bottom: 12px;
          background: #0b1120;
          border-radius: 999px;
          padding: 4px;
          border: 1px solid rgba(30, 64, 175, 0.9);
          box-shadow: 0 16px 32px rgba(15, 23, 42, 0.9);
          overflow: hidden;
          position: relative;
        }

        .carbon-bar-fill {
          width: 0%;
          height: 12px;
          border-radius: 999px;
          background: linear-gradient(90deg, #22c55e, #facc15, #fb923c, #ef4444);
          box-shadow: 0 0 12px rgba(239, 68, 68, 0.9);
          transition: width 0.16s linear;
        }

        .carbon-bar-glow {
          position: absolute;
          inset: -10px;
          background: radial-gradient(circle at 0 50%, rgba(34, 197, 94, 0.22), transparent 60%);
          pointer-events: none;
          opacity: 0.8;
        }

        /* GAME AREA */

        .game-shell {
          background: rgba(15, 23, 42, 0.95);
          border-radius: 26px;
          border: 1px solid rgba(30, 64, 175, 0.9);
          padding: 12px 12px 14px;
          box-shadow: 0 26px 60px rgba(15, 23, 42, 0.95);
          position: relative;
          overflow: visible;
          animation: shellRise 0.6s ease-out;
        }

        @keyframes shellRise {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .game-shell::before {
          content: "Tip: Collect green actions and shields. Avoid red pollution!";
          position: absolute;
          top: -22px;
          left: 16px;
          font-size: 0.8rem;
          color: #0f172a;
          background: #e0f2fe;
          padding: 4px 8px;
          border-radius: 999px;
          border: 1px solid rgba(191, 219, 254, 0.9);
          box-shadow: 0 10px 22px rgba(15, 23, 42, 0.6);
        }

        .game-area {
          position: relative;
          width: 100%;
          height: 340px;
          border-radius: 20px;
          overflow: hidden;
          background: linear-gradient(180deg, #020617 0%, #0f172a 35%, #dcfce7 65%, #22c55e 100%);
        }

        /* Animated sky & city */

        .sky-gradient {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 20% 0%, rgba(251, 191, 36, 0.4), transparent 55%);
          mix-blend-mode: soft-light;
          animation: skyPulse 12s ease-in-out infinite alternate;
          z-index: 0;
        }

        @keyframes skyPulse {
          0% { opacity: 0.4; }
          100% { opacity: 0.9; }
        }

        .city-layer {
          position: absolute;
          bottom: 90px;
          left: 0;
          right: 0;
          height: 110px;
          background-repeat: repeat-x;
          opacity: 0.5;
          z-index: 1;
        }

        .city-back {
          background-image: linear-gradient(
            to top,
            rgba(15, 23, 42, 0.6) 0,
            rgba(30, 64, 175, 0.7) 40%,
            transparent 40%
          );
          background-size: 220px 110px;
          animation: cityScrollBack 40s linear infinite;
        }

        .city-front {
          background-image: linear-gradient(
            to top,
            rgba(15, 23, 42, 0.7) 0,
            rgba(30, 64, 175, 0.8) 45%,
            transparent 45%
          );
          background-size: 280px 110px;
          animation: cityScrollFront 30s linear infinite;
        }

        @keyframes cityScrollBack {
          from { background-position-x: 0; }
          to { background-position-x: -200px; }
        }

        @keyframes cityScrollFront {
          from { background-position-x: 0; }
          to { background-position-x: -260px; }
        }

        .bg-stripes {
          position: absolute;
          inset: 0;
          background-image:
            repeating-linear-gradient(
              to right,
              rgba(59, 130, 246, 0.16) 0 12px,
              transparent 12px 24px
            );
          opacity: 0.4;
          z-index: 0;
        }

        .bg-hills {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse at 10% 120%, rgba(22, 163, 74, 0.45) 0 45%, transparent 45%),
            radial-gradient(ellipse at 50% 120%, rgba(34, 197, 94, 0.55) 0 48%, transparent 48%),
            radial-gradient(ellipse at 90% 120%, rgba(21, 128, 61, 0.45) 0 44%, transparent 44%);
          background-repeat: no-repeat;
          animation: hillsMove 22s linear infinite;
          opacity: 0.9;
          z-index: 1;
        }

        @keyframes hillsMove {
          0% { background-position-x: 0, 0, 0; }
          100% { background-position-x: -80px, -140px, -60px; }
        }

        .ground {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 90px;
          background:
            linear-gradient(180deg, #22c55e 0%, #16a34a 60%, #15803d 100%),
            repeating-linear-gradient(
              to right,
              rgba(255, 255, 255, 0.18) 0 14px,
              transparent 14px 28px
            );
          background-blend-mode: soft-light;
          animation: groundMove 4s linear infinite;
          z-index: 2;
        }

        @keyframes groundMove {
          from { background-position: 0 0, 0 0; }
          to { background-position: 0 0, -200px 0; }
        }

        .track-line {
          position: absolute;
          left: 4%;
          right: 4%;
          bottom: 86px;
          height: 4px;
          border-radius: 999px;
          background: linear-gradient(90deg, #bbf7d0, #22c55e, #a3e635);
          box-shadow: 0 0 10px rgba(22, 163, 74, 0.9);
          z-index: 3;
        }

        /* Floating leaves */

        .leaf {
          position: absolute;
          font-size: 1.1rem;
          opacity: 0.9;
          z-index: 3;
          animation: leafFloat 10s linear infinite;
          pointer-events: none;
        }

        .leaf:nth-child(1) { left: 5%; animation-duration: 11s; }
        .leaf:nth-child(2) { left: 25%; animation-duration: 9s; animation-delay: 2s; }
        .leaf:nth-child(3) { left: 55%; animation-duration: 12s; animation-delay: 4s; }
        .leaf:nth-child(4) { left: 80%; animation-duration: 10s; animation-delay: 1s; }

        @keyframes leafFloat {
          0% { bottom: 110%; transform: translateX(0) rotate(0deg); opacity: 0; }
          20% { opacity: 1; }
          100% { bottom: 70%; transform: translateX(-40px) rotate(40deg); opacity: 0; }
        }

        /* RUNNER */

        .runner {
          position: absolute;
          width: 58px;
          height: 58px;
          left: 18%;
          bottom: 90px;
          border-radius: 50%;
          background: radial-gradient(circle at top, #bbf7d0, #22c55e);
          box-shadow:
            0 6px 14px rgba(22, 163, 74, 0.5),
            0 0 0 4px rgba(134, 239, 172, 0.7);
          border: 2px solid #ecfdf3;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 5;
          position: absolute;
          overflow: visible;
        }

        .runner::before {
          content: "🧑‍🚀";
          font-size: 2rem;
        }

        .runner-glow-ring {
          position: absolute;
          inset: -10px;
          border-radius: 50%;
          border: 2px dashed rgba(56, 189, 248, 0.7);
          animation: glowSpin 5s linear infinite;
          pointer-events: none;
        }

        @keyframes glowSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .runner.run {
          animation: runCycle 0.5s linear infinite;
        }

        .runner.jump {
          animation: jumpSquash 0.25s ease-out;
        }

        @keyframes runCycle {
          0% { transform: translateY(0) scale(1); }
          25% { transform: translateY(-2px) scale(1.02); }
          50% { transform: translateY(0) scale(1); }
          75% { transform: translateY(1px) scale(0.99); }
          100% { transform: translateY(0) scale(1); }
        }

        @keyframes jumpSquash {
          0% { transform: scale(1, 1); }
          30% { transform: scale(0.96, 1.04); }
          70% { transform: scale(1.03, 0.97); }
          100% { transform: scale(1, 1); }
        }

        .runner-shadow {
          position: absolute;
          width: 70px;
          height: 16px;
          left: calc(18% - 2px);
          bottom: 82px;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(15, 23, 42, 0.20), transparent 70%);
          opacity: 0.9;
          z-index: 4;
          pointer-events: none;
        }

        /* SPEED TRAIL */

        .speed-trail {
          position: absolute;
          width: 90px;
          height: 36px;
          left: calc(18% - 65px);
          bottom: 92px;
          background: radial-gradient(circle at right, rgba(56, 189, 248, 0.5), transparent 70%);
          opacity: 0;
          pointer-events: none;
          z-index: 4;
          transition: opacity 0.2s ease;
        }

        .speed-trail.show {
          opacity: 1;
          animation: trailPulse 0.4s linear infinite;
        }

        @keyframes trailPulse {
          0% { transform: scaleX(1); opacity: 0.9; }
          100% { transform: scaleX(1.1); opacity: 0.6; }
        }

        /* OBJECTS */

        .object {
          position: absolute;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
          border: 2px solid rgba(255,255,255,0.9);
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.4);
          background: #ffffff;
          z-index: 5;
          transform-origin: center;
        }

        .object.green {
          background: radial-gradient(circle at top, #bbf7d0, #4ade80);
          animation: bob 1.2s ease-in-out infinite;
        }

        .object.pollution {
          background: radial-gradient(circle at top, #fecaca, #fb923c);
          animation: wobble 0.8s ease-in-out infinite;
        }

        .object.shield {
          background: radial-gradient(circle at top, #dbeafe, #60a5fa);
          animation: bob 1.3s ease-in-out infinite;
        }

        .object.fact {
          background: radial-gradient(circle at top, #fef3c7, #facc15);
          animation: bob 1.1s ease-in-out infinite;
        }

        @keyframes bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(4px); }
        }

        @keyframes wobble {
          0%, 100% { transform: rotate(0deg) translateY(0); }
          25% { transform: rotate(2deg) translateY(2px); }
          50% { transform: rotate(-2deg) translateY(-1px); }
          75% { transform: rotate(1deg) translateY(2px); }
        }

        .floating-text {
          position: absolute;
          font-size: 0.88rem;
          font-weight: 700;
          color: #f9fafb;
          text-shadow: 0 0 6px rgba(15, 23, 42, 0.9);
          z-index: 6;
          animation: floatUp 0.8s ease-out forwards;
          pointer-events: none;
        }

        @keyframes floatUp {
          0% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-24px); }
        }

        /* MINI HUD */

        .mini-hud {
          position: absolute;
          top: 8px;
          left: 8px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          z-index: 6;
        }

        .mini-pill {
          padding: 3px 9px;
          border-radius: 999px;
          background: rgba(15, 23, 42, 0.85);
          border: 1px solid rgba(148, 163, 184, 0.9);
          font-size: 0.78rem;
          color: #e5e7eb;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          box-shadow: 0 10px 20px rgba(15, 23, 42, 0.8);
        }

        /* MESSAGE & CONTROLS */

        .message-box {
          margin-top: 10px;
          background: linear-gradient(90deg, #ecfdf5, #eef2ff);
          border-radius: 16px;
          padding: 10px 14px;
          border: 1px solid #bbf7d0;
          font-size: 0.9rem;
          color: #064e3b;
          box-shadow: 0 10px 22px rgba(148, 163, 184, 0.4);
          min-height: 40px;
          display: flex;
          align-items: center;
        }

        .message-highlight {
          font-weight: 700;
          color: #047857;
        }

        .bottom-controls {
          display: flex;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 8px;
        }

        .btn {
          border: none;
          border-radius: 999px;
          padding: 9px 18px;
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: transform 0.14s ease, box-shadow 0.14s ease, filter 0.14s ease;
        }

        .btn-main {
          background: linear-gradient(135deg, #22c55e, #0ea5e9);
          color: #f9fafb;
          box-shadow: 0 10px 22px rgba(56, 189, 248, 0.5);
        }

        .btn-secondary {
          background: #ffffff;
          color: #0f172a;
          border: 1px solid rgba(209, 213, 219, 0.9);
          box-shadow: 0 8px 18px rgba(148, 163, 184, 0.35);
        }

        .btn:hover {
          transform: translateY(-2px);
          filter: brightness(1.05);
        }

        .btn:active {
          transform: translateY(0);
          box-shadow: none;
        }

        .mobile-controls {
          margin-top: 8px;
          display: flex;
          justify-content: center;
          gap: 10px;
        }

        .mobile-btn {
          width: 90px;
          height: 40px;
          border-radius: 999px;
          border: none;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: #f9fafb;
          font-size: 0.95rem;
          font-weight: 700;
          box-shadow: 0 10px 22px rgba(34, 197, 94, 0.6);
          cursor: pointer;
          transition: transform 0.1s ease, box-shadow 0.1s ease;
        }

        .mobile-btn:active {
          transform: translateY(1px) scale(0.97);
          box-shadow: 0 6px 12px rgba(34, 197, 94, 0.5);
        }

        /* GAME OVER */

        .game-over-screen {
          position: absolute;
          inset: 0;
          background: rgba(15, 23, 42, 0.55);
          backdrop-filter: blur(6px);
          display: none;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }

        .game-over-screen.show { display: flex; }

        .game-over-card {
          background: radial-gradient(circle at top, #eff6ff 0, #ffffff 40%, #ecfdf5 100%);
          border-radius: 20px;
          padding: 18px 20px;
          border: 1px solid rgba(209, 213, 219, 0.9);
          max-width: 360px;
          text-align: center;
          box-shadow: 0 24px 45px rgba(15, 23, 42, 0.8);
          color: #0f172a;
          position: relative;
          overflow: hidden;
          animation: gameOverPop 0.35s ease-out;
        }

        @keyframes gameOverPop {
          0% { opacity: 0; transform: translateY(16px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        .game-over-card::before {
          content: "";
          position: absolute;
          inset: -40%;
          background:
            radial-gradient(circle at 0 0, rgba(34, 197, 94, 0.12), transparent 60%),
            radial-gradient(circle at 100% 100%, rgba(59, 130, 246, 0.12), transparent 60%);
          opacity: 0.9;
          z-index: -1;
        }

        .game-over-title {
          font-size: 1.8rem;
          margin-bottom: 10px;
          color: #047857;
        }

        .game-over-stats {
          font-size: 0.9rem;
          line-height: 1.6;
          margin-bottom: 12px;
        }

        .game-over-stats span {
          font-weight: 700;
          color: #16a34a;
        }

        .game-over-buttons {
          display: flex;
          justify-content: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .game-over-btn {
          border-radius: 999px;
          border: none;
          padding: 7px 16px;
          font-size: 0.86rem;
          font-weight: 700;
          cursor: pointer;
        }

        .game-over-btn.primary {
          background: linear-gradient(135deg, #22c55e, #0ea5e9);
          color: #f9fafb;
        }

        .game-over-btn.secondary {
          background: #ffffff;
          color: #0f172a;
          border: 1px solid rgba(148, 163, 184, 0.9);
        }

        .game-over-btn:hover {
          filter: brightness(1.05);
        }

        /* FOOTER / BADGES */

        .footer {
          max-width: 1180px;
          margin: 18px auto 0;
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          font-size: 0.78rem;
          color: #4b5563;
        }

        .footer-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .footer-pill {
          padding: 4px 9px;
          border-radius: 999px;
          background: #e5e7eb;
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }

        /* RESPONSIVE */

        @media (max-width: 900px) {
          .start-layout {
            grid-template-columns: minmax(0, 1fr);
          }
          .game-header {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
          .eco-runner-game .top-nav {
            flex-direction: column;
            align-items: flex-start;
          }
          .eco-runner-game .nav-badges {
            justify-content: flex-start;
          }
        }

        @media (max-width: 720px) {
          .game-header {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .game-area {
            height: 320px;
          }
        }

        @media (max-width: 520px) {
          .eco-runner-game .header h1 { font-size: 2.1rem; }
          .game-header { grid-template-columns: minmax(0, 1fr); }
          .game-area { height: 300px; }
          .runner { width: 52px; height: 52px; }
          .object { width: 44px; height: 44px; font-size: 1.6rem; }
          .eco-runner-game .top-nav {
            border-radius: 18px;
          }
        }
      `}</style>

      {/* TOP NAV */}
      <div className="top-nav">
        <div className="brand">
          <div className="brand-logo">🌍</div>
          <span>Eco Runner Dash</span>
        </div>
        <div className="nav-badges">
          <div className="nav-pill alt">
            <span>🎓</span> School Climate Lab
          </div>
          <div className="nav-pill">
            <span>🧪</span> Environmental Science
          </div>
          <div className="nav-pill alt">
            <span>🎮</span> Play • Learn • Win
          </div>
        </div>
      </div>

      <div className="container">
        <div className="header">
          <div className="header-cloud left" />
          <div className="header-cloud right" />
          <div className="sun-orbit" />
          <h1>Eco Runner Dash</h1>
          <p>Run, jump and manage carbon in a bright climate-friendly city.</p>
          <div className="tagline">
            🌱 3 Lives • Environmental Science • Jump Runner
          </div>
        </div>

        {/* START SCREEN */}
        <div className="start-screen" id="startScreen">
          <div className="start-icon">🏃‍♂✨</div>
          <h2>Choose Your Eco Sprint</h2>
          <p>
            Help your Eco Hero race through a clean-energy city. Jump over{" "}
            <strong>pollution orbs</strong>, collect{" "}
            <strong>green solutions</strong>, use <strong>shields</strong>, and
            unlock <strong>climate facts</strong>. You have
            <strong> 3 lives</strong> – keep the city's carbon under control!
          </p>

          <div className="start-layout">
            <div className="instructions">
              <h3>How to Play</h3>
              <ul>
                <li>
                  Press <strong>Space</strong> or <strong>↑ Arrow</strong> to
                  jump. Tap again in the air for a{" "}
                  <strong>double jump</strong>.
                </li>
                <li>
                  ✅ Grab <strong>green items</strong> (trees, solar, cycles) to
                  cut carbon and gain score.
                </li>
                <li>
                  ❌ Touching <strong>red pollution</strong> costs{" "}
                  <strong>1 life</strong> and raises carbon.
                </li>
                <li>
                  🛡 Collect <strong>Eco Shields</strong> to block the next
                  pollution hit.
                </li>
                <li>
                  📘 Catch <strong>knowledge orbs</strong> to see short climate
                  facts.
                </li>
              </ul>
              <div className="controls-note">
                📱 On mobile, tap the green <strong>Jump</strong> button to jump
                / double jump.
              </div>
            </div>

            <div className="level-box">
              <h3>
                Select Difficulty
                <span className="level-sub">Best for Grades 6 – 12</span>
              </h3>
              <div className="level-buttons">
                <button
                  className="level-btn easy"
                  id="easyBtn"
                  type="button"
                >
                  <span>
                    <span>🌱</span> Easy Eco Run
                  </span>
                  <small>
                    Gentle speed • More green boosts • Safer carbon limit
                  </small>
                </button>
                <button
                  className="level-btn medium"
                  id="mediumBtn"
                  type="button"
                >
                  <span>
                    <span>🌿</span> City Climate Dash
                  </span>
                  <small>
                    Medium speed • Balanced red &amp; green items
                  </small>
                </button>
                <button
                  className="level-btn hard"
                  id="hardBtn"
                  type="button"
                >
                  <span>
                    <span>🔥</span> Extreme Net-Zero Sprint
                  </span>
                  <small>
                    Fast track • Many obstacles • Tight carbon limit
                  </small>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* GAME SCREEN */}
        <div className="game-screen" id="gameScreen">
          <div className="game-header">
            <div className="info-box">
              <div className="info-label">Carbon Level</div>
              <div className="info-value" id="carbonDisplay">
                100
              </div>
            </div>
            <div className="info-box">
              <div className="info-label">Score</div>
              <div className="info-value" id="scoreDisplay">
                0
              </div>
            </div>
            <div className="info-box">
              <div className="info-label">Distance</div>
              <div className="info-value small" id="distanceDisplay">
                0 m
              </div>
            </div>
            <div className="info-box">
              <div className="info-label">Lives</div>
              <div className="info-value" id="livesDisplay">
                ❤❤❤
              </div>
            </div>
            <div className="info-box">
              <div className="info-label">Level</div>
              <div className="info-value">
                <span className="level-tag" id="levelTag">
                  Easy 🌱
                </span>
              </div>
            </div>
          </div>

          <div className="carbon-label-row">
            <span>
              🌍 Keep carbon low – too much means a climate crisis.
            </span>
            <span>
              Max Safe Carbon: <strong id="maxCarbonLabel">170</strong>
            </span>
          </div>
          <div className="carbon-bar-wrapper">
            <div className="carbon-bar-glow" />
            <div className="carbon-bar-fill" id="carbonBarFill" />
          </div>

          <div className="game-shell">
            <div className="game-area" id="gameArea">
              <div className="sky-gradient" />
              <div className="bg-stripes" />
              <div className="bg-hills" />
              <div className="city-layer city-back" />
              <div className="city-layer city-front" />
              <div className="ground" />
              <div className="track-line" />

              {/* Floating decorative leaves */}
              <div className="leaf">🍃</div>
              <div className="leaf">🍃</div>
              <div className="leaf">🍂</div>
              <div className="leaf">🍁</div>

              <div className="runner" id="runner">
                <div className="runner-glow-ring" />
              </div>
              <div className="runner-shadow" id="runnerShadow" />
              <div className="speed-trail" id="speedTrail" />

              <div className="mini-hud" id="miniHud">
                <div className="mini-pill" id="comboPill">
                  🔥 Combo: 0
                </div>
                <div className="mini-pill" id="shieldPill">
                  🛡 Shield: 0
                </div>
              </div>

              <div className="game-over-screen" id="gameOverScreen">
                <div className="game-over-card">
                  <div
                    className="game-over-title"
                    id="gameOverTitle"
                  >
                    Mission Complete!
                  </div>
                  <div className="game-over-stats">
                    <div>
                      Level: <span id="finalLevelText">Easy</span>
                    </div>
                    <div>
                      Final Score: <span id="finalScore">0</span>
                    </div>
                    <div>
                      Final Carbon: <span id="finalCarbon">100</span>
                    </div>
                    <div>
                      Distance Run: <span id="finalDistance">0 m</span>
                    </div>
                    <div>
                      Climate Facts Unlocked:{" "}
                      <span id="finalFacts">0</span>
                    </div>
                  </div>
                  <div className="game-over-buttons">
                    <button
                      className="game-over-btn primary"
                      id="overlayRestartBtn"
                      type="button"
                    >
                      🔁 Restart
                    </button>
                    <button
                      className="game-over-btn secondary"
                      id="overlayBackBtn"
                      type="button"
                    >
                      🏠 Level Menu
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="message-box" id="messageBox">
            🧠 Tip: Use <span className="message-highlight">double jump</span>{" "}
            to clear tall pollution and reach high green orbs.
          </div>

          <div className="bottom-controls">
            <button
              className="btn btn-main"
              id="restartLevelBtn"
              type="button"
            >
              🔄 Restart Level
            </button>
            <button
              className="btn btn-secondary"
              id="backToMenuBtn"
              type="button"
            >
              🏠 Back to Menu
            </button>
          </div>

          <div className="mobile-controls">
            <button
              className="mobile-btn"
              id="mobileJumpBtn"
              type="button"
            >
              Jump
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="footer">
        <div>
          Designed for climate education • Use in classroom, clubs or
          competitions.
        </div>
        <div className="footer-badges">
          <div className="footer-pill">
            ♻ Sustainable Cities &amp; Communities
          </div>
          <div className="footer-pill">🌡 Climate Action (SDG 13)</div>
          <div className="footer-pill">👩‍🎓 Student-Friendly Gameplay</div>
        </div>
      </div>
    </div>
  );
};

export default EcoRunnerDash;
