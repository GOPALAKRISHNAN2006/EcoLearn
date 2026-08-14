import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { 
  Mountain, 
  TreePine, 
  Rabbit, 
  Eye, 
  Shield, 
  Heart,
  Home,
  RefreshCw,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle,
  MapPin,
  Camera,
  Footprints,
  Leaf
} from "lucide-react";

const MountainRanger = () => {
  const navigate = useNavigate();
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [rangerHealth, setRangerHealth] = useState(100);
  const [gameTime, setGameTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLocation, setCurrentLocation] = useState("base-camp");
  const [inventory, setInventory] = useState({
    camera: 1,
    firstAid: 3,
    food: 5,
    water: 3,
    equipment: 2
  });
  const [wildlifeSpotted, setWildlifeSpotted] = useState([]);
  const [threatsNeutralized, setThreatsNeutralized] = useState([]);
  const [conservationProjects, setConservationProjects] = useState([]);
  const [currentMission, setCurrentMission] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [weatherCondition, setWeatherCondition] = useState("clear");

  // Mountain locations
  const locations = [
    { 
      id: "base-camp", 
      name: "Base Camp", 
      danger: 0, 
      wildlife: [], 
      threats: [],
      description: "Safe starting point with supplies",
      icon: "🏕️"
    },
    { 
      id: "forest-trail", 
      name: "Forest Trail", 
      danger: 20, 
      wildlife: ["deer", "squirrel", "owl"], 
      threats: ["litter", "illegal-camping"],
      description: "Dense forest with diverse wildlife",
      icon: "🌲"
    },
    { 
      id: "mountain-peak", 
      name: "Mountain Peak", 
      danger: 60, 
      wildlife: ["eagle", "mountain-goat"], 
      threats: ["rockfall", "extreme-weather"],
      description: "Challenging peak with rare wildlife",
      icon: "⛰️"
    },
    { 
      id: "alpine-meadow", 
      name: "Alpine Meadow", 
      danger: 30, 
      wildlife: ["butterfly", "marmot", "wildflowers"], 
      threats: ["poaching", "habitat-destruction"],
      description: "Beautiful meadow with fragile ecosystem",
      icon: "🌸"
    },
    { 
      id: "river-valley", 
      name: "River Valley", 
      danger: 40, 
      wildlife: ["fish", "beaver", "otter"], 
      threats: ["pollution", "dam-damage"],
      description: "Vital water source for mountain life",
      icon: "🏞️"
    },
    { 
      id: "cave-system", 
      name: "Cave System", 
      danger: 50, 
      wildlife: ["bat", "salamander"], 
      threats: ["disturbance", "vandalism"],
      description: "Delicate underground ecosystem",
      icon: "🕳️"
    }
  ];

  // Wildlife database
  const wildlifeData = {
    deer: { name: "Mountain Deer", rarity: "common", points: 10, emoji: "🦌" },
    squirrel: { name: "Tree Squirrel", rarity: "common", points: 5, emoji: "🐿️" },
    owl: { name: "Great Horned Owl", rarity: "uncommon", points: 15, emoji: "🦉" },
    eagle: { name: "Golden Eagle", rarity: "rare", points: 30, emoji: "🦅" },
    "mountain-goat": { name: "Mountain Goat", rarity: "rare", points: 25, emoji: "🐐" },
    butterfly: { name: "Alpine Butterfly", rarity: "uncommon", points: 12, emoji: "🦋" },
    marmot: { name: "Alpine Marmot", rarity: "common", points: 8, emoji: "🐹" },
    wildflowers: { name: "Rare Wildflowers", rarity: "uncommon", points: 10, emoji: "🌺" },
    fish: { name: "Mountain Trout", rarity: "common", points: 7, emoji: "🐟" },
    beaver: { name: "Mountain Beaver", rarity: "uncommon", points: 18, emoji: "🦫" },
    otter: { name: "River Otter", rarity: "rare", points: 22, emoji: "🦦" },
    bat: { name: "Cave Bat", rarity: "common", points: 6, emoji: "🦇" },
    salamander: { name: "Cave Salamander", rarity: "rare", points: 20, emoji: "🦎" }
  };

  // Threats database
  const threatData = {
    litter: { name: "Litter Cleanup", difficulty: "easy", points: 15, emoji: "🗑️" },
    "illegal-camping": { name: "Illegal Camping", difficulty: "medium", points: 25, emoji: "🚫" },
    rockfall: { name: "Rockfall Warning", difficulty: "hard", points: 40, emoji: "⚠️" },
    "extreme-weather": { name: "Weather Emergency", difficulty: "hard", points: 35, emoji: "🌪️" },
    poaching: { name: "Stop Poaching", difficulty: "hard", points: 50, emoji: "🚨" },
    "habitat-destruction": { name: "Habitat Protection", difficulty: "medium", points: 30, emoji: "🛡️" },
    pollution: { name: "Water Pollution", difficulty: "medium", points: 35, emoji: "💧" },
    "dam-damage": { name: "Dam Inspection", difficulty: "hard", points: 45, emoji: "🏗️" },
    disturbance: { name: "Visitor Education", difficulty: "easy", points: 20, emoji: "📚" },
    vandalism: { name: "Cave Protection", difficulty: "medium", points: 30, emoji: "🔒" }
  };

  // Available missions
  const missions = [
    {
      id: "wildlife-survey",
      name: "Wildlife Population Survey",
      description: "Document wildlife in 3 different locations",
      reward: 100,
      requirements: { wildlifeSpotted: 3 },
      completed: false
    },
    {
      id: "threat-assessment",
      name: "Environmental Threat Assessment",
      description: "Neutralize 5 environmental threats",
      reward: 150,
      requirements: { threatsNeutralized: 5 },
      completed: false
    },
    {
      id: "conservation-leader",
      name: "Conservation Leadership",
      description: "Complete 2 conservation projects",
      reward: 200,
      requirements: { conservationProjects: 2 },
      completed: false
    }
  ];

  // Weather conditions
  const weatherConditions = ["clear", "cloudy", "rainy", "snowy", "foggy"];

  // Game timer and random events
  useEffect(() => {
    let interval;
    if (isPlaying && gameStarted) {
      interval = setInterval(() => {
        setGameTime(prev => prev + 1);
        
        // Random weather changes
        if (Math.random() < 0.08) {
          setWeatherCondition(weatherConditions[Math.floor(Math.random() * weatherConditions.length)]);
        }

        // Health regeneration at base camp
        if (currentLocation === "base-camp" && rangerHealth < 100) {
          setRangerHealth(prev => Math.min(100, prev + 2));
        }

        // Random wildlife encounters
        if (Math.random() < 0.15) {
          const location = locations.find(loc => loc.id === currentLocation);
          if (location && location.wildlife.length > 0) {
            const randomWildlife = location.wildlife[Math.floor(Math.random() * location.wildlife.length)];
            if (!wildlifeSpotted.some(w => w.species === randomWildlife && w.location === currentLocation)) {
              spotWildlife(randomWildlife);
            }
          }
        }

      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, gameStarted, currentLocation, rangerHealth, wildlifeSpotted]);

  // Check achievements
  useEffect(() => {
    const newAchievements = [];
    
    if (wildlifeSpotted.length >= 5 && !achievements.includes("wildlife-expert")) {
      newAchievements.push("wildlife-expert");
    }
    
    if (threatsNeutralized.length >= 3 && !achievements.includes("threat-neutralizer")) {
      newAchievements.push("threat-neutralizer");
    }
    
    if (score >= 500 && !achievements.includes("master-ranger")) {
      newAchievements.push("master-ranger");
    }

    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements]);
    }
  }, [wildlifeSpotted.length, threatsNeutralized.length, score, achievements]);

  const startGame = () => {
    setGameStarted(true);
    setIsPlaying(true);
    setCurrentMission(missions[0]);
  };

  const moveToLocation = (locationId) => {
    const location = locations.find(loc => loc.id === locationId);
    
    // Health cost based on danger level
    const healthCost = Math.floor(location.danger / 10);
    setRangerHealth(prev => Math.max(0, prev - healthCost));
    
    setCurrentLocation(locationId);
    setScore(prev => prev + 5); // Movement points
  };

  const spotWildlife = (species) => {
    if (inventory.camera > 0) {
      const wildlife = wildlifeData[species];
      const newSpotting = {
        species,
        location: currentLocation,
        time: gameTime,
        ...wildlife
      };
      
      setWildlifeSpotted(prev => [...prev, newSpotting]);
      setScore(prev => prev + wildlife.points);
      setInventory(prev => ({ ...prev, camera: prev.camera - 0.1 })); // Camera battery
    }
  };

  const handleThreat = (threatId) => {
    const threat = threatData[threatId];
    const location = locations.find(loc => loc.id === currentLocation);
    
    if (location.threats.includes(threatId)) {
      let success = true;
      let healthCost = 0;
      
      // Determine success based on difficulty and resources
      switch (threat.difficulty) {
        case "easy":
          healthCost = 5;
          break;
        case "medium":
          healthCost = 15;
          success = inventory.equipment > 0.5;
          break;
        case "hard":
          healthCost = 25;
          success = inventory.equipment > 1 && rangerHealth > 30;
          break;
      }
      
      setRangerHealth(prev => Math.max(0, prev - healthCost));
      
      if (success) {
        setThreatsNeutralized(prev => [...prev, {
          threat: threatId,
          location: currentLocation,
          time: gameTime,
          ...threat
        }]);
        setScore(prev => prev + threat.points);
        setInventory(prev => ({ ...prev, equipment: Math.max(0, prev.equipment - 0.5) }));
      }
    }
  };

  const startConservationProject = () => {
    if (inventory.equipment >= 1 && inventory.food >= 2) {
      const project = {
        id: Date.now(),
        location: currentLocation,
        startTime: gameTime,
        completed: false
      };
      
      setConservationProjects(prev => [...prev, project]);
      setInventory(prev => ({
        ...prev,
        equipment: prev.equipment - 1,
        food: prev.food - 2
      }));
      setScore(prev => prev + 75);
    }
  };

  const useItem = (item) => {
    switch (item) {
      case "firstAid":
        if (inventory.firstAid > 0 && rangerHealth < 100) {
          setRangerHealth(prev => Math.min(100, prev + 30));
          setInventory(prev => ({ ...prev, firstAid: prev.firstAid - 1 }));
        }
        break;
      case "food":
        if (inventory.food > 0 && rangerHealth < 100) {
          setRangerHealth(prev => Math.min(100, prev + 15));
          setInventory(prev => ({ ...prev, food: prev.food - 1 }));
        }
        break;
      case "water":
        if (inventory.water > 0 && rangerHealth < 100) {
          setRangerHealth(prev => Math.min(100, prev + 10));
          setInventory(prev => ({ ...prev, water: prev.water - 1 }));
        }
        break;
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setScore(0);
    setRangerHealth(100);
    setGameTime(0);
    setIsPlaying(false);
    setCurrentLocation("base-camp");
    setInventory({ camera: 1, firstAid: 3, food: 5, water: 3, equipment: 2 });
    setWildlifeSpotted([]);
    setThreatsNeutralized([]);
    setConservationProjects([]);
    setCurrentMission(null);
    setAchievements([]);
    setWeatherCondition("clear");
  };

  const currentLocationData = locations.find(loc => loc.id === currentLocation);

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <Navigation userType="student" />
        <main className="pt-20 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                <Mountain className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
                Mountain Ranger
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Protect mountain ecosystems and wildlife habitats as a dedicated park ranger!
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <Card className="bg-gradient-to-br from-white to-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <Shield className="w-6 h-6" />
                    Ranger Duties
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <Rabbit className="w-4 h-4 text-green-600 mt-0.5" />
                      Document and protect wildlife populations
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                      Address environmental threats
                    </li>
                    <li className="flex items-start gap-2">
                      <TreePine className="w-4 h-4 text-green-600 mt-0.5" />
                      Lead conservation projects
                    </li>
                    <li className="flex items-start gap-2">
                      <Eye className="w-4 h-4 text-blue-600 mt-0.5" />
                      Monitor ecosystem health
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-white to-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-700">
                    <Camera className="w-6 h-6" />
                    Equipment & Survival
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      Manage limited supplies wisely
                    </li>
                    <li className="flex items-start gap-2">
                      <Heart className="w-4 h-4 text-red-600 mt-0.5" />
                      Monitor your health and energy
                    </li>
                    <li className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-purple-600 mt-0.5" />
                      Navigate dangerous terrain
                    </li>
                    <li className="flex items-start gap-2">
                      <Footprints className="w-4 h-4 text-brown-600 mt-0.5" />
                      Track wildlife and threats
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <Button 
                onClick={startGame}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Play className="w-6 h-6 mr-2" />
                Start Ranger Duty
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <Navigation userType="student" />
      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Game Header */}
          <div className="flex flex-wrap items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Mountain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Mountain Ranger</h1>
                <p className="text-gray-600">Day {Math.floor(gameTime / 120) + 1} - {Math.floor((gameTime % 120) / 60)}:{((gameTime % 120) % 60).toString().padStart(2, '0')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setIsPlaying(!isPlaying)}
                variant="outline"
                className="border-green-300 text-green-700 hover:bg-green-50"
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
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
              <CardContent className="p-4 text-center">
                <Heart className="w-6 h-6 text-red-600 mx-auto mb-2" />
                <Progress value={rangerHealth} className="h-2 mb-2" />
                <div className="text-sm font-bold text-red-700">{rangerHealth}/100</div>
                <div className="text-xs text-red-600">Health</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
              <CardContent className="p-4 text-center">
                <Mountain className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-yellow-700">{score}</div>
                <div className="text-xs text-yellow-600">Score</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-4 text-center">
                <Rabbit className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-green-700">{wildlifeSpotted.length}</div>
                <div className="text-xs text-green-600">Wildlife</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
              <CardContent className="p-4 text-center">
                <Shield className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-blue-700">{threatsNeutralized.length}</div>
                <div className="text-xs text-blue-600">Threats</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-1">
                  {weatherCondition === "clear" ? "☀️" : 
                   weatherCondition === "cloudy" ? "☁️" :
                   weatherCondition === "rainy" ? "🌧️" :
                   weatherCondition === "snowy" ? "❄️" : "🌫️"}
                </div>
                <div className="text-sm font-bold text-purple-700 capitalize">{weatherCondition}</div>
                <div className="text-xs text-purple-600">Weather</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Current Location */}
            <div className="lg:col-span-2">
              <Card className="h-96">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">{currentLocationData.icon}</span>
                    {currentLocationData.name}
                    <Badge variant={currentLocationData.danger > 40 ? "destructive" : currentLocationData.danger > 20 ? "secondary" : "default"}>
                      Danger: {currentLocationData.danger}%
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{currentLocationData.description}</p>
                  
                  {/* Wildlife in area */}
                  {currentLocationData.wildlife.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Rabbit className="w-4 h-4" />
                        Wildlife in Area
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {currentLocationData.wildlife.map(wildlife => (
                          <Button
                            key={wildlife}
                            onClick={() => spotWildlife(wildlife)}
                            disabled={inventory.camera <= 0}
                            size="sm"
                            className="bg-green-100 text-green-700 hover:bg-green-200"
                          >
                            {wildlifeData[wildlife].emoji} Spot {wildlifeData[wildlife].name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Threats in area */}
                  {currentLocationData.threats.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        Environmental Threats
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {currentLocationData.threats.map(threat => (
                          <Button
                            key={threat}
                            onClick={() => handleThreat(threat)}
                            disabled={rangerHealth < 20}
                            size="sm"
                            variant="destructive"
                          >
                            {threatData[threat].emoji} {threatData[threat].name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Conservation project */}
                  <Button
                    onClick={startConservationProject}
                    disabled={inventory.equipment < 1 || inventory.food < 2}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Leaf className="w-4 h-4 mr-2" />
                    Start Conservation Project
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-2 space-y-4">
              {/* Navigation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Move to Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {locations.filter(loc => loc.id !== currentLocation).map(location => (
                      <Button
                        key={location.id}
                        onClick={() => moveToLocation(location.id)}
                        disabled={rangerHealth < 10}
                        size="sm"
                        variant="outline"
                        className="text-left justify-start"
                      >
                        <span className="mr-2">{location.icon}</span>
                        {location.name}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Inventory */}
              <Card>
                <CardHeader>
                  <CardTitle>Ranger Equipment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Camera className="w-4 h-4" />
                        Camera Battery
                      </span>
                      <div className="flex items-center gap-2">
                        <Progress value={inventory.camera * 100} className="w-16 h-2" />
                        <span className="text-sm">{Math.round(inventory.camera * 100)}%</span>
                      </div>
                    </div>
                    
                    {Object.entries(inventory).filter(([key]) => key !== 'camera').map(([item, count]) => (
                      <div key={item} className="flex items-center justify-between">
                        <span className="capitalize">{item.replace(/([A-Z])/g, ' $1')}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{count}</Badge>
                          {(item === 'firstAid' || item === 'food' || item === 'water') && (
                            <Button
                              onClick={() => useItem(item)}
                              disabled={count <= 0 || rangerHealth >= 100}
                              size="sm"
                            >
                              Use
                            </Button>
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
                    <Badge className="bg-yellow-100 text-yellow-800">
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
                      <Mountain className="w-5 h-5" />
                      Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {achievements.map(achievement => (
                        <Badge key={achievement} className="w-full justify-start bg-yellow-100 text-yellow-800">
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
              <CardTitle>Activity Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {[...wildlifeSpotted.slice(-3), ...threatsNeutralized.slice(-3)]
                  .sort((a, b) => b.time - a.time)
                  .map((activity, index) => (
                    <div key={index} className="text-sm flex items-center gap-2">
                      <span className="text-gray-500">
                        {Math.floor(activity.time / 60)}:{(activity.time % 60).toString().padStart(2, '0')}
                      </span>
                      <span>
                        {activity.emoji} 
                        {activity.species ? ` Spotted ${activity.name}` : ` Handled ${activity.name}`}
                        at {locations.find(loc => loc.id === activity.location)?.name}
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

export default MountainRanger;