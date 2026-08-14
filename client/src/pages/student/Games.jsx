import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { getGamesForClass } from "@/services/gameService";
import "@/styles/animations.css";
import { 
  Gamepad2, 
  Play, 
  Star, 
  Clock, 
  Trophy, 
  Target,
  Leaf,
  Droplets,
  Sun,
  Recycle,
  TreePine,
  Wind,
  Mountain,
  Fish,
  Snowflake,
  Zap,
  Globe,
  Flower2,
  Bug,
  Search,
  RefreshCw,
  AlertCircle,
  Sparkles,
  Flame,
  Crown,
  ChevronRight,
  Filter,
  TrendingUp,
  Award
} from "lucide-react";

// Icon mapping for dynamic icons from database
const iconMap = {
  Leaf, Droplets, Sun, Recycle, TreePine, Wind, Mountain, Fish, 
  Snowflake, Zap, Globe, Flower2, Bug, Gamepad2
};

// Climate games available
const defaultGames = [
  {
    id: 1,
    title: "Eco Ninja",
    description: "Slice eco-friendly items to save the planet! Avoid pollution hazards.",
    difficulty: "Easy",
    duration: "10 min",
    points: 50,
    icon: "Leaf",
    category: "Action",
    route: "/student/games/eco-ninja"
  },
  {
    id: 2,
    title: "Eco Runner Dash",
    description: "Run through an eco-friendly world collecting green items",
    difficulty: "Medium",
    duration: "15 min",
    points: 75,
    icon: "Zap",
    category: "Runner",
    route: "/student/games/eco-runner"
  },
  {
    id: 3,
    title: "Eco Snake & Ladders",
    description: "Classic snakes and ladders with environmental learning",
    difficulty: "Easy",
    duration: "20 min",
    points: 60,
    icon: "Gamepad2",
    category: "Board Game",
    route: "/student/games/eco-snakes-ladders"
  },
  {
    id: 4,
    title: "Eco Puzzle",
    description: "Solve environmental puzzles and learn about nature",
    difficulty: "Medium",
    duration: "15 min",
    points: 70,
    icon: "Target",
    category: "Puzzle",
    route: "/student/games/eco-puzzle"
  },
  {
    id: 5,
    title: "Word Search",
    description: "Find environmental words in this exciting word search game",
    difficulty: "Easy",
    duration: "10 min",
    points: 40,
    icon: "Search",
    category: "Word Game",
    route: "/student/games/word-search"
  },
  {
    id: 6,
    title: "Nature Ninjas",
    description: "Defend nature and protect wildlife in this action game",
    difficulty: "Hard",
    duration: "20 min",
    points: 100,
    icon: "TreePine",
    category: "Action",
    route: "/student/games/nature-ninjas"
  },
  {
    id: 7,
    title: "Net Zero Quest",
    description: "Journey towards net zero carbon emissions",
    difficulty: "Hard",
    duration: "25 min",
    points: 120,
    icon: "Globe",
    category: "Strategy",
    route: "/student/games/net-zero-quest"
  }
];

