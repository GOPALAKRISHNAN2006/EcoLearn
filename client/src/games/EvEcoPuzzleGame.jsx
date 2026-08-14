import React, { useEffect } from "react";

const EvEcoPuzzleGame = () => {
  useEffect(() => {
    // ===== TILE DATA =====
    const TILE_DATA = [
      {
        icon: "🚗",
        name: "Electric Car",
        class: "tile-ev",
        fact:
          "EVs convert 85-90% of energy to motion, compared to 20-30% for gas cars.",
      },
      {
        icon: "☀",
        name: "Solar Panel",
        class: "tile-solar",
        fact:
          "Solar panels can last 25-30 years and power both homes and EV chargers.",
      },
      {
        icon: "💨",
        name: "Wind Power",
        class: "tile-wind",
        fact:
          "One wind turbine can produce enough electricity to charge 1,000 EVs daily.",
      },
      {
        icon: "🌿",
        name: "Clean Air",
        class: "tile-plant",
        fact: "EVs produce zero tailpipe emissions, improving city air quality.",
      },
      {
        icon: "♻",
        name: "Recycle",
        class: "tile-recycle",
        fact:
          "EV batteries can be recycled to recover valuable materials like lithium.",
      },
      {
        icon: "💧",
        name: "Clean Water",
        class: "tile-water",
        fact:
          "EVs don't need oil changes, preventing oil pollution in waterways.",
      },
      {
        icon: "🌍",
        name: "Save Earth",
        class: "tile-earth",
        fact:
          "Switching to EVs could reduce global CO2 emissions by 1.5 billion tons yearly.",
      },
      {
        icon: "🔋",
        name: "Battery",
        class: "tile-battery",
        fact:
          "Modern EV batteries can last 300,000+ miles before needing replacement.",
      },
      {
        icon: "🍃",
        name: "Green Life",
        class: "tile-leaf",
        fact: "EVs are quieter, reducing noise pollution in neighborhoods.",
      },
      {
        icon: "🚲",
        name: "E-Bike",
        class: "tile-bike",
        fact: "E-bikes use 100x less energy per mile than cars!",
      },
      {
        icon: "⚡",
        name: "Charging",
        class: "tile-charge",
        fact: "Fast chargers can add 200 miles of range in just 15 minutes.",
      },
      {
        icon: "🌐",
        name: "Smart Grid",
        class: "tile-globe",
        fact:
          "EVs can feed power back to the grid during peak demand hours.",
      },
      {
        icon: "🚌",
        name: "E-Bus",
        class: "tile-bus",
        fact: "Electric buses save cities millions in fuel costs each year.",
      },
      {
        icon: "💡",
        name: "LED Lights",
        class: "tile-bulb",
        fact:
          "LED headlights in EVs use 80% less energy than halogen bulbs.",
      },
      {
        icon: "🏠",
        name: "Smart Home",
        class: "tile-home",
        fact:
          "Home solar + EV = driving on sunshine for nearly free!",
      },
      {
        icon: "🚀",
        name: "Future",
        class: "tile-ev",
        fact:
          "By 2030, EVs are expected to make up 30% of all new car sales.",
      },
      {
        icon: "🌻",
        name: "Biofuel",
        class: "tile-solar",
        fact: "Some EVs can be charged using biofuel generators.",
      },
      {
        icon: "🏭",
        name: "Clean Factory",
        class: "tile-wind",
        fact: "Tesla's Gigafactory runs on 100% renewable energy.",
      },
      {
        icon: "🛵",
        name: "E-Scooter",
        class: "tile-charge",
        fact:
          "E-scooters produce 90% less CO2 per mile than cars.",
      },
      {
        icon: "🚂",
        name: "E-Train",
        class: "tile-bus",
        fact:
          "Electric trains are the most energy-efficient way to travel long distances.",
      },
      {
        icon: "🔌",
        name: "Plug-In",
        class: "tile-battery",
        fact: "Plug-in hybrids can drive 25-50 miles on electricity alone.",
      },
      {
        icon: "🌳",
        name: "Forest",
        class: "tile-plant",
        fact:
          "1 EV saves about 1.5 tons of CO2 per year - like planting 35 trees!",
      },
      {
        icon: "❄",
        name: "AC System",
        class: "tile-water",
        fact:
          "EV heat pumps are 3x more efficient than traditional car heaters.",
      },
      {
        icon: "🎯",
        name: "Net Zero",
        class: "tile-earth",
        fact:
          "Many countries aim for net-zero emissions by 2050 with EV adoption.",
      },
    ];

    const EV_FACTS = TILE_DATA.map((t) => t.fact);

    let gridSize = 4;
    let tiles = [];
    let emptyIndex = 0;
    let moves = 0;
    let timerInterval = null;
    let seconds = 0;
    let bestScores;

    try {
      bestScores = JSON.parse(localStorage.getItem("evPuzzleBest") || "{}");
    } catch {
      bestScores = {};
    }

    const board = document.getElementById("puzzle-board");
    const movesDisplay = document.getElementById("moves");
    const timeDisplay = document.getElementById("time");
    const bestDisplay = document.getElementById("best");
    const factText = document.getElementById("fact-text");
    const winPopup = document.getElementById("win-popup");

    // ===== CORE FUNCTIONS =====

    function updateBestDisplay() {
      const key = `${gridSize}x${gridSize}`;
      bestDisplay.textContent = bestScores[key] || "-";
    }

    function showRandomFact() {
      factText.textContent =
        EV_FACTS[Math.floor(Math.random() * EV_FACTS.length)];
    }

    function createPuzzle() {
      board.innerHTML = "";
      board.className = `puzzle-board grid-${gridSize}x${gridSize}`;

      const totalTiles = gridSize * gridSize;
      tiles = [];

      for (let i = 0; i < totalTiles - 1; i++) {
        tiles.push(i + 1);
      }
      tiles.push(0); // empty tile at end
      emptyIndex = totalTiles - 1;

      renderBoard();
    }

    function renderBoard() {
      board.innerHTML = "";
      tiles.forEach((tile, index) => {
        const div = document.createElement("div");
        div.className = "puzzle-tile";
        div.dataset.index = String(index);

        if (tile === 0) {
          div.classList.add("empty");
        } else {
          const tileInfo = TILE_DATA[(tile - 1) % TILE_DATA.length];
          div.classList.add(tileInfo.class);
          div.innerHTML = `
            <span class="tile-number">${tile}</span>
            <span class="tile-icon">${tileInfo.icon}</span>
            <span class="tile-name">${tileInfo.name}</span>
          `;
          div.addEventListener("click", () => moveTile(index));
        }

        board.appendChild(div);
      });
    }

    function canMove(index) {
      const row = Math.floor(index / gridSize);
      const col = index % gridSize;
      const emptyRow = Math.floor(emptyIndex / gridSize);
      const emptyCol = emptyIndex % gridSize;

      return Math.abs(row - emptyRow) + Math.abs(col - emptyCol) === 1;
    }

    function moveTile(index) {
      if (!canMove(index)) return;

      const movedTileNumber = tiles[index];

      // Swap
      [tiles[index], tiles[emptyIndex]] = [tiles[emptyIndex], tiles[index]];
      emptyIndex = index;

      moves++;
      movesDisplay.textContent = String(moves);

      // Show fact for moved tile
      if (movedTileNumber !== 0) {
        const info =
          TILE_DATA[(movedTileNumber - 1) % TILE_DATA.length];
        factText.textContent = info.fact;
      }

      renderBoard();

      if (checkWin()) {
        endGame();
      }
    }

    function getValidMoves() {
      const movesArr = [];
      const row = Math.floor(emptyIndex / gridSize);
      const col = emptyIndex % gridSize;

      if (row > 0) movesArr.push(emptyIndex - gridSize); // up
      if (row < gridSize - 1) movesArr.push(emptyIndex + gridSize); // down
      if (col > 0) movesArr.push(emptyIndex - 1); // left
      if (col < gridSize - 1) movesArr.push(emptyIndex + 1); // right

      return movesArr;
    }

    function shuffleTiles() {
      moves = 0;
      seconds = 0;
      movesDisplay.textContent = "0";
      timeDisplay.textContent = "0:00";

      if (timerInterval) clearInterval(timerInterval);

      const shuffleMoves = gridSize * gridSize * 20;
      for (let i = 0; i < shuffleMoves; i++) {
        const validMoves = getValidMoves();
        const randomMove =
          validMoves[Math.floor(Math.random() * validMoves.length)];
        [tiles[randomMove], tiles[emptyIndex]] = [
          tiles[emptyIndex],
          tiles[randomMove],
        ];
        emptyIndex = randomMove;
      }

      renderBoard();
      startTimer();
    }

    function checkWin() {
      for (let i = 0; i < tiles.length - 1; i++) {
        if (tiles[i] !== i + 1) return false;
      }
      return tiles[tiles.length - 1] === 0;
    }

    function startTimer() {
      timerInterval = setInterval(() => {
        seconds++;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        timeDisplay.textContent = `${mins}:${secs
          .toString()
          .padStart(2, "0")}`;
      }, 1000);
    }

    function endGame() {
      clearInterval(timerInterval);

      const key = `${gridSize}x${gridSize}`;
      if (!bestScores[key] || moves < bestScores[key]) {
        bestScores[key] = moves;
        try {
          localStorage.setItem(
            "evPuzzleBest",
            JSON.stringify(bestScores)
          );
        } catch {
          // ignore storage errors
        }
        updateBestDisplay();
      }

      document.getElementById("win-moves").textContent = String(moves);
      document.getElementById("win-time").textContent =
        timeDisplay.textContent;
      document.getElementById("win-fact").textContent =
        EV_FACTS[Math.floor(Math.random() * EV_FACTS.length)];
      winPopup.style.display = "flex";
    }

    function showHint() {
      const validMoves = getValidMoves();
      for (const moveIndex of validMoves) {
        const tile = tiles[moveIndex];
        if (tile !== moveIndex + 1 && tile !== 0) {
          const tileElement = board.children[moveIndex];
          tileElement.classList.add("hint-highlight");
          setTimeout(() => {
            tileElement.classList.remove("hint-highlight");
          }, 1500);
          break;
        }
      }
    }

    // ===== EVENT HANDLERS & INIT =====

    const shuffleBtn = document.getElementById("shuffle-btn");
    const hintBtn = document.getElementById("hint-btn");
    const playAgainBtn = document.getElementById("play-again-btn");
    const diffBtns = document.querySelectorAll(".diff-btn");

    function handleShuffleClick() {
      shuffleTiles();
      showRandomFact();
    }

    function handleHintClick() {
      showHint();
    }

    function handlePlayAgain() {
      winPopup.style.display = "none";
      shuffleTiles();
      showRandomFact();
    }

    function handleDiffClick(btn) {
      diffBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      gridSize = parseInt(btn.dataset.size || "4", 10);
      updateBestDisplay();
      createPuzzle();
      shuffleTiles();
      showRandomFact();
    }

    function handleKeydown(e) {
      const emptyRow = Math.floor(emptyIndex / gridSize);
      const emptyCol = emptyIndex % gridSize;
      let targetIndex = -1;

      switch (e.key) {
        case "ArrowUp":
          if (emptyRow < gridSize - 1)
            targetIndex = emptyIndex + gridSize;
          break;
        case "ArrowDown":
          if (emptyRow > 0) targetIndex = emptyIndex - gridSize;
          break;
        case "ArrowLeft":
          if (emptyCol < gridSize - 1) targetIndex = emptyIndex + 1;
          break;
        case "ArrowRight":
          if (emptyCol > 0) targetIndex = emptyIndex - 1;
          break;
        default:
          break;
      }

      if (targetIndex >= 0) {
        e.preventDefault();
        moveTile(targetIndex);
      }
    }

    if (shuffleBtn) shuffleBtn.addEventListener("click", handleShuffleClick);
    if (hintBtn) hintBtn.addEventListener("click", handleHintClick);
    if (playAgainBtn)
      playAgainBtn.addEventListener("click", handlePlayAgain);

    diffBtns.forEach((btn) => {
      btn.addEventListener("click", () => handleDiffClick(btn));
    });

    document.addEventListener("keydown", handleKeydown);

    // Initial setup
    updateBestDisplay();
    createPuzzle();
    shuffleTiles();
    showRandomFact();

    // Cleanup on unmount
    return () => {
      if (timerInterval) clearInterval(timerInterval);
      if (shuffleBtn)
        shuffleBtn.removeEventListener("click", handleShuffleClick);
      if (hintBtn) hintBtn.removeEventListener("click", handleHintClick);
      if (playAgainBtn)
        playAgainBtn.removeEventListener("click", handlePlayAgain);
      diffBtns.forEach((btn) => {
        btn.replaceWith(btn.cloneNode(true)); // drop listeners
      });
      document.removeEventListener("keydown", handleKeydown);
    };
  }, []);

  return (
    <div className="ev-puzzle-root">
      <style>{`
        .ev-puzzle-root {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #1a5f2a 0%, #2d8f4e 50%, #43aa6a 100%);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 70px 15px 15px 15px;
          width: 100%;
          box-sizing: border-box;
        }

        .ev-puzzle-root * {
          box-sizing: border-box;
        }

        .ev-puzzle-root .ev-eco-root {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .ev-puzzle-root h1 {
          color: #fff;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          margin-bottom: 8px;
          font-size: 1.8rem;
        }

        .ev-puzzle-root .subtitle {
          color: #c8f7d6;
          margin-bottom: 15px;
          font-size: 1rem;
        }

        .ev-puzzle-root .game-container {
          background: rgba(255,255,255,0.95);
          border-radius: 16px;
          padding: 15px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.3);
          max-width: 420px;
          width: 100%;
        }

        .ev-puzzle-root .stats-bar {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          padding: 8px 12px;
          background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
          border-radius: 8px;
        }

        .ev-puzzle-root .stat {
          text-align: center;
        }

        .ev-puzzle-root .stat-label {
          font-size: 0.7rem;
          color: #2e7d32;
          font-weight: 600;
        }

        .ev-puzzle-root .stat-value {
          font-size: 1.2rem;
          color: #1b5e20;
          font-weight: bold;
        }

        .ev-puzzle-root .puzzle-board {
          display: grid;
          gap: 4px;
          background: #37474f;
          padding: 6px;
          border-radius: 10px;
          margin-bottom: 15px;
        }

        .ev-puzzle-root .grid-3x3 {
          grid-template-columns: repeat(3, 1fr);
        }
        .ev-puzzle-root .grid-4x4 {
          grid-template-columns: repeat(4, 1fr);
        }
        .ev-puzzle-root .grid-5x5 {
          grid-template-columns: repeat(5, 1fr);
        }

        .ev-puzzle-root .puzzle-tile {
          aspect-ratio: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-size: 1.6rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
          user-select: none;
          position: relative;
        }

        .ev-puzzle-root .puzzle-tile:not(.empty):hover {
          transform: scale(1.05);
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }

        .ev-puzzle-root .puzzle-tile.empty {
          background: #263238;
          cursor: default;
        }

        .ev-puzzle-root .tile-number {
          font-size: 0.6rem;
          position: absolute;
          top: 2px;
          right: 4px;
          opacity: 0.7;
          font-weight: bold;
        }

        .ev-puzzle-root .tile-icon {
          font-size: 1.8rem;
        }

        .ev-puzzle-root .tile-name {
          font-size: 0.5rem;
          margin-top: 1px;
          font-weight: 600;
          text-align: center;
          line-height: 1.1;
        }

        .ev-puzzle-root .tile-ev { background: linear-gradient(135deg, #42a5f5, #1976d2); color: white; }
        .ev-puzzle-root .tile-solar { background: linear-gradient(135deg, #ffca28, #f9a825); color: #5d4037; }
        .ev-puzzle-root .tile-wind { background: linear-gradient(135deg, #90caf9, #64b5f6); color: #1565c0; }
        .ev-puzzle-root .tile-plant { background: linear-gradient(135deg, #66bb6a, #43a047); color: white; }
        .ev-puzzle-root .tile-recycle { background: linear-gradient(135deg, #4db6ac, #00897b); color: white; }
        .ev-puzzle-root .tile-water { background: linear-gradient(135deg, #4fc3f7, #0288d1); color: white; }
        .ev-puzzle-root .tile-earth { background: linear-gradient(135deg, #8d6e63, #5d4037); color: #c8e6c9; }
        .ev-puzzle-root .tile-battery { background: linear-gradient(135deg, #7cb342, #558b2f); color: white; }
        .ev-puzzle-root .tile-leaf { background: linear-gradient(135deg, #aed581, #7cb342); color: #33691e; }
        .ev-puzzle-root .tile-bike { background: linear-gradient(135deg, #ff8a65, #f4511e); color: white; }
        .ev-puzzle-root .tile-charge { background: linear-gradient(135deg, #ffd54f, #ffc107); color: #5d4037; }
        .ev-puzzle-root .tile-globe { background: linear-gradient(135deg, #4dd0e1, #00acc1); color: white; }
        .ev-puzzle-root .tile-bus { background: linear-gradient(135deg, #9575cd, #7e57c2); color: white; }
        .ev-puzzle-root .tile-bulb { background: linear-gradient(135deg, #fff59d, #ffee58); color: #5d4037; }
        .ev-puzzle-root .tile-home { background: linear-gradient(135deg, #a1887f, #6d4c41); color: white; }

        .ev-puzzle-root .controls {
          display: flex;
          gap: 8px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .ev-puzzle-root .btn {
          padding: 10px 20px;
          font-size: 0.9rem;
          font-weight: 600;
          border: none;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .ev-puzzle-root .btn-primary {
          background: linear-gradient(135deg, #43a047, #2e7d32);
          color: white;
        }

        .ev-puzzle-root .btn-secondary {
          background: linear-gradient(135deg, #78909c, #546e7a);
          color: white;
        }

        .ev-puzzle-root .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }

        .ev-puzzle-root .difficulty-selector {
          display: flex;
          gap: 8px;
          justify-content: center;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }

        .ev-puzzle-root .diff-btn {
          padding: 6px 14px;
          font-size: 0.8rem;
          border: 2px solid #43a047;
          background: white;
          color: #43a047;
          border-radius: 18px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .ev-puzzle-root .diff-btn.active {
          background: #43a047;
          color: white;
        }

        .ev-puzzle-root .diff-btn:hover {
          background: #e8f5e9;
        }

        .ev-puzzle-root .diff-btn.active:hover {
          background: #2e7d32;
        }

        .ev-puzzle-root .info-panel {
          margin-top: 12px;
          padding: 10px;
          background: linear-gradient(135deg, #e3f2fd, #bbdefb);
          border-radius: 10px;
          border-left: 3px solid #1976d2;
        }

        .ev-puzzle-root .info-panel h3 {
          color: #1565c0;
          margin-bottom: 5px;
          font-size: 0.9rem;
        }

        .ev-puzzle-root .info-panel p {
          color: #37474f;
          font-size: 0.8rem;
          line-height: 1.4;
        }

        .ev-puzzle-root .eco-fact {
          margin-top: 10px;
          padding: 10px;
          background: linear-gradient(135deg, #fff3e0, #ffe0b2);
          border-radius: 8px;
          border-left: 3px solid #ff9800;
        }

        .ev-puzzle-root .eco-fact h4 {
          color: #e65100;
          font-size: 0.8rem;
          margin-bottom: 4px;
        }

        .ev-puzzle-root .eco-fact p {
          color: #5d4037;
          font-size: 0.75rem;
        }

        .ev-puzzle-root .win-message {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.7);
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .ev-puzzle-root .win-content {
          background: white;
          padding: 30px;
          border-radius: 16px;
          text-align: center;
          max-width: 350px;
          animation: popIn 0.3s ease;
        }

        @keyframes popIn {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }

        .ev-puzzle-root .win-content h2 {
          color: #2e7d32;
          font-size: 1.6rem;
          margin-bottom: 8px;
        }

        .ev-puzzle-root .win-content .trophy {
          font-size: 3rem;
          margin-bottom: 10px;
        }

        .ev-puzzle-root .win-content p {
          color: #455a64;
          margin-bottom: 15px;
          font-size: 0.9rem;
        }

        .ev-puzzle-root .win-stats {
          display: flex;
          justify-content: center;
          gap: 25px;
          margin-bottom: 15px;
        }

        .ev-puzzle-root .win-stat {
          text-align: center;
        }

        .ev-puzzle-root .win-stat-value {
          font-size: 1.5rem;
          color: #43a047;
          font-weight: bold;
        }

        .ev-puzzle-root .win-stat-label {
          font-size: 0.7rem;
          color: #78909c;
        }

        .ev-puzzle-root .hint-highlight {
          animation: pulse 0.5s ease 3;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); box-shadow: 0 0 20px rgba(76,175,80,0.6); }
        }

        @media (max-width: 550px) {
          .ev-puzzle-root .game-container {
            padding: 12px;
          }
          .ev-puzzle-root {
            padding: 65px 10px 10px 10px;
          }
        }
      `}</style>

      <div className="ev-eco-root">
        <h1>🔋 EV Eco Puzzle</h1>
        <p className="subtitle">
          Slide tiles to arrange them in order & learn about EVs!
        </p>

        <div className="game-container">
          <div className="stats-bar">
            <div className="stat">
              <div className="stat-label">MOVES</div>
              <div className="stat-value" id="moves">
                0
              </div>
            </div>
            <div className="stat">
              <div className="stat-label">TIME</div>
              <div className="stat-value" id="time">
                0:00
              </div>
            </div>
            <div className="stat">
              <div className="stat-label">BEST</div>
              <div className="stat-value" id="best">
                -
              </div>
            </div>
          </div>

          <div className="difficulty-selector">
            <button className="diff-btn" data-size="3">
              Easy (3×3)
            </button>
            <button className="diff-btn active" data-size="4">
              Medium (4×4)
            </button>
            <button className="diff-btn" data-size="5">
              Hard (5×5)
            </button>
          </div>

          <div className="puzzle-board grid-4x4" id="puzzle-board">
            {/* tiles via JS */}
          </div>

          <div className="controls">
            <button className="btn btn-primary" id="shuffle-btn">
              🔀 Shuffle
            </button>
            <button className="btn btn-secondary" id="hint-btn">
              💡 Hint
            </button>
          </div>

          <div className="info-panel">
            <h3>🎮 How to Play</h3>
            <p>
              Click on a tile next to the empty space to slide it. Arrange all
              tiles in order (1 to N) to complete the puzzle and reveal the
              eco-friendly picture!
            </p>
          </div>

          <div className="eco-fact" id="eco-fact">
            <h4>🌱 EV Fact</h4>
            <p id="fact-text">
              Electric vehicles produce zero direct emissions, making them much
              cleaner for our air quality in cities!
            </p>
          </div>
        </div>

        <div className="win-message" id="win-popup">
          <div className="win-content">
            <div className="trophy">🏆</div>
            <h2>Puzzle Complete!</h2>
            <p>Great job! You've arranged all the eco-friendly tiles!</p>
            <div className="win-stats">
              <div className="win-stat">
                <div className="win-stat-value" id="win-moves">
                  0
                </div>
                <div className="win-stat-label">Moves</div>
              </div>
              <div className="win-stat">
                <div className="win-stat-value" id="win-time">
                  0:00
                </div>
                <div className="win-stat-label">Time</div>
              </div>
            </div>
            <p
              id="win-fact"
              style={{ fontStyle: "italic", color: "#2e7d32" }}
            ></p>
            <button className="btn btn-primary" id="play-again-btn">
              🔄 Play Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvEcoPuzzleGame;
