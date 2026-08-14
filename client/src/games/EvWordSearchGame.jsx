import React, { useEffect } from "react";
import { completeGame } from "../services/gameRewardsService";

const EvWordSearchGame = () => {
  useEffect(() => {
    // ===== LAND POLLUTION WORD DATA =====
    const WORD_DATA = {
      easy: [
        { word: "SOIL", icon: "🌍", hint: "Earth's surface layer", fact: "Healthy soil takes 500-1000 years to form just 1 inch! Once polluted, it can take decades to recover.", category: "impact" },
        { word: "WASTE", icon: "🗑", hint: "Discarded materials", fact: "The world generates 2 billion tons of waste annually. About 33% is not managed properly!", category: "impact" },
        { word: "TOXIC", icon: "☠", hint: "Poisonous substance", fact: "Toxic chemicals can stay in soil for over 100 years, affecting multiple generations of plants and animals.", category: "impact" },
        { word: "DUMP", icon: "🏭", hint: "Waste disposal site", fact: "Open dumps release methane gas which is 25 times more harmful than CO2 for global warming.", category: "impact" },
        { word: "CROP", icon: "🌾", hint: "Farm produce", fact: "Polluted soil can reduce crop yields by up to 50% and make food unsafe to eat.", category: "impact" },
        { word: "CLEAN", icon: "✨", hint: "Free from dirt", fact: "Regular soil testing and cleanup programs can restore land health within 5-10 years.", category: "control" },
        { word: "TREE", icon: "🌳", hint: "Tall plant", fact: "Trees act as natural filters! One tree can absorb pollutants and clean the surrounding soil.", category: "control" },
        { word: "REUSE", icon: "♻", hint: "Use again", fact: "Reusing items reduces landfill waste by 30% and prevents soil contamination.", category: "control" },
      ],
      medium: [
        { word: "LANDFILL", icon: "🗑", hint: "Waste burial site", fact: "Modern landfills use liners to prevent toxic leachate from contaminating groundwater and soil.", category: "impact" },
        { word: "PLASTIC", icon: "🧴", hint: "Synthetic material", fact: "Plastic takes 400-1000 years to decompose and releases harmful chemicals into the soil as it breaks down.", category: "impact" },
        { word: "EROSION", icon: "💨", hint: "Soil wearing away", fact: "Deforestation causes 75% of soil erosion. We lose 24 billion tons of fertile soil every year!", category: "impact" },
        { word: "COMPOST", icon: "🍂", hint: "Organic fertilizer", fact: "Composting reduces landfill waste by 30% and creates nutrient-rich soil without chemicals.", category: "control" },
        { word: "RECYCLE", icon: "♻", hint: "Convert waste", fact: "Recycling one ton of paper saves 17 trees and prevents harmful inks from polluting soil.", category: "control" },
        { word: "ORGANIC", icon: "🌱", hint: "Natural farming", fact: "Organic farming improves soil health by 25% and eliminates harmful pesticide contamination.", category: "control" },
        { word: "SEWAGE", icon: "🚿", hint: "Waste water", fact: "Untreated sewage contains pathogens that can contaminate soil for years, affecting crops and water.", category: "impact" },
        { word: "MINING", icon: "⛏", hint: "Earth extraction", fact: "Mining waste covers 1% of Earth's land and can make soil toxic for centuries.", category: "impact" },
        { word: "FILTER", icon: "🔬", hint: "Remove impurities", fact: "Phytoremediation uses plants to filter and remove up to 80% of soil contaminants naturally!", category: "control" },
        { word: "MULCH", icon: "🍃", hint: "Ground cover", fact: "Mulching prevents erosion, retains moisture, and adds nutrients back to the soil.", category: "control" },
      ],
      hard: [
        { word: "PESTICIDE", icon: "🧪", hint: "Insect killer", fact: "Pesticides can persist in soil for 10+ years. Over 95% of pesticides reach non-target destinations including soil and water.", category: "impact" },
        { word: "LEACHATE", icon: "💧", hint: "Liquid waste", fact: "Leachate from landfills contains 200+ toxic compounds that can contaminate soil and groundwater for miles.", category: "impact" },
        { word: "DEGRADATION", icon: "📉", hint: "Quality decline", fact: "Land degradation affects 3.2 billion people globally and costs $10 trillion annually in lost ecosystem services.", category: "impact" },
        { word: "BIOREMEDIATE", icon: "🦠", hint: "Bio cleanup", fact: "Bioremediation uses bacteria to break down pollutants - it's cleaned up over 100,000 contaminated sites worldwide!", category: "control" },
        { word: "SUSTAINABLE", icon: "🌍", hint: "Long-term viable", fact: "Sustainable land management can restore 12 million hectares of degraded land annually by 2030.", category: "control" },
        { word: "CONTAMINATE", icon: "☢", hint: "Make impure", fact: "Industrial contamination affects 10 million hectares globally. Cleanup costs can exceed $1 million per acre.", category: "impact" },
        { word: "FERTILIZER", icon: "🧪", hint: "Plant food", fact: "Excess chemical fertilizers pollute 40% of rivers and lakes through soil runoff.", category: "impact" },
        { word: "RESTORATION", icon: "🔄", hint: "Bring back health", fact: "Soil restoration projects can sequester 1.5 billion tons of carbon annually, fighting climate change!", category: "control" },
        { word: "ECOSYSTEM", icon: "🌿", hint: "Living system", fact: "Healthy soil ecosystems contain 25% of Earth's biodiversity - more species than rainforests!", category: "control" },
        { word: "GROUNDWATER", icon: "💧", hint: "Underground water", fact: "Soil pollution threatens groundwater for 2 billion people who depend on it for drinking water.", category: "impact" },
      ],
    };

    const GRID_SIZE = 12;
    let grid = [];
    let words = [];
    let foundWords = [];
    let selecting = false;
    let selectedCells = [];
    let startCell = null;
    let difficulty = "medium";
    let coins = 0;
    let seconds = 0;
    let timerInterval = null;
    let knowledgeCards = [];

    const gridEl = document.getElementById("word-grid");
    const wordListEl = document.getElementById("word-list");
    const foundCountEl = document.getElementById("found-count");
    const totalCountEl = document.getElementById("total-count");
    const timerEl = document.getElementById("timer");
    const coinsEl = document.getElementById("coins");
    const knowledgeCardsEl = document.getElementById("knowledge-cards");
    const impactCountEl = document.getElementById("impact-count");
    const controlCountEl = document.getElementById("control-count");

    const newGameBtn = document.getElementById("new-game-btn");
    const hintBtn = document.getElementById("hint-btn");

    if (!gridEl || !wordListEl) return;

    // ===== CORE GAME FUNCTIONS =====

    function init() {
      words = [...WORD_DATA[difficulty]];
      foundWords = [];
      knowledgeCards = [];
      coins = 0;
      seconds = 0;
      coinsEl.textContent = "0";
      timerEl.textContent = "0:00";
      foundCountEl.textContent = "0";
      totalCountEl.textContent = String(words.length);
      if (impactCountEl) impactCountEl.textContent = "0";
      if (controlCountEl) controlCountEl.textContent = "0";

      if (timerInterval) clearInterval(timerInterval);

      generateGrid();
      renderWordList();
      renderKnowledgeCards();
      startTimer();
    }

    function generateGrid() {
      // Empty grid
      grid = [];
      for (let i = 0; i < GRID_SIZE; i++) {
        grid[i] = [];
        for (let j = 0; j < GRID_SIZE; j++) {
          grid[i][j] = { letter: "", wordIndex: -1 };
        }
      }

      const directions = [
        { dr: 0, dc: 1 }, // horizontal right
        { dr: 1, dc: 0 }, // vertical down
        { dr: 1, dc: 1 }, // diagonal down-right
        { dr: 0, dc: -1 }, // horizontal left
        { dr: 1, dc: -1 }, // diagonal down-left
      ];

      const shuffledWords = [...words].sort(() => Math.random() - 0.5);

      shuffledWords.forEach((wordObj, wordIndex) => {
        let placed = false;
        let attempts = 0;
        const word = wordObj.word;

        while (!placed && attempts < 100) {
          const dir = directions[Math.floor(Math.random() * directions.length)];
          const startRow = Math.floor(Math.random() * GRID_SIZE);
          const startCol = Math.floor(Math.random() * GRID_SIZE);

          if (canPlaceWord(word, startRow, startCol, dir)) {
            placeWord(word, startRow, startCol, dir, wordIndex);
            placed = true;
          }
          attempts++;
        }
      });

      const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
          if (grid[i][j].letter === "") {
            grid[i][j].letter =
              letters[Math.floor(Math.random() * letters.length)];
          }
        }
      }

      renderGrid();
    }

    function canPlaceWord(word, row, col, dir) {
      for (let i = 0; i < word.length; i++) {
        const r = row + i * dir.dr;
        const c = col + i * dir.dc;

        if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) return false;
        if (grid[r][c].letter !== "" && grid[r][c].letter !== word[i])
          return false;
      }
      return true;
    }

    function placeWord(word, row, col, dir, wordIndex) {
      for (let i = 0; i < word.length; i++) {
        const r = row + i * dir.dr;
        const c = col + i * dir.dc;
        grid[r][c].letter = word[i];
        grid[r][c].wordIndex = wordIndex;
      }
    }

    function renderGrid() {
      gridEl.innerHTML = "";

      for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
          const cell = document.createElement("div");
          cell.className = "grid-cell";
          cell.textContent = grid[i][j].letter;
          cell.dataset.row = String(i);
          cell.dataset.col = String(j);

          cell.addEventListener("mousedown", handleMouseDown);
          cell.addEventListener("mouseenter", handleMouseEnter);
          cell.addEventListener("mouseup", handleMouseUp);

          gridEl.appendChild(cell);
        }
      }

      document.addEventListener("mouseup", handleMouseUp);
    }

    function renderWordList() {
      wordListEl.innerHTML = "";

      words.forEach((wordObj, index) => {
        const item = document.createElement("div");
        item.className = "word-item";
        // FIX: proper string template for id
        item.id = `word-${index}`;
        item.innerHTML = `
          <span class="icon">${wordObj.icon}</span>
          <span class="word">${wordObj.word}</span>
          <span class="hint">${wordObj.hint}</span>
        `;
        wordListEl.appendChild(item);
      });
    }

    function renderKnowledgeCards() {
      if (!knowledgeCardsEl) return;
      knowledgeCardsEl.innerHTML = "";
      
      words.forEach((wordObj, index) => {
        const card = document.createElement("div");
        // FIX: proper className string
        card.className = `knowledge-card ${wordObj.category}`;
        // FIX: proper id string
        card.id = `card-${index}`;
        card.innerHTML = `
          <div class="card-inner">
            <div class="card-front">
              <span class="card-icon">${wordObj.icon}</span>
              <span class="card-word">?</span>
              <span class="card-category-badge ${wordObj.category}">${wordObj.category === 'impact' ? '⚠ Impact' : '✅ Control'}</span>
            </div>
            <div class="card-back">
              <div class="card-header">
                <span class="card-icon-small">${wordObj.icon}</span>
                <span class="card-title">${wordObj.word}</span>
              </div>
              <p class="card-fact">${wordObj.fact}</p>
              <span class="card-category-badge ${wordObj.category}">${wordObj.category === 'impact' ? '⚠ Pollution Impact' : '✅ Control Measure'}</span>
            </div>
          </div>
        `;
        knowledgeCardsEl.appendChild(card);
      });
    }

    function flipCard(index) {
      // FIX: proper id string
      const card = document.getElementById(`card-${index}`);
      if (card && !card.classList.contains("flipped")) {
        card.classList.add("flipped");
        
        // Update category counts
        const wordObj = words[index];
        if (wordObj.category === "impact") {
          const currentCount = parseInt(impactCountEl.textContent) || 0;
          impactCountEl.textContent = String(currentCount + 1);
        } else {
          const currentCount = parseInt(controlCountEl.textContent) || 0;
          controlCountEl.textContent = String(currentCount + 1);
        }
      }
    }

    // ===== SELECTION / MOUSE LOGIC =====

    function handleMouseDown(e) {
      selecting = true;
      startCell = {
        row: parseInt(e.target.dataset.row, 10),
        col: parseInt(e.target.dataset.col, 10),
      };
      selectedCells = [startCell];
      updateSelection();
    }

    function handleMouseEnter(e) {
      if (!selecting) return;

      const row = parseInt(e.target.dataset.row, 10);
      const col = parseInt(e.target.dataset.col, 10);

      selectedCells = getCellsInLine(startCell.row, startCell.col, row, col);
      updateSelection();
    }

    function handleMouseUp() {
      if (!selecting) return;
      selecting = false;

      checkSelection();
      clearSelection();
    }

    function getCellsInLine(r1, c1, r2, c2) {
      const cells = [];
      const dr = Math.sign(r2 - r1);
      const dc = Math.sign(c2 - c1);

      const rowDiff = Math.abs(r2 - r1);
      const colDiff = Math.abs(c2 - c1);

      if (rowDiff !== colDiff && rowDiff !== 0 && colDiff !== 0) {
        return [{ row: r1, col: c1 }];
      }

      const steps = Math.max(rowDiff, colDiff);

      for (let i = 0; i <= steps; i++) {
        cells.push({
          row: r1 + i * dr,
          col: c1 + i * dc,
        });
      }

      return cells;
    }

    function updateSelection() {
      document.querySelectorAll(".grid-cell").forEach((cell) => {
        cell.classList.remove("selecting");
      });

      selectedCells.forEach(({ row, col }) => {
        const index = row * GRID_SIZE + col;
        gridEl.children[index].classList.add("selecting");
      });
    }

    function clearSelection() {
      document.querySelectorAll(".grid-cell").forEach((cell) => {
        cell.classList.remove("selecting");
      });
      selectedCells = [];
    }

    function checkSelection() {
      const selectedWord = selectedCells
        .map(({ row, col }) => grid[row][col].letter)
        .join("");
      const reversedWord = selectedWord.split("").reverse().join("");

      let foundIndex = -1;

      words.forEach((wordObj, index) => {
        if (!foundWords.includes(index)) {
          if (
            wordObj.word === selectedWord ||
            wordObj.word === reversedWord
          ) {
            foundIndex = index;
          }
        }
      });

      if (foundIndex !== -1) {
        foundWords.push(foundIndex);

        selectedCells.forEach(({ row, col }) => {
          const index = row * GRID_SIZE + col;
          gridEl.children[index].classList.add("found");
        });

        // FIX: proper getElementById usage
        const wordItem = document.getElementById(`word-${foundIndex}`);
        if (wordItem) wordItem.classList.add("found");

        // Flip the knowledge card to reveal the fact
        flipCard(foundIndex);

        // Award 3 coins per word, max 30 coins total
        coins = Math.min(30, coins + 3);
        coinsEl.textContent = String(coins);
        foundCountEl.textContent = String(foundWords.length);

        if (foundWords.length === words.length) {
          setTimeout(showCompletion, 500);
        }
      } else if (selectedCells.length > 1) {
        selectedCells.forEach(({ row, col }) => {
          const index = row * GRID_SIZE + col;
          const cell = gridEl.children[index];
          cell.classList.add("wrong");
          setTimeout(() => cell.classList.remove("wrong"), 300);
        });
      }
    }

    // ===== TIMER & COMPLETION =====

    function startTimer() {
      timerInterval = setInterval(() => {
        seconds++;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        // FIX: proper template literal for time string
        timerEl.textContent = `${mins}:${secs.toString().padStart(2, "0")}`;
      }, 1000);
    }

    function showCompletion() {
      clearInterval(timerInterval);
      
      // Add celebration effect to all cards
      const allCards = document.querySelectorAll(".knowledge-card");
      allCards.forEach((card, i) => {
        setTimeout(() => {
          card.classList.add("celebration");
        }, i * 100);
      });

      // Show completion banner
      const completionBanner = document.getElementById("completion-banner");
      if (completionBanner) {
        document.getElementById("final-coins").textContent = String(coins);
        document.getElementById("final-time").textContent = timerEl.textContent;
        const impactLearned = parseInt(impactCountEl.textContent) || 0;
        const controlLearned = parseInt(controlCountEl.textContent) || 0;
        document.getElementById("facts-learned").textContent = String(impactLearned + controlLearned);
        completionBanner.classList.add("show");
        
        // Save coins to database
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const studentId = user.id || user._id;
        console.log('User data:', user);
        console.log('Student ID:', studentId);
        console.log('Coins to save:', coins);
        
        if (studentId && coins > 0) {
          console.log('Calling completeGame with:', {
            studentId: studentId,
            gameId: 'word-search',
            gameName: 'Land Pollution Word Search',
            pointsEarned: 10,
            coinsEarned: coins
          });
          
          completeGame({
            studentId: studentId,
            gameId: 'word-search',
            gameName: 'Land Pollution Word Search',
            pointsEarned: 10,
            coinsEarned: coins
          })
            .then((response) => {
              console.log('Complete game response:', response);
              console.log(`Saved ${coins} coins to student account`);
              if (response.success && response.data) {
                const updatedUser = { ...user, coins: response.data.coins };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                console.log('Updated user coins in localStorage:', response.data.coins);
              }
            })
            .catch(err => {
              console.error('Error saving coins:', err);
              console.error('Full error details:', err.response || err);
            });
        } else {
          console.log('Not saving coins - studentId:', studentId, 'coins:', coins);
        }
      }
    }

    function showHint() {
      const unfoundIndex = words.findIndex(
        (_, i) => !foundWords.includes(i)
      );
      if (unfoundIndex === -1) return;

      const word = words[unfoundIndex].word;

      for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
          if (grid[i][j].letter === word[0]) {
            const index = i * GRID_SIZE + j;
            const cell = gridEl.children[index];
            cell.style.background = "#ffeb3b";
            cell.style.transform = "scale(1.2)";
            setTimeout(() => {
              if (!cell.classList.contains("found")) {
                cell.style.background = "#fff";
                cell.style.transform = "scale(1)";
              }
            }, 1500);

            coins = Math.max(0, coins - 1);
            coinsEl.textContent = String(coins);
            return;
          }
        }
      }
    }

    // ===== EVENT LISTENERS =====

    const newGameHandler = () => {
      const completionBanner = document.getElementById("completion-banner");
      if (completionBanner) completionBanner.classList.remove("show");
      init();
    };
    const hintHandler = () => showHint();

    if (newGameBtn) newGameBtn.addEventListener("click", newGameHandler);
    if (hintBtn) hintBtn.addEventListener("click", hintHandler);

    const diffBtns = document.querySelectorAll(".diff-btn");
    diffBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        diffBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        difficulty = btn.dataset.diff || "medium";
        const completionBanner = document.getElementById("completion-banner");
        if (completionBanner) completionBanner.classList.remove("show");
        init();
      });
    });

    gridEl.addEventListener("selectstart", (e) => e.preventDefault());

    // Start once
    init();

    // Cleanup on unmount
    return () => {
      if (timerInterval) clearInterval(timerInterval);
      document.removeEventListener("mouseup", handleMouseUp);
      if (newGameBtn)
        newGameBtn.removeEventListener("click", newGameHandler);
      if (hintBtn) hintBtn.removeEventListener("click", hintHandler);
      diffBtns.forEach((btn) => {
        btn.replaceWith(btn.cloneNode(true)); // quick way to drop listeners
      });
    };
  }, []);

  return (
    <>
      <style>{`
        .ev-root * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .ev-root {
          width: 100%;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 70px 20px 20px;
          background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 50%, #ffcc80 100%);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .ev-root h1 {
          color: #e65100;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
          margin-bottom: 3px;
          font-size: 1.6rem;
        }

        .subtitle {
          color: #bf360c;
          margin-bottom: 12px;
          font-size: 0.85rem;
          text-align: center;
        }

        .main-container {
          background: rgba(255,255,255,0.97);
          border-radius: 20px;
          padding: 20px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.15);
          max-width: 720px;
          width: 100%;
        }

        .top-stats {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          gap: 10px;
          flex-wrap: wrap;
        }

        .stats-bar {
          display: flex;
          gap: 15px;
          padding: 8px 15px;
          background: linear-gradient(135deg, #fff3e0, #ffe0b2);
          border-radius: 10px;
        }

        .stat {
          text-align: center;
        }

        .stat-label {
          font-size: 0.65rem;
          color: #e65100;
          font-weight: 600;
          text-transform: uppercase;
        }

        .stat-value {
          font-size: 1rem;
          color: #bf360c;
          font-weight: bold;
        }

        .learning-stats {
          display: flex;
          gap: 12px;
          padding: 8px 12px;
          background: linear-gradient(135deg, #fce4ec, #f8bbd0);
          border-radius: 10px;
        }

        .learning-stat {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .learning-stat.impact {
          color: #c62828;
        }

        .learning-stat.control {
          color: #2e7d32;
        }

        .difficulty-selector {
          display: flex;
          gap: 6px;
          justify-content: center;
          margin-bottom: 12px;
        }

        .diff-btn {
          padding: 5px 12px;
          font-size: 0.7rem;
          border: 2px solid #e65100;
          background: white;
          color: #e65100;
          border-radius: 15px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .diff-btn.active {
          background: #e65100;
          color: white;
        }

        .diff-btn:hover {
          background: #fff3e0;
        }

        .diff-btn.active:hover {
          background: #bf360c;
        }

        .game-layout {
          display: flex;
          gap: 15px;
          justify-content: center;
          align-items: flex-start;
        }

        .grid-container {
          background: #5d4037;
          padding: 6px;
          border-radius: 10px;
          display: flex;
          justify-content: center;
        }

        .word-grid {
          display: grid;
          grid-template-columns: repeat(12, 30px);
          grid-template-rows: repeat(12, 30px);
          gap: 2px;
        }

        .grid-cell {
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
          font-weight: bold;
          background: #fff;
          border-radius: 3px;
          cursor: pointer;
          user-select: none;
          transition: all 0.15s ease;
          color: #5d4037;
        }

        .grid-cell:hover {
          background: #ffe0b2;
          transform: scale(1.08);
        }

        .grid-cell.selecting {
          background: #ffcc80;
          color: #e65100;
        }

        .grid-cell.found {
          background: linear-gradient(135deg, #8bc34a, #689f38);
          color: white;
          animation: foundPulse 0.4s ease;
        }

        @keyframes foundPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }

        .grid-cell.wrong {
          background: #ef5350;
          color: white;
          animation: shake 0.3s ease;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }

        .word-list-panel {
          background: linear-gradient(135deg, #fafafa, #f5f5f5);
          border-radius: 10px;
          padding: 10px;
          width: 140px;
          max-height: 390px;
          overflow-y: auto;
          border: 1px solid #e0e0e0;
        }

        .word-list-title {
          font-size: 0.8rem;
          color: #e65100;
          margin-bottom: 8px;
          text-align: center;
          font-weight: bold;
        }

        .word-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .word-item {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 5px 8px;
          background: linear-gradient(135deg, #fff3e0, #ffe0b2);
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .word-item.found {
          background: linear-gradient(135deg, #c8e6c9, #a5d6a7);
          text-decoration: line-through;
        }

        .word-item .icon {
          font-size: 0.85rem;
        }

        .word-item .word {
          font-weight: 600;
          color: #5d4037;
          font-size: 0.7rem;
        }

        .word-item.found .word {
          color: #2e7d32;
        }

        .word-item .hint {
          display: none;
        }

        .controls {
          display: flex;
          gap: 8px;
          justify-content: center;
          margin-top: 12px;
        }

        .btn {
          padding: 8px 16px;
          font-size: 0.8rem;
          font-weight: 600;
          border: none;
          border-radius: 18px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-primary {
          background: linear-gradient(135deg, #8bc34a, #689f38);
          color: white;
        }

        .btn-secondary {
          background: linear-gradient(135deg, #ff9800, #f57c00);
          color: white;
        }

        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        }

        /* Knowledge Cards Section */
        .knowledge-section {
          margin-top: 15px;
          padding-top: 15px;
          border-top: 2px dashed #ffe0b2;
        }

        .knowledge-title {
          font-size: 0.9rem;
          color: #e65100;
          text-align: center;
          margin-bottom: 12px;
          font-weight: bold;
        }

        .knowledge-cards {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 10px;
        }

        .knowledge-card {
          perspective: 1000px;
          height: 130px;
          cursor: default;
        }

        .card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          transform-style: preserve-3d;
        }

        .knowledge-card.flipped .card-inner {
          transform: rotateY(180deg);
        }

        .card-front, .card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          border-radius: 10px;
          padding: 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .card-front {
          background: linear-gradient(135deg, #eceff1, #cfd8dc);
          border: 2px dashed #90a4ae;
        }

        .card-front .card-icon {
          font-size: 1.5rem;
          opacity: 0.5;
        }

        .card-front .card-word {
          font-size: 1.5rem;
          color: #90a4ae;
          font-weight: bold;
        }

        .card-back {
          transform: rotateY(180deg);
          text-align: center;
        }

        .knowledge-card.impact .card-back {
          background: linear-gradient(135deg, #ffebee, #ffcdd2);
          border: 2px solid #ef5350;
        }

        .knowledge-card.control .card-back {
          background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
          border: 2px solid #66bb6a;
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 5px;
          margin-bottom: 5px;
        }

        .card-icon-small {
          font-size: 1rem;
        }

        .card-title {
          font-size: 0.85rem;
          font-weight: bold;
          color: #37474f;
        }

        .card-fact {
          font-size: 0.65rem;
          color: #455a64;
          line-height: 1.3;
          flex: 1;
          overflow: hidden;
        }

        .card-category-badge {
          font-size: 0.55rem;
          padding: 2px 6px;
          border-radius: 8px;
          font-weight: 600;
          margin-top: 4px;
        }

        .card-category-badge.impact {
          background: #ffcdd2;
          color: #c62828;
        }

        .card-category-badge.control {
          background: #c8e6c9;
          color: #2e7d32;
        }

        .knowledge-card.celebration {
          animation: celebrate 0.5s ease;
        }

        @keyframes celebrate {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        /* Completion Banner */
        .completion-banner {
          position: fixed;
          bottom: -200px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #4caf50, #2e7d32);
          color: white;
          padding: 15px 30px;
          border-radius: 20px 20px 0 0;
          box-shadow: 0 -5px 30px rgba(0,0,0,0.3);
          transition: bottom 0.5s ease;
          z-index: 100;
          text-align: center;
        }

        .completion-banner.show {
          bottom: 0;
        }

        .completion-banner h2 {
          font-size: 1.2rem;
          margin-bottom: 8px;
        }

        .completion-stats {
          display: flex;
          gap: 25px;
          justify-content: center;
        }

        .completion-stat {
          text-align: center;
        }

        .completion-stat-value {
          font-size: 1.3rem;
          font-weight: bold;
        }

        .completion-stat-label {
          font-size: 0.7rem;
          opacity: 0.9;
        }

        .info-box {
          display: none;
        }

        @media (max-width: 700px) {
          .main-container {
            padding: 15px;
          }

          .game-layout {
            flex-direction: column;
            align-items: center;
          }

          .word-list-panel {
            width: 100%;
            max-height: 150px;
          }

          .word-list {
            flex-direction: row;
            flex-wrap: wrap;
            justify-content: center;
          }

          .word-item {
            flex: 0 0 auto;
          }

          .top-stats {
            flex-direction: column;
            align-items: center;
          }
        }
        
        @media (max-width: 450px) {
          .word-grid {
            grid-template-columns: repeat(12, 24px);
            grid-template-rows: repeat(12, 24px);
          }
          
          .grid-cell {
            width: 24px;
            height: 24px;
            font-size: 0.75rem;
          }

          .knowledge-cards {
            grid-template-columns: repeat(2, 1fr);
          }

          .knowledge-card {
            height: 120px;
          }

          .card-fact {
            font-size: 0.6rem;
          }
        }
      `}</style>

      <div className="ev-root">
        <h1>🌍 Land Pollution Word Search</h1>
        <p className="subtitle">
          Find words to learn about land pollution impacts & control measures!
        </p>

        <div className="main-container">
          <div className="top-stats">
            <div className="stats-bar">
              <div className="stat">
                <div className="stat-label">Found</div>
                <div className="stat-value">
                  <span id="found-count">0</span>/<span id="total-count">10</span>
                </div>
              </div>
              <div className="stat">
                <div className="stat-label">Time</div>
                <div className="stat-value" id="timer">0:00</div>
              </div>
              <div className="stat">
                <div className="stat-label">Coins</div>
                <div className="stat-value" id="coins">0</div>
              </div>
            </div>

            <div className="learning-stats">
              <div className="learning-stat impact">
                <span>⚠ Impacts:</span>
                <span id="impact-count">0</span>
              </div>
              <div className="learning-stat control">
                <span>✅ Controls:</span>
                <span id="control-count">0</span>
              </div>
            </div>
          </div>

          <div className="difficulty-selector">
            <button className="diff-btn" data-diff="easy">Easy</button>
            <button className="diff-btn active" data-diff="medium">Medium</button>
            <button className="diff-btn" data-diff="hard">Hard</button>
          </div>

          <div className="game-layout">
            <div className="grid-container">
              <div className="word-grid" id="word-grid">{/* JS fills */}</div>
            </div>

            <div className="word-list-panel">
              <div className="word-list-title">🔍 Find These</div>
              <div className="word-list" id="word-list">{/* JS fills */}</div>
            </div>
          </div>

          <div className="controls">
            <button className="btn btn-primary" id="new-game-btn">🔄 New Game</button>
            <button className="btn btn-secondary" id="hint-btn">💡 Hint</button>
          </div>

          {/* Knowledge Cards Section */}
          <div className="knowledge-section">
            <div className="knowledge-title">📚 Knowledge Cards - Find words to flip and learn!</div>
            <div className="knowledge-cards" id="knowledge-cards">{/* JS fills */}</div>
          </div>
        </div>

        {/* Completion Banner (slides up from bottom) */}
        <div className="completion-banner" id="completion-banner">
          <h2>🎉 Congratulations! You're a Land Pollution Expert!</h2>
          <div className="completion-stats">
            <div className="completion-stat">
              <div className="completion-stat-value" id="final-coins">0</div>
              <div className="completion-stat-label">🪙 Coins Earned</div>
            </div>
            <div className="completion-stat">
              <div className="completion-stat-value" id="final-time">0:00</div>
              <div className="completion-stat-label">Time</div>
            </div>
            <div className="completion-stat">
              <div className="completion-stat-value" id="facts-learned">0</div>
              <div className="completion-stat-label">Facts Learned</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EvWordSearchGame;