const Games = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentClass, setStudentClass] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [hoveredGame, setHoveredGame] = useState(null);
  
  // Get student class from localStorage
  useEffect(() => {
    const studentData = localStorage.getItem("studentData");
    if (studentData) {
      try {
        const parsed = JSON.parse(studentData);
        setStudentClass(parsed.class || "");
      } catch (e) {
        console.error("Error parsing student data:", e);
      }
    }
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  // Fetch games based on student class
  useEffect(() => {
    const fetchGames = async () => {
      if (!studentClass) {
        // If no class, use default games
        setGames(defaultGames);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await getGamesForClass(studentClass);
        
        if (response.success && response.games.length > 0) {
          // Map API games to include icon components
          const mappedGames = response.games.map((game, index) => ({
            ...game,
            id: game._id || index + 1,
            completed: false,
            progress: 0
          }));
          setGames(mappedGames);
        } else {
          // Fallback to default games
          setGames(defaultGames);
        }
      } catch (err) {
        console.error("Error fetching games:", err);
        setError("Failed to load games. Using default games.");
        setGames(defaultGames);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [studentClass]);

  // Get icon component from name
  const getIconComponent = (iconName) => {
    return iconMap[iconName] || Gamepad2;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy": return "bg-green-100 text-green-700";
      case "Medium": return "bg-yellow-100 text-yellow-700";
      case "Hard": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  // Get all unique categories for filtering
  const categories = ["All", ...new Set(games.map(game => game.category))];
  
  // Filter games based on selected category and search term
  const filteredGames = games.filter(game => {
    const matchesCategory = selectedCategory === "All" || game.category === selectedCategory;
    const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         game.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         game.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalGames = games.length;
  const completedGames = games.filter(game => game.completed).length;
  const totalPoints = games.filter(game => game.completed).reduce((sum, game) => sum + game.points, 0);

  return (
    <div className="min-h-screen bg-[#1a3a2e] overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#237a57]/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Floating Game Icons */}
        <div className="absolute top-20 left-10 text-6xl opacity-10 animate-float">🎮</div>
        <div className="absolute top-40 right-20 text-5xl opacity-10 animate-float" style={{ animationDelay: '1s' }}>🌍</div>
        <div className="absolute bottom-40 left-1/4 text-4xl opacity-10 animate-float" style={{ animationDelay: '2s' }}>🌊</div>
        <div className="absolute top-1/3 right-1/4 text-5xl opacity-10 animate-float" style={{ animationDelay: '0.5s' }}>🌳</div>
        <div className="absolute bottom-20 right-10 text-4xl opacity-10 animate-float" style={{ animationDelay: '1.5s' }}>⚡</div>
      </div>

      <Navigation userType="student" />
      
      <main className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-[#f59e0b]/30 border-t-[#f59e0b] animate-spin" />
              <Gamepad2 className="w-8 h-8 text-[#f59e0b] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="mt-6 text-gray-400 font-medium">Loading your games...</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-amber-500/20 border border-amber-500/30 rounded-xl flex items-center gap-3 text-amber-300">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Games Grid */}
        {!loading && (
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {filteredGames.length > 0 ? (
              filteredGames.map((game, index) => {
                const IconComponent = typeof game.icon === 'string' ? getIconComponent(game.icon) : (game.icon || Gamepad2);
                return (
                  <Card 
                    key={game.id || game._id} 
                    className="glass border-0 group cursor-pointer overflow-hidden transition-all duration-500 hover:scale-[1.02]"
                    style={{ animationDelay: `${index * 50}ms` }}
                    onMouseEnter={() => setHoveredGame(game.id || game._id)}
                    onMouseLeave={() => setHoveredGame(null)}
                    onClick={() => navigate(game.route)}
                  >
                    {/* Gradient overlay on hover */}
                    <div className={`absolute inset-0 bg-[#3b9b8f]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    
                    {/* Shine effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden">
                      <div className="absolute -inset-full top-0 h-full w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 group-hover:animate-shine" />
                    </div>

                    <CardContent className="p-6 relative">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${
                          game.difficulty === 'Easy' ? 'bg-[#237a57]' :
                          game.difficulty === 'Medium' ? 'bg-[#f59e0b]' :
                          'bg-[#dc2626]'
                        }`}>
                          <IconComponent className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={`${
                            game.difficulty === 'Easy' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                            game.difficulty === 'Medium' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                            'bg-red-500/20 text-red-300 border-red-500/30'
                          }`}>
                            {game.difficulty}
                          </Badge>
                          <div className="flex items-center gap-1 text-amber-400">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="font-bold">{game.points}</span>
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#f59e0b] transition-colors duration-300">
                        {game.title}
                      </h3>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                        {game.description}
                      </p>

                      {/* Meta Info */}
                      <div className="flex items-center gap-4 mb-4 text-sm">
                        <div className="flex items-center gap-1 text-gray-400">
                          <Clock className="w-4 h-4" />
                          {game.duration}
                        </div>
                        <Badge className="bg-[#3b9b8f]/20 text-[#3b9b8f] border-[#3b9b8f]/30">
                          {game.category}
                        </Badge>
                      </div>

                      {/* Progress or Action */}
                      {game.completed ? (
                        <div className="flex items-center justify-between p-3 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
                          <div className="flex items-center gap-2 text-emerald-300">
                            <Trophy className="w-5 h-5" />
                            <span className="font-semibold">Completed!</span>
                          </div>
                          <span className="text-emerald-400 font-bold">{game.score}%</span>
                        </div>
                      ) : game.progress > 0 ? (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Progress</span>
                            <span className="text-[#f59e0b] font-semibold">{game.progress}%</span>
                          </div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[#f59e0b] rounded-full transition-all duration-500"
                              style={{ width: `${game.progress}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <Button className="w-full bg-[#237a57] hover:bg-[#f59e0b] text-white border-0 shadow-lg shadow-[#237a57]/25 group-hover:shadow-[#f59e0b]/40 transition-all duration-300">
                          <Play className="w-4 h-4 mr-2" />
                          Start Adventure
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="col-span-full text-center py-20">
                <div className="text-8xl mb-6 animate-bounce">🔍</div>
                <h3 className="text-2xl font-bold text-white mb-2">No games found</h3>
                <p className="text-gray-400 mb-6">
                  {searchTerm ? `No games match "${searchTerm}"` : `No games in ${selectedCategory} category`}
                </p>
                <Button 
                  onClick={() => { setSearchTerm(""); setSelectedCategory("All"); }}
                  className="bg-[#237a57] text-white"
                >
                  Show All Games
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Coming Soon Section */}
        <div className={`mt-16 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              Coming Soon <span className="animate-pulse">✨</span>
            </h2>
            <p className="text-gray-400">More epic adventures are on the way!</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: "Climate Challenge", emoji: "🌪️", color: "from-blue-500 to-cyan-500" },
              { title: "Biodiversity Quest", emoji: "🦋", color: "from-green-500 to-emerald-500" },
              { title: "Green City Builder", emoji: "🏙️", color: "from-amber-500 to-orange-500" },
              { title: "Space Monitor", emoji: "🛰️", color: "bg-[#3b9b8f]" }
            ].map((game, index) => (
              <Card key={index} className="glass border-0 group cursor-not-allowed">
                <CardContent className="p-6 text-center">
                  <div className="text-5xl mb-4 group-hover:scale-125 transition-transform duration-300">{game.emoji}</div>
                  <h3 className="font-bold text-white mb-2">{game.title}</h3>
                  <Badge className={`${game.color} text-white border-0`}>
                    Coming Soon
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      {/* Custom Styles */}
      <style>{`
        .glass {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 5px rgba(168, 85, 247, 0.4); }
          50% { box-shadow: 0 0 30px rgba(168, 85, 247, 0.8), 0 0 60px rgba(168, 85, 247, 0.4); }
        }
        .animate-pulse-glow {
          animation: pulseGlow 2s ease-in-out infinite;
        }
        @keyframes shine {
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        .group-hover\\:animate-shine:hover {
          animation: shine 1s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Games;