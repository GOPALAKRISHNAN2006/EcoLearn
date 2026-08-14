import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { 
  Globe, 
  CloudRain, 
  Thermometer, 
  Heart, 
  Home,
  RefreshCw,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle,
  Wind,
  Eye,
  BarChart3,
  Satellite,
  MapPin,
  Sun,
  Snowflake,
  Zap
} from "lucide-react";

const GlobalWeatherDetective = () => {
  const navigate = useNavigate();
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [energy, setEnergy] = useState(100);
  const [gameTime, setGameTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLocation, setCurrentLocation] = useState("research-station");
  const [equipment, setEquipment] = useState({
    thermometer: 3,
    camera: 5,
    dataLogger: 2,
    weatherStation: 1,
    carbonDetector: 2,
    satellite: 1
  });
  const [climateData, setClimateData] = useState([]);
  const [evidenceCollected, setEvidenceCollected] = useState([]);
  const [reportsCompleted, setReportsCompleted] = useState([]);
  const [currentMission, setCurrentMission] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [globalTemperature, setGlobalTemperature] = useState(15.2);
  const [carbonLevels, setCarbonLevels] = useState(420);
  const [weatherPattern, setWeatherPattern] = useState("normal");

  // Investigation locations
  const locations = [
    { 
      id: "research-station", 
      name: "Research Station", 
      difficulty: 0, 
      phenomena: [], 
      climate_impacts: [],
      description: "Well-equipped base for climate research",
      icon: "🏢",
      energy_cost: 0
    },
    { 
      id: "arctic-ice", 
      name: "Arctic Ice Sheet", 
      difficulty: 40, 
      phenomena: ["ice-melting", "polar-bear-habitat", "albedo-effect"], 
      climate_impacts: ["sea-level-rise", "temperature-increase"],
      description: "Rapidly changing polar environment",
      icon: "🧊",
      energy_cost: 25
    },
    { 
      id: "tropical-forest", 
      name: "Tropical Rainforest", 
      difficulty: 30, 
      phenomena: ["deforestation", "carbon-storage", "biodiversity-loss"], 
      climate_impacts: ["carbon-emissions", "rainfall-changes"],
      description: "Critical carbon sink under threat",
      icon: "🌳",
      energy_cost: 20
    },
    { 
      id: "coral-reef", 
      name: "Coral Reef System", 
      difficulty: 35, 
      phenomena: ["ocean-acidification", "coral-bleaching", "temperature-rise"], 
      climate_impacts: ["marine-ecosystem-collapse", "fishery-decline"],
      description: "Ocean ecosystem showing climate stress",
      icon: "🪸",
      energy_cost: 22
    },
    { 
      id: "urban-area", 
      name: "Urban Heat Island", 
      difficulty: 20, 
      phenomena: ["heat-island", "air-pollution", "energy-consumption"], 
      climate_impacts: ["local-warming", "health-impacts"],
      description: "City showing urban climate effects",
      icon: "🏙️",
      energy_cost: 15
    },
    { 
      id: "coastal-area", 
      name: "Coastal Zone", 
      difficulty: 25, 
      phenomena: ["sea-level-rise", "coastal-erosion", "storm-surge"], 
      climate_impacts: ["flooding", "habitat-loss"],
      description: "Vulnerable coastline facing rising seas",
      icon: "🏖️",
      energy_cost: 18
    },
    { 
      id: "agricultural-land", 
      name: "Agricultural Region", 
      difficulty: 30, 
      phenomena: ["drought", "crop-stress", "changing-seasons"], 
      climate_impacts: ["food-security", "water-scarcity"],
      description: "Farmland experiencing climate stress",
      icon: "🌾",
      energy_cost: 20
    },
    { 
      id: "mountain-glacier", 
      name: "Mountain Glacier", 
      difficulty: 45, 
      phenomena: ["glacier-retreat", "permafrost-melt", "avalanche-risk"], 
      climate_impacts: ["water-supply-threat", "geologic-instability"],
      description: "Ancient ice formations disappearing",
      icon: "⛰️",
      energy_cost: 28
    }
  ];

  // Climate phenomena database
  const phenomenaData = {
    "ice-melting": { 
      name: "Ice Sheet Melting", 
      severity: "critical", 
      points: 50, 
      emoji: "🧊", 
      evidence_type: "temperature",
      description: "Arctic ice melting at unprecedented rates"
    },
    "polar-bear-habitat": { 
      name: "Polar Bear Habitat Loss", 
      severity: "high", 
      points: 40, 
      emoji: "🐻‍❄️", 
      evidence_type: "visual",
      description: "Polar bears losing hunting grounds"
    },
    "albedo-effect": { 
      name: "Reduced Albedo Effect", 
      severity: "high", 
      points: 35, 
      emoji: "☀️", 
      evidence_type: "measurement",
      description: "Dark ocean absorbing more heat"
    },
    "deforestation": { 
      name: "Accelerated Deforestation", 
      severity: "critical", 
      points: 45, 
      emoji: "🪓", 
      evidence_type: "visual",
      description: "Forest loss reducing carbon absorption"
    },
    "carbon-storage": { 
      name: "Carbon Storage Loss", 
      severity: "high", 
      points: 40, 
      emoji: "🌿", 
      evidence_type: "measurement",
      description: "Forests releasing stored carbon"
    },
    "biodiversity-loss": { 
      name: "Species Extinction", 
      severity: "high", 
      points: 35, 
      emoji: "🦋", 
      evidence_type: "visual",
      description: "Species unable to adapt to changes"
    },
    "ocean-acidification": { 
      name: "Ocean Acidification", 
      severity: "critical", 
      points: 50, 
      emoji: "🌊", 
      evidence_type: "measurement",
      description: "Ocean pH dropping due to CO2 absorption"
    },
    "coral-bleaching": { 
      name: "Mass Coral Bleaching", 
      severity: "critical", 
      points: 45, 
      emoji: "🪸", 
      evidence_type: "visual",
      description: "Corals dying from temperature stress"
    },
    "temperature-rise": { 
      name: "Water Temperature Rise", 
      severity: "high", 
      points: 30, 
      emoji: "🌡️", 
      evidence_type: "temperature",
      description: "Ocean temperatures increasing rapidly"
    },
    "heat-island": { 
      name: "Urban Heat Island Effect", 
      severity: "medium", 
      points: 25, 
      emoji: "🏙️", 
      evidence_type: "temperature",
      description: "Cities significantly warmer than surroundings"
    },
    "air-pollution": { 
      name: "Air Quality Deterioration", 
      severity: "high", 
      points: 30, 
      emoji: "🏭", 
      evidence_type: "measurement",
      description: "Greenhouse gas concentrations rising"
    },
    "energy-consumption": { 
      name: "High Energy Demand", 
      severity: "medium", 
      points: 20, 
      emoji: "⚡", 
      evidence_type: "measurement",
      description: "Increased cooling needs driving emissions"
    },
    "sea-level-rise": { 
      name: "Sea Level Rise", 
      severity: "critical", 
      points: 50, 
      emoji: "📈", 
      evidence_type: "measurement",
      description: "Global sea levels rising steadily"
    },
    "coastal-erosion": { 
      name: "Accelerated Erosion", 
      severity: "high", 
      points: 35, 
      emoji: "🌊", 
      evidence_type: "visual",
      description: "Coastlines disappearing rapidly"
    },
    "storm-surge": { 
      name: "Intensified Storm Surges", 
      severity: "high", 
      points: 40, 
      emoji: "🌪️", 
      evidence_type: "measurement",
      description: "Storms becoming more powerful"
    },
    "drought": { 
      name: "Extended Drought Periods", 
      severity: "high", 
      points: 35, 
      emoji: "🌵", 
      evidence_type: "measurement",
      description: "Rainfall patterns severely disrupted"
    },
    "crop-stress": { 
      name: "Agricultural Stress", 
      severity: "high", 
      points: 30, 
      emoji: "🌾", 
      evidence_type: "visual",
      description: "Crops failing due to climate extremes"
    },
    "changing-seasons": { 
      name: "Seasonal Disruption", 
      severity: "medium", 
      points: 25, 
      emoji: "🍂", 
      evidence_type: "measurement",
      description: "Traditional seasons becoming unpredictable"
    },
    "glacier-retreat": { 
      name: "Rapid Glacier Retreat", 
      severity: "critical", 
      points: 55, 
      emoji: "🏔️", 
      evidence_type: "visual",
      description: "Mountain glaciers disappearing"
    },
    "permafrost-melt": { 
      name: "Permafrost Thawing", 
      severity: "critical", 
      points: 50, 
      emoji: "❄️", 
      evidence_type: "temperature",
      description: "Frozen ground releasing methane"
    },
    "avalanche-risk": { 
      name: "Increased Avalanche Risk", 
      severity: "medium", 
      points: 20, 
      emoji: "⛷️", 
      evidence_type: "measurement",
      description: "Unstable ice conditions"
    }
  };

  // Climate impacts
  const impactData = {
    "sea-level-rise": { name: "Sea Level Rise", urgency: "critical", emoji: "🌊" },
    "temperature-increase": { name: "Global Warming", urgency: "critical", emoji: "🌡️" },
    "carbon-emissions": { name: "Carbon Emissions", urgency: "critical", emoji: "💨" },
    "rainfall-changes": { name: "Precipitation Changes", urgency: "high", emoji: "🌧️" },
    "marine-ecosystem-collapse": { name: "Marine Collapse", urgency: "critical", emoji: "🐟" },
    "fishery-decline": { name: "Fishery Decline", urgency: "high", emoji: "🎣" },
    "local-warming": { name: "Local Warming", urgency: "medium", emoji: "🌡️" },
    "health-impacts": { name: "Public Health Crisis", urgency: "high", emoji: "🏥" },
    "flooding": { name: "Coastal Flooding", urgency: "high", emoji: "🌊" },
    "habitat-loss": { name: "Habitat Destruction", urgency: "high", emoji: "🏠" },
    "food-security": { name: "Food Insecurity", urgency: "critical", emoji: "🍞" },
    "water-scarcity": { name: "Water Scarcity", urgency: "critical", emoji: "💧" },
    "water-supply-threat": { name: "Water Supply Crisis", urgency: "critical", emoji: "💧" },
    "geologic-instability": { name: "Geological Instability", urgency: "medium", emoji: "⛰️" }
  };

  // Available missions
  const missions = [
    {
      id: "global-temperature",
      name: "Global Temperature Assessment",
      description: "Collect temperature data from 4 different climate zones",
      reward: 200,
      requirements: { temperatureData: 4 },
      completed: false
    },
    {
      id: "evidence-collection",
      name: "Climate Evidence Documentation",
      description: "Document 6 different climate phenomena",
      reward: 250,
      requirements: { evidenceCollected: 6 },
      completed: false
    },
    {
      id: "impact-analysis",
      name: "Climate Impact Analysis",
      description: "Complete 3 detailed climate reports",
      reward: 300,
      requirements: { reportsCompleted: 3 },
      completed: false
    }
  ];

  // Weather patterns
  const weatherPatterns = ["normal", "extreme-heat", "severe-storms", "unusual-cold", "irregular"];

  // Game timer and climate simulation
  useEffect(() => {
    let interval;
    if (isPlaying && gameStarted) {
      interval = setInterval(() => {
        setGameTime(prev => prev + 1);
        
        // Energy consumption
        setEnergy(prev => Math.max(0, prev - 0.5));

        // Global climate changes
        if (Math.random() < 0.1) {
          setGlobalTemperature(prev => prev + (Math.random() - 0.48) * 0.1);
          setCarbonLevels(prev => prev + (Math.random() - 0.3) * 2);
        }

        // Weather pattern changes
        if (Math.random() < 0.08) {
          setWeatherPattern(weatherPatterns[Math.floor(Math.random() * weatherPatterns.length)]);
        }

        // Energy regeneration at research station
        if (currentLocation === "research-station" && energy < 100) {
          setEnergy(prev => Math.min(100, prev + 2));
        }

        // Random phenomena discoveries
        if (Math.random() < 0.12) {
          const location = locations.find(loc => loc.id === currentLocation);
          if (location && location.phenomena.length > 0) {
            const randomPhenomena = location.phenomena[Math.floor(Math.random() * location.phenomena.length)];
            if (!evidenceCollected.some(e => e.phenomenon === randomPhenomena && e.location === currentLocation)) {
              // Auto-discover phenomenon hint
            }
          }
        }

      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, gameStarted, currentLocation, energy, evidenceCollected]);

  // Check achievements
  useEffect(() => {
    const newAchievements = [];
    
    if (evidenceCollected.length >= 8 && !achievements.includes("climate-investigator")) {
      newAchievements.push("climate-investigator");
    }
    
    if (climateData.length >= 10 && !achievements.includes("data-scientist")) {
      newAchievements.push("data-scientist");
    }
    
    if (score >= 1000 && !achievements.includes("climate-expert")) {
      newAchievements.push("climate-expert");
    }

    if (reportsCompleted.length >= 5 && !achievements.includes("environmental-journalist")) {
      newAchievements.push("environmental-journalist");
    }

    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements]);
    }
  }, [evidenceCollected.length, climateData.length, score, reportsCompleted.length, achievements]);

  const startGame = () => {
    setGameStarted(true);
    setIsPlaying(true);
    setCurrentMission(missions[0]);
  };

  const moveToLocation = (locationId) => {
    const location = locations.find(loc => loc.id === locationId);
    
    // Energy cost for travel
    const energyCost = location.energy_cost;
    setEnergy(prev => Math.max(0, prev - energyCost));
    
    setCurrentLocation(locationId);
    setScore(prev => prev + 5); // Travel points
  };

  const investigatePhenomenon = (phenomenon) => {
    const phenomenonData = phenomenaData[phenomenon];
    
    if (equipment[getRequiredEquipment(phenomenonData.evidence_type)] > 0) {
      const evidence = {
        phenomenon,
        location: currentLocation,
        time: gameTime,
        severity: phenomenonData.severity,
        type: phenomenonData.evidence_type,
        ...phenomenonData
      };
      
      setEvidenceCollected(prev => [...prev, evidence]);
      setScore(prev => prev + phenomenonData.points);
      
      // Use equipment
      const requiredEquip = getRequiredEquipment(phenomenonData.evidence_type);
      setEquipment(prev => ({
        ...prev,
        [requiredEquip]: prev[requiredEquip] - 1
      }));
    }
  };

  const collectClimateData = (dataType) => {
    const location = locations.find(loc => loc.id === currentLocation);
    let requiredEquip = "";
    let points = 0;

    switch (dataType) {
      case "temperature":
        requiredEquip = "thermometer";
        points = 15;
        break;
      case "carbon":
        requiredEquip = "carbonDetector";
        points = 20;
        break;
      case "weather":
        requiredEquip = "weatherStation";
        points = 25;
        break;
      case "satellite":
        requiredEquip = "satellite";
        points = 30;
        break;
    }

    if (equipment[requiredEquip] > 0) {
      const data = {
        type: dataType,
        location: currentLocation,
        time: gameTime,
        value: generateDataValue(dataType, location),
        quality: Math.random() > 0.3 ? "high" : "medium"
      };
      
      setClimateData(prev => [...prev, data]);
      setScore(prev => prev + points);
      setEquipment(prev => ({
        ...prev,
        [requiredEquip]: prev[requiredEquip] - 1
      }));
    }
  };

  const generateReport = () => {
    if (evidenceCollected.length >= 2 && climateData.length >= 2) {
      const report = {
        id: Date.now(),
        location: currentLocation,
        time: gameTime,
        evidenceCount: evidenceCollected.filter(e => e.location === currentLocation).length,
        dataCount: climateData.filter(d => d.location === currentLocation).length,
        conclusions: generateConclusions()
      };
      
      setReportsCompleted(prev => [...prev, report]);
      setScore(prev => prev + 100);
    }
  };

  const generateConclusions = () => {
    const locationEvidence = evidenceCollected.filter(e => e.location === currentLocation);
    const locationData = climateData.filter(d => d.location === currentLocation);
    
    const conclusions = [];
    if (locationEvidence.some(e => e.severity === "critical")) {
      conclusions.push("Critical climate impacts detected");
    }
    if (locationData.some(d => d.quality === "high")) {
      conclusions.push("High-quality data supports findings");
    }
    if (locationEvidence.length >= 3) {
      conclusions.push("Multiple phenomena confirm climate stress");
    }
    
    return conclusions.length > 0 ? conclusions : ["Climate monitoring ongoing"];
  };

  const getRequiredEquipment = (evidenceType) => {
    switch (evidenceType) {
      case "temperature": return "thermometer";
      case "visual": return "camera";
      case "measurement": return "dataLogger";
      default: return "camera";
    }
  };

  const generateDataValue = (dataType, location) => {
    switch (dataType) {
      case "temperature":
        return (globalTemperature + (Math.random() - 0.5) * 5).toFixed(1);
      case "carbon":
        return Math.round(carbonLevels + (Math.random() - 0.5) * 50);
      case "weather":
        return weatherPattern;
      case "satellite":
        return `${location.name} observed from space`;
      default:
        return "unknown";
    }
  };

  const restockEquipment = () => {
    if (currentLocation === "research-station" && score >= 50) {
      setEquipment(prev => ({
        thermometer: Math.min(3, prev.thermometer + 2),
        camera: Math.min(5, prev.camera + 3),
        dataLogger: Math.min(2, prev.dataLogger + 1),
        weatherStation: Math.min(1, prev.weatherStation + 1),
        carbonDetector: Math.min(2, prev.carbonDetector + 1),
        satellite: Math.min(1, prev.satellite + 1)
      }));
      setScore(prev => prev - 50);
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setScore(0);
    setEnergy(100);
    setGameTime(0);
    setIsPlaying(false);
    setCurrentLocation("research-station");
    setEquipment({
      thermometer: 3,
      camera: 5,
      dataLogger: 2,
      weatherStation: 1,
      carbonDetector: 2,
      satellite: 1
    });
    setClimateData([]);
    setEvidenceCollected([]);
    setReportsCompleted([]);
    setCurrentMission(null);
    setAchievements([]);
    setGlobalTemperature(15.2);
    setCarbonLevels(420);
    setWeatherPattern("normal");
  };

  const currentLocationData = locations.find(loc => loc.id === currentLocation);

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50">
        <Navigation userType="student" />
        <main className="pt-20 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-sky-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                <Globe className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-sky-600 bg-clip-text text-transparent mb-4">
                Global Weather Detective
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Track weather patterns and predict climate changes around the world!
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <Card className="bg-gradient-to-br from-white to-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-700">
                    <BarChart3 className="w-6 h-6" />
                    Weather Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <Satellite className="w-4 h-4 text-blue-600 mt-0.5" />
                      Monitor global weather systems
                    </li>
                    <li className="flex items-start gap-2">
                      <Eye className="w-4 h-4 text-green-600 mt-0.5" />
                      Discover weather patterns
                    </li>
                    <li className="flex items-start gap-2">
                      <BarChart3 className="w-4 h-4 text-purple-600 mt-0.5" />
                      Collect meteorological data
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-orange-600 mt-0.5" />
                      Make accurate predictions
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-white to-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sky-700">
                    <CloudRain className="w-6 h-6" />
                    Weather Equipment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <Thermometer className="w-4 h-4 text-red-600 mt-0.5" />
                      Advanced weather stations
                    </li>
                    <li className="flex items-start gap-2">
                      <Satellite className="w-4 h-4 text-blue-600 mt-0.5" />
                      Satellite monitoring systems
                    </li>
                    <li className="flex items-start gap-2">
                      <Wind className="w-4 h-4 text-green-600 mt-0.5" />
                      Atmospheric measurement tools
                    </li>
                    <li className="flex items-start gap-2">
                      <BarChart3 className="w-4 h-4 text-purple-600 mt-0.5" />
                      Data logging equipment
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <Button 
                onClick={startGame}
                className="bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Play className="w-6 h-6 mr-2" />
                Start Weather Monitoring
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-yellow-50">
      <Navigation userType="student" />
      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Game Header */}
          <div className="flex flex-wrap items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-sky-600 rounded-lg flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Global Weather Detective</h1>
                <p className="text-gray-600">Forecast {Math.floor(gameTime / 200) + 1} - {Math.floor((gameTime % 200) / 60)}:{((gameTime % 200) % 60).toString().padStart(2, '0')}</p>
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

          {/* Global Status Bar */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
              <CardContent className="p-4 text-center">
                <Zap className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <Progress value={energy} className="h-2 mb-2" />
                <div className="text-sm font-bold text-blue-700">{Math.round(energy)}/100</div>
                <div className="text-xs text-blue-600">Energy</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
              <CardContent className="p-4 text-center">
                <Search className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-yellow-700">{score}</div>
                <div className="text-xs text-yellow-600">Score</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-4 text-center">
                <Camera className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-green-700">{evidenceCollected.length}</div>
                <div className="text-xs text-green-600">Evidence</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
              <CardContent className="p-4 text-center">
                <BarChart3 className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-blue-700">{climateData.length}</div>
                <div className="text-xs text-blue-600">Data Points</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
              <CardContent className="p-4 text-center">
                <Thermometer className="w-6 h-6 text-red-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-red-700">{globalTemperature.toFixed(1)}°C</div>
                <div className="text-xs text-red-600">Global Temp</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200">
              <CardContent className="p-4 text-center">
                <Factory className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-gray-700">{carbonLevels}</div>
                <div className="text-xs text-gray-600">CO2 ppm</div>
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
                    <Badge variant={currentLocationData.difficulty > 30 ? "destructive" : currentLocationData.difficulty > 15 ? "secondary" : "default"}>
                      Difficulty: {currentLocationData.difficulty}%
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{currentLocationData.description}</p>
                  
                  {/* Climate phenomena in area */}
                  {currentLocationData.phenomena.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                        Climate Phenomena
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {currentLocationData.phenomena.map(phenomenon => {
                          const data = phenomenaData[phenomenon];
                          return (
                            <Button
                              key={phenomenon}
                              onClick={() => investigatePhenomenon(phenomenon)}
                              disabled={equipment[getRequiredEquipment(data.evidence_type)] <= 0}
                              size="sm"
                              className="bg-orange-100 text-orange-700 hover:bg-orange-200"
                            >
                              {data.emoji} Investigate {data.name}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Data collection options */}
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-blue-500" />
                      Collect Climate Data
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => collectClimateData("temperature")}
                        disabled={equipment.thermometer <= 0}
                        size="sm"
                        className="bg-red-100 text-red-700 hover:bg-red-200"
                      >
                        🌡️ Temperature
                      </Button>
                      <Button
                        onClick={() => collectClimateData("carbon")}
                        disabled={equipment.carbonDetector <= 0}
                        size="sm"
                        className="bg-gray-100 text-gray-700 hover:bg-gray-200"
                      >
                        💨 Carbon Levels
                      </Button>
                      <Button
                        onClick={() => collectClimateData("weather")}
                        disabled={equipment.weatherStation <= 0}
                        size="sm"
                        className="bg-blue-100 text-blue-700 hover:bg-blue-200"
                      >
                        🌤️ Weather Data
                      </Button>
                      <Button
                        onClick={() => collectClimateData("satellite")}
                        disabled={equipment.satellite <= 0}
                        size="sm"
                        className="bg-purple-100 text-purple-700 hover:bg-purple-200"
                      >
                        🛰️ Satellite View
                      </Button>
                    </div>
                  </div>

                  {/* Generate report */}
                  <Button
                    onClick={generateReport}
                    disabled={evidenceCollected.filter(e => e.location === currentLocation).length < 2 || 
                             climateData.filter(d => d.location === currentLocation).length < 2}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Generate Climate Report
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-2 space-y-4">
              {/* Location Navigation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Travel to Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {locations.filter(loc => loc.id !== currentLocation).map(location => (
                      <Button
                        key={location.id}
                        onClick={() => moveToLocation(location.id)}
                        disabled={energy < location.energy_cost}
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

              {/* Equipment Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Research Equipment</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(equipment).map(([item, count]) => (
                      <div key={item} className="flex items-center justify-between">
                        <span className="capitalize text-sm">{item.replace(/([A-Z])/g, ' $1')}</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                    {currentLocation === "research-station" && (
                      <Button
                        onClick={restockEquipment}
                        disabled={score < 50}
                        size="sm"
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        🔄 Restock Equipment (50 pts)
                      </Button>
                    )}
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
                      <CheckCircle className="w-5 h-5" />
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

          {/* Research Log */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Research Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {[...evidenceCollected.slice(-3), ...climateData.slice(-3)]
                  .sort((a, b) => b.time - a.time)
                  .map((activity, index) => (
                    <div key={index} className="text-sm flex items-center gap-2">
                      <span className="text-gray-500">
                        {Math.floor(activity.time / 60)}:{(activity.time % 60).toString().padStart(2, '0')}
                      </span>
                      <span>
                        {activity.emoji && activity.emoji} 
                        {activity.phenomenon ? ` Documented ${activity.name}` : ` Collected ${activity.type} data`}
                        {activity.location && ` at ${locations.find(loc => loc.id === activity.location)?.name}`}
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

export default GlobalWeatherDetective;