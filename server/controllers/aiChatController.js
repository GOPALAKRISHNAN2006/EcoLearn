import ChatMessage from '../models/ChatMessage.js';
import AIStats from '../models/AIStats.js';

// Get chat history for a student
export const getChatHistory = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { limit = 50 } = req.query;

    const messages = await ChatMessage.find({ studentId })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    // Return in chronological order
    res.status(200).json(messages.reverse());
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ message: 'Error fetching chat history', error: error.message });
  }
};

// Save a chat message
export const saveChatMessage = async (req, res) => {
  try {
    const { studentId, type, message, category, hasImage } = req.body;

    const chatMessage = new ChatMessage({
      studentId,
      type,
      message,
      category: category || 'general',
      hasImage: hasImage || false
    });

    await chatMessage.save();

    // Update AI stats if it's a user message
    if (type === 'user') {
      await updateAIStats(studentId, category);
    }

    res.status(201).json(chatMessage);
  } catch (error) {
    console.error('Error saving chat message:', error);
    res.status(500).json({ message: 'Error saving chat message', error: error.message });
  }
};

// Update AI stats helper function
const updateAIStats = async (studentId, category) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let stats = await AIStats.findOne({ studentId });

    if (!stats) {
      stats = new AIStats({ studentId });
    }

    // Update questions asked
    stats.questionsAsked += 1;
    stats.totalInteractions += 1;

    // Update topics explored
    if (category && category !== 'general') {
      const topicIndex = stats.topicsExplored.findIndex(t => t.topic === category);
      if (topicIndex >= 0) {
        stats.topicsExplored[topicIndex].count += 1;
        stats.topicsExplored[topicIndex].lastAsked = new Date();
      } else {
        stats.topicsExplored.push({
          topic: category,
          count: 1,
          lastAsked: new Date()
        });
      }
    }

    // Update learning streak
    const lastActive = new Date(stats.lastActiveDate);
    lastActive.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      stats.learningStreak += 1;
    } else if (diffDays > 1) {
      stats.learningStreak = 1;
    }
    // If same day, streak stays the same

    stats.lastActiveDate = new Date();

    await stats.save();
  } catch (error) {
    console.error('Error updating AI stats:', error);
  }
};

// Get AI stats for a student
export const getAIStats = async (req, res) => {
  try {
    const { studentId } = req.params;

    let stats = await AIStats.findOne({ studentId });

    if (!stats) {
      stats = {
        questionsAsked: 0,
        topicsExplored: [],
        learningStreak: 0,
        totalInteractions: 0
      };
    }

    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching AI stats:', error);
    res.status(500).json({ message: 'Error fetching AI stats', error: error.message });
  }
};

// Clear chat history for a student
export const clearChatHistory = async (req, res) => {
  try {
    const { studentId } = req.params;

    await ChatMessage.deleteMany({ studentId });

    res.status(200).json({ message: 'Chat history cleared successfully' });
  } catch (error) {
    console.error('Error clearing chat history:', error);
    res.status(500).json({ message: 'Error clearing chat history', error: error.message });
  }
};

// Get popular topics across all students
export const getPopularTopics = async (req, res) => {
  try {
    const stats = await AIStats.aggregate([
      { $unwind: '$topicsExplored' },
      { 
        $group: {
          _id: '$topicsExplored.topic',
          totalInteractions: { $sum: '$topicsExplored.count' }
        }
      },
      { $sort: { totalInteractions: -1 } },
      { $limit: 10 }
    ]);

    // Map to include ratings (calculate based on interactions)
    const popularTopics = stats.map(topic => ({
      topic: topic._id,
      interactions: topic.totalInteractions,
      rating: Math.min(5, 4 + (topic.totalInteractions / 100)).toFixed(1)
    }));

    // If no stats, return default topics
    if (popularTopics.length === 0) {
      return res.status(200).json([
        { topic: 'Climate Change', interactions: 0, rating: '4.8' },
        { topic: 'Renewable Energy', interactions: 0, rating: '4.9' },
        { topic: 'Ocean Conservation', interactions: 0, rating: '4.7' },
        { topic: 'Ecosystems', interactions: 0, rating: '4.6' }
      ]);
    }

    res.status(200).json(popularTopics);
  } catch (error) {
    console.error('Error fetching popular topics:', error);
    res.status(500).json({ message: 'Error fetching popular topics', error: error.message });
  }
};
