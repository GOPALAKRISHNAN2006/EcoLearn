import React, { useEffect } from "react";

const NatureNinjasGame = () => {
  useEffect(() => {
    const canvas = document.getElementById("gameCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Game variables
    let ninja = {
      x: 225,
      y: 330,
      width: 30,
      height: 40,
      speed: 5,
    };

    let collectibles = [];
    let obstacles = [];
    let score = 0;
    let health = 3;
    let level = 1;
    let gameRunning = false;
    let gameOverFlag = false;
    let soundOn = true;
    let keys = {};
    let animationId = null;

    const scoreEl = document.getElementById("score");
    const levelEl = document.getElementById("level");
    const healthEl = document.getElementById("health");
    const gameOverEl = document.getElementById("gameOver");
    const startBtn = document.getElementById("startBtn");
    const soundBtn = document.getElementById("soundBtn");
    const finalScoreEl = document.getElementById("finalScore");
    const finalLevelEl = document.getElementById("finalLevel");

    // Update UI
    function updateUI() {
      if (scoreEl) scoreEl.textContent = score;
      if (levelEl) levelEl.textContent = level;
      if (healthEl) healthEl.textContent = health;
    }

    // Play sound
    function playSound(frequency, duration) {
      if (!soundOn) return;
      try {
        const audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = "sine";

        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + duration
        );

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
      } catch (e) {}
    }

    // Create collectibles
    function createCollectibles() {
      collectibles = [];
      const count = 5 + level * 2;
      const types = ["leaf", "water", "solar"];

      for (let i = 0; i < count; i++) {
        collectibles.push({
          x: Math.random() * (canvas.width - 40) + 20,
          y: Math.random() * (canvas.height - 200) + 20,
          type: types[Math.floor(Math.random() * 3)],
          radius: 8,
          collected: false,
        });
      }
    }

    // Create obstacles
    function createObstacles() {
      obstacles = [];
      const count = 2 + level;
      const types = ["smoke", "trash", "fire"];

      for (let i = 0; i < count; i++) {
        obstacles.push({
          x: Math.random() * (canvas.width - 50) + 25,
          y: Math.random() * (canvas.height - 200) + 20,
          vx: (Math.random() - 0.5) * (2 + level * 0.3),
          vy: (Math.random() - 0.5) * (2 + level * 0.3),
          type: types[Math.floor(Math.random() * 3)],
          size: 15,
          radius: 15,
        });
      }
    }

    // Start game
    function startGame() {
      ninja = { x: 225, y: 330, width: 30, height: 40, speed: 5 };
      collectibles = [];
      obstacles = [];
      score = 0;
      health = 3;
      level = 1;
      gameRunning = true;
      gameOverFlag = false;

      if (gameOverEl) gameOverEl.classList.remove("show");
      if (startBtn) startBtn.textContent = "🔄 Restart";

      createCollectibles();
      createObstacles();
      updateUI();
      gameLoop();
    }

    // Draw ninja
    function drawNinja() {
      ctx.fillStyle = "#ff6b35";
      ctx.shadowColor = "#ff6b35";
      ctx.shadowBlur = 10;
      ctx.fillRect(ninja.x, ninja.y, ninja.width, ninja.height);

      // Eyes
      ctx.fillStyle = "#000";
      ctx.fillRect(ninja.x + 8, ninja.y + 10, 4, 4);
      ctx.fillRect(ninja.x + 18, ninja.y + 10, 4, 4);

      ctx.shadowBlur = 0;
    }

    // Draw collectibles
    function drawCollectibles() {
      collectibles.forEach((item) => {
        if (item.collected) return;

        ctx.beginPath();
        ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);

        if (item.type === "leaf") {
          ctx.fillStyle = "#00d084";
        } else if (item.type === "water") {
          ctx.fillStyle = "#00bfff";
        } else if (item.type === "solar") {
          ctx.fillStyle = "#ffd700";
        }
        ctx.fill();
      });
    }

    // Draw obstacles
    function drawObstacles() {
      obstacles.forEach((obs) => {
        if (obs.type === "smoke") {
          ctx.fillStyle = "rgba(150, 150, 150, 0.7)";
          ctx.beginPath();
          ctx.arc(obs.x, obs.y, obs.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (obs.type === "trash") {
          ctx.fillStyle = "#8b4513";
          ctx.fillRect(
            obs.x - obs.size / 2,
            obs.y - obs.size / 2,
            obs.size,
            obs.size
          );
        } else if (obs.type === "fire") {
          ctx.fillStyle = "#ff4500";
          ctx.beginPath();
          ctx.arc(obs.x, obs.y, obs.size, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = "#ff6347";
          ctx.beginPath();
          ctx.arc(obs.x, obs.y - 5, obs.size * 0.6, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }

    // End game
    function endGame() {
      gameRunning = false;
      gameOverFlag = true;
      if (finalScoreEl) finalScoreEl.textContent = score;
      if (finalLevelEl) finalLevelEl.textContent = level;
      if (gameOverEl) gameOverEl.classList.add("show");
    }

    // Main game loop
    function gameLoop() {
      if (!gameRunning || gameOverFlag) return;

      // Move ninja
      if (keys["ArrowLeft"] || keys["a"] || keys["A"]) {
        ninja.x = Math.max(0, ninja.x - ninja.speed);
      }
      if (keys["ArrowRight"] || keys["d"] || keys["D"]) {
        ninja.x = Math.min(canvas.width - ninja.width, ninja.x + ninja.speed);
      }
      if (keys["ArrowUp"] || keys["w"] || keys["W"]) {
        ninja.y = Math.max(0, ninja.y - ninja.speed);
      }
      if (keys["ArrowDown"] || keys["s"] || keys["S"]) {
        ninja.y = Math.min(
          canvas.height - ninja.height,
          ninja.y + ninja.speed
        );
      }

      // Move obstacles
      obstacles.forEach((obs) => {
        obs.x += obs.vx;
        obs.y += obs.vy;

        if (obs.x - obs.size < 0 || obs.x + obs.size > canvas.width) {
          obs.vx *= -1;
        }
        if (obs.y - obs.size < 0 || obs.y + obs.size > canvas.height) {
          obs.vy *= -1;
        }
      });

      // Check collectible collisions
      collectibles.forEach((item) => {
        if (!item.collected) {
          const dx = ninja.x + ninja.width / 2 - item.x;
          const dy = ninja.y + ninja.height / 2 - item.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < ninja.width / 2 + item.radius) {
            item.collected = true;
            score += 10;
            playSound(800, 0.1);
          }
        }
      });

      // Check obstacle collisions
      for (const obs of obstacles) {
        const dx = ninja.x + ninja.width / 2 - obs.x;
        const dy = ninja.y + ninja.height / 2 - obs.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < ninja.width / 2 + obs.radius) {
          health--;
          playSound(300, 0.15);
          obs.x = Math.random() * (canvas.width - 50) + 25;
          obs.y = Math.random() * (canvas.height - 200) + 20;

          if (health <= 0) {
            endGame();
            updateUI();
            return;
          }
        }
      }

      // Level up
      if (collectibles.every((item) => item.collected)) {
        level++;
        score += 50;
        playSound(1000, 0.3);
        createCollectibles();
        createObstacles();
      }

      // Draw background
      ctx.fillStyle = "#1a4d2e";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid
      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 1;
      for (let i = 0; i <= canvas.width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let i = 0; i <= canvas.height; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      drawNinja();
      drawCollectibles();
      drawObstacles();

      updateUI();
      animationId = requestAnimationFrame(gameLoop);
    }

    // Event listeners
    const keyDownHandler = (e) => {
      keys[e.key] = true;
    };

    const keyUpHandler = (e) => {
      keys[e.key] = false;
    };

    document.addEventListener("keydown", keyDownHandler);
    document.addEventListener("keyup", keyUpHandler);

    if (startBtn) startBtn.addEventListener("click", startGame);

    if (soundBtn) {
      soundBtn.addEventListener("click", () => {
        soundOn = !soundOn;
        soundBtn.textContent = soundOn ? "🔊 Sound On" : "🔇 Sound Off";
      });
    }

    // initial UI
    updateUI();

    return () => {
      document.removeEventListener("keydown", keyDownHandler);
      document.removeEventListener("keyup", keyUpHandler);
      if (startBtn) startBtn.removeEventListener("click", startGame);
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <>
      <style>{`
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        html, body {
            width: 100%;
            height: 100%;
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #0f3822 0%, #1a4d2e 50%, #0d2818 100%);
        }

        body {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 10px;
        }

        .game-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: linear-gradient(to bottom right, #1a4d2e, #0d2818);
            padding: 30px;
            border-radius: 20px;
            box-shadow: 0 0 50px rgba(0, 0, 0, 0.8);
            max-width: 600px;
            width: 100%;
        }

        h1 {
            font-size: 3rem;
            color: #4ade80;
            text-shadow: 0 0 20px rgba(74, 222, 128, 0.8);
            margin-bottom: 10px;
            animation: glow 2s infinite;
        }

        @keyframes glow {
            0%, 100% { text-shadow: 0 0 20px rgba(74, 222, 128, 0.6); }
            50% { text-shadow: 0 0 40px rgba(74, 222, 128, 1); }
        }

        .subtitle {
            color: #86efac;
            font-size: 1.2rem;
            margin-bottom: 25px;
            font-weight: bold;
        }

        .stats {
            display: flex;
            gap: 20px;
            margin-bottom: 25px;
            justify-content: center;
            flex-wrap: wrap;
            width: 100%;
        }

        .stat {
            background: rgba(34, 197, 94, 0.2);
            border: 2px solid #4ade80;
            padding: 15px 25px;
            border-radius: 10px;
            text-align: center;
            min-width: 100px;
        }

        .stat-label {
            color: #a7f3d0;
            font-size: 0.9rem;
            text-transform: uppercase;
            font-weight: bold;
        }

        .stat-value {
            color: #4ade80;
            font-size: 2rem;
            font-weight: bold;
            margin-top: 5px;
        }

        canvas {
            border: 4px solid #4ade80;
            background: #0a1f0f;
            border-radius: 10px;
            display: block;
            margin: 0 auto 25px;
            box-shadow: 0 0 30px rgba(74, 222, 128, 0.3);
            max-width: 100%;
            height: auto;
        }

        .controls {
            display: flex;
            gap: 15px;
            justify-content: center;
            margin-bottom: 25px;
            flex-wrap: wrap;
            width: 100%;
        }

        button {
            padding: 12px 25px;
            font-size: 1rem;
            font-weight: bold;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .btn-start {
            background: linear-gradient(135deg, #22c55e, #16a34a);
            color: white;
            box-shadow: 0 5px 15px rgba(34, 197, 94, 0.4);
        }

        .btn-start:hover {
            background: linear-gradient(135deg, #16a34a, #15803d);
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(34, 197, 94, 0.6);
        }

        .btn-start:active {
            transform: translateY(0);
        }

        .btn-sound {
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            color: white;
            box-shadow: 0 5px 15px rgba(59, 130, 246, 0.4);
        }

        .btn-sound:hover {
            background: linear-gradient(135deg, #1d4ed8, #1e40af);
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(59, 130, 246, 0.6);
        }

        .game-over {
            background: rgba(239, 68, 68, 0.2);
            border: 2px solid #ef4444;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            color: #fca5a5;
            display: none;
            width: 100%;
            margin-top: 20px;
        }

        .game-over.show {
            display: block;
            animation: popIn 0.5s;
        }

        @keyframes popIn {
            0% { opacity: 0; transform: scale(0.8); }
            100% { opacity: 1; transform: scale(1); }
        }

        .game-over h2 {
            font-size: 2rem;
            margin-bottom: 10px;
        }

        .game-over p {
            font-size: 1.1rem;
            margin: 5px 0;
        }

        .instructions {
            background: rgba(34, 197, 94, 0.15);
            border: 2px solid #4ade80;
            padding: 20px;
            border-radius: 10px;
            margin-top: 20px;
            width: 100%;
            color: #d1fae5;
            font-size: 0.95rem;
            line-height: 1.6;
        }

        .instructions h3 {
            color: #4ade80;
            margin-bottom: 10px;
            font-size: 1.2rem;
        }

        .instructions p {
            margin: 8px 0;
        }

        .instructions strong {
            color: #4ade80;
        }

        @media (max-width: 600px) {
            h1 {
                font-size: 2rem;
            }
            .game-container {
                padding: 15px;
            }
            canvas {
                max-width: 100%;
            }
        }
      `}</style>

      <div className="game-container">
        <h1>🥷 Nature Ninjas</h1>
        <p className="subtitle">Mission Sustainability</p>

        <div className="stats">
          <div className="stat">
            <div className="stat-label">Score</div>
            <div className="stat-value" id="score">
              0
            </div>
          </div>
          <div className="stat">
            <div className="stat-label">Level</div>
            <div className="stat-value" id="level">
              1
            </div>
          </div>
          <div className="stat">
            <div className="stat-label">Health</div>
            <div className="stat-value" id="health">
              3
            </div>
          </div>
        </div>

        <canvas id="gameCanvas" width="500" height="400"></canvas>

        <div className="controls">
          <button className="btn-start" id="startBtn">
            ▶ Start Game
          </button>
          <button className="btn-sound" id="soundBtn">
            🔊 Sound On
          </button>
        </div>

        <div className="game-over" id="gameOver">
          <h2>Game Over!</h2>
          <p>
            Final Score: <span id="finalScore">0</span>
          </p>
          <p>
            Level Reached: <span id="finalLevel">1</span>
          </p>
        </div>

        <div className="instructions">
          <h3>📖 How to Play</h3>
          <p>
            <strong>Controls:</strong> Arrow Keys or WASD to move
          </p>
          <p>
            <strong>🟢 Green:</strong> Leaves (collect for points)
          </p>
          <p>
            <strong>🔵 Blue:</strong> Water (collect for points)
          </p>
          <p>
            <strong>🟡 Yellow:</strong> Solar Panels (collect for points)
          </p>
          <p>
            <strong>⚠ Avoid:</strong> Gray smoke, brown trash, red fire (lose health)
          </p>
          <p>
            <strong>🎯 Goal:</strong> Collect all eco-items to level up!
          </p>
        </div>
      </div>
    </>
  );
};

export default NatureNinjasGame;