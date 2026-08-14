import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "@/components/admin/AdminNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Gamepad2,
  Save,
  RefreshCw,
  Search,
  Filter,
  CheckCircle,
  XCircle,
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
  Database
} from "lucide-react";

const API_BASE = "http://localhost:5000/api";

// Icon mapping
const iconMap = {
  Leaf, Droplets, Sun, Recycle, TreePine, Wind, Mountain, Fish, 
  Snowflake, Zap, Globe, Flower2, Bug, Gamepad2
};

const GameManagement = () => {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [changes, setChanges] = useState({}); // Track unsaved changes

  // Check if admin is logged in
  useEffect(() => {
    const adminData = localStorage.getItem("adminData");
    if (!adminData) {
      navigate("/login?type=admin");
    }
  }, [navigate]);

  // Fetch games and classes
  useEffect(() => {
    fetchGames();
    fetchClasses();
  }, []);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/game/all`);
      const data = await response.json();
      
      if (data.success) {
        setGames(data.games);
      } else {
        setMessage({ type: "error", text: data.message || "Failed to fetch games" });
      }
    } catch (error) {
      console.error("Error fetching games:", error);
      setMessage({ type: "error", text: "Failed to connect to server" });
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch(`${API_BASE}/game/classes`);
      const data = await response.json();
      
      if (data.success) {
        setAvailableClasses(data.classes);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const seedGames = async () => {
    try {
      setSaving(true);
      const response = await fetch(`${API_BASE}/game/seed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: "success", text: data.message });
        fetchGames();
      } else {
        setMessage({ type: "error", text: data.message });
      }
    } catch (error) {
      console.error("Error seeding games:", error);
      setMessage({ type: "error", text: "Failed to seed games" });
    } finally {
      setSaving(false);
    }
  };

  const handleClassToggle = (gameId, className) => {
    setChanges(prev => {
      const gameChanges = prev[gameId] || { 
        allowedClasses: games.find(g => g._id === gameId)?.allowedClasses || [] 
      };
      
      const currentClasses = [...gameChanges.allowedClasses];
      const index = currentClasses.indexOf(className);
      
      if (index > -1) {
        currentClasses.splice(index, 1);
      } else {
        currentClasses.push(className);
      }
      
      return {
        ...prev,
        [gameId]: { ...gameChanges, allowedClasses: currentClasses }
      };
    });
  };

  const getGameClasses = (gameId) => {
    if (changes[gameId]) {
      return changes[gameId].allowedClasses;
    }
    const game = games.find(g => g._id === gameId);
    return game?.allowedClasses || [];
  };

  const isClassSelected = (gameId, className) => {
    const classes = getGameClasses(gameId);
    return classes.includes(className);
  };

  const selectAllClasses = (gameId) => {
    setChanges(prev => ({
      ...prev,
      [gameId]: { allowedClasses: [...availableClasses] }
    }));
  };

  const clearAllClasses = (gameId) => {
    setChanges(prev => ({
      ...prev,
      [gameId]: { allowedClasses: [] }
    }));
  };

  const saveChanges = async () => {
    if (Object.keys(changes).length === 0) {
      setMessage({ type: "info", text: "No changes to save" });
      return;
    }

    try {
      setSaving(true);
      const updates = Object.entries(changes).map(([gameId, data]) => ({
        gameId,
        allowedClasses: data.allowedClasses
      }));

      const response = await fetch(`${API_BASE}/game/bulk-update-classes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates })
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: "success", text: "Changes saved successfully!" });
        setChanges({});
        fetchGames();
      } else {
        setMessage({ type: "error", text: data.message });
      }
    } catch (error) {
      console.error("Error saving changes:", error);
      setMessage({ type: "error", text: "Failed to save changes" });
    } finally {
      setSaving(false);
    }
  };

  const toggleGameStatus = async (gameId) => {
    try {
      const response = await fetch(`${API_BASE}/game/${gameId}/toggle-status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" }
      });
      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: "success", text: data.message });
        fetchGames();
      } else {
        setMessage({ type: "error", text: data.message });
      }
    } catch (error) {
      console.error("Error toggling game status:", error);
      setMessage({ type: "error", text: "Failed to update game status" });
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy": return "bg-green-100 text-green-700";
      case "Medium": return "bg-yellow-100 text-yellow-700";
      case "Hard": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const filteredGames = games.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         game.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = selectedDifficulty === "All" || game.difficulty === selectedDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  const hasUnsavedChanges = Object.keys(changes).length > 0;

  // Clear message after 5 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ type: "", text: "" }), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const GameIcon = ({ iconName }) => {
    const Icon = iconMap[iconName] || Gamepad2;
    return <Icon className="w-6 h-6" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      <AdminNavbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            🎮 Game Management
          </h1>
          <p className="text-gray-600">Assign games to different classes</p>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
            message.type === "success" ? "bg-green-100 text-green-700" :
            message.type === "error" ? "bg-red-100 text-red-700" :
            "bg-blue-100 text-blue-700"
          }`}>
            {message.type === "success" ? <CheckCircle className="w-5 h-5" /> : 
             message.type === "error" ? <XCircle className="w-5 h-5" /> : null}
            {message.text}
          </div>
        )}

        {/* Actions Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-4 items-center">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search games..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>

                {/* Difficulty Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="border rounded-md px-3 py-2 text-sm"
                  >
                    <option value="All">All Difficulties</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                {games.length === 0 && (
                  <Button
                    onClick={seedGames}
                    disabled={saving}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Database className="w-4 h-4 mr-2" />
                    {saving ? "Seeding..." : "Seed Default Games"}
                  </Button>
                )}
                
                <Button
                  onClick={fetchGames}
                  variant="outline"
                  disabled={loading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>

                <Button
                  onClick={saveChanges}
                  disabled={saving || !hasUnsavedChanges}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Saving..." : `Save Changes ${hasUnsavedChanges ? `(${Object.keys(changes).length})` : ""}`}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Class Legend */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              📚 Class Legend
              <Badge variant="outline" className="ml-2">
                {availableClasses.length} classes available
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {availableClasses.map(cls => (
                <Badge key={cls} variant="secondary" className="px-3 py-1">
                  {cls}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-3">
              💡 <strong>Tip:</strong> Games with no classes selected are available to ALL students. 
              Select specific classes to restrict access.
            </p>
          </CardContent>
        </Card>

        {/* Games Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : filteredGames.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Gamepad2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {games.length === 0 ? "No Games Found" : "No Matching Games"}
              </h3>
              <p className="text-gray-500 mb-4">
                {games.length === 0 
                  ? "Click 'Seed Default Games' to add the default games."
                  : "Try adjusting your search or filter."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredGames.map(game => (
              <Card 
                key={game._id} 
                className={`hover:shadow-lg transition-all duration-300 ${
                  !game.isActive ? "opacity-60" : ""
                } ${changes[game._id] ? "ring-2 ring-purple-400" : ""}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        game.isActive ? "bg-gradient-to-br from-purple-100 to-indigo-100" : "bg-gray-100"
                      }`}>
                        <GameIcon iconName={game.icon} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{game.title}</CardTitle>
                        <p className="text-sm text-gray-500">{game.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getDifficultyColor(game.difficulty)}>
                        {game.difficulty}
                      </Badge>
                      <Button
                        size="sm"
                        variant={game.isActive ? "outline" : "destructive"}
                        onClick={() => toggleGameStatus(game._id)}
                      >
                        {game.isActive ? "Active" : "Inactive"}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{game.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <span>⏱️ {game.duration}</span>
                    <span>⭐ {game.points} pts</span>
                  </div>

                  {/* Class Selection */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-sm">
                        Allowed Classes:
                        {getGameClasses(game._id).length === 0 ? (
                          <Badge variant="outline" className="ml-2 bg-green-50 text-green-700">
                            All Classes
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="ml-2">
                            {getGameClasses(game._id).length} selected
                          </Badge>
                        )}
                      </span>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => selectAllClasses(game._id)}
                          className="text-xs h-7"
                        >
                          Select All
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => clearAllClasses(game._id)}
                          className="text-xs h-7"
                        >
                          Clear All
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {availableClasses.map(cls => (
                        <label
                          key={cls}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-pointer transition-all text-sm ${
                            isClassSelected(game._id, cls)
                              ? "bg-purple-100 text-purple-700 border-2 border-purple-300"
                              : "bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200"
                          }`}
                        >
                          <Checkbox
                            checked={isClassSelected(game._id, cls)}
                            onCheckedChange={() => handleClassToggle(game._id, cls)}
                            className="w-4 h-4"
                          />
                          {cls}
                        </label>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GameManagement;
