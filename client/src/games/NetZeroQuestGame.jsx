import React, { useEffect } from "react";

const NetZeroQuestGame = () => {
  useEffect(() => {
    // ===== LEVEL CONFIG =====
    const LEVELS = {
      easy: {
        name: "Easy",
        icon: "🌱",
        pairsCount: 4,
        startingCarbon: 80,
        maxSafeCarbon: 170,
      },
      medium: {
        name: "Medium",
        icon: "🌿",
        pairsCount: 6,
        startingCarbon: 100,
        maxSafeCarbon: 160,
      },
      hard: {
        name: "Hard",
        icon: "🔥",
        pairsCount: 8,
        startingCarbon: 120,
        maxSafeCarbon: 150,
      },
    };

    // ===== PUZZLE DATA =====
    const PAIRS = [
      {
        id: 1,
        pollution: { emoji: "🏭", label: "Coal Factory", type: "Pollution" },
        solution: { emoji: "☀", label: "Solar Power Plant", type: "Solution" },
        carbonCut: 20,
      },
      {
        id: 2,
        pollution: { emoji: "🚗", label: "Fuel Cars", type: "Pollution" },
        solution: {
          emoji: "🚉",
          label: "Metro / EV Transit",
          type: "Solution",
        },
        carbonCut: 18,
      },
      {
        id: 3,
        pollution: { emoji: "🔥", label: "Open Burning", type: "Pollution" },
        solution: { emoji: "🌳", label: "Urban Forest", type: "Solution" },
        carbonCut: 15,
      },
      {
        id: 4,
        pollution: {
          emoji: "💡",
          label: "Wasted Energy",
          type: "Pollution",
        },
        solution: {
          emoji: "🏠",
          label: "Energy-Efficient Home",
          type: "Solution",
        },
        carbonCut: 12,
      },
      {
        id: 5,
        pollution: { emoji: "🗑", label: "Mixed Waste", type: "Pollution" },
        solution: {
          emoji: "♻",
          label: "Recycling System",
          type: "Solution",
        },
        carbonCut: 10,
      },
      {
        id: 6,
        pollution: { emoji: "🚛", label: "Diesel Trucks", type: "Pollution" },
        solution: {
          emoji: "🚚",
          label: "Electric Logistics",
          type: "Solution",
        },
        carbonCut: 14,
      },
      {
        id: 7,
        pollution: {
          emoji: "🏢",
          label: "Inefficient Buildings",
          type: "Pollution",
        },
        solution: {
          emoji: "🏢",
          label: "Green Buildings",
          type: "Solution",
        },
        carbonCut: 13,
      },
      {
        id: 8,
        pollution: {
          emoji: "💨",
          label: "Industrial Emissions",
          type: "Pollution",
        },
        solution: {
          emoji: "💨",
          label: "Clean Tech Filters",
          type: "Solution",
        },
        carbonCut: 16,
      },
    ];

    // ===== DOM ELEMENTS =====
    const startScreen = document.getElementById("startScreen");
    const gameScreen = document.getElementById("gameScreen");
    const cardGrid = document.getElementById("cardGrid");
    const carbonDisplay = document.getElementById("carbonDisplay");
    const movesDisplay = document.getElementById("movesDisplay");
    const pairsDisplay = document.getElementById("pairsDisplay");
    const levelTag = document.getElementById("levelTag");
    const maxCarbonLabel = document.getElementById("maxCarbonLabel");
    const safeCarbonText = document.getElementById("safeCarbonText");
    const messageBox = document.getElementById("messageBox");
    const gameOverScreen = document.getElementById("gameOverScreen");
    const gameOverTitle = document.getElementById("gameOverTitle");
    const finalCarbon = document.getElementById("finalCarbon");
    const finalMoves = document.getElementById("finalMoves");
    const finalPairs = document.getElementById("finalPairs");
    const finalLevelText = document.getElementById("finalLevelText");

    const easyBtn = document.getElementById("easyBtn");
    const mediumBtn = document.getElementById("mediumBtn");
    const hardBtn = document.getElementById("hardBtn");
    const restartLevelBtn = document.getElementById("restartLevelBtn");
    const backToMenuBtn = document.getElementById("backToMenuBtn");
    const overlayRestartBtn = document.getElementById("overlayRestartBtn");

    if (!startScreen || !gameScreen || !cardGrid) {
      return;
    }

    // ===== GAME STATE =====
    let cards = [];
    let firstCardIndex = null;
    let secondCardIndex = null;
    let lockBoard = false;
    let carbonLevel = 100;
    let moves = 0;
    let pairsSolved = 0;
    let totalPairs = 8;
    let maxSafeCarbon = 150;
    let gameActive = false;
    let currentLevelKey = "easy";

    // ===== HELPERS =====
    function shuffle(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }

    function createCards(pairCount) {
      const temp = [];
      const chosenPairs = PAIRS.slice(0, pairCount); // use first N pairs for level

      chosenPairs.forEach((pair) => {
        temp.push({
          pairId: pair.id,
          role: "pollution",
          emoji: pair.pollution.emoji,
          label: pair.pollution.label,
          type: pair.pollution.type,
          carbonCut: pair.carbonCut,
          matched: false,
        });
        temp.push({
          pairId: pair.id,
          role: "solution",
          emoji: pair.solution.emoji,
          label: pair.solution.label,
          type: pair.solution.type,
          carbonCut: pair.carbonCut,
          matched: false,
        });
      });
      return shuffle(temp);
    }

    function renderBoard() {
      cardGrid.innerHTML = "";
      cards.forEach((card, index) => {
        const cardDiv = document.createElement("div");
        cardDiv.className = "card";
        cardDiv.dataset.index = String(index);

        const inner = document.createElement("div");
        inner.className = "card-inner";

        const front = document.createElement("div");
        front.className = "card-face card-front";
        front.textContent = "❔";

        const back = document.createElement("div");
        back.className = "card-face card-back";

        const emoji = document.createElement("div");
        emoji.className = "card-emoji";
        emoji.textContent = card.emoji;

        const label = document.createElement("div");
        label.className = "card-label";
        label.textContent = card.label;

        const type = document.createElement("div");
        type.className = "card-type";
        type.textContent = card.type;

        back.appendChild(emoji);
        back.appendChild(label);
        back.appendChild(type);

        inner.appendChild(front);
        inner.appendChild(back);
        cardDiv.appendChild(inner);

        cardDiv.addEventListener("click", () => handleCardClick(index));

        cardGrid.appendChild(cardDiv);
      });
    }

    function updateHUD() {
      if (carbonDisplay) carbonDisplay.textContent = String(carbonLevel);
      if (movesDisplay) movesDisplay.textContent = String(moves);
      if (pairsDisplay)
        pairsDisplay.textContent = `${pairsSolved} / ${totalPairs}`;

      if (!carbonDisplay) return;

      // color feedback
      if (carbonLevel <= 0) {
        carbonDisplay.style.color = "#16a34a";
        carbonDisplay.style.transform = "scale(1.08)";
      } else if (carbonLevel > maxSafeCarbon - 10) {
        carbonDisplay.style.color = "#dc2626";
        carbonDisplay.style.transform = "scale(1.03)";
      } else {
        carbonDisplay.style.color = "#166534";
        carbonDisplay.style.transform = "scale(1)";
      }
    }

    function setMessage(text) {
      if (messageBox) {
        messageBox.textContent = text;
      }
    }

    function applyLevelUI() {
      const level = LEVELS[currentLevelKey];
      if (levelTag) {
        levelTag.textContent = `${level.name} ${level.icon}`;
      }
      if (maxCarbonLabel) {
        maxCarbonLabel.textContent = String(level.maxSafeCarbon);
      }
      if (safeCarbonText) {
        safeCarbonText.textContent = String(level.maxSafeCarbon);
      }
    }

    // ===== CORE GAME LOGIC =====
    function startGame(levelKey) {
      if (levelKey) {
        currentLevelKey = levelKey;
      }
      const level = LEVELS[currentLevelKey];

      gameActive = true;
      carbonLevel = level.startingCarbon;
      moves = 0;
      pairsSolved = 0;
      totalPairs = level.pairsCount;
      maxSafeCarbon = level.maxSafeCarbon;
      firstCardIndex = null;
      secondCardIndex = null;
      lockBoard = false;

      cards = createCards(totalPairs);
      applyLevelUI();
      renderBoard();
      updateHUD();

      setMessage(
        "🧠 Flip a pollution card and then find the climate solution that fixes it."
      );

      if (startScreen) startScreen.style.display = "none";
      if (gameScreen) gameScreen.classList.add("active");
      if (gameOverScreen) gameOverScreen.classList.remove("show");

      window.scrollTo({
        top: gameScreen.offsetTop - 20,
        behavior: "smooth",
      });
    }

    function handleCardClick(index) {
      if (!gameActive || lockBoard) return;
      if (cards[index].matched) return;
      if (index === firstCardIndex) return;

      const cardElements = cardGrid.getElementsByClassName("card");
      const cardEl = cardElements[index];

      cardEl.classList.add("flipped");

      if (firstCardIndex === null) {
        firstCardIndex = index;
        setMessage("🔍 Now flip the card you think is the correct solution.");
        return;
      }

      secondCardIndex = index;
      moves++;
      updateHUD();
      lockBoard = true;

      checkMatch();
    }

    function checkMatch() {
      const c1 = cards[firstCardIndex];
      const c2 = cards[secondCardIndex];

      const cardElements = cardGrid.getElementsByClassName("card");
      const el1 = cardElements[firstCardIndex];
      const el2 = cardElements[secondCardIndex];

      const isMatch =
        c1.pairId === c2.pairId &&
        ((c1.role === "pollution" && c2.role === "solution") ||
          (c1.role === "solution" && c2.role === "pollution"));

      if (isMatch) {
        // Correct match
        c1.matched = true;
        c2.matched = true;
        el1.classList.add("matched");
        el2.classList.add("matched");

        pairsSolved++;
        carbonLevel = Math.max(0, carbonLevel - c1.carbonCut);
        updateHUD();

        const pollutionLabel = c1.role === "pollution" ? c1.label : c2.label;
        const solutionLabel = c1.role === "solution" ? c1.label : c2.label;

        setMessage(
          `✅ Great choice! "${solutionLabel}" helps fix "${pollutionLabel}". Carbon reduced by ${c1.carbonCut}.`
        );

        resetSelection();

        if (pairsSolved === totalPairs || carbonLevel <= 0) {
          endGame(true);
        } else if (carbonLevel >= maxSafeCarbon) {
          endGame(false);
        }
      } else {
        // Wrong match
        carbonLevel = Math.min(maxSafeCarbon + 20, carbonLevel + 5);
        updateHUD();
        setMessage(
          "⚠ Not the best match. Think again: which green action really reduces that pollution?"
        );

        setTimeout(() => {
          el1.classList.remove("flipped");
          el2.classList.remove("flipped");
          resetSelection();

          if (carbonLevel >= maxSafeCarbon) {
            endGame(false);
          }
        }, 850);
      }
    }

    function resetSelection() {
      firstCardIndex = null;
      secondCardIndex = null;
      lockBoard = false;
    }

    function endGame(won) {
      gameActive = false;
      if (!gameOverScreen) return;

      gameOverScreen.classList.add("show");

      const level = LEVELS[currentLevelKey];
      if (finalLevelText) {
        finalLevelText.textContent = `${level.name} ${level.icon}`;
      }
      if (finalCarbon) finalCarbon.textContent = String(carbonLevel);
      if (finalMoves) finalMoves.textContent = String(moves);
      if (finalPairs)
        finalPairs.textContent = `${pairsSolved} / ${totalPairs}`;

      if (won && carbonLevel <= 0) {
        gameOverTitle.textContent = "✅ Carbon Neutral Hero!";
      } else if (won) {
        gameOverTitle.textContent = "🏆 Puzzle Master!";
      } else {
        gameOverTitle.textContent = "❌ Carbon Crisis!";
      }
    }

    function restartGame() {
      startGame(currentLevelKey);
    }

    function backToMenu() {
      if (gameScreen) gameScreen.classList.remove("active");
      if (startScreen) startScreen.style.display = "block";
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // ===== EVENT LISTENERS =====
    const easyHandler = () => startGame("easy");
    const mediumHandler = () => startGame("medium");
    const hardHandler = () => startGame("hard");
    const restartLevelHandler = () => restartGame();
    const backToMenuHandler = () => backToMenu();
    const overlayRestartHandler = () => restartGame();

    if (easyBtn) easyBtn.addEventListener("click", easyHandler);
    if (mediumBtn) mediumBtn.addEventListener("click", mediumHandler);
    if (hardBtn) hardBtn.addEventListener("click", hardHandler);
    if (restartLevelBtn)
      restartLevelBtn.addEventListener("click", restartLevelHandler);
    if (backToMenuBtn)
      backToMenuBtn.addEventListener("click", backToMenuHandler);
    if (overlayRestartBtn)
      overlayRestartBtn.addEventListener("click", overlayRestartHandler);

    // cleanup on unmount
    return () => {
      if (easyBtn) easyBtn.removeEventListener("click", easyHandler);
      if (mediumBtn) mediumBtn.removeEventListener("click", mediumHandler);
      if (hardBtn) hardBtn.removeEventListener("click", hardHandler);
      if (restartLevelBtn)
        restartLevelBtn.removeEventListener("click", restartLevelHandler);
      if (backToMenuBtn)
        backToMenuBtn.removeEventListener("click", backToMenuHandler);
      if (overlayRestartBtn)
        overlayRestartBtn.removeEventListener("click", overlayRestartHandler);
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
          font-family: 'Segoe UI', Arial, sans-serif;
          scroll-behavior: smooth;
        }

        body {
          background: linear-gradient(180deg, #e0f7ff 0%, #f1fff1 40%, #ffffff 100%);
          min-height: 100vh;
          padding: 24px 12px 40px;
        }

        .container {
          max-width: 1100px;
          margin: 0 auto;
        }

        .header {
          text-align: center;
          margin-bottom: 24px;
          position: relative;
          overflow: visible;
          animation: fadeDown 0.7s ease-out;
        }

        @keyframes fadeDown {
          from {
            opacity: 0;
            transform: translateY(-25px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .header h1 {
          font-size: 2.8rem;
          color: #15803d;
          text-shadow: 0 0 12px rgba(34, 197, 94, 0.4);
          letter-spacing: 1px;
          animation: softGlow 2.5s infinite;
        }

        @keyframes softGlow {
          0%, 100% {
            text-shadow: 0 0 12px rgba(34, 197, 94, 0.3);
            transform: translateY(0);
          }
          50% {
            text-shadow: 0 0 22px rgba(22, 163, 74, 0.7);
            transform: translateY(-2px);
          }
        }

        .header p {
          margin-top: 6px;
          font-size: 1.05rem;
          color: #0369a1;
          font-weight: 600;
        }

        .header-badge {
          margin-top: 10px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(56, 189, 248, 0.1);
          border-radius: 999px;
          padding: 6px 14px;
          font-size: 0.85rem;
          color: #0f766e;
          border: 1px solid rgba(56, 189, 248, 0.5);
        }

        .cloud {
          position: absolute;
          top: -20px;
          width: 80px;
          height: 40px;
          background: #ffffff;
          border-radius: 999px;
          box-shadow: 25px 5px 0 #ffffff, 10px -10px 0 #ffffff;
          opacity: 0.6;
          animation: floatCloud 12s linear infinite;
          z-index: -1;
        }

        .cloud.left {
          left: -40px;
        }

        .cloud.right {
          right: -40px;
          animation-delay: 3s;
        }

        @keyframes floatCloud {
          0% {
            transform: translateX(0);
            opacity: 0.7;
          }
          50% {
            transform: translateX(20px);
            opacity: 1;
          }
          100% {
            transform: translateX(0);
            opacity: 0.7;
          }
        }

        .start-screen {
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.12), rgba(59, 130, 246, 0.12));
          border: 2px solid rgba(34, 197, 94, 0.7);
          border-radius: 20px;
          padding: 28px 20px 24px;
          text-align: center;
          box-shadow: 0 15px 40px rgba(22, 163, 74, 0.25);
          animation: popIn 0.7s ease-out;
        }

        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.9) translateY(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }

        .carbon-meter {
          font-size: 3.4rem;
          margin-bottom: 10px;
          animation: gentleBounce 2s infinite;
        }

        @keyframes gentleBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        .start-screen h2 {
          font-size: 2.1rem;
          color: #166534;
          margin-bottom: 10px;
        }

        .start-screen p {
          font-size: 1rem;
          color: #0369a1;
          margin-bottom: 18px;
          line-height: 1.6;
          max-width: 700px;
          margin-left: auto;
          margin-right: auto;
        }

        .instructions {
          text-align: left;
          max-width: 700px;
          margin: 0 auto 18px;
          background: rgba(240, 253, 250, 0.9);
          padding: 14px 16px;
          border-radius: 16px;
          border-left: 5px solid #10b981;
        }

        .instructions li {
          list-style: none;
          margin: 8px 0;
          font-size: 0.95rem;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .instructions li:before {
          content: "▶";
          font-size: 1rem;
          color: #22c55e;
        }

        .level-title {
          margin-top: 6px;
          font-size: 0.95rem;
          font-weight: 600;
          color: #0f766e;
        }

        .level-buttons {
          margin-top: 10px;
          display: flex;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .level-btn {
          border: none;
          border-radius: 999px;
          padding: 10px 22px;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 10px 24px rgba(22, 163, 74, 0.3);
          transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease;
        }

        .level-btn span {
          font-size: 1.1rem;
        }

        .level-btn.easy {
          background: linear-gradient(135deg, #bbf7d0, #4ade80);
          color: #064e3b;
        }

        .level-btn.medium {
          background: linear-gradient(135deg, #bfdbfe, #60a5fa);
          color: #0f172a;
        }

        .level-btn.hard {
          background: linear-gradient(135deg, #fecaca, #f97316);
          color: #7c2d12;
        }

        .level-btn:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 14px 28px rgba(22, 163, 74, 0.35);
          filter: brightness(1.05);
        }

        .level-btn:active {
          transform: translateY(0) scale(0.99);
          box-shadow: 0 7px 16px rgba(22, 163, 74, 0.2);
        }

        .game-screen {
          display: none;
          margin-top: 26px;
          animation: fadeIn 0.6s ease-out;
        }

        .game-screen.active {
          display: block;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .game-header {
          display: grid;
          grid-template-columns: 1.3fr 1fr 1fr 1.4fr;
          gap: 14px;
          margin-bottom: 18px;
        }

        .info-box {
          background: #ecfdf5;
          border-radius: 14px;
          padding: 10px 12px;
          text-align: center;
          border: 1px solid rgba(22, 163, 74, 0.3);
          box-shadow: 0 8px 18px rgba(22, 163, 74, 0.15);
        }

        .info-label {
          color: #0f766e;
          font-size: 0.8rem;
          text-transform: uppercase;
          font-weight: 700;
          margin-bottom: 4px;
          letter-spacing: 0.03em;
        }

        .info-value {
          color: #166534;
          font-size: 1.7rem;
          font-weight: 800;
        }

        #carbonDisplay {
          transition: color 0.2s ease, transform 0.2s ease;
        }

        .level-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 0.8rem;
          background: rgba(59, 130, 246, 0.1);
          color: #1e40af;
          border: 1px solid rgba(59, 130, 246, 0.6);
        }

        .game-area {
          position: relative;
          width: 100%;
          background: linear-gradient(180deg, #dcfce7 0%, #f5f3ff 60%, #ffffff 100%);
          border: 2px solid rgba(22, 163, 74, 0.5);
          border-radius: 20px;
          box-shadow: 0 16px 40px rgba(22, 163, 74, 0.3);
          margin-bottom: 22px;
          padding: 16px 18px 20px;
        }

        .status-bar {
          margin-bottom: 8px;
          background: rgba(56, 189, 248, 0.15);
          border-radius: 10px;
          padding: 8px 12px;
          color: #0369a1;
          font-weight: 600;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.9rem;
        }

        .progress-bar {
          background: rgba(22, 163, 74, 0.12);
          border-radius: 10px;
          padding: 8px 14px;
          color: #14532d;
          font-weight: 600;
          text-align: center;
          margin-bottom: 10px;
          font-size: 0.9rem;
        }

        /* ==== UPDATED GRID & CARD SIZING ==== */
        .grid {
          max-width: 620px;               /* limit board width */
          margin: 4px auto 0;             /* center it */
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;                       /* smaller gap */
        }

        .card {
          position: relative;
          width: 100%;
          padding-top: 65%;               /* smaller card height (was 100%/80%) */
          perspective: 1000px;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        .card:hover {
          transform: translateY(-2px) scale(1.01);
          box-shadow: 0 8px 16px rgba(37, 99, 235, 0.25);
        }

        .card-inner {
          position: absolute;
          inset: 0;
          transition: transform 0.5s;
          transform-style: preserve-3d;
        }

        .card.flipped .card-inner {
          transform: rotateY(180deg);
        }

        .card-face {
          position: absolute;
          inset: 0;
          border-radius: 14px;
          backface-visibility: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 8px;
          text-align: center;
        }

        .card-front {
          background: radial-gradient(circle at top, #22c55e, #16a34a);
          border: 2px solid #16a34a;
          color: #ecfdf5;
          font-size: 1.4rem;              /* smaller ? icon */
          box-shadow: inset 0 0 16px rgba(22, 101, 52, 0.7);
        }

        .card-back {
          background: linear-gradient(145deg, #ffffff, #e0f2fe);
          border: 2px solid #60a5fa;
          transform: rotateY(180deg);
          color: #0f172a;
        }

        .card-emoji {
          font-size: 1.5rem;              /* smaller emoji */
          margin-bottom: 4px;
        }

        .card-label {
          font-size: 0.65rem;             /* smaller label */
          font-weight: 700;
        }

        .card-type {
          font-size: 0.7rem;
          margin-top: 3px;
          padding: 2px 6px;
          border-radius: 999px;
          background: rgba(59, 130, 246, 0.12);
          color: #1d4ed8;
        }

        .card.matched {
          opacity: 0.6;
          filter: grayscale(0.1);
          cursor: default;
          transform: scale(0.98);
          box-shadow: none;
        }

        .message-box {
          margin-top: 8px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 10px;
          padding: 10px 12px;
          color: #0f172a;
          font-size: 0.95rem;
          border: 1px solid rgba(148, 163, 184, 0.7);
        }

        .message-highlight {
          font-weight: 700;
          color: #0f766e;
        }

        .bottom-controls {
          text-align: center;
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
          margin-top: 6px;
        }

        .controls-btn {
          background: linear-gradient(135deg, #22c55e 0%, #22c55e 40%, #0ea5e9 100%);
          color: #f8fafc;
          padding: 10px 26px;
          font-size: 0.95rem;
          font-weight: 700;
          border: none;
          border-radius: 999px;
          cursor: pointer;
          box-shadow: 0 10px 24px rgba(56, 189, 248, 0.45);
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .controls-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 30px rgba(56, 189, 248, 0.55);
          filter: brightness(1.05);
        }

        .controls-btn:active {
          transform: translateY(0);
          box-shadow: 0 8px 16px rgba(56, 189, 248, 0.4);
        }

        .game-over-screen {
          position: absolute;
          inset: 0;
          background: rgba(15, 23, 42, 0.82);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 10;
          display: none;
          border-radius: 18px;
        }

        .game-over-screen.show {
          display: flex;
          animation: fadeIn 0.4s ease-out;
        }

        .game-over-content {
          text-align: center;
          max-width: 360px;
        }

        .game-over-title {
          font-size: 2.2rem;
          color: #a5f3fc;
          margin-bottom: 16px;
          text-shadow: 0 0 20px rgba(56, 189, 248, 0.9);
        }

        .game-over-stats {
          background: rgba(15, 23, 42, 0.95);
          border: 1px solid rgba(56, 189, 248, 0.7);
          border-radius: 14px;
          padding: 16px 14px;
          margin-bottom: 16px;
          color: #e0f2fe;
          font-size: 0.95rem;
          line-height: 1.6;
        }

        .game-over-stats span {
          font-weight: 700;
          color: #22c55e;
        }

        .restart-btn {
          background: linear-gradient(135deg, #22c55e 0%, #0ea5e9 100%);
          color: #f9fafb;
          padding: 10px 28px;
          font-size: 1rem;
          font-weight: 700;
          border: none;
          border-radius: 999px;
          cursor: pointer;
          box-shadow: 0 12px 28px rgba(34, 197, 94, 0.6);
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .restart-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 30px rgba(34, 197, 94, 0.7);
        }

        @media (max-width: 900px) {
          .game-header {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 600px) {
          .header h1 {
            font-size: 2rem;
          }

          .start-screen {
            padding: 20px 14px;
          }

          .game-header {
            grid-template-columns: 1fr 1fr;
          }

          .grid {
            max-width: 500px;
          }

          .info-value {
            font-size: 1.4rem;
          }
        }

        @media (max-width: 420px) {
          .game-header {
            grid-template-columns: 1fr;
          }

          .grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            max-width: 360px;
          }
        }
      `}</style>

      <div className="container">
        <div className="header">
          <div className="cloud left"></div>
          <div className="cloud right"></div>
          <h1>Net-Zero Quest 🧩</h1>
          <p>Match pollution with climate solutions & become a Net-Zero Hero!</p>
          <div className="header-badge">
            🌱 School Edition • Climate Puzzle Game
          </div>
        </div>

        {/* START SCREEN */}
        <div className="start-screen" id="startScreen">
          <div className="carbon-meter">🌎</div>
          <h2>Choose Your Challenge</h2>
          <p>
            Flip cards, find the right green solution for each pollution source, and watch the carbon level drop!
            Perfect for school students to learn climate actions while playing.
          </p>
          <div className="instructions">
            <li>
              🃏 Flip <strong>two cards</strong> at a time.
            </li>
            <li>
              ✅ Match a <span className="message-highlight">pollution source</span> with its correct{" "}
              <span className="message-highlight">green solution</span>.
            </li>
            <li>
              💨 Correct match = <strong>Carbon goes down</strong>. Wrong match ={" "}
              <strong>Carbon goes up a little</strong>.
            </li>
            <li>
              🏆 Win by solving all pairs or bringing Carbon down to <strong>0</strong>.
            </li>
          </div>
          <div className="level-title">Select level to begin:</div>
          <div className="level-buttons">
            <button className="level-btn easy" id="easyBtn">
              <span>🌱</span> Easy
            </button>
            <button className="level-btn medium" id="mediumBtn">
              <span>🌿</span> Medium
            </button>
            <button className="level-btn hard" id="hardBtn">
              <span>🔥</span> Hard
            </button>
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
              <div className="info-label">Moves</div>
              <div className="info-value" id="movesDisplay">
                0
              </div>
            </div>
            <div className="info-box">
              <div className="info-label">Pairs Solved</div>
              <div className="info-value" id="pairsDisplay">
                0 / 0
              </div>
            </div>
            <div className="info-box">
              <div className="info-label">Level</div>
              <div className="info-value">
                <span className="level-pill" id="levelTag">
                  Easy 🌱
                </span>
              </div>
            </div>
          </div>

          <div className="game-area">
            <div className="status-bar">
              <span>
                🎯 Goal: Match each pollution source with the best green solution.
              </span>
              <span>
                Max Safe Carbon: <strong id="maxCarbonLabel">150</strong>
              </span>
            </div>
            <div className="progress-bar">
              Keep <strong>Carbon below <span id="safeCarbonText">150</span></strong>. Reach{" "}
              <strong>0</strong> or solve all pairs to win!
            </div>

            <div className="grid" id="cardGrid"></div>

            <div className="message-box" id="messageBox">
              🧠 Flip a pollution card and then find the solution that fixes it!
            </div>

            <div className="game-over-screen" id="gameOverScreen">
              <div className="game-over-content">
                <div className="game-over-title" id="gameOverTitle">
                  Mission Complete!
                </div>
                <div className="game-over-stats">
                  <div>
                    Level Played: <span id="finalLevelText">Easy</span>
                  </div>
                  <div>
                    Final Carbon Level: <span id="finalCarbon">0</span>
                  </div>
                  <div>
                    Total Moves: <span id="finalMoves">0</span>
                  </div>
                  <div>
                    Pairs Solved: <span id="finalPairs">0</span>
                  </div>
                </div>
                <button className="restart-btn" id="overlayRestartBtn">
                  🔁 Play Again on Same Level
                </button>
              </div>
            </div>
          </div>

          <div className="bottom-controls">
            <button className="controls-btn" id="restartLevelBtn">
              🔄 Restart Level
            </button>
            <button className="controls-btn" id="backToMenuBtn">
              🏠 Level Menu
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default NetZeroQuestGame;
