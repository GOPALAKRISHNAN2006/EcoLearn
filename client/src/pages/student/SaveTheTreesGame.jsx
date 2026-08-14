import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const COIN = "🪙";
const COIN_BAG = "💰";
const TREE = "🌳";
const SAPLING = "🌱";
const OXYGEN = "🌍";
const WIND = "🌬";
const AXE = "🪓";
const PLANT = "🌱";

const MAX_PLANT_PER_DAY = 20;
const MAX_CUT_PER_DAY = 10;
const initialState = {
  coins: 20,
  oxygen: 60,
  forest: [1,1,0,1,0,0,1,0,0], // 1=tree, 0=sapling
  message: "Great work! Keep it up!",
  plantedToday: 0,
  cutToday: 0,
  animatingIndex: null,
  animatingType: null, // 'plant' | 'cut'
};

const loseState = {
  coins: 20,
  oxygen: 60,
  forest: [1,1,0,1,0,0,1,0,0],
  message: "You are out!",
  plantedToday: 0,
  cutToday: 0,
  animatingIndex: null,
  animatingType: null,
};


const SaveTheTreesGame = () => {
  const [state, setState] = useState(initialState);
  const navigate = useNavigate();

  // Watch for losing condition
  // Always calculate tree count from forest array
  const treeCount = state.forest.filter(cell => cell === 1).length;
  useEffect(() => {
    if (treeCount < 1) {
      setTimeout(() => {
        setState(loseState);
        setTimeout(() => {
          navigate("/student-dashboard");
        }, 2000);
      }, 700);
    }
  }, [treeCount, navigate]);

  // Plant tree logic
  const handlePlant = () => {
    if (state.plantedToday >= MAX_PLANT_PER_DAY) {
      setState(s => ({ ...s, message: `You've planted ${MAX_PLANT_PER_DAY} trees today! Come back tomorrow.` }));
      return;
    }
    // Find first sapling
    const idx = state.forest.findIndex(cell => cell === 0);
    if (idx === -1) {
      setState(s => ({ ...s, message: "No empty spot to plant!" }));
      return;
    }
    setState(s => ({
      ...s,
      animatingIndex: idx,
      animatingType: 'plant',
    }));
    setTimeout(() => {
      setState(s => {
        const newForest = [...s.forest];
        newForest[idx] = 1;
        return {
          ...s,
          oxygen: s.oxygen + 8,
          coins: s.coins + 10,
          plantedToday: s.plantedToday + 1,
          forest: newForest,
          message: "Great job planting trees! 🌱💚 (+10 coins)",
          animatingIndex: null,
          animatingType: null,
        };
      });
    }, 700);
  };

  // Cut tree logic
  const handleCut = () => {
    if (state.cutToday >= MAX_CUT_PER_DAY) {
      setState(s => ({ ...s, message: `You've cut ${MAX_CUT_PER_DAY} trees today! Come back tomorrow.` }));
      return;
    }
    // Find first tree
    const idx = state.forest.findIndex(cell => cell === 1);
    if (idx === -1) {
      setState(s => ({ ...s, message: "No trees left to cut!" }));
      return;
    }
    setState(s => ({
      ...s,
      animatingIndex: idx,
      animatingType: 'cut',
    }));
    setTimeout(() => {
      setState(s => {
        const newForest = [...s.forest];
        newForest[idx] = 0;
        return {
          ...s,
          oxygen: s.oxygen - 5,
          coins: s.coins + 5,
          cutToday: s.cutToday + 1,
          forest: newForest,
          message: "Tree cut! Be careful, oxygen is going down! (-5 coins)",
          animatingIndex: null,
          animatingType: null,
        };
      });
    }, 700);
  };

  const handleReset = () => {
    setState(initialState);
  };

  return (
    <div className="min-h-screen bg-[#eafdff] flex flex-col">
      {/* Header - More Attractive */}
      <div className="relative px-8 py-8 rounded-b-[40px] shadow-2xl flex flex-col md:flex-row md:items-center md:justify-between overflow-hidden" style={{background: 'linear-gradient(90deg, #38b000 0%, #60efbc 100%)'}}>
        {/* Decorative Eco Icons */}
        <div className="absolute left-8 top-4 text-5xl opacity-30 select-none pointer-events-none animate-header-leaf">🌿</div>
        <div className="absolute right-8 top-6 text-5xl opacity-30 select-none pointer-events-none animate-header-bird">🕊</div>
        <div className="absolute left-1/2 -translate-x-1/2 top-0 text-6xl opacity-20 select-none pointer-events-none animate-header-earth">🌍</div>
        <div className="flex flex-col md:flex-row md:items-center gap-4 z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white flex items-center gap-4 drop-shadow-lg tracking-wide animate-fade-in-up">
            <span className="text-6xl">{TREE}</span>
            <span className="bg-gradient-to-r from-yellow-200 via-green-100 to-blue-200 bg-clip-text text-transparent">Save the Forest</span>
            <span className="text-6xl">{TREE}</span>
          </h1>
          <span className="ml-2 px-4 py-2 rounded-full bg-white/20 text-green-100 font-bold text-lg shadow-md animate-fade-in-up delay-150">An Educational Adventure Game</span>
        </div>
        <div className="flex gap-4 mt-6 md:mt-0 items-center z-10">
          <button className="bg-purple-500 hover:bg-purple-600 text-white font-bold px-7 py-3 rounded-full text-xl shadow-lg flex items-center gap-2 transition-all duration-200">
            🏆 Badges
          </button>
          <button onClick={handleReset} className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-7 py-3 rounded-full text-xl shadow-lg flex items-center gap-2 transition-all duration-200">
            🔄 Reset
          </button>
        </div>
        <style>{`
          @keyframes header-leaf {
            0%, 100% { transform: translateY(0) rotate(-10deg); }
            50% { transform: translateY(10px) rotate(10deg); }
          }
          .animate-header-leaf { animation: header-leaf 3.5s ease-in-out infinite; }
          @keyframes header-bird {
            0%, 100% { transform: translateY(0) scaleX(-1); }
            50% { transform: translateY(-12px) scaleX(-1); }
          }
          .animate-header-bird { animation: header-bird 4.2s ease-in-out infinite; }
          @keyframes header-earth {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.08); }
          }
          .animate-header-earth { animation: header-earth 5s ease-in-out infinite; }
        `}</style>
      </div>

      {/* Stats with floating animation */}
      <div className="flex flex-col md:flex-row justify-center gap-6 mt-8 mb-4 px-4 animate-fade-in-up">
        <div className="flex-1 bg-yellow-100 border-2 border-yellow-200 rounded-2xl shadow p-6 flex flex-col items-center min-w-[180px] transition-transform duration-300 hover:scale-105 floating-box-anim" style={{ animationDelay: '0s' }}>
          <div className="text-3xl mb-2">{COIN} {COIN_BAG}</div>
          <div className="text-3xl font-bold text-yellow-700">{state.coins}</div>
          <div className="text-yellow-700 font-semibold">Coins</div>
        </div>
        <div className="flex-1 bg-green-100 border-2 border-green-200 rounded-2xl shadow p-6 flex flex-col items-center min-w-[180px] transition-transform duration-300 hover:scale-105 floating-box-anim" style={{ animationDelay: '0.15s' }}>
          <div className="text-3xl mb-2">🌲 {TREE}</div>
          <div className="text-3xl font-bold text-green-700">{treeCount}</div>
          <div className="text-green-700 font-semibold">Trees</div>
        </div>
        <div className="flex-1 bg-blue-100 border-2 border-blue-200 rounded-2xl shadow p-6 flex flex-col items-center min-w-[180px] transition-transform duration-300 hover:scale-105 floating-box-anim" style={{ animationDelay: '0.3s' }}>
          <div className="text-3xl mb-2">{WIND} {OXYGEN}</div>
          <div className="text-3xl font-bold text-blue-700">{state.oxygen}</div>
          <div className="text-blue-700 font-semibold">Oxygen</div>
        </div>
        <style>{`
          @keyframes floating-box {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-18px); }
            100% { transform: translateY(0px); }
          }
          .floating-box-anim {
            animation: floating-box 2.8s ease-in-out infinite;
          }
        `}</style>
      </div>

      {/* Forest Grid - Unique and Attractive */}
      <div className="relative flex flex-col items-center mt-8 mb-8">
        <div className="w-full flex justify-center">
          <div className="relative w-full max-w-5xl">
            <div className="rounded-[48px] shadow-2xl border-4 border-green-200 bg-white/60 backdrop-blur-xl p-12 pt-20 pb-16 mx-auto overflow-hidden" style={{minHeight: 420, boxShadow: '0 8px 48px #b2f2bb55'}}>
              <h2 className="text-4xl font-extrabold text-green-800 flex items-center gap-3 mb-8 justify-center drop-shadow-lg tracking-wide animate-fade-in-up">{TREE} <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">Your Eco Forest</span> {TREE}</h2>
              <div className="relative z-10 grid grid-cols-7 gap-10 min-w-[700px] max-w-4xl mx-auto animate-fade-in-up delay-150">
                {state.forest.concat(Array(14 - state.forest.length).fill(0)).map((cell, i) => {
                  let className = "transition-all duration-700 flex items-center justify-center forest-tree-emoji";
                  if (state.animatingIndex === i && state.animatingType === 'plant') {
                    className += " animate-grow-tree";
                  }
                  if (state.animatingIndex === i && state.animatingType === 'cut') {
                    className += " animate-fall-tree";
                  }
                  return (
                    <span
                      key={i}
                      className={className}
                      style={{
                        width: 70,
                        height: 70,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(255,255,255,0.85)',
                        borderRadius: 20,
                        fontSize: 44,
                        boxShadow: '0 4px 16px #b2f2bb33',
                        margin: 'auto',
                        border: cell === 1 ? '2px solid #38b000' : '2px dashed #b2f2bb',
                        filter: cell === 1 ? 'drop-shadow(0 0 8px #38b00044)' : 'none',
                        transition: 'border 0.3s, filter 0.3s',
                      }}
                    >
                      {cell === 1 ? TREE : SAPLING}
                    </span>
                  );
                })}
              </div>
              {/* SVG Wavy Background */}
              <svg className="absolute left-0 bottom-0 w-full h-32 z-0" viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill="#b2f2bb" fillOpacity="0.4" d="M0,224L60,202.7C120,181,240,139,360,154.7C480,171,600,245,720,250.7C840,256,960,192,1080,154.7C1200,117,1320,107,1380,101.3L1440,96L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z" />
              </svg>
            </div>
          </div>
        </div>
        <style>{`
          @keyframes grow-tree {
            0% { transform: scale(0.2); opacity: 0; }
            80% { transform: scale(1.2); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
          .animate-grow-tree {
            animation: grow-tree 700ms cubic-bezier(.4,2,.6,1) forwards;
          }
          @keyframes fall-tree {
            0% { transform: rotate(0deg) scale(1); opacity: 1; }
            60% { transform: rotate(30deg) scale(1.1); opacity: 1; }
            100% { transform: rotate(90deg) scale(0.7); opacity: 0; }
          }
          .animate-fall-tree {
            animation: fall-tree 700ms cubic-bezier(.4,2,.6,1) forwards;
          }
          @keyframes butterfly-float {
            0% { transform: translateY(0px) scale(1) rotate(-10deg); }
            50% { transform: translateY(-30px) scale(1.1) rotate(10deg); }
            100% { transform: translateY(0px) scale(1) rotate(-10deg); }
          }
          .animate-butterfly-float {
            animation: butterfly-float 3.2s ease-in-out infinite;
          }
          @keyframes sun-spin {
            0% { transform: rotate(0deg) scale(1); }
            100% { transform: rotate(360deg) scale(1.05); }
          }
          .animate-sun-spin {
            animation: sun-spin 8s linear infinite;
          }
          .forest-tree-emoji:hover {
            transform: scale(1.18) rotate(-6deg);
            box-shadow: 0 8px 32px #38b00033;
            z-index: 2;
          }
        `}</style>
      </div>

      {/* Message */}
      <div className="text-green-700 text-lg font-semibold text-center my-4 flex items-center justify-center gap-2">
        {TREE} {state.message}
      </div>
      {/* Lose Overlay */}
      {state.message === "You are out!" && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60">
          <div className="bg-white rounded-3xl shadow-2xl px-12 py-10 text-4xl font-extrabold text-red-600 flex flex-col items-center gap-4 animate-fade-in-up">
            <span>😢 You are out!</span>
            <span className="text-lg text-gray-700 font-normal">All your trees are gone. Returning to dashboard...</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col md:flex-row justify-center gap-16 my-12 items-center animate-fade-in-up delay-300">
        <button
          onClick={handleCut}
          disabled={state.cutToday >= MAX_CUT_PER_DAY || state.animatingType}
          className={`bg-orange-500 hover:bg-orange-600 text-white font-bold w-[420px] h-[170px] rounded-2xl text-4xl shadow-2xl flex flex-col items-center justify-center border-4 border-orange-200 transition-all duration-200 relative active:scale-95 hover:shadow-xl ${state.cutToday >= MAX_CUT_PER_DAY || state.animatingType ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span className="absolute -top-7 left-1/2 -translate-x-1/2 flex gap-2">
            <span className="text-3xl" style={{ transform: 'rotate(-20deg)' }}>🪓</span>
            <span className="text-3xl" style={{ transform: 'rotate(20deg)' }}>🪓</span>
          </span>
          <span className="font-extrabold mt-6">Cut Tree</span>
          <span className="text-2xl font-normal mt-2">+5 {COIN_BAG}  -5 {OXYGEN}</span>
          <span className="text-base font-bold mt-2" style={{ textShadow: '0 2px 8px #fff' }}>{MAX_CUT_PER_DAY - state.cutToday} left today</span>
        </button>
        <button
          onClick={handlePlant}
          disabled={state.plantedToday >= MAX_PLANT_PER_DAY || state.animatingType}
          className={`bg-green-500 hover:bg-green-600 text-white font-bold w-[420px] h-[170px] rounded-2xl text-4xl shadow-2xl flex flex-col items-center justify-center border-4 border-green-200 transition-all duration-200 relative active:scale-95 hover:shadow-xl ${state.plantedToday >= MAX_PLANT_PER_DAY || state.animatingType ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span className="absolute -top-7 left-1/2 -translate-x-1/2 flex gap-2">
            <span className="text-3xl" style={{ transform: 'rotate(-10deg)' }}>{SAPLING}</span>
            <span className="text-3xl" style={{ transform: 'rotate(10deg)' }}>{SAPLING}</span>
          </span>
          <span className="font-extrabold mt-6">Plant Tree</span>
          <span className="text-2xl font-normal mt-2">+10 {COIN_BAG}  +8 {OXYGEN}</span>
          <span className="text-base font-bold mt-2" style={{ textShadow: '0 2px 8px #fff' }}>{MAX_PLANT_PER_DAY - state.plantedToday} left today</span>
        </button>
      </div>

      {/* Did You Know Box */}
      <div className="bg-white border-2 border-blue-100 rounded-2xl shadow p-8 w-full max-w-7xl mx-auto my-8 animate-fade-in-up delay-500">
        {/* Confetti/Floating effect for actions */}
        {state.animatingType === 'plant' && (
          <div className="pointer-events-none fixed inset-0 flex items-center justify-center z-50 animate-pop-float">
            <span className="text-6xl select-none" style={{ filter: 'drop-shadow(0 4px 16px #34d399)' }}>{SAPLING}</span>
          </div>
        )}
        {state.animatingType === 'cut' && (
          <div className="pointer-events-none fixed inset-0 flex items-center justify-center z-50 animate-pop-float">
            <span className="text-6xl select-none" style={{ filter: 'drop-shadow(0 4px 16px #fb923c)' }}>{AXE}</span>
          </div>
        )}
        {/* Animations CSS */}
        <style>{`
          @keyframes fade-in-up {
            0% { opacity: 0; transform: translateY(40px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in-up {
            animation: fade-in-up 0.7s cubic-bezier(.4,2,.6,1) both;
          }
          .delay-150 { animation-delay: 0.15s; }
          .delay-300 { animation-delay: 0.3s; }
          .delay-500 { animation-delay: 0.5s; }
          @keyframes pop-float {
            0% { opacity: 0; transform: scale(0.5) translateY(40px); }
            60% { opacity: 1; transform: scale(1.2) translateY(-10px); }
            100% { opacity: 0; transform: scale(1) translateY(-80px); }
          }
          .animate-pop-float {
            animation: pop-float 0.7s cubic-bezier(.4,2,.6,1) both;
          }
        `}</style>
        <div className="text-xl font-bold text-blue-700 mb-2 flex items-center gap-2">
          💡 Did You Know?
        </div>
        <div className="grid md:grid-cols-2 gap-4 text-blue-700">
          <div className="flex items-center gap-2"><span>🌳</span> One tree can produce enough oxygen for two people for a whole day!</div>
          <div className="flex items-center gap-2"><span>{OXYGEN}</span> Trees help clean the air by absorbing carbon dioxide and releasing oxygen!</div>
          <div className="flex items-center gap-2"><span>🦋</span> Forests are home to 80% of the world's land animals and plants!</div>
          <div className="flex items-center gap-2"><span>💧</span> Trees help prevent floods by absorbing rainwater with their roots!</div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-green-700 text-white text-lg py-4 text-center mt-auto rounded-t-2xl">
        🌱 Keep learning about our environment! Every small action helps save our planet! {OXYGEN}💚
      </div>
    </div>
  );
};

export default SaveTheTreesGame;
