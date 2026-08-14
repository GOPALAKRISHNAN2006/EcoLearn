import React, { useEffect } from "react";

const EcoSnakesLadders = () => {
  useEffect(() => {
    // Prevent double-initialization in React StrictMode
    if (typeof window !== "undefined" && window.__ecoSnakesInit) return;
    if (typeof window !== "undefined") window.__ecoSnakesInit = true;

    (() => {
      /* ---------- Core config ---------- */
      const BOARD_SIZE = 100;
      const LADDERS = {
        3: 22,
        8: 31,
        12: 45,
        19: 51,
        28: 64,
        35: 67,
        42: 79,
        56: 87,
      };
      const SNAKES = {
        17: 4,
        24: 5,
        33: 14,
        38: 20,
        48: 26,
        62: 37,
        73: 47,
        88: 64,
      };

      // additional tile types (green=rewards, red=penalty, power-up tiles)
      const GREEN_TILES = [2, 6, 11, 18, 25, 30, 40, 54, 70, 82];
      const RED_TILES = [5, 14, 23, 29, 36, 46, 57, 68, 75, 94];
      const POWER_TILES = {
        5: "energy",
        21: "shield",
        34: "coin",
        50: "oxygen",
        77: "rainbow",
      };

      // Educational content about Air Pollution - Impacts and Control Measures
      const AIR_POLLUTION_FACTS = {
        impacts: [
          {
            title: "🫁 Respiratory Health Impact",
            content: "Air pollution causes serious respiratory diseases like asthma, bronchitis, and lung cancer. Fine particles (PM2.5) can penetrate deep into lungs and even enter the bloodstream, affecting overall health.",
            icon: "🫁",
            reward: { coins: 3, oxygen: 5 }
          },
          {
            title: "🌡️ Global Warming Connection",
            content: "Air pollutants like CO2, methane, and nitrous oxide trap heat in our atmosphere, causing global temperatures to rise. This leads to melting ice caps, rising sea levels, and extreme weather events.",
            icon: "🌡️",
            reward: { coins: 3, oxygen: 4 }
          },
          {
            title: "🌧️ Acid Rain Formation",
            content: "When sulfur dioxide (SO2) and nitrogen oxides (NOx) mix with water vapor, they form acid rain. This damages forests, kills aquatic life, and corrodes buildings and monuments.",
            icon: "🌧️",
            reward: { coins: 2, oxygen: 4 }
          },
          {
            title: "🌿 Ecosystem Damage",
            content: "Air pollution harms plants by blocking sunlight and damaging leaves. It reduces crop yields, kills trees, and disrupts the entire food chain affecting birds, insects, and animals.",
            icon: "🌿",
            reward: { coins: 3, oxygen: 5 }
          },
          {
            title: "👁️ Visibility & Smog",
            content: "Smog is a mixture of smoke and fog caused by vehicle emissions and industrial pollution. It reduces visibility, causes eye irritation, and makes breathing difficult, especially for children and elderly.",
            icon: "👁️",
            reward: { coins: 2, oxygen: 3 }
          },
          {
            title: "🏥 Cardiovascular Effects",
            content: "Long-term exposure to air pollution increases the risk of heart attacks, strokes, and heart disease. Pollutants cause inflammation in blood vessels and can lead to atherosclerosis.",
            icon: "🏥",
            reward: { coins: 3, oxygen: 4 }
          },
          {
            title: "🧠 Brain & Mental Health",
            content: "Studies show air pollution can affect brain development in children and increase risk of dementia in adults. It's also linked to depression, anxiety, and reduced cognitive function.",
            icon: "🧠",
            reward: { coins: 3, oxygen: 5 }
          },
          {
            title: "☀️ Ozone Layer Depletion",
            content: "Certain pollutants like CFCs destroy the protective ozone layer, allowing harmful UV radiation to reach Earth. This increases skin cancer risk and damages marine ecosystems.",
            icon: "☀️",
            reward: { coins: 2, oxygen: 4 }
          }
        ],
        controls: [
          {
            title: "🚲 Use Clean Transportation",
            content: "Walking, cycling, using public transport, or electric vehicles significantly reduces air pollution. A single car can emit 4.6 metric tons of CO2 per year - choosing alternatives makes a real difference!",
            icon: "🚲",
            reward: { coins: 4, oxygen: 6 }
          },
          {
            title: "🌳 Plant Trees & Green Spaces",
            content: "Trees are natural air purifiers! One mature tree can absorb 48 pounds of CO2 per year and release enough oxygen for 2 people. Urban forests help reduce pollution and cool cities.",
            icon: "🌳",
            reward: { coins: 4, oxygen: 8 }
          },
          {
            title: "⚡ Switch to Renewable Energy",
            content: "Solar, wind, and hydroelectric power produce clean energy without air pollution. Switching from fossil fuels can reduce carbon emissions by up to 90% and improve air quality dramatically.",
            icon: "⚡",
            reward: { coins: 3, energy: 2, oxygen: 5 }
          },
          {
            title: "🏭 Industrial Emission Controls",
            content: "Factories can install scrubbers, filters, and electrostatic precipitators to remove pollutants before releasing exhaust. Strict regulations and regular monitoring ensure industries follow emission standards.",
            icon: "🏭",
            reward: { coins: 3, oxygen: 5 }
          },
          {
            title: "🔥 Avoid Open Burning",
            content: "Burning trash, crop residue, and fireworks releases harmful particles and toxic gases. Composting waste and using eco-friendly alternatives helps keep our air clean.",
            icon: "🔥",
            reward: { coins: 2, oxygen: 4 }
          },
          {
            title: "🏠 Energy Efficiency at Home",
            content: "Using LED bulbs, energy-efficient appliances, and proper insulation reduces energy consumption. Less energy used means fewer power plant emissions and cleaner air for everyone!",
            icon: "🏠",
            reward: { coins: 3, oxygen: 4, energy: 1 }
          },
          {
            title: "🗳️ Support Clean Air Policies",
            content: "Governments can enforce emission standards, create green zones, and fund clean energy research. Citizens can vote for environmental policies and participate in clean air initiatives.",
            icon: "🗳️",
            reward: { coins: 2, oxygen: 3 }
          },
          {
            title: "📊 Air Quality Monitoring",
            content: "Real-time air quality monitoring systems help track pollution levels and warn people during high pollution days. Apps like AQI (Air Quality Index) help you make informed decisions about outdoor activities.",
            icon: "📊",
            reward: { coins: 2, oxygen: 3, shields: 1 }
          }
        ]
      };

      // Track facts learned
      let factsLearned = { impacts: [], controls: [] };

      // Quick tips shown while crossing tiles (shorter, bite-sized facts)
      const PATH_TIPS = [
        { tip: "💨 Vehicle exhaust is a major source of PM2.5 particles", icon: "🚗" },
        { tip: "🌡️ Earth's temp has risen 1.1°C since pre-industrial times", icon: "🌍" },
        { tip: "🫁 Air pollution causes 7 million deaths yearly worldwide", icon: "⚠️" },
        { tip: "🌳 A single tree absorbs 10 lbs of pollutants per year", icon: "🌲" },
        { tip: "🏭 Industry contributes 21% of global greenhouse gases", icon: "💨" },
        { tip: "⚡ Renewable energy is now cheaper than fossil fuels", icon: "☀️" },
        { tip: "🚲 Cycling instead of driving saves 150g CO2 per km", icon: "🚴" },
        { tip: "🏠 Indoor air can be 5x more polluted than outdoor air", icon: "🏡" },
        { tip: "🌊 Oceans absorb 30% of CO2 produced by humans", icon: "🐋" },
        { tip: "🍃 Plants remove toxins like benzene & formaldehyde", icon: "🌿" },
        { tip: "🔥 Wildfires release billions of tons of CO2 annually", icon: "🌲" },
        { tip: "💡 LED bulbs use 75% less energy than incandescent", icon: "💡" },
        { tip: "🗑️ Landfills produce methane, 80x worse than CO2", icon: "♻️" },
        { tip: "🌬️ Wind power could supply 18x world's energy needs", icon: "🌀" },
        { tip: "🚌 One bus can replace 40 cars on the road", icon: "🚌" },
        { tip: "🌱 Composting reduces methane from landfills by 50%", icon: "🌱" },
        { tip: "❄️ Arctic ice is melting 3x faster than 30 years ago", icon: "🧊" },
        { tip: "🏙️ Green buildings use 25% less energy than average", icon: "🏢" },
        { tip: "🐝 Air pollution affects pollinator navigation", icon: "🐝" },
        { tip: "💧 Acid rain has pH of 4.2-4.4, normal rain is 5.6", icon: "🌧️" },
      ];

      // Milestone facts for every 10 tiles (deeper learning)
      const MILESTONE_FACTS = {
        10: {
          title: "🔟 Milestone: Understanding PM2.5",
          content: "PM2.5 are tiny particles less than 2.5 micrometers - 30x smaller than a human hair! They can bypass our nose and throat defenses, entering deep into lungs and even bloodstream. Sources include vehicle exhaust, power plants, and burning wood.",
          icon: "🔬",
          reward: { coins: 5, oxygen: 5 }
        },
        20: {
          title: "2️⃣0️⃣ Milestone: Carbon Footprint",
          content: "Your carbon footprint is the total greenhouse gases you produce. Average person: 4 tons CO2/year. Flying once = 1 ton! Reduce by: eating less meat, using public transport, buying local products, and reducing energy use at home.",
          icon: "👣",
          reward: { coins: 5, oxygen: 6 }
        },
        30: {
          title: "3️⃣0️⃣ Milestone: The Greenhouse Effect",
          content: "Greenhouse gases (CO2, methane, N2O) trap heat like a blanket around Earth. While natural, human activities have increased CO2 by 50% since 1750. This causes global warming, extreme weather, and rising sea levels.",
          icon: "🏠",
          reward: { coins: 5, oxygen: 6, energy: 1 }
        },
        40: {
          title: "4️⃣0️⃣ Milestone: Indoor Air Quality",
          content: "We spend 90% of time indoors where air can be 2-5x more polluted! Sources: cooking, cleaning products, furniture, and poor ventilation. Solutions: houseplants, air purifiers, opening windows, and using natural cleaners.",
          icon: "🏡",
          reward: { coins: 6, oxygen: 5 }
        },
        50: {
          title: "5️⃣0️⃣ Milestone: HALFWAY! Ozone - Good vs Bad",
          content: "Ozone at ground level (smog) damages lungs. But ozone layer 15-35km up protects us from UV radiation! The hole caused by CFCs is slowly healing since the 1987 Montreal Protocol - proof that global action works!",
          icon: "🌐",
          reward: { coins: 8, oxygen: 8, shields: 1 }
        },
        60: {
          title: "6️⃣0️⃣ Milestone: Clean Energy Revolution",
          content: "Solar costs dropped 90% in 10 years! Wind is the cheapest new electricity source. By 2050, renewables could provide 90% of world's electricity. Countries like Costa Rica already run on 99% renewable energy!",
          icon: "⚡",
          reward: { coins: 6, oxygen: 7, energy: 2 }
        },
        70: {
          title: "7️⃣0️⃣ Milestone: Trees - Nature's Filters",
          content: "Forests are Earth's lungs! Amazon rainforest produces 20% of world's oxygen. One acre of trees absorbs 6 tons of CO2/year. Urban trees reduce city temps by 2-8°C and filter pollutants from millions of cars.",
          icon: "🌳",
          reward: { coins: 6, oxygen: 10 }
        },
        80: {
          title: "8️⃣0️⃣ Milestone: Air Quality Index (AQI)",
          content: "AQI measures air quality from 0-500. Good: 0-50, Moderate: 51-100, Unhealthy: 151-200, Hazardous: 301+. Check AQI daily! On high pollution days, stay indoors, close windows, and avoid exercise outside.",
          icon: "📊",
          reward: { coins: 7, oxygen: 6, shields: 1 }
        },
        90: {
          title: "9️⃣0️⃣ Milestone: Your Actions Matter!",
          content: "Small actions create big change! If everyone reduced car trips by 1/week, we'd cut emissions by millions of tons. Using a reusable bag saves 700 plastic bags. One person recycling saves 2,400 lbs CO2/year. YOU can make a difference!",
          icon: "🦸",
          reward: { coins: 8, oxygen: 8, energy: 1 }
        },
        100: {
          title: "🏆 CHAMPION! Master of Clean Air!",
          content: "Congratulations! You've learned about air pollution impacts and control measures. Remember: breathe clean air is a right, not a privilege. Share this knowledge, take action daily, and inspire others. Together we can create a cleaner, healthier planet!",
          icon: "🏆",
          reward: { coins: 15, oxygen: 15, energy: 3, shields: 2 }
        }
      };

      let lastTipIndex = -1; // Track last tip shown to avoid repetition

      // DOM
      const boardArea = document.getElementById("boardArea");
      const overlay = document.getElementById("overlay");
      const pieces = document.getElementById("pieces");
      const playersCompact = document.getElementById("playersCompact");
      const rollBtn = document.getElementById("rollBtn");
      const diceEl = document.getElementById("dice");
      const currentName = document.getElementById("currentName");
      const msg = document.getElementById("msg");
      const kidModeCheckbox = document.getElementById("kidMode");
      const quizModeCheckbox = document.getElementById("quizMode");
      const resetBtn = document.getElementById("resetBtn");
      const helpBtn = document.getElementById("helpBtn");
      const diceSet = document.getElementById("diceSet");

      const oxygenBar = document.getElementById("oxygenBar");
      const pollutionBar = document.getElementById("pollutionBar");
      const ecoCoinsEl = document.getElementById("ecoCoins");
      const energyEl = document.getElementById("energyPts");
      const shieldsEl = document.getElementById("shields");

      const confettiCanvas = document.getElementById("confetti");

      // popup elements
      const helpPopup = document.getElementById("helpPopup");
      const helpClose = document.getElementById("helpClose");
      const helpMore = document.getElementById("helpMore");

      if (
        !boardArea ||
        !overlay ||
        !pieces ||
        !rollBtn ||
        !diceEl ||
        !currentName
      ) {
        // if something critical missing, just stop
        return;
      }

      let players = [],
        currentIdx = 0,
        animating = false,
        kidMode = false,
        quizMode = true;
      let audioCtx =
        (window.AudioContext || window.webkitAudioContext) &&
        new (window.AudioContext || window.webkitAudioContext)();
      let gameState = {
        oxygen: 72,
        pollution: 18,
        coins: 0,
        energy: 0,
        shields: 0,
      };
      
      // Learning panel element reference
      let learningPanel = null;
      
      // Separate indexes for alternating facts
      // Player: control (even) → impact (odd)
      // Computer: impact (even) → control (odd)
      let playerFactIndex = 0;  // Player's turn count
      let computerFactIndex = 0;  // Computer's turn count
      
      // Separate arrays for controls and impacts
      const CONTROL_FACTS = AIR_POLLUTION_FACTS.controls.map(f => ({...f, type: 'control'}));
      const IMPACT_FACTS = AIR_POLLUTION_FACTS.impacts.map(f => ({...f, type: 'impact'}));

      // audio
      function beep(freq, dur = 0.1, type = "sine", vol = 0.07) {
        if (!audioCtx) return;
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.type = type;
        o.frequency.value = freq;
        g.gain.value = vol;
        o.connect(g);
        g.connect(audioCtx.destination);
        o.start();
        o.stop(audioCtx.currentTime + dur);
      }
      function audioReward() {
        beep(880, 0.12);
        setTimeout(() => beep(1100, 0.08), 120);
      }
      function audioPenalty() {
        beep(240, 0.14, "sawtooth", 0.12);
        setTimeout(() => beep(160, 0.09, "sawtooth", 0.06), 110);
      }
      function audioRoll() {
        beep(320, 0.05);
        setTimeout(() => beep(420, 0.05), 70);
      }

      // Show quick tip - now updates learning panel instead of popup
      function showQuickTip(cell) {
        // Tips now shown in learning panel via showNextFact during dice roll
        // This function is kept for compatibility but does nothing
        return;
      }

      // Show milestone educational content (non-blocking - just gives rewards now, no popup)
      function showMilestoneFact(milestone) {
        if (!quizMode) return null;
        const fact = MILESTONE_FACTS[milestone];
        if (!fact) return null;
        
        // No popup here - just return the reward
        // Educational popup is shown once per dice roll via showNextFact
        return fact.reward;
      }

      /* ---------- build board tiles ---------- */
      function buildBoard() {
        boardArea.innerHTML = "";
        // Build board with 91-100 at top row, 1-10 at bottom row
        // Bottom row (1-10): 1 on left going right
        // Row above (11-20): 20 on left going to 11 on right
        // Alternating zigzag pattern up to 91-100 at top
        for (let rowIndex = 0; rowIndex < 10; rowIndex++) {
          // rowIndex 0 = top of screen = row with 91-100
          // rowIndex 9 = bottom of screen = row with 1-10
          const rowFromBottom = 9 - rowIndex; // 0 = bottom row (1-10), 9 = top row (91-100)
          const isOddRowFromBottom = rowFromBottom % 2 === 1;
          let tilesInRow = [];

          for (let col = 0; col < 10; col++) {
            const cellNum = rowFromBottom * 10 + col + 1;
            tilesInRow.push(cellNum);
          }

          // Even rows from bottom (0,2,4,6,8) go left-to-right (1-10, 21-30, etc.)
          // Odd rows from bottom (1,3,5,7,9) go right-to-left (20-11, 40-31, etc.)
          if (isOddRowFromBottom) {
            tilesInRow.reverse();
          }

          for (const i of tilesInRow) {
            const t = document.createElement("div");
            t.className = "tile";
            t.dataset.cell = i;
            const num = document.createElement("div");
            num.className = "num";
            num.textContent = i;
            t.appendChild(num);

            if (GREEN_TILES.includes(i)) {
              t.classList.add("green");
              t.title = "Reward tile";
            }
            if (RED_TILES.includes(i)) {
              t.classList.add("red");
              t.title = "Penalty tile";
            }
            if (LADDERS[i]) {
              const lbl = document.createElement("div");
              lbl.className = "event";
              lbl.textContent = "🪜 Ladder";
              t.appendChild(lbl);
            }
            if (SNAKES[i]) {
              const lbl = document.createElement("div");
              lbl.className = "event";
              lbl.textContent = "🐍 Snake";
              t.appendChild(lbl);
            }
            if (POWER_TILES[i]) {
              const lbl = document.createElement("div");
              lbl.className = "event";
              lbl.textContent = "✨ Power-up";
              t.appendChild(lbl);
            }

            boardArea.appendChild(t);
          }
        }
      }

      // compute tile center for pieces/overlay (620x620)
      function tileCenter(cell) {
        const idx = Math.max(1, Math.min(100, cell)) - 1;
        const rowFromBottom = Math.floor(idx / 10); // 0 = bottom row (1-10), 9 = top row (91-100)
        const colInRow = idx % 10;
        const isOddRow = rowFromBottom % 2 === 1;
        // Even rows from bottom go left-to-right, odd rows go right-to-left
        const col = isOddRow ? 9 - colInRow : colInRow;
        const tile = 620 / 10;
        const x = col * tile + tile / 2;
        const y = (9 - rowFromBottom) * tile + tile / 2; // Flip Y so row 0 is at bottom
        return { x, y };
      }

      /* ---------- decorative ladders & snakes (simple SVG lines) ---------- */
      function drawLines() {
        overlay.innerHTML = "";
        // ladders - exact ladder shape with two rails and rungs
        for (const fStr in LADDERS) {
          const f = +fStr,
            t = LADDERS[f];
          const a = tileCenter(f),
            b = tileCenter(t);

          // Calculate ladder direction and perpendicular
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          const ux = dx / len; // unit vector along ladder
          const uy = dy / len;
          const px = -uy; // perpendicular unit vector
          const py = ux;

          const railWidth = 6; // distance from center to each rail
          const rungSpacing = 18; // space between rungs
          const numRungs = Math.max(3, Math.floor(len / rungSpacing));

          // Left rail
          const leftRail = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
          );
          leftRail.setAttribute("x1", a.x + px * railWidth);
          leftRail.setAttribute("y1", a.y + py * railWidth);
          leftRail.setAttribute("x2", b.x + px * railWidth);
          leftRail.setAttribute("y2", b.y + py * railWidth);
          leftRail.setAttribute("stroke", "#8B4513");
          leftRail.setAttribute("stroke-width", 2);
          leftRail.setAttribute("stroke-linecap", "round");
          overlay.appendChild(leftRail);

          // Right rail
          const rightRail = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
          );
          rightRail.setAttribute("x1", a.x - px * railWidth);
          rightRail.setAttribute("y1", a.y - py * railWidth);
          rightRail.setAttribute("x2", b.x - px * railWidth);
          rightRail.setAttribute("y2", b.y - py * railWidth);
          rightRail.setAttribute("stroke", "#8B4513");
          rightRail.setAttribute("stroke-width", 2);
          rightRail.setAttribute("stroke-linecap", "round");
          overlay.appendChild(rightRail);

          // Rungs
          for (let i = 0; i <= numRungs; i++) {
            const t = i / numRungs;
            const rx = a.x + dx * t;
            const ry = a.y + dy * t;

            const rung = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "line"
            );
            rung.setAttribute("x1", rx + px * railWidth);
            rung.setAttribute("y1", ry + py * railWidth);
            rung.setAttribute("x2", rx - px * railWidth);
            rung.setAttribute("y2", ry - py * railWidth);
            rung.setAttribute("stroke", "#A0522D");
            rung.setAttribute("stroke-width", 2);
            rung.setAttribute("stroke-linecap", "round");
            overlay.appendChild(rung);
          }
        }
        // snakes - curvy green paths with wave pattern
        for (const s in SNAKES) {
          const start = +s,
            dest = SNAKES[s];
          const a = tileCenter(start),
            b = tileCenter(dest);
          // Create a wavy snake path
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          const waves = Math.max(2, Math.floor(len / 60));
          const amplitude = 20;

          let pathD = `M ${a.x} ${a.y}`;
          for (let w = 0; w < waves; w++) {
            const t = (w + 0.5) / waves;
            const t2 = (w + 1) / waves;
            const mx = a.x + dx * t;
            const my = a.y + dy * t;
            const ex = a.x + dx * t2;
            const ey = a.y + dy * t2;
            // Perpendicular offset for wave
            const px = (-dy / len) * amplitude * (w % 2 === 0 ? 1 : -1);
            const py = (dx / len) * amplitude * (w % 2 === 0 ? 1 : -1);
            pathD += ` Q ${mx + px} ${my + py} ${ex} ${ey}`;
          }

          const path = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path"
          );
          path.setAttribute("d", pathD);
          path.setAttribute("stroke", "#22c55e");
          path.setAttribute("stroke-width", 4);
          path.setAttribute("fill", "none");
          path.setAttribute("stroke-linecap", "round");
          path.setAttribute("opacity", 0.85);
          overlay.appendChild(path);

          // Snake head
          const head = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "circle"
          );
          head.setAttribute("cx", a.x);
          head.setAttribute("cy", a.y);
          head.setAttribute("r", 6);
          head.setAttribute("fill", "#16a34a");
          overlay.appendChild(head);
        }
        // small power icons
        for (const p in POWER_TILES) {
          const pos = tileCenter(+p);
          const text = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "text"
          );
          text.setAttribute("x", pos.x - 6);
          text.setAttribute("y", pos.y + 26);
          text.setAttribute("font-size", 28);
          text.textContent = "✨";
          overlay.appendChild(text);
        }
      }

      /* ---------- pieces ---------- */
      function createPieceEl(player) {
        const el = document.createElement("div");
        el.className = "piece";
        el.dataset.id = player.id;
        el.style.background = player.color;
        el.textContent = player.avatar;
        pieces.appendChild(el);
        return el;
      }

      function movePieceInstant(el, cell) {
        const c = tileCenter(Math.max(1, Math.min(100, cell || 1)));
        el.style.left = c.x + "px";
        el.style.top = c.y + "px";
      }

      function placePieces() {
        pieces.innerHTML = "";
        players.forEach((p) => {
          const el = createPieceEl(p);
          movePieceInstant(el, p.position || 1);
          if (kidMode) el.classList.add("big");
          else el.classList.remove("big");
        });
      }

      /* animate step-by-step */
      function animateSteps(playerIdx, start, end, baseDelay = 140, showTips = true) {
        return new Promise((resolve) => {
          if (start === end) {
            resolve();
            return;
          }
          let cur = start;
          const dir = start < end ? 1 : -1;
          const delay = kidMode ? baseDelay * 1.5 : baseDelay;
          const el = pieces.querySelector(`.piece[data-id="${playerIdx}"]`);
          const stepFn = () => {
            cur += dir;
            players[playerIdx].position = cur;
            if (el) movePieceInstant(el, cur);
            highlightTile(cur);
            
            // Show quick tips while walking (only on forward movement)
            if (showTips && dir > 0 && quizMode) {
              showQuickTip(cur);
            }
            
            if (cur === end) {
              setTimeout(() => {
                clearHighlights();
                resolve();
              }, kidMode ? 420 : 220);
            } else setTimeout(stepFn, delay);
          };
          stepFn();
        });
      }

      let hTimer = null;
      function highlightTile(cell) {
        clearHighlights();
        const idx = cell - 1;
        const t = boardArea.children[idx];
        if (t) {
          t.style.boxShadow = "0 12px 26px rgba(16,185,129,0.14)";
          t.style.transform = "scale(1.04)";
        }
        hTimer = setTimeout(clearHighlights, kidMode ? 700 : 320);
      }
      function clearHighlights() {
        if (hTimer) clearTimeout(hTimer);
        [...boardArea.children].forEach((t) => {
          t.style.boxShadow = "";
          t.style.transform = "";
        });
      }

      /* ---------- HUD updates ---------- */
      function updateHUD() {
        if (oxygenBar)
          oxygenBar.style.width =
            Math.max(0, Math.min(100, gameState.oxygen)) + "%";
        if (pollutionBar)
          pollutionBar.style.width =
            Math.max(0, Math.min(100, gameState.pollution)) + "%";
        if (ecoCoinsEl) ecoCoinsEl.textContent = gameState.coins;
        if (energyEl) energyEl.textContent = gameState.energy;
        if (shieldsEl) shieldsEl.textContent = gameState.shields;
        
        // Update facts learned counter
        const factsLearnedEl = document.getElementById('factsLearned');
        if (factsLearnedEl) {
          const totalFacts = 16; // 8 impacts + 8 controls
          const learnedCount = factsLearned.impacts.length + factsLearned.controls.length;
          factsLearnedEl.textContent = `${learnedCount}/${totalFacts}`;
        }
      }

      /* ---------- confetti (simple) ---------- */
      const confetti = (function () {
        const c = confettiCanvas;
        const ctx = c.getContext("2d");
        let items = [],
          running = false;
        function resize() {
          c.width = window.innerWidth;
          c.height = window.innerHeight;
        }
        function spawn(n = 60) {
          for (let i = 0; i < n; i++) {
            items.push({
              x: Math.random() * c.width,
              y: -20 - Math.random() * 200,
              vx: (Math.random() - 0.5) * 6,
              vy: 2 + Math.random() * 6,
              size: 6 + Math.random() * 8,
              color: ["#ff7a7a", "#ffd36b", "#7af5c8", "#a4d8ff"][
                Math.floor(Math.random() * 4)
              ],
              rot: Math.random() * 360,
              vr: (Math.random() - 0.5) * 10,
            });
          }
          if (!running) {
            running = true;
            animate();
            c.style.display = "block";
            setTimeout(() => {
              running = false;
            }, 2400);
          }
        }
        function animate() {
          resize();
          const step = () => {
            ctx.clearRect(0, 0, c.width, c.height);
            items.forEach((p, i) => {
              p.x += p.vx;
              p.y += p.vy;
              p.vy += 0.12;
              p.rot += p.vr;
              ctx.save();
              ctx.translate(p.x, p.y);
              ctx.rotate((p.rot * Math.PI) / 180);
              ctx.fillStyle = p.color;
              ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
              ctx.restore();
              if (p.y > c.height + 60) items.splice(i, 1);
            });
            if (items.length > 0) requestAnimationFrame(step);
            else {
              ctx.clearRect(0, 0, c.width, c.height);
              c.style.display = "none";
            }
          };
          step();
        }
        window.addEventListener("resize", resize);
        return { spawn };
      })();

      /* ---------- mini educational prompt ---------- */

      // Custom popup dialog system
      function showPopup(
        title,
        message,
        buttons = [{ text: "OK", value: true }],
        inputField = null
      ) {
        return new Promise((resolve) => {
          const overlay = document.createElement("div");
          overlay.style.cssText =
            "position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;";

          const popup = document.createElement("div");
          popup.style.cssText =
            "background:linear-gradient(180deg,#fff,#f0fdf4);padding:24px;border-radius:16px;max-width:400px;width:90%;box-shadow:0 20px 50px rgba(0,0,0,0.3);border:4px solid #86efac;";

          const titleEl = document.createElement("h3");
          titleEl.style.cssText =
            'margin:0 0 12px;color:#16a34a;font-size:20px;font-family:"Baloo 2",cursive;';
          titleEl.textContent = title;
          popup.appendChild(titleEl);

          const msgEl = document.createElement("p");
          msgEl.style.cssText =
            "margin:0 0 16px;color:#0f172a;font-size:14px;line-height:1.5;white-space:pre-wrap;";
          msgEl.textContent = message;
          popup.appendChild(msgEl);

          let inputEl = null;
          if (inputField) {
            inputEl = document.createElement("input");
            inputEl.type = inputField.type || "text";
            inputEl.value = inputField.default || "";
            inputEl.placeholder = inputField.placeholder || "";
            inputEl.style.cssText =
              "width:100%;padding:10px;border:2px solid #bbf7d0;border-radius:8px;font-size:16px;margin-bottom:16px;box-sizing:border-box;";
            popup.appendChild(inputEl);
            setTimeout(() => inputEl.focus(), 100);
          }

          const btnContainer = document.createElement("div");
          btnContainer.style.cssText =
            "display:flex;gap:10px;justify-content:flex-end;";

          buttons.forEach((btn) => {
            const btnEl = document.createElement("button");
            btnEl.textContent = btn.text;
            btnEl.style.cssText = btn.primary
              ? "padding:10px 20px;border:none;border-radius:10px;font-weight:800;cursor:pointer;background:linear-gradient(180deg,#34d399,#10b981);color:#fff;font-size:14px;"
              : "padding:10px 20px;border:2px solid #e5e7eb;border-radius:10px;font-weight:800;cursor:pointer;background:#fff;color:#374151;font-size:14px;";
            btnEl.onclick = () => {
              document.body.removeChild(overlay);
              resolve(inputEl ? (btn.value ? inputEl.value : null) : btn.value);
            };
            btnContainer.appendChild(btnEl);
          });

          popup.appendChild(btnContainer);
          overlay.appendChild(popup);
          document.body.appendChild(overlay);

          // Close on overlay click
          overlay.onclick = (e) => {
            if (e.target === overlay) {
              document.body.removeChild(overlay);
              resolve(inputEl ? null : false);
            }
          };
        });
      }

      async function showConfirm(title, message) {
        return showPopup(title, message, [
          { text: "No", value: false },
          { text: "Yes", value: true, primary: true },
        ]);
      }

      async function showPrompt(title, message, defaultValue = "") {
        return showPopup(
          title,
          message,
          [
            { text: "Cancel", value: false },
            { text: "OK", value: true, primary: true },
          ],
          { default: defaultValue }
        );
      }

      async function showEducationalPopup(fact, type) {
        return new Promise((resolve) => {
          const overlay = document.createElement("div");
          overlay.style.cssText =
            "position:fixed;inset:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;";

          const popup = document.createElement("div");
          const isImpact = type === 'impact';
          const gradientColor = isImpact ? '#fff,#fef2f2' : '#fff,#f0fdf4';
          const borderColor = isImpact ? '#fca5a5' : '#86efac';
          const headerColor = isImpact ? '#dc2626' : '#16a34a';
          
          popup.style.cssText =
            `background:linear-gradient(180deg,${gradientColor});padding:28px;border-radius:20px;max-width:520px;width:90%;box-shadow:0 25px 60px rgba(0,0,0,0.35);border:5px solid ${borderColor};`;

          // Header with icon
          const headerEl = document.createElement("div");
          headerEl.style.cssText = "display:flex;align-items:center;gap:12px;margin-bottom:16px;";
          
          const iconEl = document.createElement("span");
          iconEl.style.cssText = "font-size:42px;";
          iconEl.textContent = fact.icon;
          headerEl.appendChild(iconEl);

          const titleContainer = document.createElement("div");
          
          const labelEl = document.createElement("div");
          labelEl.style.cssText = `font-size:11px;font-weight:900;color:${headerColor};text-transform:uppercase;letter-spacing:1px;margin-bottom:2px;`;
          labelEl.textContent = isImpact ? '⚠️ AIR POLLUTION IMPACT' : '✅ CONTROL MEASURE';
          titleContainer.appendChild(labelEl);

          const titleEl = document.createElement("h3");
          titleEl.style.cssText =
            `margin:0;color:#0f172a;font-size:20px;font-family:"Baloo 2",cursive;line-height:1.2;`;
          titleEl.textContent = fact.title;
          titleContainer.appendChild(titleEl);
          
          headerEl.appendChild(titleContainer);
          popup.appendChild(headerEl);

          // Content
          const contentEl = document.createElement("div");
          contentEl.style.cssText =
            "background:rgba(255,255,255,0.8);padding:16px;border-radius:12px;margin-bottom:16px;border:2px solid rgba(0,0,0,0.05);";
          
          const textEl = document.createElement("p");
          textEl.style.cssText =
            "margin:0;color:#1e293b;font-size:15px;font-weight:600;line-height:1.6;";
          textEl.textContent = fact.content;
          contentEl.appendChild(textEl);
          popup.appendChild(contentEl);

          // Reward preview
          const rewardEl = document.createElement("div");
          rewardEl.style.cssText = "display:flex;gap:12px;justify-content:center;margin-bottom:16px;flex-wrap:wrap;";
          
          if (fact.reward.coins) {
            const coinBadge = document.createElement("span");
            coinBadge.style.cssText = "background:#fef3c7;padding:6px 12px;border-radius:20px;font-weight:800;font-size:13px;";
            coinBadge.textContent = `🪙 +${fact.reward.coins} Coins`;
            rewardEl.appendChild(coinBadge);
          }
          if (fact.reward.oxygen) {
            const oxyBadge = document.createElement("span");
            oxyBadge.style.cssText = "background:#dcfce7;padding:6px 12px;border-radius:20px;font-weight:800;font-size:13px;";
            oxyBadge.textContent = `🍃 +${fact.reward.oxygen} Oxygen`;
            rewardEl.appendChild(oxyBadge);
          }
          if (fact.reward.energy) {
            const energyBadge = document.createElement("span");
            energyBadge.style.cssText = "background:#e0f2fe;padding:6px 12px;border-radius:20px;font-weight:800;font-size:13px;";
            energyBadge.textContent = `⚡ +${fact.reward.energy} Energy`;
            rewardEl.appendChild(energyBadge);
          }
          if (fact.reward.shields) {
            const shieldBadge = document.createElement("span");
            shieldBadge.style.cssText = "background:#ede9fe;padding:6px 12px;border-radius:20px;font-weight:800;font-size:13px;";
            shieldBadge.textContent = `🛡 +${fact.reward.shields} Shield`;
            rewardEl.appendChild(shieldBadge);
          }
          popup.appendChild(rewardEl);

          // Progress indicator
          const progressEl = document.createElement("div");
          progressEl.style.cssText = "text-align:center;margin-bottom:12px;font-size:12px;color:#64748b;font-weight:700;";
          const totalFacts = AIR_POLLUTION_FACTS.impacts.length + AIR_POLLUTION_FACTS.controls.length;
          const learnedCount = factsLearned.impacts.length + factsLearned.controls.length;
          progressEl.textContent = `📚 Facts Learned: ${learnedCount}/${totalFacts}`;
          popup.appendChild(progressEl);

          // Button
          const btn = document.createElement("button");
          btn.style.cssText =
            `display:block;width:100%;padding:14px;border:none;border-radius:12px;font-weight:900;cursor:pointer;background:linear-gradient(180deg,${isImpact ? '#f87171,#ef4444' : '#34d399,#10b981'});color:#fff;font-size:16px;transition:transform 0.2s;`;
          btn.textContent = isImpact ? "😟 I understand this impact" : "💚 I learned something new!";
          btn.onmouseover = () => (btn.style.transform = "scale(1.02)");
          btn.onmouseout = () => (btn.style.transform = "scale(1)");
          btn.onclick = () => {
            document.body.removeChild(overlay);
            resolve(true);
          };
          popup.appendChild(btn);

          // Animate in
          popup.style.transform = "scale(0.9)";
          popup.style.opacity = "0";
          popup.style.transition = "transform 0.3s, opacity 0.3s";
          
          overlay.appendChild(popup);
          document.body.appendChild(overlay);
          
          requestAnimationFrame(() => {
            popup.style.transform = "scale(1)";
            popup.style.opacity = "1";
          });
        });
      }

      // Get a random fact that hasn't been shown yet
      function getRandomFact(type) {
        const facts = type === 'impact' ? AIR_POLLUTION_FACTS.impacts : AIR_POLLUTION_FACTS.controls;
        const learned = type === 'impact' ? factsLearned.impacts : factsLearned.controls;
        
        // Filter out already learned facts
        const unlearned = facts.filter((_, idx) => !learned.includes(idx));
        
        if (unlearned.length === 0) {
          // Reset if all facts learned
          if (type === 'impact') factsLearned.impacts = [];
          else factsLearned.controls = [];
          return { fact: facts[Math.floor(Math.random() * facts.length)], idx: Math.floor(Math.random() * facts.length) };
        }
        
        const randomIdx = Math.floor(Math.random() * unlearned.length);
        const originalIdx = facts.indexOf(unlearned[randomIdx]);
        return { fact: unlearned[randomIdx], idx: originalIdx };
      }

      async function showLearningContent(type = 'random') {
        if (!quizMode) return { learned: false, reward: null };
        
        // Randomly choose impact or control if not specified
        if (type === 'random') {
          type = Math.random() > 0.5 ? 'impact' : 'control';
        }
        
        const { fact, idx } = getRandomFact(type);
        await showEducationalPopup(fact, type);
        
        // Mark as learned
        if (type === 'impact' && !factsLearned.impacts.includes(idx)) {
          factsLearned.impacts.push(idx);
        } else if (type === 'control' && !factsLearned.controls.includes(idx)) {
          factsLearned.controls.push(idx);
        }
        
        return { learned: true, reward: fact.reward };
      }

      /* ---------- game actions on landing ---------- */
      async function handleLanding(playerIdx) {
        const p = players[playerIdx];
        let landed = p.position;
        const tile = boardArea.children[landed - 1];

        // visual flash for tile
        if (tile) {
          tile.classList.add("glow");
          setTimeout(() => tile.classList.remove("glow"), 700);
        }

        // power-up tile
        if (POWER_TILES[landed]) {
          const t = POWER_TILES[landed];
          if (t === "energy") {
            gameState.energy += 1;
            showFloating(p, "⚡ Energy +1");
            audioReward();
          }
          if (t === "shield") {
            gameState.shields += 1;
            showFloating(p, "🛡 Shield +1");
            audioReward();
          }
          if (t === "coin") {
            gameState.coins += 5;
            showFloating(p, "🪙 +5 Eco-Coins");
            audioReward();
          }
          if (t === "oxygen") {
            gameState.oxygen = Math.min(100, gameState.oxygen + 8);
            showFloating(p, "🍃 Oxygen +8");
            audioReward();
          }
          if (t === "rainbow") {
            // teleport to nearest ladder ahead
            const ahead = Object.keys(LADDERS)
              .map((n) => +n)
              .filter((n) => n > landed)
              .sort((a, b) => a - b);
            if (ahead.length) {
              const dest = LADDERS[ahead[0]];
              await animateSteps(playerIdx, landed, dest, 110);
              p.position = dest;
              showFloating(p, "🌈 Jumped to ladder!");
              audioReward();
              landed = dest;
            }
          }
        }

        // green reward tile - Learn about CONTROL MEASURES (rewards only, no extra popup)
        if (GREEN_TILES.includes(landed)) {
          // Give reward for landing on green tile
          const controlFact = AIR_POLLUTION_FACTS.controls[Math.floor(Math.random() * AIR_POLLUTION_FACTS.controls.length)];
          
          // Full reward for learning control measures
          gameState.coins += controlFact.reward.coins || 2;
          gameState.oxygen = Math.min(100, gameState.oxygen + (controlFact.reward.oxygen || 3));
          if (controlFact.reward.energy) gameState.energy += controlFact.reward.energy;
          if (controlFact.reward.shields) gameState.shields += controlFact.reward.shields;
          gameState.pollution = Math.max(0, gameState.pollution - 2);
          showFloating(p, "🌱 Green tile bonus!");
          audioReward();
        }

        // ladder
        if (LADDERS[landed]) {
          await new Promise((r) => setTimeout(r, 150));
          showFloating(p, "🪜 Climb!");
          audioReward();
          const dest = LADDERS[landed];
          await animateSteps(playerIdx, landed, dest, 110);
          p.position = dest;
          landed = dest;
        }

        // red penalty tiles: Learn about pollution IMPACTS (rewards only, no extra popup)
        if (RED_TILES.includes(landed)) {
          // Give small reward for landing on learning tile
          gameState.coins += 1;
          showFloating(p, "📖 Red tile!");
          audioReward();
          
          // Apply penalty based on dice set
          const ds = diceSet.value;
          const risk = ds === "risk" ? 0.6 : ds === "eco" ? 0.2 : 0.35;
          
          if (Math.random() < risk) {
            // Auto-use shield if available
            if (gameState.shields > 0) {
              gameState.shields--;
              showFloating(p, "🛡 Shield auto-protected!");
              audioReward();
            } else {
              // apply penalty
              const loss = Math.min(gameState.coins, 2);
              gameState.coins -= loss;
              gameState.oxygen = Math.max(0, gameState.oxygen - 4);
              gameState.pollution = Math.min(100, gameState.pollution + 3);
              showFloating(p, `⚠️ Pollution: -${loss} coins`);
              audioPenalty();
              boardArea.classList.add("shake");
              setTimeout(() => boardArea.classList.remove("shake"), 520);
            }
          }
        }

        // snake after all protections
        if (SNAKES[landed]) {
          const blocked = p._shieldActive;
          if (blocked) {
            p._shieldActive = false;
            showFloating(p, "🛡 Shield blocked the snake!");
            audioReward();
          } else {
            audioPenalty();
            showFloating(p, "🐍 Snake! Slide down!");
            const dest = SNAKES[landed];
            await new Promise((r) => setTimeout(r, 360));
            await animateSteps(playerIdx, landed, dest, 120, false); // No tips when sliding down
            p.position = dest;
            landed = dest;
          }
        }

        // small environmental drift: if player does many rewards, pollution decreases slightly
        gameState.pollution = Math.max(
          0,
          gameState.pollution - Math.random() * 1.2
        );
        // cap
        gameState.oxygen = Math.max(0, Math.min(100, gameState.oxygen));
        gameState.pollution = Math.max(0, Math.min(100, gameState.pollution));

        updateHUD();
        placePieces();
        return landed;
      }

      // show floating text near piece
      function showFloating(player, text) {
        const pos = tileCenter(player.position || 1);
        const f = document.createElement("div");
        f.textContent = text;
        f.style.position = "absolute";
        f.style.left = pos.x + 60 + "px";
        f.style.top = pos.y + 20 + "px";
        f.style.padding = "6px 10px";
        f.style.borderRadius = "10px";
        f.style.background = "rgba(2,8,6,0.9)";
        f.style.color = "#dfffe6";
        f.style.fontWeight = "800";
        f.style.zIndex = 999;
        document.body.appendChild(f);
        requestAnimationFrame(() => {
          f.style.transition = "transform .9s, opacity .9s";
          f.style.transform = "translateY(-60px)";
          f.style.opacity = "0";
        });
        setTimeout(() => f.remove(), 900);
      }

      /* ---------- roll handler (advanced dice sets) ---------- */
      async function handleRoll(isAI = false) {
        if (animating) return;
        animating = true;
        rollBtn.disabled = true;
        if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();

        // Show educational fact popup - wait for user to click continue (or auto-dismiss for AI)
        msg.textContent = isAI ? '🤖 Computer is learning...' : '📚 Learn this fact, then roll!';
        await showNextFact(isAI);
        
        msg.textContent = isAI ? '🤖 Computer is rolling...' : '🎲 Rolling the dice...';

        // produce dice depending on set
        const ds = diceSet.value;
        let dice = Math.floor(Math.random() * 6) + 1;
        // modify distribution slightly
        if (ds === "eco") {
          // slight bias toward 4-6
          if (Math.random() < 0.28) dice = 4 + Math.floor(Math.random() * 3);
        } else if (ds === "risk") {
          // risk: high variance - 1 or 6 more likely
          const r = Math.random();
          if (r < 0.18) dice = 1;
          else if (r > 0.82) dice = 6;
        }
        
        // Dice rolling animation
        let rollCount = 0;
        const rollInterval = setInterval(() => {
          diceEl.textContent = Math.floor(Math.random() * 6) + 1;
          rollCount++;
          if (rollCount > 10) {
            clearInterval(rollInterval);
            diceEl.textContent = dice;
          }
        }, 80);
        
        audioRoll();

        // Auto use energy for AI, skip prompt for human (no popups)
        const p = players[currentIdx];
        if (gameState.energy > 0 && !isAI) {
          // For human, auto-use energy if beneficial
          if (p.position < 94) { // Only use if not near end
            gameState.energy--;
            dice += 2;
            showFloating(p, "⚡ Energy boost: +2 move");
          }
        } else if (isAI && gameState.energy > 0 && Math.random() > 0.5) {
          // AI randomly decides to use energy
          gameState.energy--;
          dice += 2;
          showFloating(p, "⚡ AI uses energy: +2 move");
        }

        await new Promise((r) => setTimeout(r, 800)); // Wait for dice animation

        const startPos = p.position || 0;
        let target = startPos + dice;
        if (target > BOARD_SIZE) target = BOARD_SIZE;

        await animateSteps(currentIdx, startPos, target, 140);

        // Check for milestone crossings (10, 20, 30... etc)
        const startMilestone = Math.floor(startPos / 10);
        const endMilestone = Math.floor(target / 10);
        
        // Show milestone facts for each 10-tile boundary crossed
        for (let m = startMilestone + 1; m <= endMilestone; m++) {
          const milestone = m * 10;
          if (MILESTONE_FACTS[milestone]) {
            const reward = showMilestoneFact(milestone);
            if (reward) {
              // Apply milestone rewards
              gameState.coins += reward.coins || 0;
              gameState.oxygen = Math.min(100, gameState.oxygen + (reward.oxygen || 0));
              gameState.energy += reward.energy || 0;
              gameState.shields += reward.shields || 0;
              gameState.pollution = Math.max(0, gameState.pollution - 2);
              showFloating(p, `🎓 Milestone ${milestone}!`);
              audioReward();
              updateHUD();
            }
          }
        }

        // on landing, compute events
        let landed = await handleLanding(currentIdx);

        // Additional learning bonus for passing sections
        if (Math.floor(landed / 10) > Math.floor(startPos / 10)) {
          gameState.coins += 1;
          showFloating(p, "📚 +1 coin");
          audioReward();
        }

        // win check
        if (landed >= BOARD_SIZE) {
          audioReward();
          confetti.spawn(120);
          showBigMessage(`${p.name} ${isAI ? '(Computer)' : ''} wins! 🎉`);
          rollBtn.disabled = true;
          animating = false;
          
          // Dispatch custom event to notify parent that game is completed
          window.dispatchEvent(new CustomEvent('ecoGameCompleted', { 
            detail: { 
              winner: p.name, 
              isPlayerWin: !isAI,
              coins: gameState.coins,
              oxygen: gameState.oxygen 
            } 
          }));
          
          return;
        }

        // next player
        currentIdx = (currentIdx + 1) % players.length;
        updateCurrent();
        diceEl.textContent = "-";
        animating = false;
        updateHUD();
        
        // If next player is AI (Computer), auto-roll after delay
        if (players[currentIdx].isAI) {
          rollBtn.disabled = true;
          msg.textContent = "🤖 Computer is thinking...";
          setTimeout(() => {
            handleRoll(true);
          }, 1500);
        } else {
          rollBtn.disabled = false;
          msg.textContent = `🎲 ${players[currentIdx].name}'s turn - Roll the dice!`;
        }
      }
      
      // Show next educational fact in the learning panel
      // Returns a Promise that resolves when popup is dismissed
      // Player: Control (1st, 3rd, 5th...) → Impact (2nd, 4th, 6th...)
      // Computer: Impact (1st, 3rd, 5th...) → Control (2nd, 4th, 6th...)
      function showNextFact(isAI = false) {
        return new Promise((resolve) => {
          let fact;
          
          if (isAI) {
            // Computer: Impact on even turns (0,2,4...), Control on odd turns (1,3,5...)
            if (computerFactIndex % 2 === 0) {
              fact = IMPACT_FACTS[Math.floor(computerFactIndex / 2) % IMPACT_FACTS.length];
            } else {
              fact = CONTROL_FACTS[Math.floor(computerFactIndex / 2) % CONTROL_FACTS.length];
            }
            computerFactIndex++;
          } else {
            // Player: Control on even turns (0,2,4...), Impact on odd turns (1,3,5...)
            if (playerFactIndex % 2 === 0) {
              fact = CONTROL_FACTS[Math.floor(playerFactIndex / 2) % CONTROL_FACTS.length];
            } else {
              fact = IMPACT_FACTS[Math.floor(playerFactIndex / 2) % IMPACT_FACTS.length];
            }
            playerFactIndex++;
          }
          
          updateLearningPanel(fact, fact.type, isAI, resolve);
          
          // Track learning
          if (fact.type === 'impact') {
            const idx = AIR_POLLUTION_FACTS.impacts.findIndex(f => f.title === fact.title);
            if (idx >= 0 && !factsLearned.impacts.includes(idx)) {
              factsLearned.impacts.push(idx);
            }
          } else if (fact.type === 'control') {
            const idx = AIR_POLLUTION_FACTS.controls.findIndex(f => f.title === fact.title);
            if (idx >= 0 && !factsLearned.controls.includes(idx)) {
              factsLearned.controls.push(idx);
            }
          }
          updateHUD();
        });
      }
      
      // Show centered popup with educational fact
      function updateLearningPanel(fact, type, isAI = false, onDismiss = null) {
        // Remove any existing popup
        const existingPopup = document.getElementById('factPopup');
        if (existingPopup) existingPopup.remove();
        
        const colors = {
          impact: { bg: 'linear-gradient(135deg, #fef2f2, #fff)', border: '#fca5a5', label: '⚠️ POLLUTION IMPACT', labelColor: '#dc2626', btnBg: 'linear-gradient(180deg, #f87171, #ef4444)' },
          control: { bg: 'linear-gradient(135deg, #f0fdf4, #fff)', border: '#86efac', label: '✅ CONTROL MEASURE', labelColor: '#16a34a', btnBg: 'linear-gradient(180deg, #34d399, #10b981)' },
          milestone: { bg: 'linear-gradient(135deg, #eff6ff, #fff)', border: '#93c5fd', label: '🎓 MILESTONE FACT', labelColor: '#2563eb', btnBg: 'linear-gradient(180deg, #60a5fa, #3b82f6)' },
          tip: { bg: 'linear-gradient(135deg, #fefce8, #fff)', border: '#fde047', label: '💡 DID YOU KNOW?', labelColor: '#ca8a04', btnBg: 'linear-gradient(180deg, #fbbf24, #f59e0b)' }
        };
        
        const style = colors[type] || colors.tip;
        const playerLabel = isAI ? '🤖 Computer\'s Turn' : '👦 Your Turn';
        const buttonText = isAI ? '🤖 Computer Learned! Next →' : '📚 I Learned This! Roll Dice →';
        
        // Create overlay
        const overlay = document.createElement('div');
        overlay.id = 'factPopup';
        overlay.style.cssText = `
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
          padding: 20px;
          animation: fadeIn 0.3s ease-out;
        `;
        
        // Create popup
        const popup = document.createElement('div');
        popup.style.cssText = `
          background: ${style.bg};
          border: 5px solid ${style.border};
          border-radius: 20px;
          padding: 24px;
          max-width: 480px;
          width: 90%;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4);
          animation: popIn 0.3s ease-out;
          text-align: center;
        `;
        
        popup.innerHTML = `
          <div style="background: ${isAI ? '#dbeafe' : '#fef3c7'}; padding: 8px 16px; border-radius: 20px; display: inline-block; margin-bottom: 12px; font-weight: 900; font-size: 14px; color: ${isAI ? '#1e40af' : '#92400e'};">${playerLabel}</div>
          <div style="font-size: 50px; margin-bottom: 12px;">${fact.icon}</div>
          <div style="font-size: 11px; font-weight: 900; color: ${style.labelColor}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">${style.label}</div>
          <h3 style="margin: 0 0 12px; color: #0f172a; font-size: 20px; font-family: 'Baloo 2', cursive; line-height: 1.3;">${fact.title}</h3>
          <p style="margin: 0 0 16px; color: #334155; font-size: 15px; line-height: 1.6; font-weight: 600;">${fact.content}</p>
          <div style="display: flex; gap: 8px; justify-content: center; margin-bottom: 16px; flex-wrap: wrap;">
            ${fact.reward?.coins ? `<span style="background: #fef3c7; padding: 5px 10px; border-radius: 15px; font-weight: 800; font-size: 12px;">🪙 +${fact.reward.coins}</span>` : ''}
            ${fact.reward?.oxygen ? `<span style="background: #dcfce7; padding: 5px 10px; border-radius: 15px; font-weight: 800; font-size: 12px;">🍃 +${fact.reward.oxygen}</span>` : ''}
            ${fact.reward?.energy ? `<span style="background: #e0f2fe; padding: 5px 10px; border-radius: 15px; font-weight: 800; font-size: 12px;">⚡ +${fact.reward.energy}</span>` : ''}
            ${fact.reward?.shields ? `<span style="background: #ede9fe; padding: 5px 10px; border-radius: 15px; font-weight: 800; font-size: 12px;">🛡 +${fact.reward.shields}</span>` : ''}
          </div>
          <button id="factOkBtn" style="
            width: 100%;
            padding: 14px;
            border: none;
            border-radius: 12px;
            font-weight: 900;
            cursor: pointer;
            background: ${style.btnBg};
            color: #fff;
            font-size: 16px;
            transition: transform 0.2s;
          ">${buttonText}</button>
          ${isAI ? '<p style="margin: 8px 0 0; font-size: 12px; color: #64748b;">Auto-continuing in 3 seconds...</p>' : ''}
        `;
        
        overlay.appendChild(popup);
        document.body.appendChild(overlay);
        
        // Add animations
        const styleEl = document.createElement('style');
        styleEl.textContent = `
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes popIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        `;
        overlay.appendChild(styleEl);
        
        let dismissed = false;
        const dismissPopup = () => {
          if (dismissed) return;
          dismissed = true;
          overlay.style.animation = 'fadeIn 0.2s ease-out reverse';
          popup.style.animation = 'popIn 0.2s ease-out reverse';
          setTimeout(() => {
            overlay.remove();
            if (onDismiss) onDismiss();
          }, 200);
        };
        
        // Button click - always works
        popup.querySelector('#factOkBtn').onclick = dismissPopup;
        
        // Auto-dismiss only for AI (Computer) after 3 seconds
        if (isAI) {
          setTimeout(dismissPopup, 3000);
        }
        
        // Also update the side panel for reference
        learningPanel = document.getElementById('learningPanel');
        if (learningPanel) {
          learningPanel.style.background = style.bg;
          learningPanel.style.borderColor = style.border;
          learningPanel.innerHTML = `
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
              <span style="font-size:28px;">${fact.icon}</span>
              <div>
                <div style="font-size:9px;font-weight:900;color:${style.labelColor};text-transform:uppercase;">${style.label}</div>
                <div style="font-weight:800;color:#0f172a;font-size:12px;line-height:1.2;">${fact.title}</div>
              </div>
            </div>
            <p style="margin:0;color:#334155;font-size:11px;line-height:1.4;font-weight:600;">${fact.content.substring(0, 100)}...</p>
          `;
        }
      }

      /* ---------- UI and init ---------- */
      function updateCurrent() {
        currentName.textContent = `${players[currentIdx].name} ${players[currentIdx].avatar}`;
        const rows = playersCompact.querySelectorAll(".player-compact");
        rows.forEach((r, idx) => {
          r.style.border =
            idx === currentIdx
              ? "2px solid #fde68a"
              : "1px solid rgba(0,0,0,0.06)";
        });
      }

      function showBigMessage(text) {
        msg.textContent = text;
        msg.classList.add("glow");
        setTimeout(() => {
          msg.classList.remove("glow");
          msg.textContent = "Game over — Reset to play again.";
        }, 3800);
      }

      function init() {
        buildBoard();
        drawLines();
        // Player 1 is human, Player 2 is Computer (AI)
        players = [
          { id: 0, name: "You", avatar: "👦", color: "#FF5E5E", position: 1, isAI: false },
          { id: 1, name: "Computer", avatar: "🤖", color: "#5EBEFF", position: 1, isAI: true },
        ];
        // create player rows
        playersCompact.innerHTML = "";
        players.forEach((p, i) => {
          const row = document.createElement("div");
          row.className = "player-compact";
          const isAI = p.isAI;
          row.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px">
          <div class="avatar" style="background:${p.color}">${p.avatar}</div>
          <div style="display:flex;flex-direction:column">
            ${isAI 
              ? `<div style="font-weight:800;color:#0f172a;padding:6px 0;">🤖 ${p.name}</div>`
              : `<input class="name-input" value="${p.name}" data-index="${i}" placeholder="Your name" />`
            }
            <div style="font-size:11px;color:#64748b">Pos: <span data-pos>1</span></div>
          </div>
        </div>
        ${!isAI ? `
        <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end">
          <button class="small-btn" data-action="avatar" data-index="${i}">Avatar</button>
          <button class="small-btn" data-action="color" data-index="${i}">Color</button>
        </div>` : `<div style="font-size:11px;color:#64748b;font-weight:700;">AI Opponent</div>`}`;
          playersCompact.appendChild(row);
        });

        // wire avatar/color/name inputs (only for human player)
        const avatarOptions = ['👦', '👧', '🧑', '👨', '👩', '🧔', '👴', '👵', '🦸', '🦹', '👻', '🐼', '🐯', '🦁', '🐸'];
        const colorOptions = ['#FF5E5E', '#5EBEFF', '#4ADE80', '#FBBF24', '#A78BFA', '#F472B6', '#22D3EE'];
        let avatarIdx = 0;
        let colorIdx = 0;
        
        playersCompact.querySelectorAll("button[data-action]").forEach((btn) => {
          btn.addEventListener("click", () => {
            const idx = +btn.dataset.index;
            if (players[idx].isAI) return; // Don't allow changing AI
            
            const row = btn.closest(".player-compact");
            const avatarEl = row.querySelector(".avatar");
            
            if (btn.dataset.action === "avatar") {
              // Cycle through avatar options
              avatarIdx = (avatarIdx + 1) % avatarOptions.length;
              avatarEl.textContent = avatarOptions[avatarIdx];
              players[idx].avatar = avatarOptions[avatarIdx];
            } else {
              // Cycle through color options
              colorIdx = (colorIdx + 1) % colorOptions.length;
              avatarEl.style.background = colorOptions[colorIdx];
              players[idx].color = colorOptions[colorIdx];
            }
            placePieces();
          });
        });
        playersCompact.querySelectorAll(".name-input").forEach((inp) => {
          inp.addEventListener("input", () => {
            const idx = +inp.dataset.index;
            players[idx].name = inp.value;
            updateCurrent();
          });
        });

        // HUD & pieces
        updateHUD();
        placePieces();
        updateCurrent();
        rollBtn.disabled = false;
      }

      // events
      rollBtn.addEventListener("click", () => handleRoll(false));
      resetBtn.addEventListener("click", () => {
        // Remove any existing popup
        const existingPopup = document.getElementById('factPopup');
        if (existingPopup) existingPopup.remove();
        
        players.forEach((p) => (p.position = 1));
        currentIdx = 0;
        gameState = {
          oxygen: 72,
          pollution: 18,
          coins: 0,
          energy: 0,
          shields: 0,
        };
        factsLearned = { impacts: [], controls: [] }; // Reset learning progress
        lastTipIndex = -1; // Reset tip tracking
        playerFactIndex = 0; // Reset player fact index
        computerFactIndex = 0; // Reset computer fact index
        updateHUD();
        placePieces();
        updateCurrent();
        msg.textContent = "🎲 Your turn! Roll the dice to learn about air pollution!";
        rollBtn.disabled = false;
        
        // Reset learning panel
        learningPanel = document.getElementById('learningPanel');
        if (learningPanel) {
          learningPanel.innerHTML = `
            <div style="text-align:center;padding:15px;">
              <div style="font-size:32px;margin-bottom:8px;">🌍</div>
              <div style="font-weight:800;color:#16a34a;font-size:13px;">Last fact you learned will show here</div>
            </div>
          `;
        }
      });
      kidModeCheckbox.addEventListener("change", () => {
        kidMode = kidModeCheckbox.checked;
        document
          .getElementById("container")
          .classList.toggle("kid", kidMode);
        placePieces();
      });
      quizModeCheckbox.addEventListener(
        "change",
        () => (quizMode = quizModeCheckbox.checked)
      );

      // HELP popup: show/hide handlers (replaces alert)
      helpBtn.addEventListener("click", () => {
        helpPopup.classList.add("show");
        helpPopup.setAttribute("aria-hidden", "false");
        // simple focus trap: focus close button
        if (helpClose) helpClose.focus();
      });
      helpClose.addEventListener("click", () => {
        helpPopup.classList.remove("show");
        helpPopup.setAttribute("aria-hidden", "true");
      });
      helpMore.addEventListener("click", () => {
        // Expand with more tips in the popup
        const more = document.createElement("div");
        more.style.marginTop = "10px";
        more.innerHTML = `
      <p style="font-weight:800">Advanced Tips:</p>
      <ul style="padding-left:18px;margin:6px 0 0 0">
        <li>Use Shields strategically on red-heavy areas.</li>
        <li>Green Dice yields more rewards — safe for beginners.</li>
        <li>Energy usage is temporary but can secure a ladder if timed right.</li>
      </ul>
    `;
        const helpText = document.getElementById("helpText");
        // Prevent duplicate append
        if (!helpText.dataset.more) {
          helpText.appendChild(more);
          helpText.dataset.more = "1";
        }
      });
      // close on backdrop click
      helpPopup.addEventListener("click", (e) => {
        if (e.target === helpPopup) {
          helpPopup.classList.remove("show");
          helpPopup.setAttribute("aria-hidden", "true");
        }
      });
      // close on escape
      window.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && helpPopup.classList.contains("show")) {
          helpPopup.classList.remove("show");
          helpPopup.setAttribute("aria-hidden", "true");
        }
      });

      helpBtn.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          helpBtn.click();
        }
      });

      // utility: update displayed positions in compact rows
      function refreshPositions() {
        playersCompact.querySelectorAll(".player-compact").forEach((r, idx) => {
          const sp = r.querySelector("[data-pos]");
          sp.textContent = players[idx].position;
        });
      }

      // after every move, call this interval to refresh positions & HUD
      setInterval(() => {
        refreshPositions();
        updateHUD();
      }, 400);

      // minimal unlock: use arrow keys to open audio context on first keypress
      window.addEventListener("keydown", function onFirst() {
        if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
        window.removeEventListener("keydown", onFirst);
      });

      // initialize confetti and UI
      init();

      // expose for debugging (optional)
      window.__eco = { players, gameState, animateSteps, start: init };
    })();
  }, []);

  return (
    <div className="snake-game-root">
      <style>{`
  .snake-game-root {
    --bg: linear-gradient(180deg,#FFFBEB 0%, #ECFCCB 50%, #C7EAFB 100%);
    --card:#fff;
    --accent:#10b981;
    --accent-2:#06b6d4;
    --danger:#ef4444;
    --tile-size:56px;
    --board-gap:10px;
    --glow: 0 10px 30px rgba(16,185,129,0.18);
    font-family: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
    background: var(--bg);
    display:flex;
    align-items:flex-start;
    justify-content:center;
    padding: 80px 20px 20px 20px;
    color:#062017;
    min-height:100vh;
    width: 100%;
    box-sizing: border-box;
  }
  .snake-game-root *{box-sizing:border-box}
  .snake-game-root .container {
    width:100%;
    max-width:1400px;
    display:flex;
    flex-wrap:wrap;
    gap:20px;
    align-items:flex-start;
    justify-content:center;
    padding:10px;
  }
  .snake-game-root .board-card {
    width:680px;
    min-height:720px;
    background:linear-gradient(180deg,#fffaf0,#fff6ea);
    border-radius:16px;border:6px solid #FDE68A;
    box-shadow: 0 12px 30px rgba(0,0,0,0.12);padding:20px;position:relative;overflow:visible;
  }
  .snake-game-root .board-area { 
    width:620px;
    height:620px;
    margin:10px auto;
    border-radius:12px;
    background: linear-gradient(180deg,#FEF3C7,#FFEDD5);
    display:grid;
    grid-template-columns:repeat(10,1fr);
    grid-template-rows:repeat(10,1fr);
    gap:2px;
    border:4px solid #FFEDD5;
    position:relative;
  }
  .snake-game-root .tile { 
    position:relative;
    background: linear-gradient(180deg,#fff,#fff8f0);
    display:flex;
    align-items:flex-start;
    justify-content:flex-start;
    padding:4px;
    font-weight:800;
    color:#6b7280;
    font-size:11px;
    border-radius:6px;
    transition:transform .18s, box-shadow .18s;
    overflow:hidden;
    min-width:0;
    min-height:0;
  }
  .snake-game-root .tile .num { font-size:10px;color:#374151;background:rgba(255,255,255,0.9);padding:1px 4px;border-radius:6px;border:1px solid rgba(0,0,0,0.05); }
  .snake-game-root .tile .event { font-size:9px;position:absolute;bottom:2px;left:2px;right:2px;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis; }
  .snake-game-root .tile.green{ box-shadow: 0 6px 18px rgba(34,197,94,0.12); border:2px solid rgba(34,197,94,0.12); }
  .snake-game-root .tile.red{ box-shadow: 0 6px 18px rgba(239,68,68,0.10); border:2px solid rgba(239,68,68,0.10); }
  .snake-game-root .tile.event{ font-size:11px;color:#0f172a;padding:6px;display:flex;align-items:center;justify-content:center;font-weight:800; }

  .snake-game-root .overlay{ position:absolute; left:20px; top:30px; width:620px; height:620px; pointer-events:none; z-index:4;}
  .snake-game-root .pieces{ position:absolute; left:20px; top:30px; width:620px; height:620px; pointer-events:none; z-index:6;}
  .snake-game-root .piece{ position:absolute;width:46px;height:46px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-weight:900;font-size:20px;transform: translate(-50%,-50%);box-shadow:0 8px 20px rgba(0,0,0,0.18);border:4px solid #fff;transition:transform 220ms cubic-bezier(.2,.9,.2,1), left 220ms linear, top 220ms linear;}
  .snake-game-root .piece.big{ width:64px;height:64px;font-size:26px;}
  .snake-game-root .snake-img{ position:absolute;width:48px;height:36px;transform: translate(-50%,-50%);pointer-events:none }

  /* panel */
  .snake-game-root .panel{ 
    width:420px;
    min-width:350px;
    min-height:720px;
    background:#fff;
    border-radius:14px;
    border:6px solid #DBEAFE; 
    box-shadow:0 10px 30px rgba(0,0,0,0.12); 
    padding:14px; 
    display:flex; 
    flex-direction:column; 
    gap:12px; 
    overflow:visible;
  }
  .snake-game-root .title{ font-family:"Baloo 2", cursive; font-size:22px; color:#16a34a; margin:0 }
  .snake-game-root .subtitle{ font-weight:800; color:#0f172a; font-size:13px }
  .snake-game-root .players-compact{ display:flex; flex-direction:column; gap:8px; max-height:260px; overflow:auto; padding-right:6px }
  .snake-game-root .player-compact{ display:flex; align-items:center; justify-content:space-between; gap:8px; padding:8px 10px; border-radius:10px; background:linear-gradient(180deg,#fbf7ff,#fff); border:1px solid rgba(0,0,0,0.04)}
  .snake-game-root .avatar{ width:46px;height:46px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-weight:900;color:#fff;font-size:20px;border:3px solid rgba(255,255,255,0.9)}
  .snake-game-root .name-input{ width:160px;padding:6px;border-radius:8px;border:2px solid #eef2ff;font-weight:800}
  .snake-game-root .controls{ display:flex; flex-direction:column; gap:8px; margin-top:6px }
  .snake-game-root .dice-box{ font-size:28px; font-weight:900; color:#0369a1; text-align:center; padding:8px 0; }
  .snake-game-root .roll-btn{ padding:12px; border-radius:12px; background:linear-gradient(180deg,#34d399,#10b981); color:#fff; font-weight:900; border:6px solid #86efac; cursor:pointer; font-size:18px; box-shadow:var(--glow) }
  .snake-game-root .roll-btn[disabled]{ opacity:0.6; cursor:not-allowed }
  .snake-game-root .small-row{ display:flex; gap:8px; align-items:center }
  .snake-game-root .small-btn{ padding:8px 10px; border-radius:10px; background:#fff; border:1px solid rgba(0,0,0,0.06); cursor:pointer; font-weight:800 }
  .snake-game-root .message{ padding:8px; border-radius:10px; background:linear-gradient(180deg,#ecfeff,#ffffff); border:2px solid #bbf7d0; font-weight:800; color:#064e3b; text-align:center; min-height:40px; display:flex; align-items:center; justify-content:center }
  .snake-game-root .footer-compact{ margin-top:auto; display:flex; gap:8px; align-items:center; justify-content:space-between }
  .snake-game-root .reset{ background:#fee2e2;border:1px solid #fecaca;padding:10px;border-radius:10px;font-weight:900;cursor:pointer }
  .snake-game-root .help{ background:#fff;border:1px solid #e6eef8;padding:10px;border-radius:10px;font-weight:800;cursor:pointer }

  /* HUD badges */
  .snake-game-root .hud{ display:flex; gap:8px; align-items:center; margin-top:6px; flex-wrap:wrap }
  .snake-game-root .badge{ background:linear-gradient(90deg,#ffffff,#f0fff4); padding:8px 10px; border-radius:12px; font-weight:800; display:flex; gap:8px; align-items:center; box-shadow: 0 6px 18px rgba(0,0,0,0.06) }
  .snake-game-root .meter{ width:160px; height:10px; background:rgba(0,0,0,0.06); border-radius:8px; overflow:hidden; }
  .snake-game-root .meter > i{ display:block; height:100%; background:linear-gradient(90deg,#10b981,#34d399); width:40%; transition:width 360ms; }

  /* effects */
  .snake-game-root .glow { box-shadow: 0 8px 30px rgba(16,185,129,0.28), 0 2px 6px rgba(16,185,129,0.08); transform:translateY(-3px); transition: all 240ms; }
  .snake-game-root .shake { animation: shakeX .52s ease-in-out; }
  @keyframes shakeX { 10%{transform:translateX(-6px)} 30%{transform:translateX(6px)} 50%{transform:translateX(-4px)} 70%{transform:translateX(4px)} 100%{transform:translateX(0)} }

  .snake-game-root .confetti-canvas{ position:fixed; left:0; top:0; width:100%; height:100%; pointer-events:none; z-index:9999; display:none; }

  /* HELP POPUP - added styles */
  .snake-game-root .help-modal {
    position: fixed;
    inset: 0;
    display: none;
    align-items: center;
    justify-content: center;
    background: rgba(2,6,23,0.52);
    z-index: 99999;
    padding: 18px;
  }
  .snake-game-root .help-modal.show { display:flex; }
  .snake-game-root .help-modal-content {
    width: 480px;
    max-width: calc(100% - 40px);
    max-height: 84vh;
    overflow:auto;
    background: linear-gradient(180deg,#ffffff,#f7fffa);
    border-radius: 14px;
    padding: 20px;
    box-shadow: 0 12px 40px rgba(3,7,18,0.36);
    border: 6px solid rgba(255,255,255,0.6);
    font-family: "Inter", sans-serif;
  }
  .snake-game-root .help-modal h2 { margin:0 0 8px; font-family:'Baloo 2', cursive; color:var(--accent); font-size:20px; }
  .snake-game-root .help-modal p { margin:8px 0; color:#0f172a; font-weight:700; line-height:1.45; font-size:14px; }
  .snake-game-root .help-modal .help-actions { margin-top:12px; display:flex; gap:8px; }
  .snake-game-root .help-modal .btn { flex:1; padding:10px 12px; border-radius:10px; border:0; cursor:pointer; font-weight:900; }
  .snake-game-root .help-modal .btn.primary { background:var(--accent); color:#fff; }
  .snake-game-root .help-modal .btn.ghost { background:#fff; border:1px solid rgba(0,0,0,0.06); }

  /* Learning panel styles */
  .snake-game-root .learning-panel {
    background: linear-gradient(135deg, #f0fdf4, #fff);
    border: 3px solid #86efac;
    border-radius: 12px;
    padding: 14px;
    min-height: 120px;
    transition: all 0.3s ease;
  }
  @keyframes panelGlow {
    0% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.5); transform: scale(1.01); }
    100% { box-shadow: 0 4px 12px rgba(0,0,0,0.1); transform: scale(1); }
  }
  
  /* Dice animation */
  .snake-game-root .dice-box {
    transition: transform 0.1s;
  }
  .snake-game-root .dice-rolling {
    animation: diceShake 0.1s infinite;
  }
  @keyframes diceShake {
    0%, 100% { transform: rotate(-5deg); }
    50% { transform: rotate(5deg); }
  }

  /* small responsive */
  @media (max-width:1200px){ 
    .snake-game-root .container{ max-width:100%; } 
    .snake-game-root .board-card{ width:auto; max-width:680px; }
    .snake-game-root .panel{ width:100%; max-width:420px; }
  }
  @media (max-width:900px){ 
    .snake-game-root {padding:70px 10px 10px 10px} 
    .snake-game-root .container{ flex-direction:column; align-items:center; } 
    .snake-game-root .board-card{ width:100%; max-width:100%; margin-bottom:20px; } 
    .snake-game-root .board-area{ width:100%; height:auto; aspect-ratio:1; max-width:620px; }
    .snake-game-root .panel{ width:100%; max-width:100%; min-height:auto; } 
  }
      `}</style>

      <div className="container" id="container">
        <div className="board-card">
          <div className="board-area" id="boardArea" />
          <svg
            className="overlay"
            id="overlay"
            viewBox="0 0 620 620"
            preserveAspectRatio="xMidYMid meet"
          />
          <div className="pieces" id="pieces" />
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "8px",
              transform: "translateX(-50%)",
              fontSize: "20px",
            }}
          >
            🏁 FINISH
          </div>
        </div>

        <div className="panel" id="panel">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <h1 className="title">🌍 Eco Snakes &amp; Ladders</h1>
              <div className="subtitle">
                Learn About Air Pollution • You vs Computer • Educational Game
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 900, color: "#0f172a" }}>👦 vs 🤖</div>
              <div style={{ fontSize: "12px", color: "#475569" }}>
                Single Player
              </div>
            </div>
          </div>

          <div className="hud" id="hud">
            <div className="badge">
              🍃 Oxygen{" "}
              <div className="meter" style={{ marginLeft: "6px" }}>
                <i id="oxygenBar" style={{ width: "72%" }} />
              </div>
            </div>
            <div className="badge">
              🌫 Pollution{" "}
              <div className="meter" style={{ marginLeft: "6px" }}>
                <i
                  id="pollutionBar"
                  style={{
                    width: "18%",
                    background: "linear-gradient(90deg,#f97316,#ef4444)",
                  }}
                />
              </div>
            </div>
            <div className="badge">
              📚 Facts{" "}
              <span
                id="factsLearned"
                style={{ marginLeft: "6px", fontWeight: 900 }}
              >
                0/16
              </span>
            </div>
            <div className="badge">
              🪙 Eco-Coins{" "}
              <span
                id="ecoCoins"
                style={{ marginLeft: "6px", fontWeight: 900 }}
              >
                0
              </span>
            </div>
            <div className="badge">
              ⚡ Energy{" "}
              <span
                id="energyPts"
                style={{ marginLeft: "6px", fontWeight: 900 }}
              >
                0
              </span>
            </div>
            <div className="badge">
              🛡 Shield{" "}
              <span
                id="shields"
                style={{ marginLeft: "6px", fontWeight: 900 }}
              >
                0
              </span>
            </div>
          </div>

          {/* Learning Panel - Shows last learned fact for reference */}
          <div id="learningPanel" className="learning-panel" style={{ minHeight: "80px" }}>
            <div style={{ textAlign: "center", padding: "12px" }}>
              <div style={{ fontSize: "28px", marginBottom: "6px" }}>🌍</div>
              <div style={{ fontWeight: 800, color: "#16a34a", fontSize: "12px" }}>Last fact you learned shows here</div>
            </div>
          </div>

          <div className="players-compact\" id="playersCompact" />

          <div className="controls">
            <div
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "center",
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                    fontWeight: 800,
                  }}
                >
                  Current Turn
                </div>
                <div
                  id="currentName"
                  style={{
                    fontWeight: 900,
                    fontSize: "16px",
                    color: "#0f172a",
                  }}
                >
                  —
                </div>
              </div>
              <div style={{ width: "80px", textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#64748b",
                    fontWeight: 800,
                  }}
                >
                  Dice
                </div>
                <div id="dice" className="dice-box">
                  -
                </div>
              </div>
              <button id="rollBtn" className="roll-btn" disabled>
                🎲 Roll!
              </button>
            </div>

            <div id="msg" className="message" style={{ display: "block" }}>
              🌍 Your turn! Roll the dice and learn about air pollution!
            </div>
            
            {/* Hidden dice set selector */}
            <select id="diceSet" style={{ display: "none" }}>
              <option value="normal">Standard</option>
              <option value="eco">Eco</option>
              <option value="risk">Risk</option>
            </select>
            <input id="kidMode" type="checkbox" style={{ display: "none" }} />
            <input id="quizMode" type="checkbox" defaultChecked style={{ display: "none" }} />
          </div>

          <div className="footer-compact">
            <div style={{ display: "flex", gap: "8px" }}>
              <button id="resetBtn" className="reset">
                Reset
              </button>
              <button id="helpBtn" className="help">
                How to play
              </button>
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#475569",
                fontWeight: 800,
              }}
            >
              Made for 1366×768 — Full Advanced Pack
            </div>
          </div>
        </div>
      </div>

      {/* HELP POPUP */}
      <div
        id="helpPopup"
        className="help-modal"
        aria-hidden="true"
        role="dialog"
        aria-modal="true"
      >
        <div className="help-modal-content" role="document">
          <h2>🌍 Learn About Air Pollution - You vs Computer!</h2>
          <div id="helpText" style={{ marginTop: "8px" }}>
            <p><strong>🎯 Goal:</strong> Race against the computer to reach tile 100 while learning!</p>
            <p>
              <strong>🎲 Every Roll = New Fact:</strong> Each time you roll the dice, a new educational fact about air pollution appears in the learning panel!
            </p>
            <p>
              <strong>🟢 Green Tiles:</strong> Learn <em>Control Measures</em> - ways to reduce pollution. Earn bonus rewards!
            </p>
            <p>
              <strong>🔴 Red Tiles:</strong> Learn <em>Pollution Impacts</em> - understand the dangers. Shields protect you!
            </p>
            <p>
              <strong>🤖 Computer Opponent:</strong> After your turn, the computer automatically plays. Try to beat it!
            </p>
            <p>
              <strong>⚡ Power-ups:</strong> Auto-used when beneficial. Energy gives +2 moves, Shield blocks penalties.
            </p>
            <p
              style={{
                marginTop: "8px",
                fontWeight: 800,
                color: "#16a34a",
                background: "#f0fdf4",
                padding: "8px",
                borderRadius: "8px"
              }}
            >
              💡 No popups! Just roll and learn - facts appear automatically!
            </p>
          </div>
          <div className="help-actions" style={{ marginTop: "12px" }}>
            <button id="helpClose" className="btn primary">
              OK
            </button>
            <button id="helpMore" className="btn ghost">
              More Tips
            </button>
          </div>
        </div>
      </div>

      <canvas id="confetti" className="confetti-canvas" />
    </div>
  );
};

export default EcoSnakesLadders;
