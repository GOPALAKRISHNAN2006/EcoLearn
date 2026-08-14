import React, { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  Text,
  RoundedBox,
  MeshTransmissionMaterial,
  Float,
  Sparkles,
  Html,
} from "@react-three/drei";
import * as THREE from "three";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  Beaker,
  Leaf,
  Wind,
  FlaskConical,
  ThermometerSun,
  AlertTriangle,
  Car,
  Trees,
  Factory,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";

// ============================================
// WATER LAB COMPONENTS
// ============================================

// Floating Plastic Debris in Water
function FloatingPlastic({ position, type }) {
  const ref = useRef(null);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.1;
      ref.current.rotation.z = Math.sin(state.clock.elapsedTime + position[0]) * 0.2;
      ref.current.rotation.y += 0.005;
    }
  });

  const plasticTypes = {
    bottle: { color: "#3b82f6", scale: [0.08, 0.2, 0.08] },
    bag: { color: "#f8fafc", scale: [0.15, 0.01, 0.12] },
    straw: { color: "#ec4899", scale: [0.02, 0.15, 0.02] },
    cap: { color: "#ef4444", scale: [0.05, 0.03, 0.05] },
  };

  const config = plasticTypes[type] || plasticTypes.bottle;

  return (
    <group ref={ref} position={position}>
      {type === 'bottle' && (
        <mesh castShadow>
          <cylinderGeometry args={[0.06, 0.05, 0.2, 8]} />
          <meshStandardMaterial color={config.color} transparent opacity={0.6} />
        </mesh>
      )}
      {type === 'bag' && (
        <mesh castShadow>
          <planeGeometry args={[0.15, 0.12]} />
          <meshStandardMaterial color={config.color} transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
      )}
      {type === 'straw' && (
        <mesh castShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.15, 6]} />
          <meshStandardMaterial color={config.color} />
        </mesh>
      )}
      {type === 'cap' && (
        <mesh castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.02, 12]} />
          <meshStandardMaterial color={config.color} />
        </mesh>
      )}
    </group>
  );
}

