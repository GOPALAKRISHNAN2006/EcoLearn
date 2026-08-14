const API_BASE = "http://localhost:5000/api";

// Get games for a specific class (student use)
export const getGamesForClass = async (studentClass) => {
  const response = await fetch(`${API_BASE}/game/class/${encodeURIComponent(studentClass)}`);
  const data = await response.json();
  return data;
};

// Get all games (admin use)
export const getAllGames = async () => {
  const response = await fetch(`${API_BASE}/game/all`);
  const data = await response.json();
  return data;
};

// Get available classes
export const getAvailableClasses = async () => {
  const response = await fetch(`${API_BASE}/game/classes`);
  const data = await response.json();
  return data;
};

// Seed default games
export const seedGames = async () => {
  const response = await fetch(`${API_BASE}/game/seed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });
  const data = await response.json();
  return data;
};

// Update game
export const updateGame = async (gameId, updateData) => {
  const response = await fetch(`${API_BASE}/game/${gameId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updateData)
  });
  const data = await response.json();
  return data;
};

// Update game classes
export const updateGameClasses = async (gameId, allowedClasses) => {
  const response = await fetch(`${API_BASE}/game/${gameId}/classes`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ allowedClasses })
  });
  const data = await response.json();
  return data;
};

// Bulk update game classes
export const bulkUpdateGameClasses = async (updates) => {
  const response = await fetch(`${API_BASE}/game/bulk-update-classes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ updates })
  });
  const data = await response.json();
  return data;
};

// Toggle game status
export const toggleGameStatus = async (gameId) => {
  const response = await fetch(`${API_BASE}/game/${gameId}/toggle-status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" }
  });
  const data = await response.json();
  return data;
};

// Delete game
export const deleteGame = async (gameId) => {
  const response = await fetch(`${API_BASE}/game/${gameId}`, {
    method: "DELETE"
  });
  const data = await response.json();
  return data;
};

export default {
  getGamesForClass,
  getAllGames,
  getAvailableClasses,
  seedGames,
  updateGame,
  updateGameClasses,
  bulkUpdateGameClasses,
  toggleGameStatus,
  deleteGame
};
