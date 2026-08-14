import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { 
  Wind, 
  Zap, 
  DollarSign, 
  MapPin, 
  RotateCw, 
  TrendingUp, 
  Award,
  Home,
  RefreshCw,
  Play,
  Pause,
  BarChart3,
  Lightbulb,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

const WindFarmEngineer = () => {
  const navigate = useNavigate();
  const [gameStarted, setGameStarted] = useState(false);
  const [gamePhase, setGamePhase] = useState("planning"); // planning, construction, operation
  const [score, setScore] = useState(0);
  const [money, setMoney] = useState(50000);
  const [energyProduced, setEnergyProduced] = useState(0);
  const [windTurbines, setWindTurbines] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [gameTime, setGameTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [weather, setWeather] = useState("moderate"); // calm, light, moderate, strong, storm
  const [energyDemand, setEnergyDemand] = useState(1000);
  const [achievements, setAchievements] = useState([]);

  // Game locations with different wind conditions
  const locations = [
    { id: 1, name: "Coastal Plains", windSpeed: 15, cost: 8000, efficiency: 85, x: 20, y: 30 },
    { id: 2, name: "Mountain Ridge", windSpeed: 20, cost: 12000, efficiency: 95, x: 60, y: 20 },
    { id: 3, name: "Prairie Valley", windSpeed: 12, cost: 6000, efficiency: 70, x: 30, y: 60 },
    { id: 4, name: "Offshore Zone", windSpeed: 25, cost: 15000, efficiency: 98, x: 80, y: 40 },
    { id: 5, name: "Desert Hills", windSpeed: 18, cost: 10000, efficiency: 80, x: 40, y: 80 }
  ];

  // Weather effects on wind speed
  const weatherEffects = {
    calm: 0.3,
    light: 0.6,
    moderate: 1.0,
    strong: 1.4,
    storm: 0.1 // Turbines shut down in storms
  };

  // Turbine types
  const turbineTypes = [
    { id: 1, name: "Basic Wind Turbine", cost: 5000, power: 100, efficiency: 70 },
    { id: 2, name: "Advanced Turbine", cost: 8000, power: 150, efficiency: 85 },
    { id: 3, name: "High-Tech Turbine", cost: 12000, power: 200, efficiency: 95 }
  ];

  // Game timer
  useEffect(() => {
    let interval;
    if (isPlaying && gameStarted) {
      interval = setInterval(() => {
        setGameTime(prev => prev + 1);
        
        // Random weather changes
        if (Math.random() < 0.1) {
          const weathers = ["calm", "light", "moderate", "strong", "storm"];
          setWeather(weathers[Math.floor(Math.random() * weathers.length)]);
        }

        // Calculate energy production
        const totalProduction = windTurbines.reduce((total, turbine) => {
          const location = locations.find(loc => loc.id === turbine.locationId);
          const weatherMultiplier = weatherEffects[weather];
          const production = turbine.power * (location.efficiency / 100) * weatherMultiplier;
          return total + production;
        }, 0);

        setEnergyProduced(prev => prev + totalProduction);
        
        // Earn money from energy production
        setMoney(prev => prev + totalProduction * 0.1);
        
        // Update score
        setScore(prev => prev + totalProduction * 0.05);

        // Random demand changes
        if (Math.random() < 0.05) {
          setEnergyDemand(prev => Math.max(500, prev + (Math.random() - 0.5) * 400));
        }

      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, gameStarted, windTurbines, weather]);

  // Check for achievements
  useEffect(() => {
    const newAchievements = [];
    
    if (windTurbines.length >= 5 && !achievements.includes("first-farm")) {
      newAchievements.push("first-farm");
    }
    
    if (energyProduced >= 10000 && !achievements.includes("power-producer")) {
      newAchievements.push("power-producer");
    }
    
    if (money >= 100000 && !achievements.includes("wealthy-engineer")) {
      newAchievements.push("wealthy-engineer");
    }

    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements]);
    }
  }, [windTurbines.length, energyProduced, money, achievements]);

  const startGame = () => {
    setGameStarted(true);
    setIsPlaying(true);
  };

  const placeTurbine = (locationId, turbineType) => {
    const location = locations.find(loc => loc.id === locationId);
    const turbine = turbineTypes.find(t => t.id === turbineType);
    
    const totalCost = location.cost + turbine.cost;
    
    if (money >= totalCost) {
      setMoney(prev => prev - totalCost);
      setWindTurbines(prev => [...prev, {
        id: Date.now(),
        locationId,
        ...turbine,
        x: location.x + Math.random() * 10 - 5,
        y: location.y + Math.random() * 10 - 5
      }]);
      setScore(prev => prev + 100);
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setGamePhase("planning");
    setScore(0);
    setMoney(50000);
    setEnergyProduced(0);
    setWindTurbines([]);
    setSelectedLocation(null);
    setGameTime(0);
    setIsPlaying(false);
    setWeather("moderate");
    setEnergyDemand(1000);
    setAchievements([]);
  };

  const getWeatherIcon = () => {
    switch(weather) {
      case "calm": return "😴";
      case "light": return "🌬️";
      case "moderate": return "💨";
      case "strong": return "🌪️";
      case "storm": return "⛈️";
      default: return "💨";
    }
  };

  const currentProduction = windTurbines.reduce((total, turbine) => {
    const location = locations.find(loc => loc.id === turbine.locationId);
    const weatherMultiplier = weatherEffects[weather];
    return total + turbine.power * (location.efficiency / 100) * weatherMultiplier;
  }, 0);

  const demandMet = (currentProduction / energyDemand) * 100;

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-amber-50">
        <Navigation userType="student" />
        <main className="pt-20 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-[#237a57] rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                <Wind className="w-16 h-16 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-[#237a57] mb-4">
                Wind Farm Engineer
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Design and manage efficient wind energy farms to meet growing energy demands while maximizing profits!
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <Card className="bg-white border-[#237a57]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sky-700">
                    <Lightbulb className="w-6 h-6" />
                    How to Play
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-sky-600 font-bold">1.</span>
                      Choose strategic locations with good wind conditions
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-sky-600 font-bold">2.</span>
                      Select appropriate turbine types for each location
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-sky-600 font-bold">3.</span>
                      Monitor weather conditions and energy demand
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-sky-600 font-bold">4.</span>
                      Expand your wind farm to meet growing energy needs
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-white border-[#3b9b8f]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <Award className="w-6 h-6" />
                    Learning Goals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      Understand wind energy principles
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      Learn about renewable energy planning
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      Explore environmental factors
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      Practice resource management
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <Button 
                onClick={startGame}
                className="bg-[#237a57] hover:bg-[#f59e0b] text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Play className="w-6 h-6 mr-2" />
                Start Engineering
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50">
      <Navigation userType="student" />
      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Game Header */}
          <div className="flex flex-wrap items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#237a57] rounded-lg flex items-center justify-center">
                <Wind className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Wind Farm Engineer</h1>
                <p className="text-gray-600">Time: {Math.floor(gameTime / 60)}:{(gameTime % 60).toString().padStart(2, '0')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                onClick={() => setIsPlaying(!isPlaying)}
                variant="outline"
                className="border-sky-300 text-sky-700 hover:bg-sky-50"
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

          {/* Game Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
            <Card className="bg-white border-[#237a57]">
              <CardContent className="p-4 text-center">
                <DollarSign className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-green-700">${money.toLocaleString()}</div>
                <div className="text-xs text-green-600">Budget</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-[#f59e0b]">
              <CardContent className="p-4 text-center">
                <Zap className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-yellow-700">{Math.round(currentProduction)}</div>
                <div className="text-xs text-yellow-600">MW Current</div>
              </CardContent>
            </Card>

            <Card className="bg-white border-[#3b9b8f]">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-blue-700">{Math.round(energyProduced)}</div>
                <div className="text-xs text-blue-600">Total MWh</div>
              </CardContent>
            </Card>

            <Card className="bg-white border-[#3b9b8f]">
              <CardContent className="p-4 text-center">
                <Wind className="w-6 h-6 text-[#3b9b8f] mx-auto mb-2" />
                <div className="text-lg font-bold text-[#3b9b8f]">{windTurbines.length}</div>
                <div className="text-xs text-[#3b9b8f]">Turbines</div>
              </CardContent>
            </Card>

            <Card className="bg-white border-[#237a57]">
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-1">{getWeatherIcon()}</div>
                <div className="text-sm font-bold text-indigo-700 capitalize">{weather}</div>
                <div className="text-xs text-indigo-600">Weather</div>
              </CardContent>
            </Card>

            <Card className="bg-white border-red-500">
              <CardContent className="p-4 text-center">
                <BarChart3 className="w-6 h-6 text-red-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-red-700">{Math.round(demandMet)}%</div>
                <div className="text-xs text-red-600">Demand Met</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Wind Farm Map */}
            <div className="lg:col-span-2">
              <Card className="h-96">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Wind Farm Layout
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative w-full h-64 bg-[#3b9b8f]/20 rounded-lg overflow-hidden">
                    {/* Locations */}
                    {locations.map(location => (
                      <div
                        key={location.id}
                        className={`absolute w-8 h-8 rounded-full border-2 cursor-pointer transition-all duration-300 ${
                          selectedLocation === location.id 
                            ? 'border-sky-600 bg-sky-200 scale-125' 
                            : 'border-gray-400 bg-white hover:border-sky-400 hover:bg-sky-100'
                        }`}
                        style={{ 
                          left: `${location.x}%`, 
                          top: `${location.y}%`,
                          transform: 'translate(-50%, -50%)'
                        }}
                        onClick={() => setSelectedLocation(location.id)}
                        title={`${location.name} - ${location.windSpeed} mph avg`}
                      >
                        <div className="w-full h-full flex items-center justify-center text-xs font-bold">
                          {location.windSpeed}
                        </div>
                      </div>
                    ))}

                    {/* Wind Turbines */}
                    {windTurbines.map(turbine => (
                      <div
                        key={turbine.id}
                        className="absolute w-6 h-6 text-2xl animate-spin"
                        style={{ 
                          left: `${turbine.x}%`, 
                          top: `${turbine.y}%`,
                          transform: 'translate(-50%, -50%)',
                          animationDuration: weather === "storm" ? "0s" : `${2 / weatherEffects[weather]}s`
                        }}
                      >
                        💨
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Control Panel */}
            <div className="space-y-4">
              {/* Location Info */}
              {selectedLocation && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {locations.find(loc => loc.id === selectedLocation)?.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Wind Speed:</span>
                        <span className="font-semibold">{locations.find(loc => loc.id === selectedLocation)?.windSpeed} mph</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Efficiency:</span>
                        <span className="font-semibold">{locations.find(loc => loc.id === selectedLocation)?.efficiency}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Setup Cost:</span>
                        <span className="font-semibold">${locations.find(loc => loc.id === selectedLocation)?.cost.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Turbine Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Build Turbines</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {turbineTypes.map(turbine => (
                      <Button
                        key={turbine.id}
                        onClick={() => selectedLocation && placeTurbine(selectedLocation, turbine.id)}
                        disabled={!selectedLocation || money < (locations.find(loc => loc.id === selectedLocation)?.cost + turbine.cost)}
                        className="w-full text-left justify-start bg-[#237a57] hover:bg-[#f59e0b] disabled:bg-gray-400"
                      >
                        <div className="text-left">
                          <div className="font-semibold">{turbine.name}</div>
                          <div className="text-xs opacity-90">${turbine.cost.toLocaleString()} - {turbine.power}kW</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Achievements */}
              {achievements.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Award className="w-5 h-5" />
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

          {/* Energy Demand Progress */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Energy Demand</span>
                <span className="text-lg">{Math.round(currentProduction)} / {energyDemand} MW</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={Math.min(demandMet, 100)} className="h-4" />
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>Current Production</span>
                <span className={demandMet >= 100 ? "text-green-600 font-semibold" : "text-red-600"}>
                  {demandMet >= 100 ? "✅ Demand Met!" : "⚠️ More turbines needed"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default WindFarmEngineer;