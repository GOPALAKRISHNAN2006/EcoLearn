import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { 
  Waves, 
  Fish, 
  Heart, 
  Home,
  RefreshCw,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle,
  Shield,
  Droplets,
  Thermometer,
  Eye,
  Trash2,
  Anchor,
  Wind,
  Search,
  HelpingHand
} from "lucide-react";

const AquaticLifeGuardian = () => {
  const navigate = useNavigate();
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [oxygenLevel, setOxygenLevel] = useState(100);
  const [gameTime, setGameTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentZone, setCurrentZone] = useState("shallow-reef");
  const [equipment, setEquipment] = useState({
    divingSuit: 100,
    oxygenTank: 100,
    waterTestKit: 5,
    cleanupTools: 3,
    rescueNet: 2,
    medicineKit: 3
  });
  const [marineLifeRescued, setMarineLifeRescued] = useState([]);
  const [pollutionCleaned, setPollutionCleaned] = useState([]);
  const [waterQualityTests, setWaterQualityTests] = useState([]);
  const [currentMission, setCurrentMission] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [tideLevel, setTideLevel] = useState("normal");
  const [waterTemperature, setWaterTemperature] = useState(22);

  // Ocean zones
  const oceanZones = [
    { 
      id: "shallow-reef", 
      name: "Coral Reef", 
      depth: 10, 
      marineLife: ["clownfish", "angelfish", "sea-turtle", "coral"], 
      threats: ["coral-bleaching", "plastic-waste", "tourist-damage"],
      description: "Vibrant coral ecosystem with diverse marine life",
      icon: "🪸",
      oxygen: 5 // oxygen consumption per minute
    },
    { 
      id: "kelp-forest", 
      name: "Kelp Forest", 
      depth: 25, 
      marineLife: ["sea-otter", "sea-urchin", "rockfish", "kelp"], 
      threats: ["overharvesting", "pollution", "sea-urchin-outbreak"],
      description: "Underwater forest crucial for marine biodiversity",
      icon: "🌿",
      oxygen: 8
    },
    { 
      id: "open-ocean", 
      name: "Open Ocean", 
      depth: 100, 
      marineLife: ["dolphin", "whale", "shark", "jellyfish"], 
      threats: ["ship-pollution", "noise-pollution", "overfishing"],
      description: "Vast open waters home to large marine animals",
      icon: "🌊",
      oxygen: 15
    },
    { 
      id: "deep-trench", 
      name: "Deep Sea Trench", 
      depth: 500, 
      marineLife: ["deep-fish", "squid", "deep-coral"], 
      threats: ["mining-damage", "chemical-pollution", "pressure-changes"],
      description: "Mysterious depths with unique life forms",
      icon: "🕳️",
      oxygen: 25
    },
    { 
      id: "coastal-estuary", 
      name: "Coastal Estuary", 
      depth: 5, 
      marineLife: ["salmon", "crab", "seagrass", "oyster"], 
      threats: ["agricultural-runoff", "coastal-development", "sewage"],
      description: "Where river meets sea, vital nursery habitat",
      icon: "🏞️",
      oxygen: 3
    },
    { 
      id: "polar-waters", 
      name: "Polar Waters", 
      depth: 50, 
      marineLife: ["seal", "penguin", "arctic-fish", "krill"], 
      threats: ["ice-melting", "climate-change", "oil-spills"],
      description: "Cold waters supporting unique polar ecosystems",
      icon: "🧊",
      oxygen: 12
    }
  ];

  // Marine life database
  const marineLifeData = {
    clownfish: { name: "Clownfish", rarity: "common", points: 10, emoji: "🐠", health: "healthy" },
    angelfish: { name: "Angelfish", rarity: "common", points: 12, emoji: "🐟", health: "healthy" },
    "sea-turtle": { name: "Sea Turtle", rarity: "rare", points: 50, emoji: "🐢", health: "injured" },
    coral: { name: "Coral Colony", rarity: "uncommon", points: 25, emoji: "🪸", health: "bleached" },
    "sea-otter": { name: "Sea Otter", rarity: "uncommon", points: 30, emoji: "🦦", health: "healthy" },
    "sea-urchin": { name: "Sea Urchin", rarity: "common", points: 8, emoji: "🦔", health: "overpopulated" },
    rockfish: { name: "Rockfish", rarity: "common", points: 15, emoji: "🐟", health: "healthy" },
    kelp: { name: "Kelp Forest", rarity: "common", points: 20, emoji: "🌿", health: "damaged" },
    dolphin: { name: "Dolphin", rarity: "rare", points: 60, emoji: "🐬", health: "healthy" },
    whale: { name: "Whale", rarity: "epic", points: 100, emoji: "🐋", health: "entangled" },
    shark: { name: "Shark", rarity: "rare", points: 40, emoji: "🦈", health: "healthy" },
    jellyfish: { name: "Jellyfish", rarity: "uncommon", points: 18, emoji: "🪼", health: "healthy" },
    "deep-fish": { name: "Deep Sea Fish", rarity: "rare", points: 35, emoji: "🐟", health: "healthy" },
    squid: { name: "Giant Squid", rarity: "epic", points: 80, emoji: "🦑", health: "healthy" },
    "deep-coral": { name: "Deep Sea Coral", rarity: "rare", points: 45, emoji: "🪸", health: "healthy" },
    salmon: { name: "Salmon", rarity: "common", points: 20, emoji: "🐟", health: "healthy" },
    crab: { name: "Crab", rarity: "common", points: 12, emoji: "🦀", health: "healthy" },
    seagrass: { name: "Seagrass Bed", rarity: "common", points: 15, emoji: "🌱", health: "dying" },
    oyster: { name: "Oyster Reef", rarity: "uncommon", points: 25, emoji: "🦪", health: "healthy" },
    seal: { name: "Seal", rarity: "uncommon", points: 35, emoji: "🦭", health: "healthy" },
    penguin: { name: "Penguin", rarity: "uncommon", points: 28, emoji: "🐧", health: "healthy" },
    "arctic-fish": { name: "Arctic Fish", rarity: "uncommon", points: 22, emoji: "🐟", health: "healthy" },
    krill: { name: "Krill Swarm", rarity: "common", points: 10, emoji: "🦐", health: "healthy" }
  };

  // Pollution types
  const pollutionData = {
    "plastic-waste": { name: "Plastic Waste", severity: "high", points: 30, emoji: "🗑️", equipment: "cleanupTools" },
    "oil-spills": { name: "Oil Spill", severity: "critical", points: 50, emoji: "🛢️", equipment: "cleanupTools" },
    "chemical-pollution": { name: "Chemical Pollution", severity: "high", points: 40, emoji: "☠️", equipment: "waterTestKit" },
    "sewage": { name: "Sewage Contamination", severity: "medium", points: 25, emoji: "💩", equipment: "waterTestKit" },
    "agricultural-runoff": { name: "Agricultural Runoff", severity: "medium", points: 20, emoji: "🌾", equipment: "waterTestKit" },
    "ship-pollution": { name: "Ship Pollution", severity: "high", points: 35, emoji: "🚢", equipment: "cleanupTools" },
    "noise-pollution": { name: "Noise Pollution", severity: "medium", points: 15, emoji: "🔊", equipment: "rescueNet" },
    "mining-damage": { name: "Mining Damage", severity: "critical", points: 60, emoji: "⛏️", equipment: "cleanupTools" }
  };

  // Threats
  const threatData = {
    "coral-bleaching": { name: "Coral Bleaching", urgency: "high", points: 40, emoji: "🌡️" },
    "tourist-damage": { name: "Tourist Damage", urgency: "medium", points: 25, emoji: "👥" },
    "overharvesting": { name: "Overharvesting", urgency: "high", points: 35, emoji: "🎣" },
    "sea-urchin-outbreak": { name: "Sea Urchin Outbreak", urgency: "medium", points: 30, emoji: "🦔" },
    "overfishing": { name: "Overfishing", urgency: "high", points: 45, emoji: "🎣" },
    "coastal-development": { name: "Coastal Development", urgency: "medium", points: 30, emoji: "🏗️" },
    "ice-melting": { name: "Ice Melting", urgency: "critical", points: 50, emoji: "🧊" },
    "climate-change": { name: "Climate Change", urgency: "critical", points: 60, emoji: "🌡️" },
    "pressure-changes": { name: "Pressure Changes", urgency: "low", points: 20, emoji: "📊" }
  };

  // Available missions
  const missions = [
    {
      id: "reef-restoration",
      name: "Coral Reef Restoration",
      description: "Restore health to 3 coral colonies",
      reward: 150,
      requirements: { coralRestored: 3 },
      completed: false
    },
    {
      id: "pollution-cleanup",
      name: "Ocean Cleanup Initiative",
      description: "Clean up 5 pollution sources",
      reward: 200,
      requirements: { pollutionCleaned: 5 },
      completed: false
    },
    {
      id: "marine-rescue",
      name: "Marine Life Rescue",
      description: "Rescue 8 marine animals",
      reward: 250,
      requirements: { marineLifeRescued: 8 },
      completed: false
    }
  ];

  // Tide levels
  const tideLevels = ["low", "normal", "high"];

  // Game timer and environmental changes
  useEffect(() => {
    let interval;
    if (isPlaying && gameStarted) {
      interval = setInterval(() => {
        setGameTime(prev => prev + 1);
        
        // Oxygen consumption based on depth
        const zone = oceanZones.find(z => z.id === currentZone);
        setOxygenLevel(prev => Math.max(0, prev - (zone.oxygen / 60)));

        // Random tide changes
        if (Math.random() < 0.1) {
          setTideLevel(tideLevels[Math.floor(Math.random() * tideLevels.length)]);
        }

        // Temperature fluctuations
        if (Math.random() < 0.15) {
          setWaterTemperature(prev => Math.max(0, Math.min(30, prev + (Math.random() - 0.5) * 2)));
        }

        // Equipment degradation
        setEquipment(prev => ({
          ...prev,
          divingSuit: Math.max(0, prev.divingSuit - 0.1),
          oxygenTank: Math.max(0, prev.oxygenTank - 0.2)
        }));

        // Random marine life encounters
        if (Math.random() < 0.12) {
          const zone = oceanZones.find(z => z.id === currentZone);
          if (zone && zone.marineLife.length > 0) {
            const randomMarine = zone.marineLife[Math.floor(Math.random() * zone.marineLife.length)];
            const marineData = marineLifeData[randomMarine];
            if (marineData.health !== "healthy" && !marineLifeRescued.some(m => m.species === randomMarine && m.zone === currentZone)) {
              // Auto-encounter distressed marine life
            }
          }
        }

      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, gameStarted, currentZone, marineLifeRescued]);

  // Check for achievements
  useEffect(() => {
    const newAchievements = [];
    
    if (marineLifeRescued.length >= 10 && !achievements.includes("marine-hero")) {
      newAchievements.push("marine-hero");
    }
    
    if (pollutionCleaned.length >= 7 && !achievements.includes("pollution-fighter")) {
      newAchievements.push("pollution-fighter");
    }
    
    if (score >= 1000 && !achievements.includes("ocean-guardian")) {
      newAchievements.push("ocean-guardian");
    }

    if (waterQualityTests.length >= 5 && !achievements.includes("water-scientist")) {
      newAchievements.push("water-scientist");
    }

    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements]);
    }
  }, [marineLifeRescued.length, pollutionCleaned.length, score, waterQualityTests.length, achievements]);

  const startGame = () => {
    setGameStarted(true);
    setIsPlaying(true);
    setCurrentMission(missions[0]);
  };

  const moveToZone = (zoneId) => {
    const zone = oceanZones.find(z => z.id === zoneId);
    
    // Oxygen cost for travel
    const oxygenCost = zone.depth / 5;
    setOxygenLevel(prev => Math.max(0, prev - oxygenCost));
    
    // Equipment wear
    setEquipment(prev => ({
      ...prev,
      divingSuit: Math.max(0, prev.divingSuit - zone.depth / 50)
    }));
    
    setCurrentZone(zoneId);
    setScore(prev => prev + 5); // Travel points
  };

  const rescueMarineLife = (species) => {
    const marineData = marineLifeData[species];
    
    if (equipment.rescueNet > 0 && equipment.medicineKit > 0) {
      const rescue = {
        species,
        zone: currentZone,
        time: gameTime,
        ...marineData
      };
      
      setMarineLifeRescued(prev => [...prev, rescue]);
      setScore(prev => prev + marineData.points);
      setEquipment(prev => ({
        ...prev,
        rescueNet: prev.rescueNet - 0.5,
        medicineKit: prev.medicineKit - 1
      }));
    }
  };

  const cleanPollution = (pollutionType) => {
    const pollution = pollutionData[pollutionType];
    const zone = oceanZones.find(z => z.id === currentZone);
    
    if (equipment[pollution.equipment] > 0) {
      const cleanup = {
        type: pollutionType,
        zone: currentZone,
        time: gameTime,
        ...pollution
      };
      
      setPollutionCleaned(prev => [...prev, cleanup]);
      setScore(prev => prev + pollution.points);
      setEquipment(prev => ({
        ...prev,
        [pollution.equipment]: prev[pollution.equipment] - 1
      }));
    }
  };

  const testWaterQuality = () => {
    if (equipment.waterTestKit > 0) {
      const testResult = {
        zone: currentZone,
        time: gameTime,
        temperature: waterTemperature,
        pollution: Math.random() > 0.7 ? "detected" : "clean",
        oxygenContent: Math.floor(Math.random() * 100)
      };
      
      setWaterQualityTests(prev => [...prev, testResult]);
      setScore(prev => prev + 15);
      setEquipment(prev => ({
        ...prev,
        waterTestKit: prev.waterTestKit - 1
      }));
    }
  };

  const refillOxygen = () => {
    if (currentZone === "shallow-reef" && equipment.oxygenTank > 0) {
      setOxygenLevel(100);
      setEquipment(prev => ({
        ...prev,
        oxygenTank: prev.oxygenTank - 10
      }));
    }
  };

  const repairEquipment = () => {
    if (currentZone === "shallow-reef") {
      setEquipment(prev => ({
        ...prev,
        divingSuit: Math.min(100, prev.divingSuit + 20),
        rescueNet: Math.min(2, prev.rescueNet + 1),
        cleanupTools: Math.min(3, prev.cleanupTools + 1)
      }));
      setScore(prev => prev - 20); // Cost for repairs
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setScore(0);
    setOxygenLevel(100);
    setGameTime(0);
    setIsPlaying(false);
    setCurrentZone("shallow-reef");
    setEquipment({
      divingSuit: 100,
      oxygenTank: 100,
      waterTestKit: 5,
      cleanupTools: 3,
      rescueNet: 2,
      medicineKit: 3
    });
    setMarineLifeRescued([]);
    setPollutionCleaned([]);
    setWaterQualityTests([]);
    setCurrentMission(null);
    setAchievements([]);
    setTideLevel("normal");
    setWaterTemperature(22);
  };

  const currentZoneData = oceanZones.find(z => z.id === currentZone);

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
        <Navigation userType="student" />
        <main className="pt-20 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                <Waves className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4">
                Aquatic Life Guardian
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Dive deep to protect marine ecosystems and rescue aquatic life from environmental threats!
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <Card className="bg-gradient-to-br from-white to-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-700">
                    <Fish className="w-6 h-6" />
                    Guardian Missions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <HelpingHand className="w-4 h-4 text-blue-600 mt-0.5" />
                      Rescue endangered marine life
                    </li>
                    <li className="flex items-start gap-2">
                      <Trash2 className="w-4 h-4 text-red-600 mt-0.5" />
                      Clean up ocean pollution
                    </li>
                    <li className="flex items-start gap-2">
                      <Search className="w-4 h-4 text-green-600 mt-0.5" />
                      Monitor water quality
                    </li>
                    <li className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-purple-600 mt-0.5" />
                      Protect marine habitats
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-white to-cyan-50 border-cyan-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-cyan-700">
                    <Droplets className="w-6 h-6" />
                    Diving & Survival
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <Heart className="w-4 h-4 text-red-600 mt-0.5" />
                      Manage oxygen levels carefully
                    </li>
                    <li className="flex items-start gap-2">
                      <Anchor className="w-4 h-4 text-gray-600 mt-0.5" />
                      Navigate different ocean depths
                    </li>
                    <li className="flex items-start gap-2">
                      <Thermometer className="w-4 h-4 text-orange-600 mt-0.5" />
                      Adapt to changing conditions
                    </li>
                    <li className="flex items-start gap-2">
                      <Wind className="w-4 h-4 text-blue-600 mt-0.5" />
                      Work with tides and currents
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <Button 
                onClick={startGame}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Play className="w-6 h-6 mr-2" />
                Begin Dive
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      <Navigation userType="student" />
      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Game Header */}
          <div className="flex flex-wrap items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                <Waves className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Aquatic Life Guardian</h1>
                <p className="text-gray-600">Dive {Math.floor(gameTime / 180) + 1} - {Math.floor((gameTime % 180) / 60)}:{((gameTime % 180) % 60).toString().padStart(2, '0')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setIsPlaying(!isPlaying)}
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {isPlaying ? 'Pause' : 'Resume'}
              </Button>
              <Button onClick={resetGame} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button onClick={() => navigate('/student/games')} variant="outline">
                <Home className="w-4 h-4 mr-2" />
                Back to Games
              </Button>
            </div>
          </div>

          {/* Status Bar */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
              <CardContent className="p-4 text-center">
                <Droplets className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <Progress value={oxygenLevel} className="h-2 mb-2" />
                <div className="text-sm font-bold text-blue-700">{Math.round(oxygenLevel)}/100</div>
                <div className="text-xs text-blue-600">Oxygen</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
              <CardContent className="p-4 text-center">
                <Waves className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-yellow-700">{score}</div>
                <div className="text-xs text-yellow-600">Score</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-4 text-center">
                <Fish className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-green-700">{marineLifeRescued.length}</div>
                <div className="text-xs text-green-600">Rescued</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
              <CardContent className="p-4 text-center">
                <Trash2 className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-blue-700">{pollutionCleaned.length}</div>
                <div className="text-xs text-blue-600">Cleaned</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
              <CardContent className="p-4 text-center">
                <Thermometer className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-purple-700">{Math.round(waterTemperature)}°C</div>
                <div className="text-xs text-purple-600">Temp</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-1">
                  {tideLevel === "low" ? "🌊" : tideLevel === "high" ? "🌊🌊" : "🌊"}
                </div>
                <div className="text-sm font-bold text-teal-700 capitalize">{tideLevel}</div>
                <div className="text-xs text-teal-600">Tide</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Current Zone */}
            <div className="lg:col-span-2">
              <Card className="h-96">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">{currentZoneData.icon}</span>
                    {currentZoneData.name}
                    <Badge variant={currentZoneData.depth > 100 ? "destructive" : currentZoneData.depth > 25 ? "secondary" : "default"}>
                      Depth: {currentZoneData.depth}m
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{currentZoneData.description}</p>
                  
                  {/* Marine life in area */}
                  {currentZoneData.marineLife.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Fish className="w-4 h-4" />
                        Marine Life Present
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {currentZoneData.marineLife.map(marine => {
                          const data = marineLifeData[marine];
                          return (
                            <Button
                              key={marine}
                              onClick={() => rescueMarineLife(marine)}
                              disabled={equipment.rescueNet <= 0 || equipment.medicineKit <= 0 || data.health === "healthy"}
                              size="sm"
                              className={`${data.health === "healthy" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700 hover:bg-red-200"}`}
                            >
                              {data.emoji} {data.health !== "healthy" ? "Rescue" : "Observe"} {data.name}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Pollution in area */}
                  {currentZoneData.threats.some(threat => pollutionData[threat]) && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Trash2 className="w-4 h-4 text-red-500" />
                        Pollution Detected
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {currentZoneData.threats.filter(threat => pollutionData[threat]).map(threat => {
                          const pollution = pollutionData[threat];
                          return (
                            <Button
                              key={threat}
                              onClick={() => cleanPollution(threat)}
                              disabled={equipment[pollution.equipment] <= 0}
                              size="sm"
                              variant="destructive"
                            >
                              {pollution.emoji} Clean {pollution.name}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={testWaterQuality}
                      disabled={equipment.waterTestKit <= 0}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Test Water
                    </Button>
                    {currentZone === "shallow-reef" && (
                      <>
                        <Button
                          onClick={refillOxygen}
                          disabled={equipment.oxygenTank <= 10}
                          className="bg-cyan-600 hover:bg-cyan-700"
                        >
                          <Droplets className="w-4 h-4 mr-2" />
                          Refill O2
                        </Button>
                        <Button
                          onClick={repairEquipment}
                          disabled={score < 20}
                          className="bg-gray-600 hover:bg-gray-700"
                        >
                          🔧 Repair
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-2 space-y-4">
              {/* Zone Navigation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Anchor className="w-5 h-5" />
                    Navigate to Zone
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {oceanZones.filter(zone => zone.id !== currentZone).map(zone => (
                      <Button
                        key={zone.id}
                        onClick={() => moveToZone(zone.id)}
                        disabled={oxygenLevel < zone.depth / 5}
                        size="sm"
                        variant="outline"
                        className="text-left justify-start"
                      >
                        <span className="mr-2">{zone.icon}</span>
                        {zone.name}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Equipment Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Diving Equipment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(equipment).map(([item, value]) => (
                      <div key={item} className="flex items-center justify-between">
                        <span className="capitalize text-sm">{item.replace(/([A-Z])/g, ' $1')}</span>
                        <div className="flex items-center gap-2">
                          {item === 'divingSuit' || item === 'oxygenTank' ? (
                            <>
                              <Progress value={value} className="w-16 h-2" />
                              <span className="text-sm">{Math.round(value)}%</span>
                            </>
                          ) : (
                            <Badge variant="outline">{Math.round(value)}</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Current Mission */}
              {currentMission && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Current Mission
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <h4 className="font-semibold">{currentMission.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{currentMission.description}</p>
                    <Badge className="bg-blue-100 text-blue-800">
                      Reward: {currentMission.reward} points
                    </Badge>
                  </CardContent>
                </Card>
              )}

              {/* Achievements */}
              {achievements.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {achievements.map(achievement => (
                        <Badge key={achievement} className="w-full justify-start bg-blue-100 text-blue-800">
                          🏆 {achievement.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Recent Activity Log */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Dive Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {[...marineLifeRescued.slice(-3), ...pollutionCleaned.slice(-3), ...waterQualityTests.slice(-2)]
                  .sort((a, b) => b.time - a.time)
                  .map((activity, index) => (
                    <div key={index} className="text-sm flex items-center gap-2">
                      <span className="text-gray-500">
                        {Math.floor(activity.time / 60)}:{(activity.time % 60).toString().padStart(2, '0')}
                      </span>
                      <span>
                        {activity.emoji && activity.emoji} 
                        {activity.species ? ` Rescued ${activity.name}` : 
                         activity.type ? ` Cleaned ${activity.name}` :
                         ` Water test: ${activity.pollution}`}
                        {activity.zone && ` at ${oceanZones.find(z => z.id === activity.zone)?.name}`}
                      </span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default AquaticLifeGuardian;