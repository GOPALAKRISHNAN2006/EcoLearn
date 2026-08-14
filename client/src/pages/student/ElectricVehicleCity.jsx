import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { 
  Car, 
  Battery, 
  Zap, 
  Home,
  RefreshCw,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle,
  Truck,
  Bus,
  MapPin,
  Factory,
  Fuel,
  Coins,
  Users,
  TreePine,
  Gauge,
  Settings
} from "lucide-react";

const ElectricVehicleCity = () => {
  const navigate = useNavigate();
  const [gameStarted, setGameStarted] = useState(false);
  const [money, setMoney] = useState(50000);
  const [energy, setEnergy] = useState(100);
  const [gameTime, setGameTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLocation, setCurrentLocation] = useState("city-center");
  const [vehicles, setVehicles] = useState({
    electricCars: 5,
    electricBuses: 2,
    electricTrucks: 1,
    chargingStations: 3,
    solarPanels: 2,
    batteries: 10
  });
  const [cityStats, setCityStats] = useState({
    population: 50000,
    airQuality: 60,
    electricVehicleAdoption: 15,
    carbonEmissions: 1000,
    happinessScore: 70,
    gridStability: 80
  });
  const [missions, setMissions] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [currentMission, setCurrentMission] = useState(null);
  const [constructionProjects, setConstructionProjects] = useState([]);
  const [electricityPrice, setElectricityPrice] = useState(0.12);
  const [gasPrice, setGasPrice] = useState(3.50);

  // City districts
  const districts = [
    { 
      id: "city-center", 
      name: "Downtown Core", 
      type: "commercial", 
      population: 15000,
      description: "Busy commercial district with high traffic",
      icon: "🏢",
      challenges: ["traffic-congestion", "air-pollution", "parking-shortage"],
      benefits: ["high-visibility", "economic-hub", "transit-access"]
    },
    { 
      id: "residential-north", 
      name: "North Residential", 
      type: "residential", 
      population: 20000,
      description: "Suburban family neighborhoods",
      icon: "🏘️",
      challenges: ["long-commutes", "energy-costs", "range-anxiety"],
      benefits: ["family-friendly", "home-charging", "quieter-streets"]
    },
    { 
      id: "industrial-zone", 
      name: "Industrial District", 
      type: "industrial", 
      population: 5000,
      description: "Manufacturing and logistics hub",
      icon: "🏭",
      challenges: ["heavy-transport", "power-demand", "operational-costs"],
      benefits: ["fleet-adoption", "efficiency-gains", "bulk-charging"]
    },
    { 
      id: "shopping-district", 
      name: "Shopping Mall Area", 
      type: "retail", 
      population: 10000,
      description: "Major retail and entertainment zone",
      icon: "🛍️",
      challenges: ["customer-convenience", "charging-wait-times", "infrastructure-costs"],
      benefits: ["destination-charging", "customer-attraction", "brand-image"]
    },
    { 
      id: "university-campus", 
      name: "University Campus", 
      type: "educational", 
      population: 25000,
      description: "Student and academic community",
      icon: "🎓",
      challenges: ["budget-constraints", "education-needs", "diverse-mobility"],
      benefits: ["tech-adoption", "research-collaboration", "sustainability-focus"]
    },
    { 
      id: "airport-area", 
      name: "Airport Transportation Hub", 
      type: "transport", 
      population: 8000,
      description: "Major transportation and logistics center",
      icon: "✈️",
      challenges: ["high-utilization", "reliability-needs", "operational-schedules"],
      benefits: ["fleet-efficiency", "emission-reduction", "visitor-experience"]
    }
  ];

  // Vehicle types and specifications
  const vehicleTypes = {
    electricCars: {
      name: "Electric Cars",
      cost: 35000,
      operatingCost: 0.04,
      capacity: 5,
      range: 300,
      chargingTime: 8,
      emissionReduction: 4.6,
      maintenanceCost: 500,
      icon: "🚗"
    },
    electricBuses: {
      name: "Electric Buses",
      cost: 450000,
      operatingCost: 0.80,
      capacity: 50,
      range: 200,
      chargingTime: 4,
      emissionReduction: 1.5,
      maintenanceCost: 8000,
      icon: "🚌"
    },
    electricTrucks: {
      name: "Electric Trucks",
      cost: 150000,
      operatingCost: 0.45,
      capacity: 15,
      range: 250,
      chargingTime: 6,
      emissionReduction: 8.2,
      maintenanceCost: 3000,
      icon: "🚛"
    },
    chargingStations: {
      name: "Charging Stations",
      cost: 25000,
      operatingCost: 0.02,
      capacity: 4,
      range: null,
      chargingTime: null,
      emissionReduction: 0,
      maintenanceCost: 1000,
      icon: "⚡"
    },
    solarPanels: {
      name: "Solar Panel Arrays",
      cost: 50000,
      operatingCost: 0.01,
      capacity: null,
      range: null,
      chargingTime: null,
      emissionReduction: 15,
      maintenanceCost: 500,
      icon: "☀️"
    },
    batteries: {
      name: "Grid Storage Batteries",
      cost: 5000,
      operatingCost: 0.005,
      capacity: null,
      range: null,
      chargingTime: null,
      emissionReduction: 2,
      maintenanceCost: 100,
      icon: "🔋"
    }
  };

  // Available missions
  const missionTypes = [
    {
      id: "fleet-conversion",
      name: "Fleet Electrification",
      description: "Convert 50% of city fleet to electric vehicles",
      target: { electricVehicleAdoption: 50 },
      reward: 25000,
      difficulty: "medium"
    },
    {
      id: "air-quality",
      name: "Clean Air Initiative",
      description: "Improve city air quality to 80+",
      target: { airQuality: 80 },
      reward: 30000,
      difficulty: "medium"
    },
    {
      id: "emission-reduction",
      name: "Carbon Neutral Transport",
      description: "Reduce transport emissions by 60%",
      target: { carbonEmissions: 400 },
      reward: 40000,
      difficulty: "hard"
    },
    {
      id: "charging-network",
      name: "Charging Infrastructure",
      description: "Build comprehensive charging network (15+ stations)",
      target: { chargingStations: 15 },
      reward: 20000,
      difficulty: "easy"
    },
    {
      id: "public-happiness",
      name: "Citizen Satisfaction",
      description: "Achieve 85+ citizen happiness score",
      target: { happinessScore: 85 },
      reward: 35000,
      difficulty: "hard"
    }
  ];

  // Game simulation and effects
  useEffect(() => {
    let interval;
    if (isPlaying && gameStarted) {
      interval = setInterval(() => {
        setGameTime(prev => prev + 1);
        
        // Energy consumption and regeneration
        setEnergy(prev => Math.max(0, prev - 0.3));
        if (currentLocation === "city-center" && energy < 100) {
          setEnergy(prev => Math.min(100, prev + 1));
        }

        // Dynamic city simulation
        setCityStats(prev => {
          const totalElectricVehicles = vehicles.electricCars + vehicles.electricBuses + vehicles.electricTrucks;
          const chargingCapacity = vehicles.chargingStations * vehicleTypes.chargingStations.capacity;
          const solarGeneration = vehicles.solarPanels * 10; // kW per solar array
          const batteryStorage = vehicles.batteries * 50; // kWh per battery
          
          // Calculate EV adoption rate
          const maxVehicles = Math.floor(prev.population / 100); // 1 vehicle per 100 people
          const adoptionRate = Math.min(95, (totalElectricVehicles / maxVehicles) * 100);
          
          // Air quality improves with more electric vehicles
          const airQualityImprovement = adoptionRate * 0.3;
          const newAirQuality = Math.min(100, 40 + airQualityImprovement);
          
          // Carbon emissions decrease with electrification
          const emissionReduction = totalElectricVehicles * 5; // tons CO2 per year per vehicle
          const newEmissions = Math.max(100, 1000 - emissionReduction);
          
          // Happiness affected by air quality, convenience, and costs
          const convenienceScore = Math.min(100, (chargingCapacity / totalElectricVehicles) * 40);
          const environmentScore = newAirQuality * 0.3;
          const costScore = (gasPrice / electricityPrice) * 10;
          const newHappiness = Math.min(100, (convenienceScore + environmentScore + costScore) / 3);
          
          // Grid stability affected by renewable energy and storage
          const renewableRatio = solarGeneration / (totalElectricVehicles * 20 + 1000); // baseline grid demand
          const storageRatio = batteryStorage / (solarGeneration + 100);
          const newGridStability = Math.min(100, 60 + (renewableRatio * 20) + (storageRatio * 20));
          
          return {
            ...prev,
            electricVehicleAdoption: adoptionRate,
            airQuality: newAirQuality,
            carbonEmissions: newEmissions,
            happinessScore: newHappiness,
            gridStability: newGridStability
          };
        });

        // Random events affecting electricity and gas prices
        if (Math.random() < 0.05) {
          setElectricityPrice(prev => Math.max(0.08, Math.min(0.20, prev + (Math.random() - 0.5) * 0.02)));
          setGasPrice(prev => Math.max(2.50, Math.min(5.00, prev + (Math.random() - 0.5) * 0.20)));
        }

        // Generate income from electric vehicle operations
        const totalOperatingCost = Object.entries(vehicles).reduce((total, [type, count]) => {
          return total + (count * (vehicleTypes[type]?.operatingCost || 0));
        }, 0);
        
        const revenueFromElectrification = (vehicles.electricCars * 2) + (vehicles.electricBuses * 15) + (vehicles.electricTrucks * 8);
        const maintenanceSavings = Object.entries(vehicles).reduce((total, [type, count]) => {
          const vehicleType = vehicleTypes[type];
          if (vehicleType) {
            const conventionalMaintenance = vehicleType.maintenanceCost * 1.5; // 50% higher for conventional
            const savings = conventionalMaintenance - vehicleType.maintenanceCost;
            return total + (count * savings / 365); // daily savings
          }
          return total;
        }, 0);
        
        setMoney(prev => prev + revenueFromElectrification + maintenanceSavings - totalOperatingCost);

      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, gameStarted, vehicles, currentLocation, energy, electricityPrice, gasPrice]);

  // Check for mission completion and achievements
  useEffect(() => {
    // Check achievement conditions
    const newAchievements = [];
    
    if (cityStats.electricVehicleAdoption >= 25 && !achievements.includes("early-adopter")) {
      newAchievements.push("early-adopter");
    }
    
    if (cityStats.airQuality >= 85 && !achievements.includes("clean-air-champion")) {
      newAchievements.push("clean-air-champion");
    }
    
    if (vehicles.chargingStations >= 20 && !achievements.includes("infrastructure-master")) {
      newAchievements.push("infrastructure-master");
    }

    if (cityStats.carbonEmissions <= 300 && !achievements.includes("carbon-hero")) {
      newAchievements.push("carbon-hero");
    }

    if (money >= 200000 && !achievements.includes("green-tycoon")) {
      newAchievements.push("green-tycoon");
    }

    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements]);
    }

    // Generate new missions if needed
    if (missions.length < 3) {
      const availableMissions = missionTypes.filter(m => 
        !missions.some(existing => existing.id === m.id)
      );
      if (availableMissions.length > 0) {
        const newMission = availableMissions[Math.floor(Math.random() * availableMissions.length)];
        setMissions(prev => [...prev, { ...newMission, startTime: gameTime }]);
      }
    }

    // Set current mission if none active
    if (!currentMission && missions.length > 0) {
      setCurrentMission(missions[0]);
    }

  }, [cityStats, vehicles, money, achievements, missions, currentMission, gameTime]);

  const startGame = () => {
    setGameStarted(true);
    setIsPlaying(true);
  };

  const moveToDistrict = (districtId) => {
    setCurrentLocation(districtId);
    setEnergy(prev => Math.max(0, prev - 5)); // Travel cost
  };

  const purchaseVehicle = (vehicleType) => {
    const vehicle = vehicleTypes[vehicleType];
    if (money >= vehicle.cost) {
      setMoney(prev => prev - vehicle.cost);
      setVehicles(prev => ({
        ...prev,
        [vehicleType]: prev[vehicleType] + 1
      }));
    }
  };

  const sellVehicle = (vehicleType) => {
    const vehicle = vehicleTypes[vehicleType];
    if (vehicles[vehicleType] > 0) {
      setMoney(prev => prev + Math.floor(vehicle.cost * 0.7)); // 70% resale value
      setVehicles(prev => ({
        ...prev,
        [vehicleType]: prev[vehicleType] - 1
      }));
    }
  };

  const startConstruction = (projectType, districtId) => {
    const project = {
      id: Date.now(),
      type: projectType,
      district: districtId,
      startTime: gameTime,
      duration: 30, // seconds
      cost: vehicleTypes[projectType].cost
    };
    
    if (money >= project.cost) {
      setMoney(prev => prev - project.cost);
      setConstructionProjects(prev => [...prev, project]);
      
      // Complete construction after duration
      setTimeout(() => {
        setVehicles(prev => ({
          ...prev,
          [projectType]: prev[projectType] + 1
        }));
        setConstructionProjects(prev => prev.filter(p => p.id !== project.id));
      }, project.duration * 1000);
    }
  };

  const completeMission = (mission) => {
    setMoney(prev => prev + mission.reward);
    setMissions(prev => prev.filter(m => m.id !== mission.id));
    setCurrentMission(null);
  };

  const resetGame = () => {
    setGameStarted(false);
    setMoney(50000);
    setEnergy(100);
    setGameTime(0);
    setIsPlaying(false);
    setCurrentLocation("city-center");
    setVehicles({
      electricCars: 5,
      electricBuses: 2,
      electricTrucks: 1,
      chargingStations: 3,
      solarPanels: 2,
      batteries: 10
    });
    setCityStats({
      population: 50000,
      airQuality: 60,
      electricVehicleAdoption: 15,
      carbonEmissions: 1000,
      happinessScore: 70,
      gridStability: 80
    });
    setMissions([]);
    setAchievements([]);
    setCurrentMission(null);
    setConstructionProjects([]);
    setElectricityPrice(0.12);
    setGasPrice(3.50);
  };

  const currentDistrict = districts.find(d => d.id === currentLocation);

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <Navigation userType="student" />
        <main className="pt-20 pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                <Car className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
                Electric Vehicle City
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Transform your city with electric vehicles and sustainable transportation!
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <Card className="bg-gradient-to-br from-white to-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <Car className="w-6 h-6" />
                    Vehicle Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <Car className="w-4 h-4 text-green-600 mt-0.5" />
                      Purchase and deploy electric vehicles
                    </li>
                    <li className="flex items-start gap-2">
                      <Zap className="w-4 h-4 text-blue-600 mt-0.5" />
                      Build charging infrastructure
                    </li>
                    <li className="flex items-start gap-2">
                      <Factory className="w-4 h-4 text-purple-600 mt-0.5" />
                      Reduce carbon emissions
                    </li>
                    <li className="flex items-start gap-2">
                      <Users className="w-4 h-4 text-orange-600 mt-0.5" />
                      Improve citizen satisfaction
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-white to-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-700">
                    <Battery className="w-6 h-6" />
                    Clean Energy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <Battery className="w-4 h-4 text-blue-600 mt-0.5" />
                      Manage energy storage systems
                    </li>
                    <li className="flex items-start gap-2">
                      <TreePine className="w-4 h-4 text-green-600 mt-0.5" />
                      Install solar panel arrays
                    </li>
                    <li className="flex items-start gap-2">
                      <Gauge className="w-4 h-4 text-cyan-600 mt-0.5" />
                      Monitor grid stability
                    </li>
                    <li className="flex items-start gap-2">
                      <Coins className="w-4 h-4 text-yellow-600 mt-0.5" />
                      Optimize operational costs
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <Button 
                onClick={startGame}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Play className="w-6 h-6 mr-2" />
                Start Building City
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <Navigation userType="student" />
      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Game Header */}
          <div className="flex flex-wrap items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Car className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Electric Vehicle City</h1>
                <p className="text-gray-600">Year {Math.floor(gameTime / 365) + 1} - Day {(gameTime % 365) + 1}</p>
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

          {/* Status Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-4 text-center">
                <Coins className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-green-700">${Math.round(money).toLocaleString()}</div>
                <div className="text-xs text-green-600">Budget</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
              <CardContent className="p-4 text-center">
                <Car className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-blue-700">{cityStats.electricVehicleAdoption.toFixed(0)}%</div>
                <div className="text-xs text-blue-600">EV Adoption</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
              <CardContent className="p-4 text-center">
                <TreePine className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-purple-700">{Math.round(cityStats.airQuality)}</div>
                <div className="text-xs text-purple-600">Air Quality</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-200">
              <CardContent className="p-4 text-center">
                <Factory className="w-6 h-6 text-red-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-red-700">{Math.round(cityStats.carbonEmissions)}</div>
                <div className="text-xs text-red-600">CO2 Tons/Year</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
              <CardContent className="p-4 text-center">
                <Users className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-yellow-700">{Math.round(cityStats.happinessScore)}</div>
                <div className="text-xs text-yellow-600">Happiness</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200">
              <CardContent className="p-4 text-center">
                <Gauge className="w-6 h-6 text-cyan-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-cyan-700">{Math.round(cityStats.gridStability)}</div>
                <div className="text-xs text-cyan-600">Grid Stability</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200">
              <CardContent className="p-4 text-center">
                <Fuel className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-gray-700">${gasPrice.toFixed(2)}</div>
                <div className="text-xs text-gray-600">Gas Price</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200">
              <CardContent className="p-4 text-center">
                <Zap className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-orange-700">${electricityPrice.toFixed(2)}</div>
                <div className="text-xs text-orange-600">Electric Rate</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Current District */}
            <div className="lg:col-span-2">
              <Card className="h-96">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">{currentDistrict.icon}</span>
                    {currentDistrict.name}
                    <Badge variant="outline" className="capitalize">
                      {currentDistrict.type}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{currentDistrict.description}</p>
                  <p className="text-sm text-gray-500 mb-4">Population: {currentDistrict.population.toLocaleString()}</p>
                  
                  {/* Vehicle Purchase Options */}
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Car className="w-4 h-4 text-green-500" />
                      Purchase Vehicles
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(vehicleTypes).map(([type, vehicle]) => (
                        <Button
                          key={type}
                          onClick={() => purchaseVehicle(type)}
                          disabled={money < vehicle.cost}
                          size="sm"
                          className="bg-green-100 text-green-700 hover:bg-green-200 text-xs p-2"
                        >
                          {vehicle.icon} {vehicle.name}
                          <br />${vehicle.cost.toLocaleString()}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Construction Options */}
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Settings className="w-4 h-4 text-blue-500" />
                      Infrastructure Projects
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => startConstruction("chargingStations", currentLocation)}
                        disabled={money < vehicleTypes.chargingStations.cost}
                        size="sm"
                        className="bg-blue-100 text-blue-700 hover:bg-blue-200"
                      >
                        ⚡ Build Charging Station
                      </Button>
                      <Button
                        onClick={() => startConstruction("solarPanels", currentLocation)}
                        disabled={money < vehicleTypes.solarPanels.cost}
                        size="sm"
                        className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                      >
                        ☀️ Install Solar Panels
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-2 space-y-4">
              {/* District Navigation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    City Districts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {districts.filter(d => d.id !== currentLocation).map(district => (
                      <Button
                        key={district.id}
                        onClick={() => moveToDistrict(district.id)}
                        disabled={energy < 5}
                        size="sm"
                        variant="outline"
                        className="text-left justify-start"
                      >
                        <span className="mr-2">{district.icon}</span>
                        {district.name}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Fleet Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Vehicle Fleet</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(vehicles).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>{vehicleTypes[type]?.icon}</span>
                          <span className="capitalize text-sm">{vehicleTypes[type]?.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{count}</Badge>
                          {count > 0 && (
                            <Button
                              onClick={() => sellVehicle(type)}
                              size="sm"
                              variant="outline"
                              className="text-xs"
                            >
                              Sell
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
                      Active Mission
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <h4 className="font-semibold">{currentMission.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{currentMission.description}</p>
                    <Badge className="bg-green-100 text-green-800">
                      Reward: ${currentMission.reward.toLocaleString()}
                    </Badge>
                    
                    {/* Mission Progress */}
                    <div className="mt-2">
                      {Object.entries(currentMission.target).map(([stat, target]) => {
                        const current = stat.includes('Vehicle') ? vehicles[stat] || cityStats[stat] : cityStats[stat];
                        const progress = Math.min(100, (current / target) * 100);
                        return (
                          <div key={stat} className="mb-2">
                            <div className="flex justify-between text-xs">
                              <span>{stat.replace(/([A-Z])/g, ' $1').trim()}</span>
                              <span>{Math.round(current)} / {target}</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Check if mission complete */}
                    {Object.entries(currentMission.target).every(([stat, target]) => {
                      const current = stat.includes('Vehicle') ? vehicles[stat] || cityStats[stat] : cityStats[stat];
                      return current >= target;
                    }) && (
                      <Button
                        onClick={() => completeMission(currentMission)}
                        className="w-full mt-2 bg-green-600 hover:bg-green-700"
                      >
                        Complete Mission
                      </Button>
                    )}
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

          {/* Construction Progress */}
          {constructionProjects.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Construction Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {constructionProjects.map(project => {
                    const elapsed = gameTime - project.startTime;
                    const progress = Math.min(100, (elapsed / project.duration) * 100);
                    return (
                      <div key={project.id} className="flex items-center gap-4">
                        <span className="text-sm">{vehicleTypes[project.type]?.icon} {vehicleTypes[project.type]?.name}</span>
                        <Progress value={progress} className="flex-1 h-2" />
                        <span className="text-xs text-gray-500">{Math.max(0, project.duration - elapsed)}s</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default ElectricVehicleCity;