// Oil Slick on Water Surface
function OilSlick({ pollutionLevel }) {
  const ref = useRef(null);
  const size = pollutionLevel / 40;

  useFrame((state) => {
    if (ref.current) {
      ref.current.scale.x = size + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      ref.current.scale.z = size + Math.cos(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <mesh ref={ref} position={[0.3, 1.36, 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.5, 32]} />
      <meshStandardMaterial
        color="#1a1a2e"
        transparent
        opacity={0.6}
        metalness={0.9}
        roughness={0.1}
      />
    </mesh>
  );
}

// Chemical Foam
function ChemicalFoam({ pollutionLevel }) {
  const foamCount = Math.floor(pollutionLevel / 8);
  
  const foams = useMemo(() => {
    return Array.from({ length: foamCount }).map((_, i) => ({
      position: [
        (Math.random() - 0.5) * 1.8,
        1.3 + Math.random() * 0.15,
        (Math.random() - 0.5) * 1.8
      ],
      scale: 0.03 + Math.random() * 0.05
    }));
  }, [foamCount]);

  return (
    <group>
      {foams.map((foam, i) => (
        <mesh key={i} position={foam.position} scale={foam.scale}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial color="#f0fdf4" transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  );
}

// Dead Fish
function DeadFish({ position, visible }) {
  const ref = useRef(null);
  
  useFrame((state) => {
    if (ref.current && visible) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
      ref.current.rotation.z = Math.PI + Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  if (!visible) return null;

  return (
    <group ref={ref} position={position}>
      {/* Fish Body */}
      <mesh castShadow>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      {/* Tail */}
      <mesh position={[-0.12, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
        <coneGeometry args={[0.06, 0.1, 4]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      {/* Eye */}
      <mesh position={[0.06, 0.02, 0.05]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
    </group>
  );
}

// Algae Bloom
function AlgaeBloom({ pollutionLevel }) {
  const ref = useRef(null);
  const visible = pollutionLevel > 40;
  const intensity = (pollutionLevel - 40) / 60;

  useFrame((state) => {
    if (ref.current && visible) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  if (!visible) return null;

  return (
    <group ref={ref} position={[0, 0.5, 0]}>
      {Array.from({ length: Math.floor(intensity * 20) }).map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 1.5,
            (Math.random() - 0.5) * 1.5,
            (Math.random() - 0.5) * 1.5
          ]}
        >
          <sphereGeometry args={[0.02 + Math.random() * 0.03, 6, 6]} />
          <meshStandardMaterial color="#22c55e" transparent opacity={0.5} />
        </mesh>
      ))}
    </group>
  );
}

// Industrial Waste Pipe
function IndustrialPipe({ pollutionLevel }) {
  const flowRef = useRef(null);
  const dripRef = useRef(null);

  useFrame((state) => {
    if (flowRef.current) {
      flowRef.current.position.y = -1.1 + Math.sin(state.clock.elapsedTime * 4) * 0.05;
    }
    if (dripRef.current) {
      const t = (state.clock.elapsedTime % 1);
      dripRef.current.position.y = -1.8 - t * 0.5;
      dripRef.current.scale.setScalar(1 - t * 0.5);
    }
  });

  const toxicColor = useMemo(() => {
    const clean = new THREE.Color("#38bdf8");
    const toxic = new THREE.Color("#84cc16");
    return clean.lerp(toxic, pollutionLevel / 100);
  }, [pollutionLevel]);

  return (
    <group position={[-1.8, 1, 0]} rotation={[0, 0, 0.1]}>
      {/* Main Pipe */}
      <mesh castShadow>
        <cylinderGeometry args={[0.2, 0.2, 1.4, 16]} />
        <meshStandardMaterial color="#374151" metalness={0.9} roughness={0.2} />
      </mesh>
      
      {/* Rust Patches */}
      <mesh position={[0.18, 0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <planeGeometry args={[0.3, 0.15]} />
        <meshStandardMaterial color="#b45309" roughness={0.9} />
      </mesh>
      
      {/* Hazard Stripes */}
      <mesh position={[0, 0.5, 0.21]}>
        <planeGeometry args={[0.3, 0.1]} />
        <meshStandardMaterial color="#fbbf24" />
      </mesh>
      <mesh position={[0, 0.5, 0.21]}>
        <planeGeometry args={[0.08, 0.1]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>

      {/* Pipe Mouth */}
      <mesh position={[0, -0.7, 0]} castShadow>
        <torusGeometry args={[0.2, 0.05, 12, 24]} />
        <meshStandardMaterial color="#1f2937" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Toxic Flow */}
      <mesh ref={flowRef} position={[0, -1.1, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.1, 1.6, 12]} />
        <meshStandardMaterial
          color={toxicColor}
          transparent
          opacity={0.85}
          roughness={0.2}
          emissive={toxicColor}
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Drips */}
      <mesh ref={dripRef} position={[0, -1.8, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color={toxicColor} transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

// Healthy Fish (disappears with pollution)
function HealthyFish({ pollutionLevel }) {
  const fishCount = Math.max(0, 5 - Math.floor(pollutionLevel / 20));
  
  const fish = useMemo(() => {
    return Array.from({ length: fishCount }).map((_, i) => ({
      position: [(Math.random() - 0.5) * 1.5, -0.5 + Math.random() * 1, (Math.random() - 0.5) * 1.5],
      speed: 0.5 + Math.random() * 0.5,
      offset: Math.random() * Math.PI * 2
    }));
  }, [fishCount]);

  return (
    <group>
      {fish.map((f, i) => (
        <AnimatedFish key={i} {...f} index={i} />
      ))}
    </group>
  );
}

function AnimatedFish({ position, speed, offset, index }) {
  const ref = useRef(null);
  
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime * speed + offset;
      ref.current.position.x = position[0] + Math.sin(t) * 0.5;
      ref.current.position.z = position[2] + Math.cos(t) * 0.5;
      ref.current.rotation.y = Math.atan2(Math.cos(t), -Math.sin(t));
    }
  });

  const colors = ["#f97316", "#3b82f6", "#eab308", "#ec4899", "#22c55e"];

  return (
    <group ref={ref} position={position}>
      <mesh castShadow>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color={colors[index % colors.length]} />
      </mesh>
      <mesh position={[-0.1, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
        <coneGeometry args={[0.05, 0.08, 4]} />
        <meshStandardMaterial color={colors[index % colors.length]} />
      </mesh>
    </group>
  );
}

// Water Quality Info Panel
function WaterInfoPanel({ pollutionLevel, temperature }) {
  const ph = (7 - pollutionLevel * 0.03).toFixed(1);
  const oxygen = Math.max(0, 8 - pollutionLevel * 0.06).toFixed(1);
  const healthStatus = pollutionLevel < 30 ? "Healthy" : pollutionLevel < 60 ? "At Risk" : "Critical";
  const statusColor = pollutionLevel < 30 ? "#4ade80" : pollutionLevel < 60 ? "#fbbf24" : "#f87171";

  return (
    <Html position={[2.8, 0.5, 0]} center>
      <div className="bg-slate-900/95 border border-cyan-500/50 rounded-xl p-3 backdrop-blur-sm shadow-xl w-48">
        <h3 className="text-cyan-400 font-bold text-sm mb-2 flex items-center gap-2">
          💧 Water Analysis
        </h3>
        
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Temperature</span>
            <span className="text-white font-mono">{temperature}°C</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">pH Level</span>
            <span className="text-white font-mono">{ph}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Dissolved O₂</span>
            <span className="text-white font-mono">{oxygen} mg/L</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Pollution</span>
            <span className="text-orange-400 font-mono">{pollutionLevel}%</span>
          </div>
          
          <div className="pt-2 border-t border-slate-700">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Status</span>
              <span className="font-bold" style={{ color: statusColor }}>
                {healthStatus}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Html>
  );
}

// Water Educational Tooltip
function WaterTooltip({ position, text, icon }) {
  return (
    <Html position={position} center>
      <div className="bg-slate-900/95 text-white text-xs px-3 py-2 rounded-lg max-w-[160px] text-center shadow-xl border border-cyan-500/30">
        <span className="text-lg">{icon}</span>
        <p className="mt-1 text-cyan-100">{text}</p>
      </div>
    </Html>
  );
}

// Water Pollution Solutions Panel
function WaterSolutionsPanel({ pollutionLevel, onApplySolution }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [appliedSolutions, setAppliedSolutions] = useState([]);
  
  const solutions = [
    { icon: "🚰", title: "Use Water Filters", desc: "Install filters to remove contaminants", impact: "99% bacteria removed", reduction: 15 },
    { icon: "🏭", title: "Industrial Treatment", desc: "Proper wastewater treatment plants", impact: "Removes 95% toxins", reduction: 20 },
    { icon: "🌿", title: "Wetland Restoration", desc: "Natural water purification systems", impact: "Filters 5M gal/day", reduction: 15 },
    { icon: "🚮", title: "Proper Disposal", desc: "Never dump chemicals in drains", impact: "Prevents 40% pollution", reduction: 12 },
    { icon: "🧪", title: "Regular Testing", desc: "Monitor water quality frequently", impact: "Early detection", reduction: 8 },
    { icon: "🌱", title: "Reduce Fertilizers", desc: "Use organic farming methods", impact: "50% less runoff", reduction: 10 },
  ];

  const visibleSolutions = Math.min(
    solutions.length,
    Math.floor((pollutionLevel - 60) / 7) + 1
  );

  const handleApplySolution = (index, reduction) => {
    if (appliedSolutions.includes(index)) return;
    setAppliedSolutions([...appliedSolutions, index]);
    if (onApplySolution) {
      onApplySolution(reduction);
    }
  };

  return (
    <Html position={[-3.5, 0.5, 0]} center>
      <div className="transition-all duration-500" style={{ width: '280px' }}>
        {/* Header */}
        <div 
          className="bg-gradient-to-r from-cyan-600 to-blue-500 rounded-t-xl p-3 cursor-pointer flex items-center justify-between shadow-lg"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌊</span>
            <div>
              <h3 className="text-white font-bold text-sm">Clean Water Solutions</h3>
              <p className="text-cyan-100 text-xs">Click solutions to apply!</p>
            </div>
          </div>
          <span className={`text-white transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </div>

        {/* Solutions List */}
        {isExpanded && (
          <div className="bg-slate-900/95 backdrop-blur-sm border border-cyan-500/30 rounded-b-xl p-3 space-y-2 shadow-xl max-h-[350px] overflow-y-auto">
            {/* Alert Banner */}
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-2 mb-3 animate-pulse">
              <div className="flex items-center gap-2">
                <span className="text-xl">🚨</span>
                <div>
                  <p className="text-red-400 font-bold text-xs">Critical Level: {pollutionLevel}%</p>
                  <p className="text-red-300 text-xs">Click solutions below to clean the water!</p>
                </div>
              </div>
            </div>

            {/* Solutions */}
            {solutions.slice(0, visibleSolutions).map((solution, index) => {
              const isApplied = appliedSolutions.includes(index);
              return (
                <div 
                  key={index}
                  onClick={() => handleApplySolution(index, solution.reduction)}
                  className={`rounded-lg p-2 border transition-all duration-300 cursor-pointer group ${
                    isApplied 
                      ? 'bg-green-500/30 border-green-500/50' 
                      : 'bg-slate-800/80 border-slate-700 hover:border-cyan-500/50 hover:bg-slate-700/80 hover:scale-[1.02]'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className={`text-xl transition-transform duration-300 ${isApplied ? '' : 'group-hover:scale-125 group-hover:rotate-12'}`}>
                      {isApplied ? '✅' : solution.icon}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className={`font-semibold text-xs ${isApplied ? 'text-green-400' : 'text-cyan-400'}`}>
                          {solution.title}
                        </h4>
                        {!isApplied && (
                          <span className="text-xs bg-cyan-500/30 text-cyan-300 px-1.5 py-0.5 rounded font-bold animate-pulse">
                            -{solution.reduction}%
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-xs leading-tight">{solution.desc}</p>
                      {isApplied ? (
                        <span className="inline-block mt-1 text-xs bg-green-500/30 text-green-300 px-1.5 py-0.5 rounded">
                          ✓ Applied!
                        </span>
                      ) : (
                        <span className="inline-block mt-1 text-xs bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded">
                          {solution.impact}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Progress indicator */}
            <div className="mt-3 pt-2 border-t border-slate-700">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-400">Solutions applied</span>
                <span className="text-xs text-green-400">{appliedSolutions.length}/{visibleSolutions}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-1.5">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-400 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${(appliedSolutions.length / visibleSolutions) * 100}%` }}
                />
              </div>
            </div>

            {/* Success Message */}
            {appliedSolutions.length === visibleSolutions && visibleSolutions > 0 && (
              <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 mt-2 text-center animate-bounce">
                <span className="text-2xl">🎉</span>
                <p className="text-green-300 font-bold text-sm">Great job!</p>
                <p className="text-green-200 text-xs">You've applied all available solutions!</p>
              </div>
            )}

            {/* Fun Fact */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-2 mt-2">
              <p className="text-xs text-blue-300">
                💡 <strong>Did you know?</strong> Only 3% of Earth's water is freshwater, and just 1% is accessible!
              </p>
            </div>
          </div>
        )}
      </div>
    </Html>
  );
}

// Enhanced Water Container/Beaker
function EnhancedWaterBeaker({ pollutionLevel }) {
  const beakerRef = useRef(null);
  const waterRef = useRef(null);

  useFrame((state) => {
    if (beakerRef.current) {
      beakerRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.15;
    }
  });

  const waterColor = useMemo(() => {
    const clean = new THREE.Color("#00a8ff");
    const polluted = new THREE.Color("#3d2914");
    return clean.lerp(polluted, pollutionLevel / 100);
  }, [pollutionLevel]);

  // Generate floating plastic debris
  const plasticDebris = useMemo(() => {
    const count = Math.floor(pollutionLevel / 10);
    const types = ['bottle', 'bag', 'straw', 'cap'];
    return Array.from({ length: count }).map((_, i) => ({
      position: [
        (Math.random() - 0.5) * 1.5,
        0.8 + Math.random() * 0.5,
        (Math.random() - 0.5) * 1.5
      ],
      type: types[i % types.length]
    }));
  }, [pollutionLevel]);

  // Dead fish positions
  const deadFish = useMemo(() => {
    return [
      { position: [0.5, 1.2, 0.3], visible: pollutionLevel > 50 },
      { position: [-0.4, 1.25, -0.2], visible: pollutionLevel > 70 },
      { position: [0.2, 1.15, -0.4], visible: pollutionLevel > 85 },
    ];
  }, [pollutionLevel]);

  return (
    <group ref={beakerRef} position={[0, -0.5, 0]}>
      {/* Glass Bucket/Beaker */}
      <mesh castShadow>
        <cylinderGeometry args={[1.2, 1, 3, 32, 1, true]} />
        <MeshTransmissionMaterial
          backside
          samples={16}
          thickness={0.3}
          chromaticAberration={0.1}
          anisotropy={0.3}
          distortion={0.1}
          distortionScale={0.2}
          temporalDistortion={0.1}
          iridescence={0.5}
          iridescenceIOR={1}
          iridescenceThicknessRange={[0, 1400]}
          color="#ffffff"
          transmission={0.95}
          roughness={0.05}
        />
      </mesh>

      {/* Beaker Bottom */}
      <mesh position={[0, -1.5, 0]} receiveShadow>
        <cylinderGeometry args={[1, 1, 0.1, 32]} />
        <MeshTransmissionMaterial
          thickness={0.2}
          transmission={0.9}
          roughness={0.1}
          color="#e8e8e8"
        />
      </mesh>

      {/* Beaker Rim/Handle */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <torusGeometry args={[1.2, 0.08, 16, 32]} />
        <meshStandardMaterial color="#e0e0e0" metalness={0.3} roughness={0.4} />
      </mesh>
      
      {/* Bucket Handle */}
      <mesh position={[0, 2.2, 0]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.8, 0.04, 8, 32, Math.PI]} />
        <meshStandardMaterial color="#e0e0e0" metalness={0.5} roughness={0.3} />
      </mesh>

      {/* Water */}
      <mesh ref={waterRef} position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[1.1, 0.95, 2.8, 32]} />
        <meshStandardMaterial
          color={waterColor}
          transparent
          opacity={0.7 + pollutionLevel * 0.003}
          roughness={0.1}
          metalness={0.1}
        />
      </mesh>

      {/* Oil Slick */}
      {pollutionLevel > 25 && <OilSlick pollutionLevel={pollutionLevel} />}

      {/* Chemical Foam */}
      {pollutionLevel > 30 && <ChemicalFoam pollutionLevel={pollutionLevel} />}

      {/* Healthy Fish */}
      <HealthyFish pollutionLevel={pollutionLevel} />

      {/* Dead Fish */}
      {deadFish.map((fish, i) => (
        <DeadFish key={i} position={fish.position} visible={fish.visible} />
      ))}

      {/* Algae Bloom */}
      <AlgaeBloom pollutionLevel={pollutionLevel} />

      {/* Floating Plastic Debris */}
      {plasticDebris.map((debris, i) => (
        <FloatingPlastic key={i} position={debris.position} type={debris.type} />
      ))}

      {/* Bubbles */}
      <CleanBubbles pollutionLevel={pollutionLevel} />

      {/* Water Surface */}
      <mesh position={[0, 1.35, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <circleGeometry args={[1.1, 32]} />
        <meshStandardMaterial
          color={waterColor}
          transparent
          opacity={0.5}
          roughness={0}
          metalness={0.5}
        />
      </mesh>

      {/* Measurement Lines */}
      {[0.5, 1, 1.5, 2].map((y, i) => (
        <mesh key={i} position={[1.15, y - 1, 0]} castShadow>
          <boxGeometry args={[0.15, 0.02, 0.02]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      ))}
    </group>
  );
}

function CleanBubbles({ pollutionLevel }) {
  const pointsRef = useRef(null);
  const count = useMemo(
    () => Math.max(5, Math.floor(40 - pollutionLevel * 0.3)),
    [pollutionLevel]
  );

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 0.8;
      arr[i * 3 + 1] = -1 + Math.random() * 1.6;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 0.8;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const pos = pointsRef.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += 0.01 + pollutionLevel * 0.0005;
      if (pos[i * 3 + 1] > 1.1) {
        pos[i * 3] = (Math.random() - 0.5) * 0.8;
        pos[i * 3 + 1] = -1 + Math.random() * 0.2;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 0.8;
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  const bubbleColor = new THREE.Color("#a5f3fc").lerp(
    new THREE.Color("#64748b"),
    pollutionLevel / 100
  );

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color={bubbleColor}
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  );
}

function SewagePipe({ pollutionLevel }) {
  const flowRef = useRef(null);

  useFrame((state) => {
    if (flowRef.current) {
      flowRef.current.position.y =
        0.5 + Math.sin(state.clock.elapsedTime * 4) * 0.05;
    }
  });

  const pipeColor = "#4b5563";
  const flowColor = new THREE.Color("#38bdf8").lerp(
    new THREE.Color("#b45309"),
    pollutionLevel / 100
  );

  return (
    <group position={[-1.8, 1, 0]} rotation={[0, 0, 0.1]}>
      {/* Pipe body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.18, 0.18, 1.4, 16]} />
        <meshStandardMaterial color={pipeColor} metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Pipe mouth */}
      <mesh position={[0, -0.7, 0]} castShadow>
        <torusGeometry args={[0.18, 0.04, 12, 24]} />
        <meshStandardMaterial color={pipeColor} metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Flowing water (polluted) */}
      <mesh ref={flowRef} position={[0, -1.1, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 1.6, 12]} />
        <meshStandardMaterial
          color={flowColor}
          transparent
          opacity={0.8}
          roughness={0.3}
        />
      </mesh>
    </group>
  );
}

function PollutionParticles({
  positions,
  pollutionLevel,
}) {
  const particlesRef = useRef(null);
  const count = positions.length / 3;

  useFrame((state) => {
    if (particlesRef.current) {
      const pos =
        particlesRef.current.geometry.attributes.position.array;
      for (let i = 0; i < count; i++) {
        pos[i * 3 + 1] += Math.sin(state.clock.elapsedTime + i) * 0.002;

        if (pos[i * 3 + 1] > 1.3) pos[i * 3 + 1] = -0.8;
        if (pos[i * 3 + 1] < -1) pos[i * 3 + 1] = 1.3;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#2d1810"
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}

function WaterBeaker({ pollutionLevel }) {
  const beakerRef = useRef(null);
  const waterRef = useRef(null);

  useFrame((state) => {
    if (beakerRef.current) {
      beakerRef.current.rotation.y =
        Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
    }
  });

  const waterColor = useMemo(() => {
    const clean = new THREE.Color("#00a8ff");
    const polluted = new THREE.Color("#3d2914");
    return clean.lerp(polluted, pollutionLevel / 100);
  }, [pollutionLevel]);

  const particles = useMemo(() => {
    const count = Math.floor(pollutionLevel * 5);
    const positions = [];
    const sizes = [];

    for (let i = 0; i < count; i++) {
      positions.push(
        (Math.random() - 0.5) * 1.2,
        Math.random() * 2 - 0.5,
        (Math.random() - 0.5) * 1.2
      );
      sizes.push(Math.random() * 0.08 + 0.02);
    }

    return { positions: new Float32Array(positions), sizes };
  }, [pollutionLevel]);

  return (
    <group ref={beakerRef} position={[0, -0.5, 0]}>
      {/* Glass Beaker */}
      <mesh castShadow>
        <cylinderGeometry args={[1.2, 1, 3, 32, 1, true]} />
        <MeshTransmissionMaterial
          backside
          samples={16}
          thickness={0.3}
          chromaticAberration={0.1}
          anisotropy={0.3}
          distortion={0.1}
          distortionScale={0.2}
          temporalDistortion={0.1}
          iridescence={0.5}
          iridescenceIOR={1}
          iridescenceThicknessRange={[0, 1400]}
          color="#ffffff"
          transmission={0.95}
          roughness={0.05}
        />
      </mesh>

      {/* Beaker Bottom */}
      <mesh position={[0, -1.5, 0]} receiveShadow>
        <cylinderGeometry args={[1, 1, 0.1, 32]} />
        <MeshTransmissionMaterial
          thickness={0.2}
          transmission={0.9}
          roughness={0.1}
          color="#e8e8e8"
        />
      </mesh>

      {/* Beaker Rim */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <torusGeometry args={[1.2, 0.08, 16, 32]} />
        <meshStandardMaterial color="#e0e0e0" metalness={0.3} roughness={0.4} />
      </mesh>

      {/* Water */}
      <mesh ref={waterRef} position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[1.1, 0.95, 2.8, 32]} />
        <meshStandardMaterial
          color={waterColor}
          transparent
          opacity={0.7 + pollutionLevel * 0.003}
          roughness={0.1}
          metalness={0.1}
        />
      </mesh>

      {/* Bubbles */}
      <CleanBubbles pollutionLevel={pollutionLevel} />

      {/* Pollution Particles */}
      {pollutionLevel > 5 && (
        <PollutionParticles
          positions={particles.positions}
          pollutionLevel={pollutionLevel}
        />
      )}

      {/* Water Surface */}
      <mesh
        position={[0, 1.35, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        castShadow
      >
        <circleGeometry args={[1.1, 32]} />
        <meshStandardMaterial
          color={waterColor}
          transparent
          opacity={0.5}
          roughness={0}
          metalness={0.5}
        />
      </mesh>

      {/* Measurement Lines */}
      {[0.5, 1, 1.5, 2].map((y, i) => (
        <mesh key={i} position={[1.15, y - 1, 0]} castShadow>
          <boxGeometry args={[0.15, 0.02, 0.02]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      ))}
    </group>
  );
}

function WaterLabUI({
  pollutionLevel,
  temperature,
}) {
  return (
    <group position={[2.5, 1, 0]}>
      {/* Temperature Display */}
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.3}>
        <RoundedBox args={[1.5, 0.8, 0.1]} radius={0.1} position={[0, 1, 0]}>
          <meshStandardMaterial
            color="#1a365d"
            metalness={0.5}
            roughness={0.3}
          />
        </RoundedBox>
        <Text position={[0, 1.15, 0.1]} fontSize={0.12} color="#60a5fa">
          Temperature
        </Text>
        <Text position={[0, 0.9, 0.1]} fontSize={0.25} color="#ffffff">
          {temperature}°C
        </Text>
      </Float>

      {/* Contamination Meter */}
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.3}>
        <RoundedBox args={[1.5, 0.8, 0.1]} radius={0.1} position={[0, 0, 0]}>
          <meshStandardMaterial
            color="#7c2d12"
            metalness={0.5}
            roughness={0.3}
          />
        </RoundedBox>
        <Text position={[0, 0.15, 0.1]} fontSize={0.12} color="#fdba74">
          Contamination
        </Text>
        <Text position={[0, -0.1, 0.1]} fontSize={0.25} color="#ffffff">
          {pollutionLevel}%
        </Text>
      </Float>
    </group>
  );
}

// ============================================
// SOIL LAB COMPONENTS - Enhanced Plastic Pollution
// ============================================

// Plastic Bottle Component
function PlasticBottle({ position, rotation, scale, plasticLevel }) {
  const bottleRef = useRef(null);
  
  useFrame((state) => {
    if (bottleRef.current) {
      bottleRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.05;
    }
  });

  const bottleColor = useMemo(() => {
    const colors = ["#3b82f6", "#22c55e", "#ef4444", "#f59e0b", "#06b6d4"];
    return colors[Math.floor(Math.abs(position[0] * 10) % colors.length)];
  }, [position]);

  return (
    <group ref={bottleRef} position={position} rotation={rotation} scale={scale}>
      {/* Bottle Body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.5, 12]} />
        <meshStandardMaterial 
          color={bottleColor} 
          transparent 
          opacity={0.7}
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>
      {/* Bottle Neck */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 0.15, 12]} />
        <meshStandardMaterial 
          color={bottleColor} 
          transparent 
          opacity={0.7}
          roughness={0.2}
        />
      </mesh>
      {/* Bottle Cap */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.07, 0.05, 12]} />
        <meshStandardMaterial color="#ffffff" roughness={0.3} />
      </mesh>
      {/* Label */}
      <mesh position={[0, 0, 0.151]} castShadow>
        <planeGeometry args={[0.2, 0.3]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </mesh>
    </group>
  );
}

// Plastic Bag Component  
function PlasticBag({ position, rotation, plasticLevel }) {
  const bagRef = useRef(null);
  
  useFrame((state) => {
    if (bagRef.current) {
      // Floating/rustling animation
      bagRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.03;
      bagRef.current.rotation.z = rotation[2] + Math.sin(state.clock.elapsedTime * 1.5) * 0.1;
    }
  });

  const bagColor = useMemo(() => {
    const colors = ["#f8fafc", "#fef3c7", "#dbeafe", "#fce7f3"];
    return colors[Math.floor(Math.abs(position[0] * 10) % colors.length)];
  }, [position]);

  return (
    <group ref={bagRef} position={position} rotation={rotation} scale={0.3}>
      {/* Crumpled bag body - using multiple deformed spheres */}
      <mesh castShadow>
        <sphereGeometry args={[0.4, 8, 6]} />
        <meshStandardMaterial 
          color={bagColor} 
          transparent 
          opacity={0.5}
          roughness={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0.1, 0.2, 0]} rotation={[0.3, 0, 0.2]} castShadow>
        <sphereGeometry args={[0.25, 6, 4]} />
        <meshStandardMaterial 
          color={bagColor} 
          transparent 
          opacity={0.4}
          roughness={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Handles */}
      <mesh position={[-0.15, 0.35, 0]} rotation={[0, 0, -0.3]}>
        <torusGeometry args={[0.1, 0.02, 8, 12, Math.PI]} />
        <meshStandardMaterial color={bagColor} transparent opacity={0.5} />
      </mesh>
      <mesh position={[0.15, 0.35, 0]} rotation={[0, 0, 0.3]}>
        <torusGeometry args={[0.1, 0.02, 8, 12, Math.PI]} />
        <meshStandardMaterial color={bagColor} transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

// Plastic Straw Component
function PlasticStraw({ position, rotation, color }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.4, 8]} />
        <meshStandardMaterial 
          color={color || "#ec4899"} 
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      {/* Bendable part lines */}
      {[0.05, 0.07, 0.09].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <torusGeometry args={[0.015, 0.003, 4, 12]} />
          <meshStandardMaterial color={color || "#ec4899"} />
        </mesh>
      ))}
    </group>
  );
}

// Microplastics Component - tiny particles
function Microplastics({ plasticLevel }) {
  const particlesRef = useRef(null);
  const count = Math.floor(plasticLevel * 3);

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const colorOptions = [
      [1, 0.4, 0.4],     // red
      [0.4, 0.8, 1],     // blue
      [0.4, 1, 0.6],     // green
      [1, 0.9, 0.4],     // yellow
      [1, 0.6, 0.8],     // pink
    ];

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 3.5;
      positions[i * 3 + 1] = Math.random() * 2 - 1;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2;

      const color = colorOptions[Math.floor(Math.random() * colorOptions.length)];
      colors[i * 3] = color[0];
      colors[i * 3 + 1] = color[1];
      colors[i * 3 + 2] = color[2];

      sizes[i] = 0.02 + Math.random() * 0.03;
    }

    return { positions, colors, sizes };
  }, [count]);

  useFrame((state) => {
    if (particlesRef.current) {
      const pos = particlesRef.current.geometry.attributes.position.array;
      for (let i = 0; i < count; i++) {
        pos[i * 3 + 1] += Math.sin(state.clock.elapsedTime + i * 0.1) * 0.001;
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={particles.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
}

// Food Container / Styrofoam Component
function FoodContainer({ position, rotation }) {
  return (
    <group position={position} rotation={rotation} scale={0.25}>
      {/* Container body */}
      <mesh castShadow>
        <boxGeometry args={[0.8, 0.3, 0.6]} />
        <meshStandardMaterial color="#f5f5f4" roughness={0.8} />
      </mesh>
      {/* Lid */}
      <mesh position={[0, 0.18, -0.25]} rotation={[-0.3, 0, 0]} castShadow>
        <boxGeometry args={[0.78, 0.05, 0.58]} />
        <meshStandardMaterial color="#f5f5f4" roughness={0.8} />
      </mesh>
    </group>
  );
}

// Plastic Cup Component
function PlasticCup({ position, rotation }) {
  const cupColor = useMemo(() => {
    const colors = ["#fef3c7", "#dbeafe", "#fce7f3", "#d1fae5"];
    return colors[Math.floor(Math.random() * colors.length)];
  }, []);

  return (
    <group position={position} rotation={rotation} scale={0.2}>
      <mesh castShadow>
        <cylinderGeometry args={[0.35, 0.25, 0.6, 16]} />
        <meshStandardMaterial 
          color={cupColor} 
          transparent 
          opacity={0.6}
          roughness={0.3}
        />
      </mesh>
      {/* Rim */}
      <mesh position={[0, 0.3, 0]}>
        <torusGeometry args={[0.35, 0.03, 8, 24]} />
        <meshStandardMaterial color={cupColor} transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

// Enhanced Worm with realistic movement
function EnhancedWorm({ position, isHealthy, index }) {
  const wormRef = useRef(null);
  const segments = 5;

  useFrame((state) => {
    if (wormRef.current && isHealthy) {
      // Wiggling motion
      wormRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 3 + index) * 0.3;
      wormRef.current.position.x = position[0] + Math.sin(state.clock.elapsedTime * 0.5 + index) * 0.1;
    }
  });

  const wormColor = isHealthy ? "#e879a0" : "#6b7280";

  return (
    <group ref={wormRef} position={position}>
      {Array.from({ length: segments }).map((_, i) => (
        <mesh key={i} position={[i * 0.04 - 0.08, 0, 0]} castShadow>
          <sphereGeometry args={[0.025 - i * 0.003, 8, 8]} />
          <meshStandardMaterial 
            color={wormColor} 
            roughness={0.6}
            opacity={isHealthy ? 1 : 0.5}
            transparent
          />
        </mesh>
      ))}
    </group>
  );
}

// Healthy Plant Component
function HealthyPlant({ plasticLevel }) {
  const plantRef = useRef(null);
  const health = Math.max(0, 1 - plasticLevel / 100);

  useFrame((state) => {
    if (plantRef.current) {
      // Wilting effect based on plastic level
      const wiltAngle = (plasticLevel / 100) * 0.8;
      plantRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.03 + wiltAngle * 0.5;
    }
  });

  const stemColor = useMemo(() => {
    const healthy = new THREE.Color("#15803d");
    const dead = new THREE.Color("#78350f");
    return healthy.lerp(dead, plasticLevel / 100);
  }, [plasticLevel]);

  const leafColor = useMemo(() => {
    const healthy = new THREE.Color("#22c55e");
    const dead = new THREE.Color("#a16207");
    return healthy.lerp(dead, plasticLevel / 100);
  }, [plasticLevel]);

  const flowerColor = useMemo(() => {
    const healthy = new THREE.Color("#f472b6");
    const dead = new THREE.Color("#78716c");
    return healthy.lerp(dead, plasticLevel / 100);
  }, [plasticLevel]);

  return (
    <group ref={plantRef} position={[0, 1.5, 0]}>
      {/* Main Stem */}
      <mesh castShadow>
        <cylinderGeometry args={[0.04, 0.06, 0.8 * health + 0.2, 8]} />
        <meshStandardMaterial color={stemColor} roughness={0.7} />
      </mesh>

      {/* Leaves */}
      {health > 0.3 && (
        <>
          <group position={[0.15, 0.1, 0]} rotation={[0, 0, -0.4]}>
            <mesh castShadow>
              <sphereGeometry args={[0.12 * health, 8, 6]} />
              <meshStandardMaterial color={leafColor} roughness={0.6} />
            </mesh>
          </group>
          <group position={[-0.15, 0.2, 0]} rotation={[0, 0, 0.4]}>
            <mesh castShadow>
              <sphereGeometry args={[0.1 * health, 8, 6]} />
              <meshStandardMaterial color={leafColor} roughness={0.6} />
            </mesh>
          </group>
        </>
      )}

      {/* Flower */}
      {health > 0.6 && (
        <group position={[0, 0.45, 0]}>
          {[0, 72, 144, 216, 288].map((angle, i) => (
            <mesh 
              key={i} 
              position={[
                Math.cos((angle * Math.PI) / 180) * 0.08,
                0,
                Math.sin((angle * Math.PI) / 180) * 0.08
              ]}
              rotation={[0.3, 0, (angle * Math.PI) / 180]}
              castShadow
            >
              <sphereGeometry args={[0.05, 6, 6]} />
              <meshStandardMaterial color={flowerColor} roughness={0.5} />
            </mesh>
          ))}
          {/* Center */}
          <mesh>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color="#fbbf24" roughness={0.5} />
          </mesh>
        </group>
      )}

      {/* Drooping indicator for high pollution */}
      {plasticLevel > 50 && (
        <Html position={[0.3, 0.3, 0]} center>
          <div className="text-xs bg-red-500/80 text-white px-2 py-1 rounded-full whitespace-nowrap">
            😢 Struggling
          </div>
        </Html>
      )}
    </group>
  );
}

// Root System Component
function RootSystem({ plasticLevel }) {
  const health = Math.max(0.2, 1 - plasticLevel / 100);
  
  const rootColor = useMemo(() => {
    const healthy = new THREE.Color("#92400e");
    const dead = new THREE.Color("#1c1917");
    return healthy.lerp(dead, plasticLevel / 100);
  }, [plasticLevel]);

  const rootPositions = [
    { pos: [0, 0.6, 0], rot: [0, 0, 0], length: 0.6 },
    { pos: [0.15, 0.7, 0.1], rot: [0.3, 0, 0.4], length: 0.4 },
    { pos: [-0.12, 0.65, -0.08], rot: [-0.2, 0, -0.5], length: 0.35 },
    { pos: [0.08, 0.55, -0.12], rot: [-0.4, 0.2, 0.3], length: 0.3 },
    { pos: [-0.18, 0.5, 0.1], rot: [0.2, -0.1, -0.6], length: 0.25 },
  ];

  return (
    <group>
      {rootPositions.map((root, i) => (
        health > 0.3 - i * 0.05 && (
          <mesh 
            key={i} 
            position={root.pos} 
            rotation={root.rot}
            castShadow
          >
            <cylinderGeometry args={[0.01 * health, 0.025 * health, root.length * health, 6]} />
            <meshStandardMaterial color={rootColor} roughness={0.8} />
          </mesh>
        )
      ))}
    </group>
  );
}

// Soil Layers with contamination visualization
function SoilLayers({ plasticLevel }) {
  const topSoilColor = useMemo(() => {
    const healthy = new THREE.Color("#5c4033");
    const contaminated = new THREE.Color("#292524");
    return healthy.lerp(contaminated, plasticLevel / 100);
  }, [plasticLevel]);

  const subSoilColor = useMemo(() => {
    const healthy = new THREE.Color("#a16207");
    const contaminated = new THREE.Color("#44403c");
    return healthy.lerp(contaminated, plasticLevel / 100);
  }, [plasticLevel]);

  return (
    <group position={[0, -0.3, 0]}>
      {/* Top Soil - Organic Layer */}
      <mesh position={[0, 0.7, 0]} receiveShadow>
        <boxGeometry args={[3.8, 0.6, 2.4]} />
        <meshStandardMaterial color={topSoilColor} roughness={0.95} />
      </mesh>
      
      {/* Sub Soil */}
      <mesh position={[0, 0.15, 0]} receiveShadow>
        <boxGeometry args={[3.8, 0.5, 2.4]} />
        <meshStandardMaterial color={subSoilColor} roughness={0.9} />
      </mesh>
      
      {/* Clay Layer */}
      <mesh position={[0, -0.3, 0]} receiveShadow>
        <boxGeometry args={[3.8, 0.4, 2.4]} />
        <meshStandardMaterial color="#b45309" roughness={0.85} />
      </mesh>
      
      {/* Rock/Bedrock */}
      <mesh position={[0, -0.7, 0]} receiveShadow>
        <boxGeometry args={[3.8, 0.4, 2.4]} />
        <meshStandardMaterial color="#57534e" roughness={0.8} />
      </mesh>

      {/* Soil layer labels */}
      <Html position={[-2.1, 0.7, 1.3]} center>
        <div className="text-[10px] bg-amber-900/80 text-amber-100 px-2 py-0.5 rounded whitespace-nowrap">
          Topsoil (Organic)
        </div>
      </Html>
      <Html position={[-2.1, 0.15, 1.3]} center>
        <div className="text-[10px] bg-yellow-800/80 text-yellow-100 px-2 py-0.5 rounded whitespace-nowrap">
          Subsoil
        </div>
      </Html>
      <Html position={[-2.1, -0.3, 1.3]} center>
        <div className="text-[10px] bg-orange-800/80 text-orange-100 px-2 py-0.5 rounded whitespace-nowrap">
          Clay Layer
        </div>
      </Html>
    </group>
  );
}

// Glass Terrarium Container
function GlassTerrarium() {
  return (
    <group position={[0, 0.2, 0]}>
      {/* Glass walls */}
      <mesh>
        <boxGeometry args={[4, 2.5, 2.6]} />
        <MeshTransmissionMaterial
          backside
          samples={8}
          thickness={0.15}
          transmission={0.92}
          roughness={0.05}
          color="#e0f2fe"
          chromaticAberration={0.02}
        />
      </mesh>
      
      {/* Metal frame edges */}
      {[
        [-2, 1.25, 1.3], [2, 1.25, 1.3], [-2, 1.25, -1.3], [2, 1.25, -1.3],
        [-2, -1.25, 1.3], [2, -1.25, 1.3], [-2, -1.25, -1.3], [2, -1.25, -1.3]
      ].map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#71717a" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

// Info Display Panel
function InfoPanel({ plasticLevel }) {
  const wormCount = Math.max(0, 5 - Math.floor(plasticLevel / 20));
  const soilHealth = Math.max(0, 100 - plasticLevel);
  
  return (
    <group position={[2.8, 0.5, 0]}>
      <Float speed={1.5} rotationIntensity={0.05} floatIntensity={0.2}>
        <RoundedBox args={[1.4, 1.8, 0.1]} radius={0.08} position={[0, 0, 0]}>
          <meshStandardMaterial color="#1e293b" metalness={0.3} roughness={0.4} />
        </RoundedBox>
        
        {/* Title */}
        <Text position={[0, 0.65, 0.06]} fontSize={0.12} color="#94a3b8" anchorX="center">
          Soil Health Monitor
        </Text>
        
        {/* Plastic Level */}
        <Text position={[-0.5, 0.4, 0.06]} fontSize={0.08} color="#f87171" anchorX="left">
          Plastic: {plasticLevel}%
        </Text>
        
        {/* Worm Count */}
        <Text position={[-0.5, 0.2, 0.06]} fontSize={0.08} color="#a3e635" anchorX="left">
          Worms: {wormCount} 🪱
        </Text>
        
        {/* Soil Health */}
        <Text position={[-0.5, 0, 0.06]} fontSize={0.08} color="#fbbf24" anchorX="left">
          Health: {soilHealth}%
        </Text>
        
        {/* Microplastics */}
        <Text position={[-0.5, -0.2, 0.06]} fontSize={0.08} color="#f472b6" anchorX="left">
          Microplastics: {Math.floor(plasticLevel * 3)}
        </Text>
        
        {/* Status */}
        <Text 
          position={[0, -0.55, 0.06]} 
          fontSize={0.1} 
          color={plasticLevel < 30 ? "#4ade80" : plasticLevel < 60 ? "#fbbf24" : "#f87171"}
          anchorX="center"
        >
          {plasticLevel < 30 ? "✓ Healthy" : plasticLevel < 60 ? "⚠ At Risk" : "✗ Critical"}
        </Text>
      </Float>
    </group>
  );
}

// Educational Tooltip Component
function EducationalTooltip({ position, text, icon }) {
  return (
    <Html position={position} center>
      <div className="bg-slate-900/95 text-white text-xs px-3 py-2 rounded-lg max-w-[180px] text-center shadow-xl border border-slate-600">
        <span className="text-lg">{icon}</span>
        <p className="mt-1">{text}</p>
      </div>
    </Html>
  );
}

// Solutions Panel - Shows how to reduce plastic pollution (appears after 60%)
function SolutionsPanel({ plasticLevel, onApplySolution }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [appliedSolutions, setAppliedSolutions] = useState([]);
  
  const solutions = [
    { icon: "🛍️", title: "Use Cloth Bags", desc: "Replace plastic bags with reusable cloth bags", impact: "Saves 170 bags/year", reduction: 15 },
    { icon: "🍶", title: "Refillable Bottles", desc: "Use glass or metal water bottles", impact: "Saves 156 bottles/year", reduction: 18 },
    { icon: "🥡", title: "Avoid Takeout Plastic", desc: "Bring your own containers for food", impact: "Reduces 40% waste", reduction: 12 },
    { icon: "🌱", title: "Composting", desc: "Compost organic waste to enrich soil", impact: "30% less landfill", reduction: 15 },
    { icon: "♻️", title: "Proper Recycling", desc: "Separate and recycle plastics correctly", impact: "75% can be recycled", reduction: 20 },
    { icon: "🚫", title: "Say No to Straws", desc: "Use paper or metal straws instead", impact: "500M straws/day saved", reduction: 10 },
  ];

  const visibleSolutions = Math.min(
    solutions.length,
    Math.floor((plasticLevel - 60) / 7) + 1
  );

  const handleApplySolution = (index, reduction) => {
    if (appliedSolutions.includes(index)) return;
    setAppliedSolutions([...appliedSolutions, index]);
    if (onApplySolution) {
      onApplySolution(reduction);
    }
  };

  return (
    <Html position={[-4, 0.5, 0]} center>
      <div 
        className="transition-all duration-500"
        style={{ width: '280px' }}
      >
        {/* Header */}
        <div 
          className="bg-gradient-to-r from-green-600 to-emerald-500 rounded-t-xl p-3 cursor-pointer flex items-center justify-between shadow-lg"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌍</span>
            <div>
              <h3 className="text-white font-bold text-sm">How to Reduce Pollution</h3>
              <p className="text-green-100 text-xs">Click solutions to apply!</p>
            </div>
          </div>
          <span className={`text-white transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </div>

        {/* Solutions List */}
        {isExpanded && (
          <div className="bg-slate-900/95 backdrop-blur-sm border border-green-500/30 rounded-b-xl p-3 space-y-2 shadow-xl max-h-[350px] overflow-y-auto">
            {/* Alert Banner */}
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-2 mb-3 animate-pulse">
              <div className="flex items-center gap-2">
                <span className="text-xl">🚨</span>
                <div>
                  <p className="text-red-400 font-bold text-xs">Critical Level: {plasticLevel}%</p>
                  <p className="text-red-300 text-xs">Click solutions below to clean the soil!</p>
                </div>
              </div>
            </div>

            {/* Solutions */}
            {solutions.slice(0, visibleSolutions).map((solution, index) => {
              const isApplied = appliedSolutions.includes(index);
              return (
                <div 
                  key={index}
                  onClick={() => handleApplySolution(index, solution.reduction)}
                  className={`rounded-lg p-2 border transition-all duration-300 cursor-pointer group ${
                    isApplied 
                      ? 'bg-green-500/30 border-green-500/50' 
                      : 'bg-slate-800/80 border-slate-700 hover:border-green-500/50 hover:bg-slate-700/80 hover:scale-[1.02]'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className={`text-xl transition-transform duration-300 ${isApplied ? '' : 'group-hover:scale-125 group-hover:rotate-12'}`}>
                      {isApplied ? '✅' : solution.icon}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className={`font-semibold text-xs ${isApplied ? 'text-green-400' : 'text-green-400'}`}>
                          {solution.title}
                        </h4>
                        {!isApplied && (
                          <span className="text-xs bg-green-500/30 text-green-300 px-1.5 py-0.5 rounded font-bold animate-pulse">
                            -{solution.reduction}%
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-xs leading-tight">{solution.desc}</p>
                      {isApplied ? (
                        <span className="inline-block mt-1 text-xs bg-green-500/30 text-green-300 px-1.5 py-0.5 rounded">
                          ✓ Applied!
                        </span>
                      ) : (
                        <span className="inline-block mt-1 text-xs bg-green-500/20 text-green-300 px-1.5 py-0.5 rounded">
                          {solution.impact}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Progress indicator */}
            <div className="mt-3 pt-2 border-t border-slate-700">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-400">Solutions applied</span>
                <span className="text-xs text-green-400">{appliedSolutions.length}/{visibleSolutions}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-1.5">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-400 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${(appliedSolutions.length / visibleSolutions) * 100}%` }}
                />
              </div>
            </div>

            {/* Success Message */}
            {appliedSolutions.length === visibleSolutions && visibleSolutions > 0 && (
              <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 mt-2 text-center animate-bounce">
                <span className="text-2xl">🎉</span>
                <p className="text-green-300 font-bold text-sm">Amazing work!</p>
                <p className="text-green-200 text-xs">You've applied all available solutions!</p>
              </div>
            )}

            {/* Fun Fact */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-2 mt-2">
              <p className="text-xs text-blue-300">
                💡 <strong>Did you know?</strong> It takes 1000 years for a plastic bag to decompose in a landfill!
              </p>
            </div>
          </div>
        )}
      </div>
    </Html>
  );
}

// Main Enhanced Soil Cross Section
function EnhancedSoilCrossSection({ plasticLevel, onApplySolution }) {
  const bottleCount = Math.floor(plasticLevel / 15);
  const bagCount = Math.floor(plasticLevel / 20);
  const strawCount = Math.floor(plasticLevel / 12);
  const containerCount = Math.floor(plasticLevel / 25);
  const cupCount = Math.floor(plasticLevel / 18);
  const wormCount = Math.max(0, 5 - Math.floor(plasticLevel / 20));

  // Generate plastic items
  const bottles = useMemo(() => {
    return Array.from({ length: bottleCount }).map((_, i) => ({
      position: [(Math.random() - 0.5) * 3, Math.random() * 1.2 - 0.3, (Math.random() - 0.5) * 1.8],
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
      scale: 0.3 + Math.random() * 0.2
    }));
  }, [bottleCount]);

  const bags = useMemo(() => {
    return Array.from({ length: bagCount }).map((_, i) => ({
      position: [(Math.random() - 0.5) * 3.2, Math.random() * 1.5 - 0.2, (Math.random() - 0.5) * 1.8],
      rotation: [Math.random() * 0.5, Math.random() * Math.PI, Math.random() * 0.5]
    }));
  }, [bagCount]);

  const straws = useMemo(() => {
    return Array.from({ length: strawCount }).map((_, i) => ({
      position: [(Math.random() - 0.5) * 3, Math.random() * 1 - 0.2, (Math.random() - 0.5) * 1.6],
      rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
      color: ["#ec4899", "#f97316", "#84cc16", "#06b6d4", "#a855f7"][i % 5]
    }));
  }, [strawCount]);

  const containers = useMemo(() => {
    return Array.from({ length: containerCount }).map((_, i) => ({
      position: [(Math.random() - 0.5) * 2.8, Math.random() * 0.8 + 0.2, (Math.random() - 0.5) * 1.5],
      rotation: [0, Math.random() * Math.PI, Math.random() * 0.3]
    }));
  }, [containerCount]);

  const cups = useMemo(() => {
    return Array.from({ length: cupCount }).map((_, i) => ({
      position: [(Math.random() - 0.5) * 3, Math.random() * 1 - 0.1, (Math.random() - 0.5) * 1.6],
      rotation: [Math.random() * Math.PI * 0.3, Math.random() * Math.PI, Math.random() * 0.3]
    }));
  }, [cupCount]);

  const worms = useMemo(() => {
    return Array.from({ length: 5 }).map((_, i) => ({
      position: [(Math.random() - 0.5) * 2.5, 0.3 + Math.random() * 0.4, (Math.random() - 0.5) * 1.5],
      isHealthy: i < wormCount
    }));
  }, [wormCount]);

  return (
    <group position={[0, -0.5, 0]}>
      {/* Glass Terrarium */}
      <GlassTerrarium />

      {/* Soil Layers */}
      <SoilLayers plasticLevel={plasticLevel} />

      {/* Plant */}
      <HealthyPlant plasticLevel={plasticLevel} />

      {/* Root System */}
      <RootSystem plasticLevel={plasticLevel} />

      {/* Worms */}
      {worms.map((worm, i) => (
        <EnhancedWorm 
          key={i} 
          position={worm.position} 
          isHealthy={worm.isHealthy}
          index={i}
        />
      ))}

      {/* Plastic Bottles */}
      {bottles.map((bottle, i) => (
        <PlasticBottle
          key={`bottle-${i}`}
          position={bottle.position}
          rotation={bottle.rotation}
          scale={bottle.scale}
          plasticLevel={plasticLevel}
        />
      ))}

      {/* Plastic Bags */}
      {bags.map((bag, i) => (
        <PlasticBag
          key={`bag-${i}`}
          position={bag.position}
          rotation={bag.rotation}
          plasticLevel={plasticLevel}
        />
      ))}

      {/* Straws */}
      {straws.map((straw, i) => (
        <PlasticStraw
          key={`straw-${i}`}
          position={straw.position}
          rotation={straw.rotation}
          color={straw.color}
        />
      ))}

      {/* Food Containers */}
      {containers.map((container, i) => (
        <FoodContainer
          key={`container-${i}`}
          position={container.position}
          rotation={container.rotation}
        />
      ))}

      {/* Cups */}
      {cups.map((cup, i) => (
        <PlasticCup
          key={`cup-${i}`}
          position={cup.position}
          rotation={cup.rotation}
        />
      ))}

      {/* Microplastics */}
      {plasticLevel > 15 && <Microplastics plasticLevel={plasticLevel} />}

      {/* Info Panel */}
      <InfoPanel plasticLevel={plasticLevel} />

      {/* Educational Tooltips */}
      {plasticLevel > 30 && (
        <EducationalTooltip 
          position={[-1.5, 1.2, 1.5]} 
          text="Plastic bottles take 450+ years to decompose in soil!"
          icon="🍾"
        />
      )}
      {plasticLevel > 50 && (
        <EducationalTooltip 
          position={[1.2, 0.8, 1.5]} 
          text="Microplastics contaminate groundwater and harm organisms."
          icon="💧"
        />
      )}
      {plasticLevel > 70 && (
        <EducationalTooltip 
          position={[0, 1.8, 1.3]} 
          text="High plastic levels kill earthworms and damage plant roots!"
          icon="⚠️"
        />
      )}

      {/* Solutions Panel - Appears when pollution exceeds 60% */}
      {plasticLevel >= 60 && <SolutionsPanel plasticLevel={plasticLevel} onApplySolution={onApplySolution} />}
    </group>
  );
}

// ============================================
// AIR LAB COMPONENTS
// ============================================

// Dynamic Sky that changes from blue to gray to dark based on smoke level
function DynamicSky({ smokeLevel }) {
  const skyColor = useMemo(() => {
    const blue = new THREE.Color("#87CEEB");
    const gray = new THREE.Color("#6b7280");
    const dark = new THREE.Color("#1f2937");
    
    if (smokeLevel < 50) {
      return blue.lerp(gray, smokeLevel / 50);
    } else {
      return gray.clone().lerp(dark, (smokeLevel - 50) / 50);
    }
  }, [smokeLevel]);

  return <color attach="background" args={[skyColor]} />;
}

// Sun that dims based on smoke level
function Sun({ smokeLevel }) {
  const sunRef = useRef(null);
  const glowRef = useRef(null);
  
  const sunOpacity = Math.max(0.2, 1 - smokeLevel / 100);
  const sunColor = useMemo(() => {
    const bright = new THREE.Color("#ffd700");
    const dim = new THREE.Color("#9ca3af");
    return bright.lerp(dim, smokeLevel / 100);
  }, [smokeLevel]);

  useFrame((state) => {
    if (sunRef.current) {
      sunRef.current.rotation.z = state.clock.elapsedTime * 0.1;
    }
    if (glowRef.current) {
      glowRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.05);
    }
  });

  return (
    <group position={[4, 4, -5]}>
      {/* Sun glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshBasicMaterial 
          color={sunColor} 
          transparent 
          opacity={sunOpacity * 0.3}
        />
      </mesh>
      {/* Sun core */}
      <mesh ref={sunRef}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshBasicMaterial 
          color={sunColor} 
          transparent 
          opacity={sunOpacity}
        />
      </mesh>
    </group>
  );
}

// Trees that turn brown based on smoke level
function PollutedTrees({ smokeLevel, treeCount }) {
  const treesData = useMemo(() => {
    const trees = [];
    for (let i = 0; i < treeCount; i++) {
      trees.push({
        position: [
          -6 + Math.random() * 3,
          -1.5,
          -3 + Math.random() * 6
        ],
        scale: 0.8 + Math.random() * 0.4,
        rotation: Math.random() * Math.PI * 2
      });
    }
    return trees;
  }, [treeCount]);

  const leafColor = useMemo(() => {
    const green = new THREE.Color("#22c55e");
    const brown = new THREE.Color("#92400e");
    return green.lerp(brown, smokeLevel / 100);
  }, [smokeLevel]);

  const trunkColor = "#5c4033";

  return (
    <>
      {treesData.map((tree, i) => (
        <group key={i} position={tree.position} scale={tree.scale} rotation={[0, tree.rotation, 0]}>
          {/* Trunk */}
          <mesh position={[0, 0.4, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.12, 0.8, 8]} />
            <meshStandardMaterial color={trunkColor} roughness={0.8} />
          </mesh>
          {/* Foliage layers */}
          <mesh position={[0, 1, 0]} castShadow>
            <coneGeometry args={[0.5, 0.8, 8]} />
            <meshStandardMaterial color={leafColor} roughness={0.7} />
          </mesh>
          <mesh position={[0, 1.4, 0]} castShadow>
            <coneGeometry args={[0.4, 0.6, 8]} />
            <meshStandardMaterial color={leafColor} roughness={0.7} />
          </mesh>
          <mesh position={[0, 1.7, 0]} castShadow>
            <coneGeometry args={[0.25, 0.4, 8]} />
            <meshStandardMaterial color={leafColor} roughness={0.7} />
          </mesh>
        </group>
      ))}
    </>
  );
}

// Moving vehicles on road
function MovingVehicles({ trafficLevel }) {
  const vehiclesRef = useRef([]);
  const vehicleCount = Math.floor(trafficLevel / 20) + 1;

  const vehiclesData = useMemo(() => {
    const vehicles = [];
    for (let i = 0; i < vehicleCount; i++) {
      vehicles.push({
        startX: -8 + (i * 4),
        speed: 0.02 + Math.random() * 0.02,
        z: -0.5 + (i % 2) * 1,
        color: ["#ef4444", "#3b82f6", "#f59e0b", "#10b981", "#8b5cf6"][i % 5],
        type: i % 3 === 0 ? "truck" : "car"
      });
    }
    return vehicles;
  }, [vehicleCount]);

  useFrame((state) => {
    vehiclesRef.current.forEach((vehicle, i) => {
      if (vehicle) {
        vehicle.position.x += vehiclesData[i]?.speed || 0.02;
        if (vehicle.position.x > 8) {
          vehicle.position.x = -8;
        }
      }
    });
  });

  return (
    <group position={[0, -1.3, 2]}>
      {/* Road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 2]} />
        <meshStandardMaterial color="#374151" roughness={0.9} />
      </mesh>
      {/* Road markings */}
      {[-6, -3, 0, 3, 6].map((x, i) => (
        <mesh key={i} position={[x, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.5, 0.1]} />
          <meshBasicMaterial color="#fbbf24" />
        </mesh>
      ))}
      
      {/* Vehicles */}
      {vehiclesData.map((data, i) => (
        <group
          key={i}
          ref={(el) => { if (el) vehiclesRef.current[i] = el; }}
          position={[data.startX, 0.15, data.z]}
        >
          {data.type === "truck" ? (
            // Truck
            <>
              <mesh castShadow>
                <boxGeometry args={[0.8, 0.3, 0.4]} />
                <meshStandardMaterial color={data.color} metalness={0.3} roughness={0.5} />
              </mesh>
              <mesh position={[0.35, 0.1, 0]} castShadow>
                <boxGeometry args={[0.25, 0.2, 0.35]} />
                <meshStandardMaterial color="#1f2937" metalness={0.4} roughness={0.4} />
              </mesh>
              {/* Exhaust smoke from truck */}
              <mesh position={[-0.45, 0.2, 0.15]}>
                <sphereGeometry args={[0.08, 8, 8]} />
                <meshBasicMaterial color="#6b7280" transparent opacity={0.5 * (trafficLevel / 100)} />
              </mesh>
            </>
          ) : (
            // Car
            <>
              <mesh castShadow>
                <boxGeometry args={[0.5, 0.2, 0.3]} />
                <meshStandardMaterial color={data.color} metalness={0.5} roughness={0.4} />
              </mesh>
              <mesh position={[0, 0.15, 0]} castShadow>
                <boxGeometry args={[0.3, 0.12, 0.25]} />
                <meshStandardMaterial color="#1f2937" metalness={0.4} roughness={0.3} />
              </mesh>
              {/* Wheels */}
              {[[-0.15, -0.1, 0.15], [0.15, -0.1, 0.15], [-0.15, -0.1, -0.15], [0.15, -0.1, -0.15]].map((pos, j) => (
                <mesh key={j} position={pos} rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.05, 0.05, 0.03, 12]} />
                  <meshStandardMaterial color="#1f2937" />
                </mesh>
              ))}
            </>
          )}
        </group>
      ))}
    </group>
  );
}

// Birds with coughing/falling animation
function Birds({ smokeLevel }) {
  const birdsRef = useRef([]);
  const birdCount = Math.max(1, 5 - Math.floor(smokeLevel / 25));

  const birdsData = useMemo(() => {
    const birds = [];
    for (let i = 0; i < 5; i++) {
      birds.push({
        position: [
          -3 + Math.random() * 6,
          2 + Math.random() * 2,
          -2 + Math.random() * 4
        ],
        speed: 0.5 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2
      });
    }
    return birds;
  }, []);

  useFrame((state) => {
    birdsRef.current.forEach((bird, i) => {
      if (bird && i < birdCount) {
        const data = birdsData[i];
        // Flying motion
        bird.position.x = data.position[0] + Math.sin(state.clock.elapsedTime * data.speed + data.phase) * 2;
        bird.position.y = data.position[1] + Math.sin(state.clock.elapsedTime * 2 + data.phase) * 0.3;
        
        // Wing flapping
        bird.children[1].rotation.z = Math.sin(state.clock.elapsedTime * 10) * 0.4;
        bird.children[2].rotation.z = -Math.sin(state.clock.elapsedTime * 10) * 0.4;
        
        // Coughing/shaking when smoke is high
        if (smokeLevel > 50) {
          bird.rotation.z = Math.sin(state.clock.elapsedTime * 20) * 0.1 * (smokeLevel / 100);
        } else {
          bird.rotation.z = 0;
        }
      } else if (bird && i >= birdCount) {
        // Falling animation for "affected" birds
        bird.position.y -= 0.01;
        bird.rotation.x += 0.02;
        if (bird.position.y < -2) {
          bird.visible = false;
        }
      }
    });
  });

  return (
    <>
      {birdsData.map((data, i) => (
        <group
          key={i}
          ref={(el) => { if (el) birdsRef.current[i] = el; }}
          position={data.position}
          scale={0.15}
        >
          {/* Body */}
          <mesh castShadow>
            <sphereGeometry args={[0.5, 8, 8]} />
            <meshStandardMaterial 
              color={i < birdCount ? "#1f2937" : "#6b7280"} 
              roughness={0.6} 
            />
          </mesh>
          {/* Left Wing */}
          <mesh position={[-0.5, 0, 0]} castShadow>
            <boxGeometry args={[0.8, 0.05, 0.4]} />
            <meshStandardMaterial 
              color={i < birdCount ? "#374151" : "#9ca3af"} 
              roughness={0.5} 
            />
          </mesh>
          {/* Right Wing */}
          <mesh position={[0.5, 0, 0]} castShadow>
            <boxGeometry args={[0.8, 0.05, 0.4]} />
            <meshStandardMaterial 
              color={i < birdCount ? "#374151" : "#9ca3af"} 
              roughness={0.5} 
            />
          </mesh>
          {/* Beak */}
          <mesh position={[0, 0, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.15, 0.3, 6]} />
            <meshStandardMaterial color="#f59e0b" />
          </mesh>
        </group>
      ))}
    </>
  );
}

// Enhanced Factory with taller chimneys
function EnhancedFactory({ smokeLevel }) {
  const smokeRefs = useRef([]);
  const smokeCount = 60 + Math.floor(smokeLevel * 1.2);

  const smokePositions = useMemo(() => {
    const positions = [];
    for (let chimney = 0; chimney < 3; chimney++) {
      const arr = new Float32Array((smokeCount / 3) * 3);
      for (let i = 0; i < smokeCount / 3; i++) {
        arr[i * 3] = (Math.random() - 0.5) * 0.4;
        arr[i * 3 + 1] = Math.random() * 0.5;
        arr[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
      }
      positions.push(arr);
    }
    return positions;
  }, [smokeCount]);

  useFrame(() => {
    smokeRefs.current.forEach((smokePoints, chimneyIdx) => {
      if (!smokePoints) return;
      const pos = smokePoints.geometry.attributes.position.array;
      const count = pos.length / 3;
      for (let i = 0; i < count; i++) {
        pos[i * 3 + 1] += 0.015 + smokeLevel * 0.0008;
        pos[i * 3] += (Math.random() - 0.5) * 0.01;
        if (pos[i * 3 + 1] > 4) {
          pos[i * 3] = (Math.random() - 0.5) * 0.4;
          pos[i * 3 + 1] = 0.3;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
        }
      }
      smokePoints.geometry.attributes.position.needsUpdate = true;
    });
  });

  const smokeColor = useMemo(() => {
    const light = new THREE.Color("#d1d5db");
    const dark = new THREE.Color("#1f2937");
    return light.lerp(dark, smokeLevel / 100);
  }, [smokeLevel]);

  const chimneyPositions = [-0.8, 0, 0.8];

  return (
    <group position={[-4, -1.5, -2]}>
      {/* Main Factory Building */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[3, 1.2, 1.5]} />
        <meshStandardMaterial color="#4b5563" roughness={0.7} metalness={0.2} />
      </mesh>
      
      {/* Factory windows */}
      {[-0.9, -0.3, 0.3, 0.9].map((x, i) => (
        <mesh key={i} position={[x, 0.7, 0.76]} castShadow>
          <boxGeometry args={[0.3, 0.4, 0.02]} />
          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.3} />
        </mesh>
      ))}

      {/* Tall Chimneys */}
      {chimneyPositions.map((x, idx) => (
        <group key={idx} position={[x, 1.2, 0]}>
          {/* Chimney base */}
          <mesh castShadow>
            <cylinderGeometry args={[0.2, 0.25, 0.4, 12]} />
            <meshStandardMaterial color="#374151" roughness={0.6} metalness={0.3} />
          </mesh>
          {/* Tall chimney */}
          <mesh position={[0, 0.9, 0]} castShadow>
            <cylinderGeometry args={[0.15, 0.2, 1.5, 12]} />
            <meshStandardMaterial color="#6b7280" roughness={0.5} metalness={0.3} />
          </mesh>
          {/* Chimney top ring */}
          <mesh position={[0, 1.65, 0]} castShadow>
            <torusGeometry args={[0.18, 0.04, 12, 24]} />
            <meshStandardMaterial color="#9ca3af" roughness={0.4} metalness={0.4} />
          </mesh>
          {/* Red warning light */}
          <mesh position={[0, 1.75, 0]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial color="#ef4444" />
          </mesh>
          
          {/* Smoke particles for each chimney */}
          <points 
            ref={(el) => { if (el) smokeRefs.current[idx] = el; }}
            position={[0, 1.7, 0]}
          >
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={smokeCount / 3}
                array={smokePositions[idx]}
                itemSize={3}
              />
            </bufferGeometry>
            <pointsMaterial
              size={0.15 + smokeLevel * 0.002}
              color={smokeColor}
              transparent
              opacity={0.6 + smokeLevel * 0.003}
              sizeAttenuation
            />
          </points>
        </group>
      ))}
      
      {/* Tooltip */}
      <Html position={[0, 3.5, 0]} center>
        <div className="bg-slate-900/90 text-white text-xs px-3 py-2 rounded-lg max-w-[200px] text-center shadow-lg border border-slate-700">
          💨 Smoke from factories makes air dirty and hard to breathe.
        </div>
      </Html>
    </group>
  );
}

function AirParticles({ smokeLevel }) {
  const particlesRef = useRef(null);
  const count = Math.floor(50 + smokeLevel * 10);

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 2.5;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2.5;

      const pollution = smokeLevel / 100;
      const r = 0.8 - pollution * 0.5;
      const g = 0.8 - pollution * 0.6;
      const b = 0.8 - pollution * 0.4;
      colors[i * 3] = r;
      colors[i * 3 + 1] = g;
      colors[i * 3 + 2] = b;
    }

    return { positions, colors };
  }, [count, smokeLevel]);

  useFrame(() => {
    if (!particlesRef.current) return;
    const pos =
      particlesRef.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      pos[i * 3] += (Math.random() - 0.5) * 0.01;
      pos[i * 3 + 1] += (Math.random() - 0.5) * 0.01 + 0.002;
      pos[i * 3 + 2] += (Math.random() - 0.5) * 0.01;

      if (Math.abs(pos[i * 3]) > 1.3) pos[i * 3] *= -0.9;
      if (pos[i * 3 + 1] > 1.3) pos[i * 3 + 1] = -1.2;
      if (Math.abs(pos[i * 3 + 2]) > 1.3) pos[i * 3 + 2] *= -0.9;
    }
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={particles.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04 + smokeLevel * 0.001}
        vertexColors
        transparent
        opacity={0.6 + smokeLevel * 0.004}
        sizeAttenuation
      />
    </points>
  );
}

function LightRays({ smokeLevel }) {
  const rayRef = useRef(null);

  useFrame(() => {
    if (rayRef.current) {
      const mat = rayRef.current.material;
      mat.opacity = 0.1 + (smokeLevel / 100) * 0.4;
    }
  });

  return (
    <mesh
      ref={rayRef}
      position={[0.8, 0, 0]}
      rotation={[0, 0, -Math.PI / 6]}
      castShadow
    >
      <coneGeometry args={[0.5, 3, 32, 1, true]} />
      <meshBasicMaterial
        color="#fff8dc"
        transparent
        opacity={0.1}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

function AirCube({ smokeLevel }) {
  const cubeRef = useRef(null);

  useFrame((state) => {
    if (cubeRef.current) {
      cubeRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group ref={cubeRef} position={[0, 0, 0]}>
      {/* Transparent Cube */}
      <mesh castShadow>
        <boxGeometry args={[3, 3, 3]} />
        <MeshTransmissionMaterial
          backside
          samples={8}
          thickness={0.15}
          transmission={0.95}
          roughness={0.05}
          color="#ffffff"
        />
      </mesh>

      {/* Cube Edges */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(3, 3, 3)]} />
        <lineBasicMaterial color="#60a5fa" linewidth={2} />
      </lineSegments>

      {/* Air Particles */}
      <AirParticles smokeLevel={smokeLevel} />

      {/* Light Rays */}
      <LightRays smokeLevel={smokeLevel} />
    </group>
  );
}

function AQIDisplay({ smokeLevel }) {
  const aqi = Math.floor(50 + (smokeLevel / 100) * 200);

  const getAQIColor = (aqi) => {
    if (aqi <= 50) return "#00e400";
    if (aqi <= 100) return "#ffff00";
    if (aqi <= 150) return "#ff7e00";
    if (aqi <= 200) return "#ff0000";
    return "#7e0023";
  };

  const getAQILabel = (aqi) => {
    if (aqi <= 50) return "Good";
    if (aqi <= 100) return "Moderate";
    if (aqi <= 150) return "Unhealthy (SG)";
    if (aqi <= 200) return "Unhealthy";
    return "Very Unhealthy";
  };

  return (
    <group position={[2.5, 1, 0]}>
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.3}>
        <RoundedBox args={[1.8, 1.2, 0.1]} radius={0.1}>
          <meshStandardMaterial
            color="#1e293b"
            metalness={0.5}
            roughness={0.3}
          />
        </RoundedBox>
        <Text position={[0, 0.35, 0.1]} fontSize={0.15} color="#94a3b8">
          Air Quality Index
        </Text>
        <Text
          position={[0, 0, 0.1]}
          fontSize={0.35}
          color={getAQIColor(aqi)}
        >
          {aqi}
        </Text>
        <Text
          position={[0, -0.35, 0.1]}
          fontSize={0.12}
          color={getAQIColor(aqi)}
        >
          {getAQILabel(aqi)}
        </Text>
      </Float>
    </group>
  );
}

function FactoryWithSmoke({ smokeLevel }) {
  const smokeRef = useRef(null);
  const smokeCount = 40 + Math.floor(smokeLevel * 0.8);

  const positions = useMemo(() => {
    const arr = new Float32Array(smokeCount * 3);
    for (let i = 0; i < smokeCount; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 0.6;
      arr[i * 3 + 1] = Math.random() * 0.5;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 0.6;
    }
    return arr;
  }, [smokeCount]);

  useFrame(() => {
    if (!smokeRef.current) return;
    const pos =
      smokeRef.current.geometry.attributes.position.array;
    for (let i = 0; i < smokeCount; i++) {
      pos[i * 3 + 1] += 0.01 + smokeLevel * 0.0006;
      if (pos[i * 3 + 1] > 3) {
        pos[i * 3] = (Math.random() - 0.5) * 0.6;
        pos[i * 3 + 1] = 0.5;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 0.6;
      }
    }
    smokeRef.current.geometry.attributes.position.needsUpdate = true;
  });

  const smokeColor = new THREE.Color("#e5e7eb").lerp(
    new THREE.Color("#111827"),
    smokeLevel / 100
  );

  return (
    <group position={[-3, -1.2, -1]}>
      {/* Factory building */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[2, 1, 1.2]} />
        <meshStandardMaterial color="#4b5563" roughness={0.7} />
      </mesh>

      {/* Chimneys */}
      {[-0.6, 0, 0.6].map((x, idx) => (
        <group key={idx} position={[x, 1.2, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.15, 0.15, 0.9, 12]} />
            <meshStandardMaterial color="#6b7280" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.45, 0]} castShadow>
            <torusGeometry args={[0.18, 0.04, 12, 24]} />
            <meshStandardMaterial color="#9ca3af" roughness={0.4} />
          </mesh>
        </group>
      ))}

      {/* Smoke particles */}
      <points ref={smokeRef} position={[0, 1.3, 0]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={smokeCount}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.12}
          color={smokeColor}
          transparent
          opacity={0.7}
          sizeAttenuation
        />
      </points>
    </group>
  );
}

// ============================================
// TREE LIFE CYCLE COMPONENTS
// ============================================

const TREE_STAGES = [
  { id: 0, name: "Seed", range: [0, 14] },
  { id: 1, name: "Germination", range: [15, 28] },
  { id: 2, name: "Seedling", range: [29, 42] },
  { id: 3, name: "Sapling", range: [43, 57] },
  { id: 4, name: "Mature Tree", range: [58, 72] },
  { id: 5, name: "Aging Tree", range: [73, 86] },
  { id: 6, name: "Dead Tree", range: [87, 100] },
];

function getTreeStage(progress) {
  for (const stage of TREE_STAGES) {
    if (progress >= stage.range[0] && progress <= stage.range[1]) {
      return stage;
    }
  }
  return TREE_STAGES[0];
}

// Soft rolling hills in the background
function DistantHills() {
  return (
    <group position={[0, -2, -15]}>
      {/* Hill 1 */}
      <mesh position={[-8, 0, 0]}>
        <sphereGeometry args={[6, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#4ade80" roughness={0.9} />
      </mesh>
      {/* Hill 2 */}
      <mesh position={[0, 0, -3]}>
        <sphereGeometry args={[8, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#22c55e" roughness={0.9} />
      </mesh>
      {/* Hill 3 */}
      <mesh position={[10, 0, 2]}>
        <sphereGeometry args={[5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#86efac" roughness={0.9} />
      </mesh>
    </group>
  );
}

// Ground with grass
function TreeGround({ progress }) {
  const grassColor = useMemo(() => {
    if (progress > 85) return "#78716c"; // Dead stage - gray
    if (progress > 72) return "#a3a83a"; // Aging - yellowish
    return "#22c55e"; // Healthy green
  }, [progress]);

  return (
    <group>
      {/* Main ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
        <circleGeometry args={[12, 64]} />
        <meshStandardMaterial color={grassColor} roughness={0.9} />
      </mesh>
      {/* Soil patch for the tree */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.49, 0]} receiveShadow>
        <circleGeometry args={[1.5, 32]} />
        <meshStandardMaterial color="#78350f" roughness={1} />
      </mesh>
    </group>
  );
}

// Seed component
function TreeSeed({ progress }) {
  const visible = progress < 20;
  const ref = useRef(null);
  const crackProgress = Math.max(0, (progress - 10) / 10); // Start cracking at 10%
  
  useFrame((state) => {
    if (ref.current && visible) {
      ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  if (!visible) return null;

  return (
    <group ref={ref} position={[0, -1.35, 0]}>
      {/* Seed body */}
      <mesh castShadow>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial 
          color="#92400e" 
          roughness={0.8}
        />
      </mesh>
      {/* Seed stripe */}
      <mesh position={[0, 0, 0.1]} rotation={[0, 0, Math.PI / 4]}>
        <planeGeometry args={[0.25, 0.03]} />
        <meshStandardMaterial color="#78350f" />
      </mesh>
      {/* Crack effect */}
      {crackProgress > 0 && (
        <mesh position={[0, 0, 0.16]}>
          <planeGeometry args={[0.02, 0.1 * crackProgress]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  );
}

// Sprout/Root emerging
function TreeSprout({ progress }) {
  const visible = progress >= 15 && progress < 35;
  const sproutHeight = Math.min(0.3, (progress - 15) / 50);
  const rootLength = Math.min(0.2, (progress - 15) / 60);
  const ref = useRef(null);

  useFrame((state) => {
    if (ref.current && visible) {
      ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 2) * 0.03;
    }
  });

  if (!visible) return null;

  return (
    <group ref={ref} position={[0, -1.35, 0]}>
      {/* Root going down */}
      <mesh position={[0, -rootLength / 2 - 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.01, rootLength, 8]} />
        <meshStandardMaterial color="#fef3c7" />
      </mesh>
      {/* Stem coming up */}
      <mesh position={[0, sproutHeight / 2, 0]} castShadow>
        <cylinderGeometry args={[0.025, 0.02, sproutHeight, 8]} />
        <meshStandardMaterial color="#84cc16" />
      </mesh>
      {/* First tiny leaves */}
      {progress > 20 && (
        <>
          <mesh position={[-0.05, sproutHeight + 0.03, 0]} rotation={[0, 0, -0.5]} castShadow>
            <sphereGeometry args={[0.04, 8, 8, 0, Math.PI]} />
            <meshStandardMaterial color="#4ade80" />
          </mesh>
          <mesh position={[0.05, sproutHeight + 0.03, 0]} rotation={[0, 0, 0.5]} castShadow>
            <sphereGeometry args={[0.04, 8, 8, 0, Math.PI]} />
            <meshStandardMaterial color="#4ade80" />
          </mesh>
        </>
      )}
    </group>
  );
}

// Seedling with small leaves
function TreeSeedling({ progress }) {
  const visible = progress >= 29 && progress < 45;
  const scale = Math.min(1, (progress - 29) / 15);
  const ref = useRef(null);

  useFrame((state) => {
    if (ref.current && visible) {
      // Gentle swaying
      ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
    }
  });

  if (!visible) return null;

  return (
    <group ref={ref} position={[0, -1.3, 0]} scale={scale}>
      {/* Thin stem */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.04, 0.5, 8]} />
        <meshStandardMaterial color="#84cc16" />
      </mesh>
      {/* Leaves */}
      {[0, 1, 2, 3].map((i) => (
        <group key={i} position={[0, 0.35 + i * 0.08, 0]} rotation={[0, (i * Math.PI) / 2, 0]}>
          <mesh position={[0.1, 0, 0]} rotation={[0, 0, -0.3]} castShadow>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial color="#4ade80" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Young sapling tree
function TreeSapling({ progress }) {
  const visible = progress >= 43 && progress < 60;
  const scale = Math.min(1, (progress - 43) / 15);
  const ref = useRef(null);

  useFrame((state) => {
    if (ref.current && visible) {
      ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 1) * 0.03;
    }
  });

  if (!visible) return null;

  return (
    <group ref={ref} position={[0, -1.2, 0]} scale={0.5 + scale * 0.5}>
      {/* Trunk */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.1, 1.2, 12]} />
        <meshStandardMaterial color="#92400e" roughness={0.8} />
      </mesh>
      {/* Branches */}
      {[0, 1, 2].map((i) => (
        <group key={i} position={[0, 0.8 + i * 0.25, 0]} rotation={[0, (i * Math.PI * 2) / 3, 0]}>
          <mesh position={[0.2, 0.1, 0]} rotation={[0, 0, -0.8]} castShadow>
            <cylinderGeometry args={[0.02, 0.03, 0.3, 8]} />
            <meshStandardMaterial color="#78350f" />
          </mesh>
          {/* Leaf clusters */}
          <mesh position={[0.35, 0.15, 0]} castShadow>
            <sphereGeometry args={[0.15, 12, 12]} />
            <meshStandardMaterial color="#22c55e" roughness={0.7} />
          </mesh>
        </group>
      ))}
      {/* Top canopy */}
      <mesh position={[0, 1.4, 0]} castShadow>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color="#22c55e" roughness={0.7} />
      </mesh>
    </group>
  );
}

// Mature full tree
function MatureTree({ progress }) {
  const visible = progress >= 58 && progress < 75;
  const scale = Math.min(1, (progress - 58) / 10);
  const ref = useRef(null);
  const leavesRef = useRef(null);

  useFrame((state) => {
    if (leavesRef.current && visible) {
      // Gentle rustling
      leavesRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    }
  });

  if (!visible) return null;

  return (
    <group ref={ref} position={[0, -1, 0]} scale={0.7 + scale * 0.3}>
      {/* Main trunk */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.2, 2, 16]} />
        <meshStandardMaterial color="#78350f" roughness={0.9} />
      </mesh>
      {/* Trunk texture lines */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[0.15, 0.3 + i * 0.3, 0]} rotation={[0, (i * Math.PI) / 2, Math.PI / 2]}>
          <planeGeometry args={[0.4, 0.02]} />
          <meshStandardMaterial color="#451a03" roughness={1} />
        </mesh>
      ))}
      
      {/* Branch structure */}
      <group ref={leavesRef}>
        {/* Main branches */}
        {[0, 1, 2, 3, 4].map((i) => (
          <group key={i} position={[0, 1.5 + i * 0.15, 0]} rotation={[0, (i * Math.PI * 2) / 5, 0]}>
            <mesh position={[0.4, 0, 0]} rotation={[0, 0, -0.6]} castShadow>
              <cylinderGeometry args={[0.03, 0.05, 0.6, 8]} />
              <meshStandardMaterial color="#78350f" />
            </mesh>
            {/* Leaf clusters */}
            <mesh position={[0.6, 0.15, 0]} castShadow>
              <sphereGeometry args={[0.35, 16, 16]} />
              <meshStandardMaterial color="#16a34a" roughness={0.7} />
            </mesh>
          </group>
        ))}
        
        {/* Top canopy */}
        <mesh position={[0, 2.3, 0]} castShadow>
          <sphereGeometry args={[0.6, 24, 24]} />
          <meshStandardMaterial color="#22c55e" roughness={0.6} />
        </mesh>
        <mesh position={[0.3, 2.1, 0.2]} castShadow>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshStandardMaterial color="#4ade80" roughness={0.6} />
        </mesh>
        <mesh position={[-0.25, 2.15, -0.15]} castShadow>
          <sphereGeometry args={[0.35, 16, 16]} />
          <meshStandardMaterial color="#15803d" roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}

// Butterflies around the tree
function Butterflies({ progress }) {
  const visible = progress >= 60 && progress < 75;
  const butterfliesRef = useRef([]);
  
  const butterfliesData = useMemo(() => {
    return Array.from({ length: 4 }).map((_, i) => ({
      offset: (i * Math.PI * 2) / 4,
      radius: 1.5 + Math.random() * 0.5,
      height: 1.5 + Math.random() * 1,
      speed: 0.8 + Math.random() * 0.4,
      color: ["#ec4899", "#f59e0b", "#8b5cf6", "#06b6d4"][i]
    }));
  }, []);

  useFrame((state) => {
    butterfliesRef.current.forEach((butterfly, i) => {
      if (butterfly && visible) {
        const data = butterfliesData[i];
        const t = state.clock.elapsedTime * data.speed + data.offset;
        butterfly.position.x = Math.cos(t) * data.radius;
        butterfly.position.z = Math.sin(t) * data.radius;
        butterfly.position.y = data.height + Math.sin(t * 2) * 0.3;
        butterfly.rotation.y = t + Math.PI / 2;
        // Wing flapping
        if (butterfly.children[1]) {
          butterfly.children[1].rotation.y = Math.sin(state.clock.elapsedTime * 15) * 0.5;
        }
        if (butterfly.children[2]) {
          butterfly.children[2].rotation.y = -Math.sin(state.clock.elapsedTime * 15) * 0.5;
        }
      }
    });
  });

  if (!visible) return null;

  return (
    <group>
      {butterfliesData.map((data, i) => (
        <group
          key={i}
          ref={(el) => { if (el) butterfliesRef.current[i] = el; }}
          position={[0, data.height, 0]}
          scale={0.1}
        >
          {/* Body */}
          <mesh castShadow>
            <capsuleGeometry args={[0.2, 0.6, 4, 8]} />
            <meshStandardMaterial color="#1f2937" />
          </mesh>
          {/* Left wing */}
          <mesh position={[-0.4, 0, 0]}>
            <circleGeometry args={[0.5, 16]} />
            <meshStandardMaterial color={data.color} side={THREE.DoubleSide} />
          </mesh>
          {/* Right wing */}
          <mesh position={[0.4, 0, 0]}>
            <circleGeometry args={[0.5, 16]} />
            <meshStandardMaterial color={data.color} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Small birds
function TreeBirds({ progress }) {
  const visible = progress >= 62 && progress < 73;
  const birdsRef = useRef([]);

  useFrame((state) => {
    birdsRef.current.forEach((bird, i) => {
      if (bird && visible) {
        const t = state.clock.elapsedTime + i * 2;
        bird.position.x = Math.sin(t * 0.5) * 2;
        bird.position.y = 2.5 + Math.sin(t) * 0.2;
        bird.position.z = Math.cos(t * 0.5) * 1.5;
        // Wing flapping
        if (bird.children[1]) {
          bird.children[1].rotation.z = Math.sin(state.clock.elapsedTime * 12) * 0.4;
        }
        if (bird.children[2]) {
          bird.children[2].rotation.z = -Math.sin(state.clock.elapsedTime * 12) * 0.4;
        }
      }
    });
  });

  if (!visible) return null;

  return (
    <group>
      {[0, 1, 2].map((i) => (
        <group
          key={i}
          ref={(el) => { if (el) birdsRef.current[i] = el; }}
          position={[0, 2.5, 0]}
          scale={0.08}
        >
          {/* Body */}
          <mesh castShadow>
            <sphereGeometry args={[1, 8, 8]} />
            <meshStandardMaterial color={["#ef4444", "#3b82f6", "#f59e0b"][i]} />
          </mesh>
          {/* Left wing */}
          <mesh position={[-1, 0, 0]}>
            <boxGeometry args={[1.5, 0.1, 0.8]} />
            <meshStandardMaterial color="#374151" />
          </mesh>
          {/* Right wing */}
          <mesh position={[1, 0, 0]}>
            <boxGeometry args={[1.5, 0.1, 0.8]} />
            <meshStandardMaterial color="#374151" />
          </mesh>
          {/* Beak */}
          <mesh position={[0, 0, 1]} rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.3, 0.5, 6]} />
            <meshStandardMaterial color="#fbbf24" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Aging tree with color changes
function AgingTree({ progress }) {
  const visible = progress >= 73 && progress < 88;
  const agingFactor = (progress - 73) / 15;
  const ref = useRef(null);
  const fallingLeavesRef = useRef([]);

  const leafColor = useMemo(() => {
    const green = new THREE.Color("#22c55e");
    const yellow = new THREE.Color("#fbbf24");
    const brown = new THREE.Color("#a16207");
    if (agingFactor < 0.5) {
      return green.lerp(yellow, agingFactor * 2);
    }
    return yellow.clone().lerp(brown, (agingFactor - 0.5) * 2);
  }, [agingFactor]);

  // Falling leaves
  const fallingLeaves = useMemo(() => {
    return Array.from({ length: Math.floor(agingFactor * 15) }).map((_, i) => ({
      startPos: [(Math.random() - 0.5) * 1.5, 2 + Math.random(), (Math.random() - 0.5) * 1.5],
      speed: 0.3 + Math.random() * 0.3,
      rotSpeed: 1 + Math.random() * 2,
      offset: Math.random() * Math.PI * 2
    }));
  }, [agingFactor]);

  useFrame((state) => {
    fallingLeavesRef.current.forEach((leaf, i) => {
      if (leaf) {
        const data = fallingLeaves[i];
        if (data) {
          const t = (state.clock.elapsedTime * data.speed + data.offset) % 4;
          leaf.position.y = data.startPos[1] - t * 0.8;
          leaf.position.x = data.startPos[0] + Math.sin(t * 3) * 0.3;
          leaf.rotation.x = t * data.rotSpeed;
          leaf.rotation.z = t * data.rotSpeed * 0.5;
          if (leaf.position.y < -1.4) {
            leaf.position.y = data.startPos[1];
          }
        }
      }
    });
  });

  if (!visible) return null;

  return (
    <group ref={ref} position={[0, -1, 0]}>
      {/* Trunk with cracks */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.22, 2, 16]} />
        <meshStandardMaterial color="#6b5a47" roughness={1} />
      </mesh>
      {/* Cracks on trunk */}
      {[0.3, 0.6, 1, 1.3].map((y, i) => (
        <mesh key={i} position={[0.13, y, 0]} rotation={[0, 0, Math.PI / 2 + i * 0.1]}>
          <planeGeometry args={[0.15, 0.02]} />
          <meshStandardMaterial color="#1c1917" />
        </mesh>
      ))}
      
      {/* Sparse canopy */}
      <group>
        {[0, 1, 2, 3].map((i) => (
          <group key={i} position={[0, 1.5 + i * 0.2, 0]} rotation={[0, (i * Math.PI * 2) / 4, 0]}>
            <mesh position={[0.5, 0.1, 0]} castShadow>
              <sphereGeometry args={[0.25 - agingFactor * 0.1, 12, 12]} />
              <meshStandardMaterial color={leafColor} roughness={0.7} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, 2.1, 0]} castShadow>
          <sphereGeometry args={[0.4 - agingFactor * 0.15, 16, 16]} />
          <meshStandardMaterial color={leafColor} roughness={0.7} />
        </mesh>
      </group>

      {/* Falling leaves */}
      {fallingLeaves.map((data, i) => (
        <mesh
          key={i}
          ref={(el) => { if (el) fallingLeavesRef.current[i] = el; }}
          position={data.startPos}
        >
          <planeGeometry args={[0.08, 0.06]} />
          <meshStandardMaterial color={leafColor} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

// Dead tree
function DeadTree({ progress }) {
  const visible = progress >= 87;
  const deadFactor = Math.min(1, (progress - 87) / 13);

  if (!visible) return null;

  return (
    <group position={[0, -1, 0]}>
      {/* Dead trunk */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.2, 1.8, 12]} />
        <meshStandardMaterial color="#57534e" roughness={1} />
      </mesh>
      
      {/* Broken branches */}
      <group position={[0, 1.4, 0]}>
        <mesh position={[0.3, 0, 0]} rotation={[0, 0, -0.8]} castShadow>
          <cylinderGeometry args={[0.02, 0.04, 0.4, 6]} />
          <meshStandardMaterial color="#78716c" />
        </mesh>
        <mesh position={[-0.25, 0.1, 0.1]} rotation={[0.3, 0, 0.6]} castShadow>
          <cylinderGeometry args={[0.02, 0.03, 0.3, 6]} />
          <meshStandardMaterial color="#78716c" />
        </mesh>
        {/* Broken branch tip */}
        <mesh position={[0.4, 0.15, 0]} rotation={[0, 0, -1.2]} castShadow>
          <cylinderGeometry args={[0.01, 0.02, 0.15, 6]} />
          <meshStandardMaterial color="#a8a29e" />
        </mesh>
      </group>

      {/* A few remaining dead leaves */}
      {deadFactor < 0.7 && (
        <group>
          <mesh position={[0.35, 1.5, 0]} rotation={[0.5, 0, 0.3]}>
            <planeGeometry args={[0.1, 0.08]} />
            <meshStandardMaterial color="#92400e" side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[-0.2, 1.55, 0.1]} rotation={[-0.3, 0.2, -0.2]}>
            <planeGeometry args={[0.08, 0.06]} />
            <meshStandardMaterial color="#a16207" side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}

      {/* Fallen branches on ground */}
      <mesh position={[0.8, -0.45, 0.3]} rotation={[0, 0.5, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.02, 0.03, 0.5, 6]} />
        <meshStandardMaterial color="#78716c" />
      </mesh>
      <mesh position={[-0.6, -0.45, -0.2]} rotation={[0, -0.3, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.015, 0.025, 0.35, 6]} />
        <meshStandardMaterial color="#a8a29e" />
      </mesh>

      {/* Fallen leaves on ground */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 2,
            -1.48,
            (Math.random() - 0.5) * 2
          ]}
          rotation={[-Math.PI / 2, 0, Math.random() * Math.PI]}
        >
          <planeGeometry args={[0.08, 0.06]} />
          <meshStandardMaterial color={["#92400e", "#a16207", "#78350f"][i % 3]} />
        </mesh>
      ))}
    </group>
  );
}

// Stage label display
function StageLabel({ progress }) {
  // Stage label is now shown in the UI overlay, not in 3D scene
  return null;
}

// Educational info panel
function TreeInfoPanel({ progress }) {
  // Info panel is now shown in the UI overlay, not in 3D scene
  return null;
}

// Main Tree Life Cycle Scene
function TreeLifeCycleScene({ progress }) {
  return (
    <>
      {/* Sky gradient */}
      <color attach="background" args={["#87CEEB"]} />
      <fog attach="fog" args={["#87CEEB", 15, 40]} />

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-5, 5, -5]} intensity={0.3} color="#fef3c7" />
      
      {/* Sun */}
      <mesh position={[8, 8, -10]}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshBasicMaterial color="#fef08a" />
      </mesh>
      {/* Sun glow */}
      <mesh position={[8, 8, -10]}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshBasicMaterial color="#fef08a" transparent opacity={0.3} />
      </mesh>

      {/* Environment */}
      <DistantHills />
      <TreeGround progress={progress} />

      {/* Tree Stages */}
      <TreeSeed progress={progress} />
      <TreeSprout progress={progress} />
      <TreeSeedling progress={progress} />
      <TreeSapling progress={progress} />
      <MatureTree progress={progress} />
      <AgingTree progress={progress} />
      <DeadTree progress={progress} />

      {/* Ecosystem elements */}
      <Butterflies progress={progress} />
      <TreeBirds progress={progress} />

      {/* UI Elements */}
      <StageLabel progress={progress} />
      <TreeInfoPanel progress={progress} />

      {/* Sparkles for magical feel */}
      <Sparkles
        count={30}
        scale={8}
        size={2}
        speed={0.3}
        opacity={0.5}
        color="#22c55e"
      />

      <OrbitControls
        enablePan={false}
        maxDistance={10}
        minDistance={4}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 4}
        autoRotate
        autoRotateSpeed={0.3}
      />
      <Environment preset="forest" />
    </>
  );
}

// ============================================
// MAIN LAB SCENE COMPONENTS
// ============================================

// Air Quality Info Panel
function AirInfoPanel({ smokeLevel, trafficLevel, treeCount }) {
  const aqi = Math.floor(50 + (smokeLevel / 100) * 200);
  const pm25 = Math.floor(10 + smokeLevel * 1.5);
  const co2 = Math.floor(400 + smokeLevel * 5);
  const o3 = Math.floor(20 + smokeLevel * 0.8);
  
  const healthStatus = smokeLevel < 30 ? "Good" : smokeLevel < 60 ? "Moderate" : "Unhealthy";
  const statusColor = smokeLevel < 30 ? "#4ade80" : smokeLevel < 60 ? "#fbbf24" : "#f87171";

  return (
    <Html position={[3.5, 0.5, 0]} center>
      <div className="bg-slate-900/95 border border-amber-500/50 rounded-xl p-3 backdrop-blur-sm shadow-xl w-52">
        <h3 className="text-amber-400 font-bold text-sm mb-2 flex items-center gap-2">
          🌬️ Air Quality Monitor
        </h3>
        
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">AQI</span>
            <span className="font-mono" style={{ color: statusColor }}>{aqi}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">PM2.5</span>
            <span className="text-white font-mono">{pm25} µg/m³</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">CO₂</span>
            <span className="text-white font-mono">{co2} ppm</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Ozone (O₃)</span>
            <span className="text-white font-mono">{o3} ppb</span>
          </div>
          
          <div className="pt-2 border-t border-slate-700 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Traffic</span>
              <span className="text-orange-400 font-mono">{trafficLevel}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Trees</span>
              <span className="text-green-400 font-mono">{treeCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Status</span>
              <span className="font-bold" style={{ color: statusColor }}>
                {healthStatus}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Html>
  );
}

// Air Educational Tooltip
function AirTooltip({ position, text, icon }) {
  return (
    <Html position={position} center>
      <div className="bg-slate-900/95 text-white text-xs px-3 py-2 rounded-lg max-w-[160px] text-center shadow-xl border border-amber-500/30">
        <span className="text-lg">{icon}</span>
        <p className="mt-1 text-amber-100">{text}</p>
      </div>
    </Html>
  );
}

// Air Pollution Solutions Panel
function AirSolutionsPanel({ smokeLevel, onApplySolution }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [appliedSolutions, setAppliedSolutions] = useState([]);
  
  const solutions = [
    { icon: "🚲", title: "Use Bicycles", desc: "Bike or walk for short distances", impact: "Zero emissions", reduction: 12 },
    { icon: "🚌", title: "Public Transport", desc: "Use buses and trains instead of cars", impact: "70% less CO₂", reduction: 18 },
    { icon: "🌳", title: "Plant Trees", desc: "Trees absorb CO₂ and release oxygen", impact: "1 tree = 22kg CO₂/yr", reduction: 20 },
    { icon: "⚡", title: "Electric Vehicles", desc: "Switch to EVs for cleaner transport", impact: "50% less emissions", reduction: 15 },
    { icon: "🏠", title: "Clean Energy", desc: "Use solar and wind power at home", impact: "100% renewable", reduction: 20 },
    { icon: "🏭", title: "Industrial Filters", desc: "Install scrubbers in factories", impact: "90% particles removed", reduction: 25 },
  ];

  const visibleSolutions = Math.min(
    solutions.length,
    Math.floor((smokeLevel - 60) / 7) + 1
  );

  const handleApplySolution = (index, reduction) => {
    if (appliedSolutions.includes(index)) return;
    setAppliedSolutions([...appliedSolutions, index]);
    if (onApplySolution) {
      onApplySolution(reduction);
    }
  };

  return (
    <Html position={[-4, 1, 0]} center>
      <div className="transition-all duration-500" style={{ width: '280px' }}>
        {/* Header */}
        <div 
          className="bg-gradient-to-r from-amber-600 to-orange-500 rounded-t-xl p-3 cursor-pointer flex items-center justify-between shadow-lg"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌬️</span>
            <div>
              <h3 className="text-white font-bold text-sm">Clean Air Solutions</h3>
              <p className="text-amber-100 text-xs">Click solutions to apply!</p>
            </div>
          </div>
          <span className={`text-white transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </div>

        {/* Solutions List */}
        {isExpanded && (
          <div className="bg-slate-900/95 backdrop-blur-sm border border-amber-500/30 rounded-b-xl p-3 space-y-2 shadow-xl max-h-[350px] overflow-y-auto">
            {/* Alert Banner */}
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-2 mb-3 animate-pulse">
              <div className="flex items-center gap-2">
                <span className="text-xl">🚨</span>
                <div>
                  <p className="text-red-400 font-bold text-xs">Air Quality Alert: {smokeLevel}%</p>
                  <p className="text-red-300 text-xs">Click solutions below to clean the air!</p>
                </div>
              </div>
            </div>

            {/* Health Warning */}
            <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">😷</span>
                <p className="text-amber-300 text-xs">Wear a mask outdoors and limit physical activity.</p>
              </div>
            </div>

            {/* Solutions */}
            {solutions.slice(0, visibleSolutions).map((solution, index) => {
              const isApplied = appliedSolutions.includes(index);
              return (
                <div 
                  key={index}
                  onClick={() => handleApplySolution(index, solution.reduction)}
                  className={`rounded-lg p-2 border transition-all duration-300 cursor-pointer group ${
                    isApplied 
                      ? 'bg-green-500/30 border-green-500/50' 
                      : 'bg-slate-800/80 border-slate-700 hover:border-amber-500/50 hover:bg-slate-700/80 hover:scale-[1.02]'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className={`text-xl transition-transform duration-300 ${isApplied ? '' : 'group-hover:scale-125 group-hover:rotate-12'}`}>
                      {isApplied ? '✅' : solution.icon}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className={`font-semibold text-xs ${isApplied ? 'text-green-400' : 'text-amber-400'}`}>
                          {solution.title}
                        </h4>
                        {!isApplied && (
                          <span className="text-xs bg-amber-500/30 text-amber-300 px-1.5 py-0.5 rounded font-bold animate-pulse">
                            -{solution.reduction}%
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-xs leading-tight">{solution.desc}</p>
                      {isApplied ? (
                        <span className="inline-block mt-1 text-xs bg-green-500/30 text-green-300 px-1.5 py-0.5 rounded">
                          ✓ Applied!
                        </span>
                      ) : (
                        <span className="inline-block mt-1 text-xs bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">
                          {solution.impact}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Progress indicator */}
            <div className="mt-3 pt-2 border-t border-slate-700">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-400">Solutions applied</span>
                <span className="text-xs text-green-400">{appliedSolutions.length}/{visibleSolutions}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-1.5">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-400 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${(appliedSolutions.length / visibleSolutions) * 100}%` }}
                />
              </div>
            </div>

            {/* Success Message */}
            {appliedSolutions.length === visibleSolutions && visibleSolutions > 0 && (
              <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 mt-2 text-center animate-bounce">
                <span className="text-2xl">🎉</span>
                <p className="text-green-300 font-bold text-sm">Excellent!</p>
                <p className="text-green-200 text-xs">You've applied all available solutions!</p>
              </div>
            )}

            {/* Fun Fact */}
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-2 mt-2">
              <p className="text-xs text-orange-300">
                💡 <strong>Did you know?</strong> Indoor air can be 2-5x more polluted than outdoor air!
              </p>
            </div>
          </div>
        )}
      </div>
    </Html>
  );
}

// Smog Layer Component
function SmogLayer({ smokeLevel }) {
  const ref = useRef(null);
  const visible = smokeLevel > 40;
  
  useFrame((state) => {
    if (ref.current && visible) {
      ref.current.position.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.5;
      ref.current.material.opacity = 0.1 + (smokeLevel - 40) / 100 * 0.4;
    }
  });

  if (!visible) return null;

  return (
    <mesh ref={ref} position={[0, 2, 0]}>
      <boxGeometry args={[20, 3, 15]} />
      <meshBasicMaterial 
        color="#78716c" 
        transparent 
        opacity={0.2}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

// Airplane with contrails
function AirplaneWithContrails({ smokeLevel }) {
  const planeRef = useRef(null);
  const visible = smokeLevel > 30;
  
  useFrame((state) => {
    if (planeRef.current && visible) {
      planeRef.current.position.x = Math.sin(state.clock.elapsedTime * 0.3) * 8;
      planeRef.current.position.z = Math.cos(state.clock.elapsedTime * 0.3) * 5;
    }
  });

  if (!visible) return null;

  return (
    <group ref={planeRef} position={[0, 5, -3]}>
      {/* Plane body */}
      <mesh castShadow rotation={[0, Math.PI / 4, 0]}>
        <cylinderGeometry args={[0.05, 0.08, 0.5, 8]} />
        <meshStandardMaterial color="#f8fafc" metalness={0.8} />
      </mesh>
      {/* Wings */}
      <mesh position={[0, 0, 0]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[0.6, 0.02, 0.15]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.7} />
      </mesh>
      {/* Contrail */}
      <mesh position={[-0.4, 0, 0]} rotation={[0, Math.PI / 4, 0]}>
        <cylinderGeometry args={[0.02, 0.08, 1, 8]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

// Coughing Person (appears at high pollution)
function CoughingPerson({ smokeLevel }) {
  const visible = smokeLevel > 70;
  const ref = useRef(null);
  
  useFrame((state) => {
    if (ref.current && visible) {
      // Coughing animation
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 8) * 0.05;
    }
  });

  if (!visible) return null;

  return (
    <group ref={ref} position={[3, -1, 1]}>
      {/* Body */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <capsuleGeometry args={[0.15, 0.4, 4, 8]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.85, 0]} castShadow>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#fcd9b6" />
      </mesh>
      {/* Mask */}
      <mesh position={[0, 0.82, 0.1]}>
        <boxGeometry args={[0.15, 0.08, 0.05]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* Cough clouds */}
      <Float speed={3} floatIntensity={0.2}>
        <mesh position={[0, 0.9, 0.2]}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshBasicMaterial color="#d1d5db" transparent opacity={0.5} />
        </mesh>
        <mesh position={[0.05, 0.92, 0.25]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshBasicMaterial color="#d1d5db" transparent opacity={0.4} />
        </mesh>
      </Float>
      
      {/* Label */}
      <Html position={[0, 1.3, 0]} center>
        <div className="bg-red-500/90 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          😷 Respiratory issues!
        </div>
      </Html>
    </group>
  );
}

// Wilting Flowers (appear at high pollution)
function WiltingFlowers({ smokeLevel }) {
  const flowersData = useMemo(() => {
    return Array.from({ length: 8 }).map((_, i) => ({
      position: [5 + Math.random() * 2, -1.5, -2 + Math.random() * 4],
      wiltAngle: Math.min(Math.PI / 3, (smokeLevel / 100) * Math.PI / 2),
      color: ["#ec4899", "#f59e0b", "#a855f7", "#ef4444"][i % 4]
    }));
  }, [smokeLevel]);

  return (
    <group>
      {flowersData.map((flower, i) => (
        <group key={i} position={flower.position}>
          {/* Stem */}
          <mesh rotation={[flower.wiltAngle, 0, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.3, 6]} />
            <meshStandardMaterial color="#22c55e" />
          </mesh>
          {/* Flower head */}
          <mesh 
            position={[0, 0.15 * Math.cos(flower.wiltAngle), 0.15 * Math.sin(flower.wiltAngle)]} 
            rotation={[flower.wiltAngle, 0, 0]}
          >
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial 
              color={flower.color} 
              roughness={0.7}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function WaterLabScene({ pollutionLevel, onApplySolution }) {
  const temperature = Math.floor(22 + pollutionLevel * 0.08);

  return (
    <>
      <color attach="background" args={["#0a1628"]} />
      <fog attach="fog" args={["#0a1628", 10, 22]} />

      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={0.9}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-3, 4, 2]} intensity={0.6} color="#60a5fa" />
      <pointLight position={[3, 2, -2]} intensity={0.3} color="#22d3ee" />
      <spotLight
        position={[0, 6, 0]}
        angle={0.5}
        penumbra={0.5}
        intensity={0.5}
        color="#0ea5e9"
        castShadow
      />

      {/* Industrial Waste Pipe */}
      <IndustrialPipe pollutionLevel={pollutionLevel} />

      {/* Enhanced Water Beaker with pollution effects */}
      <EnhancedWaterBeaker pollutionLevel={pollutionLevel} />
      
      {/* Water Analysis Info Panel */}
      <WaterInfoPanel pollutionLevel={pollutionLevel} temperature={temperature} />

      {/* Educational Tooltips */}
      {pollutionLevel > 30 && (
        <WaterTooltip 
          position={[-1.5, 1.5, 1.2]} 
          text="Industrial waste contains heavy metals and toxins!"
          icon="🏭"
        />
      )}
      {pollutionLevel > 50 && (
        <WaterTooltip 
          position={[1.2, 0.5, 1.2]} 
          text="Plastic debris kills marine life and enters food chain."
          icon="🐟"
        />
      )}
      {pollutionLevel > 70 && (
        <WaterTooltip 
          position={[0, 1.8, 1]} 
          text="Algae blooms deplete oxygen, creating dead zones!"
          icon="☠️"
        />
      )}

      {/* Solutions Panel - Appears when pollution exceeds 60% */}
      {pollutionLevel >= 60 && <WaterSolutionsPanel pollutionLevel={pollutionLevel} onApplySolution={onApplySolution} />}

      <Sparkles
        count={pollutionLevel < 50 ? 40 : 15}
        scale={6}
        size={2}
        speed={0.4}
        opacity={pollutionLevel < 50 ? 0.5 : 0.2}
        color={pollutionLevel < 50 ? "#60a5fa" : "#64748b"}
      />

      <OrbitControls
        enablePan={true}
        maxDistance={10}
        minDistance={4}
        maxPolarAngle={Math.PI / 1.8}
        minPolarAngle={Math.PI / 6}
        autoRotate
        autoRotateSpeed={0.4}
      />
      <Environment preset="city" />
    </>
  );
}

function SoilLabScene({ plasticLevel, onApplySolution }) {
  return (
    <>
      <color attach="background" args={["#1a0f0a"]} />
      <fog attach="fog" args={["#1a0f0a", 8, 20]} />

      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-3, 4, 3]} intensity={0.5} color="#fcd34d" />
      <pointLight position={[3, 2, -2]} intensity={0.3} color="#60a5fa" />
      <spotLight
        position={[0, 8, 0]}
        angle={0.4}
        penumbra={0.6}
        intensity={0.6}
        castShadow
        color="#fbbf24"
      />

      <EnhancedSoilCrossSection plasticLevel={plasticLevel} onApplySolution={onApplySolution} />

      <OrbitControls
        enablePan={true}
        maxDistance={12}
        minDistance={5}
        maxPolarAngle={Math.PI / 1.8}
        minPolarAngle={Math.PI / 6}
        autoRotate
        autoRotateSpeed={0.3}
      />
      <Environment preset="sunset" />
    </>
  );
}

function AirLabScene({ smokeLevel, trafficLevel, treeCount, onApplySolution }) {
  return (
    <>
      {/* Dynamic sky that changes based on smoke */}
      <DynamicSky smokeLevel={smokeLevel} />
      <fog attach="fog" args={[smokeLevel > 50 ? "#4b5563" : "#87CEEB", 10, 30]} />

      <ambientLight intensity={Math.max(0.25, 0.6 - smokeLevel * 0.004)} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={Math.max(0.4, 1 - smokeLevel * 0.006)}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <spotLight
        position={[3, 6, 2]}
        angle={0.4}
        penumbra={0.5}
        intensity={0.9}
        color="#fff8dc"
        castShadow
      />
      <pointLight position={[-4, 3, 2]} intensity={0.3} color="#fbbf24" />

      {/* Sun */}
      <Sun smokeLevel={smokeLevel} />

      {/* Smog Layer */}
      <SmogLayer smokeLevel={smokeLevel} />

      {/* Airplane with contrails */}
      <AirplaneWithContrails smokeLevel={smokeLevel} />

      {/* Ground - grass that turns gray */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -1.5, 0]}
        receiveShadow
      >
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial 
          color={smokeLevel > 60 ? "#57534e" : smokeLevel > 30 ? "#65a30d" : "#22c55e"} 
          roughness={0.9} 
        />
      </mesh>

      {/* Trees that turn brown */}
      <PollutedTrees smokeLevel={smokeLevel} treeCount={treeCount} />

      {/* Wilting Flowers */}
      <WiltingFlowers smokeLevel={smokeLevel} />

      {/* Moving vehicles on road */}
      <MovingVehicles trafficLevel={trafficLevel} />

      {/* Birds with animations */}
      <Birds smokeLevel={smokeLevel} />

      {/* Coughing Person */}
      <CoughingPerson smokeLevel={smokeLevel} />

      {/* Enhanced Factory with tall chimneys */}
      <EnhancedFactory smokeLevel={smokeLevel} />

      {/* Air quality cube */}
      <AirCube smokeLevel={smokeLevel} />
      
      {/* Air Quality Info Panel */}
      <AirInfoPanel smokeLevel={smokeLevel} trafficLevel={trafficLevel} treeCount={treeCount} />

      {/* Educational Tooltips */}
      {smokeLevel > 30 && (
        <AirTooltip 
          position={[-5, 2.5, -1]} 
          text="Factory emissions release harmful PM2.5 particles!"
          icon="🏭"
        />
      )}
      {smokeLevel > 50 && (
        <AirTooltip 
          position={[1, 3.5, 1]} 
          text="Vehicle exhaust is a major source of CO₂ and NOx."
          icon="🚗"
        />
      )}
      {smokeLevel > 70 && (
        <AirTooltip 
          position={[-2, 2, 2]} 
          text="Poor air quality causes respiratory diseases and heart problems!"
          icon="💔"
        />
      )}

      {/* Solutions Panel - Appears when pollution exceeds 60% */}
      {smokeLevel >= 60 && <AirSolutionsPanel smokeLevel={smokeLevel} onApplySolution={onApplySolution} />}

      <OrbitControls
        enablePan={true}
        maxDistance={12}
        minDistance={5}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 6}
        autoRotate
        autoRotateSpeed={0.25}
      />
      <Environment preset="sunset" />
    </>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

const EcoLab = () => {
  const [pollutionLevel, setPollutionLevel] = useState(15);
  const [plasticLevel, setPlasticLevel] = useState(10);
  const [smokeLevel, setSmokeLevel] = useState(20);
  const [trafficLevel, setTrafficLevel] = useState(20);
  const [treeCount, setTreeCount] = useState(5);
  const [treeLifeProgress, setTreeLifeProgress] = useState(0); // Tree life cycle progress 0-100
  const [isTreeAutoPlay, setIsTreeAutoPlay] = useState(true); // Auto-play animation
  const [activeLab, setActiveLab] = useState(null); // 'water', 'soil', 'air', 'tree', or null

  // Tree life cycle auto-play effect
  const treeIntervalRef = useRef(null);
  
  // Auto-play tree life cycle
  useEffect(() => {
    if (activeLab === 'tree' && isTreeAutoPlay) {
      treeIntervalRef.current = setInterval(() => {
        setTreeLifeProgress((prev) => {
          if (prev >= 100) {
            setIsTreeAutoPlay(false); // Stop at 100%
            return 100;
          }
          return prev + 0.1; // Slower speed for better viewing
        });
      }, 100); // Increased interval for smoother, slower animation
    }
    return () => {
      if (treeIntervalRef.current) {
        clearInterval(treeIntervalRef.current);
      }
    };
  }, [activeLab, isTreeAutoPlay]);

  // Interactive button handlers for Air Lab
  const handleIncreaseTraffic = useCallback(() => {
    setTrafficLevel((prev) => Math.min(100, prev + 20));
    setSmokeLevel((prev) => Math.min(100, prev + 10));
  }, []);

  const handlePlantTrees = useCallback(() => {
    setTreeCount((prev) => Math.min(15, prev + 2));
    setSmokeLevel((prev) => Math.max(0, prev - 15));
    setTrafficLevel((prev) => Math.max(0, prev - 5));
  }, []);

  // Solution apply handlers for reducing pollution
  const handleApplyWaterSolution = useCallback((reduction) => {
    setPollutionLevel((prev) => Math.max(0, prev - reduction));
  }, []);

  const handleApplySoilSolution = useCallback((reduction) => {
    setPlasticLevel((prev) => Math.max(0, prev - reduction));
  }, []);

  const handleApplyAirSolution = useCallback((reduction) => {
    setSmokeLevel((prev) => Math.max(0, prev - reduction));
    setTrafficLevel((prev) => Math.max(0, prev - Math.floor(reduction / 2)));
  }, []);

  const handleCloseLab = useCallback(() => {
    setActiveLab(null);
    setIsTreeAutoPlay(true);
    setTreeLifeProgress(0);
  }, []);

  const getTreeStageStatus = (progress) => {
    if (progress < 15) return { label: "Seed", color: "bg-amber-700", textColor: "text-amber-400" };
    if (progress < 29) return { label: "Germinating", color: "bg-lime-500", textColor: "text-lime-400" };
    if (progress < 43) return { label: "Seedling", color: "bg-green-500", textColor: "text-green-400" };
    if (progress < 58) return { label: "Sapling", color: "bg-green-600", textColor: "text-green-400" };
    if (progress < 73) return { label: "Mature", color: "bg-emerald-600", textColor: "text-emerald-400" };
    if (progress < 87) return { label: "Aging", color: "bg-yellow-600", textColor: "text-yellow-400" };
    return { label: "Dead", color: "bg-stone-600", textColor: "text-stone-400" };
  };

  const getWaterQualityStatus = (level) => {
    if (level < 20) return { label: "Clean", color: "bg-green-500", textColor: "text-green-400" };
    if (level < 50) return { label: "Moderate", color: "bg-yellow-500", textColor: "text-yellow-400" };
    if (level < 75) return { label: "Polluted", color: "bg-orange-500", textColor: "text-orange-400" };
    return { label: "Hazardous", color: "bg-red-500", textColor: "text-red-400" };
  };

  const getSoilHealthStatus = (level) => {
    if (level < 20) return { label: "Healthy", color: "bg-green-500", textColor: "text-green-400" };
    if (level < 50) return { label: "Stressed", color: "bg-yellow-500", textColor: "text-yellow-400" };
    if (level < 75) return { label: "Damaged", color: "bg-orange-500", textColor: "text-orange-400" };
    return { label: "Critical", color: "bg-red-500", textColor: "text-red-400" };
  };

  const getAirQualityStatus = (level) => {
    if (level < 25) return { label: "Good", color: "bg-green-500", textColor: "text-green-400" };
    if (level < 50) return { label: "Moderate", color: "bg-yellow-500", textColor: "text-yellow-400" };
    if (level < 75) return { label: "Poor", color: "bg-orange-500", textColor: "text-orange-400" };
    return { label: "Hazardous", color: "bg-red-500", textColor: "text-red-400" };
  };

  const getTreeStageEmoji = (progress) => {
    if (progress < 15) return "🌰";
    if (progress < 29) return "🌱";
    if (progress < 43) return "🌿";
    if (progress < 58) return "🌲";
    if (progress < 73) return "🌳";
    if (progress < 87) return "🍂";
    return "🪵";
  };

  // Get tree benefits based on stage
  const getTreeBenefits = (progress) => {
    if (progress < 15) {
      return {
        title: "Seed Stage 🌰",
        description: "The beginning of life! A tiny seed holds the potential for a mighty tree.",
        benefits: [
          { icon: "🧬", text: "Contains genetic blueprint" },
          { icon: "💤", text: "Waiting to germinate" },
          { icon: "🌍", text: "Future carbon absorber" }
        ],
        funFact: "A single tree can produce hundreds of thousands of seeds!"
      };
    }
    if (progress < 29) {
      return {
        title: "Germinating 🌱",
        description: "The seed awakens! Roots reach down while a tiny shoot reaches for the sun.",
        benefits: [
          { icon: "🌱", text: "First roots developing" },
          { icon: "💧", text: "Absorbing water & nutrients" },
          { icon: "☀️", text: "Starting photosynthesis" }
        ],
        funFact: "The first root (radicle) can grow several inches in just days!"
      };
    }
    if (progress < 43) {
      return {
        title: "Seedling 🌿",
        description: "Growing stronger! The young plant develops its first true leaves.",
        benefits: [
          { icon: "🍃", text: "Producing oxygen" },
          { icon: "🦗", text: "Home for tiny insects" },
          { icon: "💨", text: "Filtering air pollutants" }
        ],
        funFact: "Seedlings can grow 1-2 feet per year in ideal conditions!"
      };
    }
    if (progress < 58) {
      return {
        title: "Sapling 🌲",
        description: "A young tree standing tall! Developing a woody trunk and branches.",
        benefits: [
          { icon: "🌬️", text: "Cleaning air pollution" },
          { icon: "🐦", text: "Nesting spots for birds" },
          { icon: "🌡️", text: "Cooling the environment" },
          { icon: "💧", text: "Preventing soil erosion" }
        ],
        funFact: "A sapling can absorb about 13 pounds of CO₂ per year!"
      };
    }
    if (progress < 73) {
      return {
        title: "Mature Tree 🌳",
        description: "In its prime! A fully grown tree providing maximum benefits to the ecosystem.",
        benefits: [
          { icon: "😮‍💨", text: "Produces 260 lbs of O₂/year" },
          { icon: "🏠", text: "Shelter for 100+ species" },
          { icon: "🍎", text: "Fruits, nuts & seeds" },
          { icon: "🪵", text: "Valuable timber resource" },
          { icon: "❄️", text: "Cools area by 10°F" },
          { icon: "💰", text: "Increases property value" }
        ],
        funFact: "A mature tree absorbs 48 pounds of CO₂ per year!"
      };
    }
    if (progress < 87) {
      return {
        title: "Aging Tree 🍂",
        description: "A wise old tree. Still vital, with unique ecological importance.",
        benefits: [
          { icon: "🦉", text: "Cavities for owls & bats" },
          { icon: "🍄", text: "Supports fungi & lichens" },
          { icon: "🐿️", text: "Food storage for wildlife" },
          { icon: "🌿", text: "Rich in biodiversity" }
        ],
        funFact: "Old trees store more carbon than young ones!"
      };
    }
    return {
      title: "End of Cycle 🪵",
      description: "The tree completes its journey, but continues to give back to nature.",
      benefits: [
        { icon: "🐛", text: "Habitat for decomposers" },
        { icon: "🌱", text: "Nutrients return to soil" },
        { icon: "🪺", text: "Nesting for woodpeckers" },
        { icon: "♻️", text: "Completes the cycle" }
      ],
      funFact: "Dead trees (snags) support more species than living ones!"
    };
  };

  const waterStatus = getWaterQualityStatus(pollutionLevel);
  const soilStatus = getSoilHealthStatus(plasticLevel);
  const airStatus = getAirQualityStatus(smokeLevel);
  const treeStatus = getTreeStageStatus(treeLifeProgress);

  // Lab card data
  const labCards = [
    {
      id: 'water',
      title: 'Water Lab',
      subtitle: 'Water Pollution Simulation',
      icon: Beaker,
      description: 'Explore how pollutants affect water quality. See how chemicals change pH levels, temperature, and harm aquatic life.',
      gradient: 'from-cyan-500 via-blue-500 to-blue-600',
      bgGradient: 'from-cyan-900/40 to-blue-900/40',
      borderColor: 'border-cyan-500/30',
      iconBg: 'bg-cyan-500/20',
      iconColor: 'text-cyan-400',
      status: waterStatus,
      level: pollutionLevel,
      facts: [
        '💧 80% of wastewater returns untreated',
        '🌡️ Pollutants raise water temperature',
        '⚗️ pH changes harm aquatic life',
        '🐟 Clean water sustains ecosystems'
      ],
      learnMore: 'Discover how industrial waste, sewage, and chemicals pollute our water sources.'
    },
    {
      id: 'soil',
      title: 'Soil Lab',
      subtitle: 'Soil Contamination Study',
      icon: Leaf,
      description: 'Investigate how plastic waste damages soil health. Watch earthworms disappear and plants wilt as pollution increases.',
      gradient: 'from-amber-500 via-orange-500 to-orange-600',
      bgGradient: 'from-amber-900/40 to-orange-900/40',
      borderColor: 'border-amber-500/30',
      iconBg: 'bg-amber-500/20',
      iconColor: 'text-amber-400',
      status: soilStatus,
      level: plasticLevel,
      facts: [
        '♻️ Plastic takes 500+ years to decompose',
        '🪱 Earthworms are soil engineers',
        '🦠 Healthy soil has billions of organisms',
        '🌱 Microplastics block root growth'
      ],
      learnMore: 'Learn how microplastics and waste affect the living organisms in soil.'
    },
    {
      id: 'air',
      title: 'Air Lab',
      subtitle: 'Air Quality Analysis',
      icon: Wind,
      description: 'See how factory smoke and traffic affect air quality. Watch the sky darken and birds struggle as pollution rises.',
      gradient: 'from-purple-500 via-pink-500 to-rose-500',
      bgGradient: 'from-purple-900/40 to-pink-900/40',
      borderColor: 'border-purple-500/30',
      iconBg: 'bg-purple-500/20',
      iconColor: 'text-purple-400',
      status: airStatus,
      level: smokeLevel,
      facts: [
        '🏭 Factory smoke causes respiratory issues',
        '🚗 Vehicle emissions increase PM2.5',
        '🌳 Trees filter 100+ pollutants daily',
        '🐦 Birds are affected by air pollution'
      ],
      learnMore: 'Understand how industrial and vehicle emissions impact air quality and wildlife.'
    },
    {
      id: 'tree',
      title: 'Tree Life Cycle',
      subtitle: 'Educational Animation',
      icon: Trees,
      description: 'Watch the complete life cycle of a tree from seed to death. Perfect for learning about plant biology and ecosystems!',
      gradient: 'from-green-500 via-emerald-500 to-teal-500',
      bgGradient: 'from-green-900/40 to-emerald-900/40',
      borderColor: 'border-green-500/30',
      iconBg: 'bg-green-500/20',
      iconColor: 'text-green-400',
      status: treeStatus,
      level: treeLifeProgress,
      facts: [
        '🌰 Seeds can stay dormant for years',
        '🌱 A seed needs water, warmth, and oxygen to germinate',
        '🌳 One tree produces oxygen for 4 people daily',
        '🍂 Dead trees return nutrients to the soil'
      ],
      learnMore: 'Discover the amazing journey from a tiny seed to a mighty tree and back to nature.'
    }
  ];

  // Full-screen Lab Modal
  if (activeLab) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900">
        {/* Close Button */}
        <button
          onClick={handleCloseLab}
          className="absolute top-4 right-4 z-50 p-3 bg-slate-800/80 hover:bg-slate-700 rounded-full text-white transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-slate-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Lab Title */}
        <div className="absolute top-4 left-4 z-50 flex items-center gap-3 bg-slate-800/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-slate-600">
          {activeLab === 'water' && <Beaker className="w-6 h-6 text-cyan-400" />}
          {activeLab === 'soil' && <Leaf className="w-6 h-6 text-amber-400" />}
          {activeLab === 'air' && <Wind className="w-6 h-6 text-purple-400" />}
          {activeLab === 'tree' && <Trees className="w-6 h-6 text-green-400" />}
          <span className="text-white font-bold text-lg capitalize">
            {activeLab === 'tree' ? 'Tree Life Cycle' : `${activeLab} Lab`}
          </span>
          <Badge className={
            activeLab === 'water' ? waterStatus.color : 
            activeLab === 'soil' ? soilStatus.color : 
            activeLab === 'air' ? airStatus.color :
            treeStatus.color
          }>
            {activeLab === 'water' ? waterStatus.label : 
             activeLab === 'soil' ? soilStatus.label : 
             activeLab === 'air' ? airStatus.label :
             treeStatus.label}
          </Badge>
        </div>

        {/* Full-screen 3D Canvas */}
        <div className="w-full h-full">
          <Canvas shadows camera={{ 
            position: activeLab === 'water' ? [0, 0, 6] : 
                      activeLab === 'soil' ? [0, 1, 5] : 
                      activeLab === 'tree' ? [0, 1, 7] : [0, 2, 12], 
            fov: activeLab === 'air' ? 55 : activeLab === 'tree' ? 50 : 45 
          }}>
            {activeLab === 'water' && <WaterLabScene pollutionLevel={pollutionLevel} onApplySolution={handleApplyWaterSolution} />}
            {activeLab === 'soil' && <SoilLabScene plasticLevel={plasticLevel} onApplySolution={handleApplySoilSolution} />}
            {activeLab === 'air' && (
              <AirLabScene 
                smokeLevel={smokeLevel} 
                trafficLevel={trafficLevel}
                treeCount={treeCount}
                onApplySolution={handleApplyAirSolution}
              />
            )}
            {activeLab === 'tree' && <TreeLifeCycleScene progress={treeLifeProgress} />}
          </Canvas>

          {/* Tree Life Cycle Floating Controls & Benefits Panel */}
          {activeLab === 'tree' && (
            <>
              {/* Control Buttons - moved more to the left */}
              <div className="absolute top-4 right-20 flex gap-3 z-10">
                <Button
                  onClick={() => setIsTreeAutoPlay(!isTreeAutoPlay)}
                  className={`${isTreeAutoPlay 
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600' 
                    : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                  } text-white font-semibold px-5 py-2.5 rounded-xl shadow-xl backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-105`}
                >
                  {isTreeAutoPlay ? (
                    <><Pause className="w-5 h-5 mr-2" /> Pause</>
                  ) : (
                    <><Play className="w-5 h-5 mr-2" /> Play</>
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setTreeLifeProgress(0);
                    setIsTreeAutoPlay(true);
                  }}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold px-5 py-2.5 rounded-xl shadow-xl backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-105"
                >
                  <RotateCcw className="w-5 h-5 mr-2" /> Restart
                </Button>
              </div>

              {/* Educational Benefits Panel - Right Side */}
              <div className="absolute top-20 right-4 w-80 max-h-[60vh] overflow-y-auto z-10">
                <div className="bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                  {/* Header */}
                  <div className={`p-4 bg-gradient-to-r ${
                    treeLifeProgress < 15 ? 'from-amber-600 to-orange-600' :
                    treeLifeProgress < 29 ? 'from-lime-500 to-green-500' :
                    treeLifeProgress < 43 ? 'from-green-500 to-emerald-500' :
                    treeLifeProgress < 58 ? 'from-green-600 to-teal-600' :
                    treeLifeProgress < 73 ? 'from-emerald-600 to-green-600' :
                    treeLifeProgress < 87 ? 'from-yellow-600 to-orange-600' :
                    'from-stone-600 to-slate-600'
                  }`}>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      {getTreeBenefits(treeLifeProgress).title}
                    </h3>
                    <p className="text-white/90 text-sm mt-1">
                      {getTreeBenefits(treeLifeProgress).description}
                    </p>
                  </div>

                  {/* Benefits List */}
                  <div className="p-4 space-y-2">
                    <h4 className="text-sm font-semibold text-emerald-400 uppercase tracking-wide mb-3">🌿 What Trees Provide</h4>
                    {getTreeBenefits(treeLifeProgress).benefits.map((benefit, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center gap-3 p-2.5 bg-white/5 rounded-lg hover:bg-white/10 transition-colors duration-200 border border-white/5"
                      >
                        <span className="text-2xl">{benefit.icon}</span>
                        <span className="text-white/90 text-sm font-medium">{benefit.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Fun Fact */}
                  <div className="p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-t border-white/10">
                    <div className="flex items-start gap-2">
                      <span className="text-xl">💡</span>
                      <div>
                        <span className="text-yellow-400 font-semibold text-xs uppercase">Fun Fact</span>
                        <p className="text-white/90 text-sm mt-0.5">{getTreeBenefits(treeLifeProgress).funFact}</p>
                      </div>
                    </div>
                  </div>

                  {/* Completion Message */}
                  {treeLifeProgress >= 100 && (
                    <div className="p-4 bg-gradient-to-r from-green-500/30 to-emerald-500/30 border-t border-green-500/30">
                      <div className="text-center">
                        <span className="text-3xl">🎉</span>
                        <p className="text-white font-bold mt-1">Cycle Complete!</p>
                        <p className="text-white/70 text-sm">Click Restart to watch again</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Control Panel */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 via-slate-900/95 to-transparent p-6">
          <div className="max-w-4xl mx-auto">
            {/* Water Lab Controls */}
            {activeLab === 'water' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-white font-medium flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    Pollutant Level
                  </label>
                  <span className="text-2xl font-bold text-cyan-400">{pollutionLevel}%</span>
                </div>
                <Slider
                  value={[pollutionLevel]}
                  onValueChange={(value) => setPollutionLevel(value[0])}
                  max={100}
                  min={0}
                  step={1}
                  className="w-full"
                />
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
                    <div className="text-slate-400 text-sm mb-1">Temperature</div>
                    <div className="text-2xl font-bold text-white">{Math.floor(22 + pollutionLevel * 0.08)}°C</div>
                  </div>
                  <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
                    <div className="text-slate-400 text-sm mb-1">pH Level</div>
                    <div className="text-2xl font-bold text-white">{(7 - pollutionLevel * 0.025).toFixed(1)}</div>
                  </div>
                  <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
                    <div className="text-slate-400 text-sm mb-1">Water Quality</div>
                    <div className={`text-2xl font-bold ${waterStatus.textColor}`}>{waterStatus.label}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Soil Lab Controls */}
            {activeLab === 'soil' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-white font-medium flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    Plastic Waste Level
                  </label>
                  <span className="text-2xl font-bold text-amber-400">{plasticLevel}%</span>
                </div>
                <Slider
                  value={[plasticLevel]}
                  onValueChange={(value) => setPlasticLevel(value[0])}
                  max={100}
                  min={0}
                  step={1}
                  className="w-full"
                />
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
                    <div className="text-slate-400 text-sm mb-1">🪱 Worm Count</div>
                    <div className="text-2xl font-bold text-white">{Math.max(0, Math.floor(4 - plasticLevel / 25))}</div>
                  </div>
                  <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
                    <div className="text-slate-400 text-sm mb-1">🌱 Plant Health</div>
                    <div className="text-2xl font-bold text-white">{Math.max(0, 100 - plasticLevel)}%</div>
                  </div>
                  <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
                    <div className="text-slate-400 text-sm mb-1">Soil Status</div>
                    <div className={`text-2xl font-bold ${soilStatus.textColor}`}>{soilStatus.label}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Air Lab Controls */}
            {activeLab === 'air' && (
              <div className="space-y-4">
                <div className="flex gap-4 mb-4">
                  <Button
                    onClick={handleIncreaseTraffic}
                    className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-medium py-3"
                    disabled={trafficLevel >= 100}
                  >
                    <Car className="w-5 h-5 mr-2" />
                    Increase Traffic
                  </Button>
                  <Button
                    onClick={handlePlantTrees}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium py-3"
                    disabled={treeCount >= 15}
                  >
                    <Trees className="w-5 h-5 mr-2" />
                    Plant Trees
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-white font-medium flex items-center gap-2">
                    <Factory className="w-5 h-5 text-purple-400" />
                    Smoke Emission
                  </label>
                  <span className="text-2xl font-bold text-purple-400">{smokeLevel}%</span>
                </div>
                <Slider
                  value={[smokeLevel]}
                  onValueChange={(value) => setSmokeLevel(value[0])}
                  max={100}
                  min={0}
                  step={1}
                  className="w-full"
                />
                <div className="grid grid-cols-4 gap-4 mt-4">
                  <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
                    <div className="text-slate-400 text-sm mb-1">AQI Index</div>
                    <div className="text-2xl font-bold" style={{
                      color: smokeLevel < 25 ? "#00e400" : smokeLevel < 50 ? "#ffff00" : smokeLevel < 75 ? "#ff7e00" : "#ff0000"
                    }}>{Math.floor(50 + (smokeLevel / 100) * 200)}</div>
                  </div>
                  <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
                    <div className="text-slate-400 text-sm mb-1">🚗 Traffic</div>
                    <div className="text-2xl font-bold text-orange-400">{trafficLevel}%</div>
                  </div>
                  <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
                    <div className="text-slate-400 text-sm mb-1">🌳 Trees</div>
                    <div className="text-2xl font-bold text-green-400">{treeCount}</div>
                  </div>
                  <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 border border-slate-700">
                    <div className="text-slate-400 text-sm mb-1">🐦 Birds</div>
                    <div className="text-2xl font-bold text-white">{Math.max(1, 5 - Math.floor(smokeLevel / 25))}/5</div>
                  </div>
                </div>
              </div>
            )}

            {/* Tree Life Cycle Controls - Simplified bottom bar */}
            {activeLab === 'tree' && (
              <div className="space-y-3">
                {/* Progress slider with stage indicators */}
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{getTreeStageEmoji(treeLifeProgress)}</span>
                  <div className="flex-1">
                    <Slider
                      value={[treeLifeProgress]}
                      onValueChange={(value) => {
                        setIsTreeAutoPlay(false);
                        setTreeLifeProgress(value[0]);
                      }}
                      max={100}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  <span className="text-2xl font-bold text-green-400 w-16 text-right">{Math.round(treeLifeProgress)}%</span>
                </div>
                {/* Stage indicators */}
                <div className="flex justify-between text-xs text-slate-400">
                  <span className={treeLifeProgress < 15 ? 'text-amber-400 font-bold' : ''}>🌰 Seed</span>
                  <span className={treeLifeProgress >= 15 && treeLifeProgress < 29 ? 'text-lime-400 font-bold' : ''}>🌱 Sprout</span>
                  <span className={treeLifeProgress >= 29 && treeLifeProgress < 43 ? 'text-green-400 font-bold' : ''}>🌿 Seedling</span>
                  <span className={treeLifeProgress >= 43 && treeLifeProgress < 58 ? 'text-green-500 font-bold' : ''}>🌲 Sapling</span>
                  <span className={treeLifeProgress >= 58 && treeLifeProgress < 73 ? 'text-emerald-400 font-bold' : ''}>🌳 Mature</span>
                  <span className={treeLifeProgress >= 73 && treeLifeProgress < 87 ? 'text-yellow-400 font-bold' : ''}>🍂 Aging</span>
                  <span className={treeLifeProgress >= 87 ? 'text-stone-400 font-bold' : ''}>🪵 Dead</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main Card View
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#1a3a2e] to-slate-900">
      <Navigation />

      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 bg-[#237a57]/20 rounded-full border border-[#237a57]/30">
              <FlaskConical className="w-8 h-8 text-[#3b9b8f]" />
              <span className="text-[#3b9b8f] font-semibold text-lg">Interactive Learning</span>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-[#3b9b8f] via-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-4">
              Eco-Lab Virtual Experiments
            </h1>
            <p className="text-slate-400 text-xl max-w-3xl mx-auto leading-relaxed">
              Discover how pollution affects our planet through immersive 3D simulations. 
              Click on any lab below to explore and learn!
            </p>
          </div>

          {/* Lab Cards Grid */}
          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {labCards.map((lab) => (
              <div
                key={lab.id}
                onClick={() => setActiveLab(lab.id)}
                className={`group relative cursor-pointer rounded-3xl overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-${lab.id === 'water' ? 'cyan' : lab.id === 'soil' ? 'amber' : 'purple'}-500/20`}
              >
                {/* Card Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${lab.bgGradient} opacity-80`}></div>
                <div className={`absolute inset-0 border-2 ${lab.borderColor} rounded-3xl`}></div>
                
                {/* Animated Glow Effect */}
                <div className={`absolute -inset-1 bg-gradient-to-r ${lab.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500`}></div>

                <div className="relative p-6 h-full flex flex-col">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 ${lab.iconBg} rounded-2xl backdrop-blur-sm`}>
                        <lab.icon className={`w-7 h-7 ${lab.iconColor}`} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">{lab.title}</h3>
                        <p className="text-slate-400 text-sm">{lab.subtitle}</p>
                      </div>
                    </div>
                    <Badge className={`${lab.status.color} text-white`}>
                      {lab.status.label}
                    </Badge>
                  </div>

                  {/* 3D Preview */}
                  <div className="relative h-52 rounded-2xl overflow-hidden mb-4 bg-slate-900/50">
                    <Canvas shadows camera={{ 
                      position: lab.id === 'water' ? [0, 0, 6] : lab.id === 'soil' ? [0, 1, 5] : [0, 2, 10], 
                      fov: 45 
                    }}>
                      {lab.id === 'water' && <WaterLabScene pollutionLevel={pollutionLevel} />}
                      {lab.id === 'soil' && <SoilLabScene plasticLevel={plasticLevel} />}
                      {lab.id === 'air' && (
                        <AirLabScene 
                          smokeLevel={smokeLevel} 
                          trafficLevel={trafficLevel}
                          treeCount={treeCount}
                        />
                      )}
                    </Canvas>
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                      <span className="px-6 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white font-medium flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                        Open Full Screen
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                    {lab.description}
                  </p>

                  {/* Quick Facts */}
                  <div className="mt-auto space-y-2">
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">Quick Facts</p>
                    <div className="grid grid-cols-2 gap-2">
                      {lab.facts.slice(0, 2).map((fact, i) => (
                        <div key={i} className="bg-slate-800/40 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-slate-300">
                          {fact}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Current Level Indicator */}
                  <div className="mt-4 pt-4 border-t border-slate-700/50">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Current Level</span>
                      <span className={`font-bold ${lab.status.textColor}`}>{lab.level}%</span>
                    </div>
                    <div className="mt-2 h-2 bg-slate-700/50 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${lab.gradient} transition-all duration-500`}
                        style={{ width: `${lab.level}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Educational Section */}
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-3xl p-8 border border-slate-700/50">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">🌍 Why Environmental Education Matters</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">
                Understanding how pollution affects our ecosystems is the first step toward protecting our planet for future generations.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 rounded-2xl p-6 border border-cyan-500/20">
                <div className="text-4xl mb-4">💧</div>
                <h3 className="text-xl font-bold text-cyan-300 mb-2">Water Conservation</h3>
                <p className="text-slate-400 text-sm">
                  Only 3% of Earth's water is freshwater. Learn how pollution affects this precious resource and what we can do to protect it.
                </p>
              </div>

              <div className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 rounded-2xl p-6 border border-amber-500/20">
                <div className="text-4xl mb-4">🌱</div>
                <h3 className="text-xl font-bold text-amber-300 mb-2">Soil Protection</h3>
                <p className="text-slate-400 text-sm">
                  Healthy soil is home to 25% of all species on Earth. Discover how plastic pollution threatens this underground ecosystem.
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-2xl p-6 border border-purple-500/20">
                <div className="text-4xl mb-4">🌬️</div>
                <h3 className="text-xl font-bold text-purple-300 mb-2">Clean Air Initiative</h3>
                <p className="text-slate-400 text-sm">
                  Air pollution causes 7 million deaths annually. Explore how we can reduce emissions and plant more trees for cleaner air.
                </p>
              </div>
            </div>

            {/* Call to Action */}
            <div className="mt-8 text-center">
              <p className="text-slate-300 mb-4">Ready to make a difference? Start exploring the labs above!</p>
              <div className="flex justify-center gap-4 flex-wrap">
                <button
                  onClick={() => setActiveLab('water')}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl text-white font-medium hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300"
                >
                  Explore Water Lab
                </button>
                <button
                  onClick={() => setActiveLab('soil')}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl text-white font-medium hover:shadow-lg hover:shadow-amber-500/30 transition-all duration-300"
                >
                  Explore Soil Lab
                </button>
                <button
                  onClick={() => setActiveLab('air')}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300"
                >
                  Explore Air Lab
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EcoLab;
