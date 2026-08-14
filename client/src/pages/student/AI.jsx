import Navigation from "@/components/Navigation";
import { 
  Send,
  ImageIcon,
  X,
  Loader2,
  Trash2,
  Bot,
  Leaf,
  Sun,
  Waves,
  TreePine,
  Bird,
  Recycle,
  Sparkles,
  MessageSquare,
  Zap,
  Globe,
  Heart
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const AI = () => {
  const [chatInput, setChatInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [studentData, setStudentData] = useState(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [lastRequestTime, setLastRequestTime] = useState(0);
  
  const fileInputRef = useRef(null);
  const chatContainerRef = useRef(null);
  
  // Rate limiting: minimum 2 seconds between requests
  const MIN_REQUEST_INTERVAL = 2000;
  
  // Gemini API configuration - Single key
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  // Quick suggestion chips
  const quickSuggestions = [
    { text: "Climate change", icon: Sun },
    { text: "Rainforests", icon: TreePine },
    { text: "Solar energy", icon: Sparkles },
    { text: "Ocean life", icon: Waves },
    { text: "Recycling", icon: Recycle },
    { text: "Wildlife", icon: Bird },
  ];

  // Environmental science topics for validation
  const environmentalKeywords = [
    // Climate & Weather
    'climate', 'weather', 'temperature', 'global warming', 'greenhouse', 'carbon', 'co2', 'monsoon', 'heat wave', 'season',
    // Ecosystems & Biodiversity
    'ecosystem', 'biodiversity', 'species', 'habitat', 'wildlife', 'animal', 'plant', 'tree', 'forest', 'bird', 'insect',
    // Water
    'ocean', 'sea', 'water', 'river', 'lake', 'marine', 'coral', 'fish', 'pollution', 'groundwater', 'rain', 'irrigation',
    // Energy
    'renewable', 'solar', 'wind', 'energy', 'electricity', 'power', 'sustainable', 'biogas', 'fuel',
    // Waste & Recycling
    'recycle', 'waste', 'plastic', 'garbage', 'compost', 'disposal', 'swachh', 'clean',
    // General Environment
    'environment', 'nature', 'conservation', 'ecology', 'green', 'eco', 'natural', 'protect', 'preserve',
    // Air & Atmosphere
    'air quality', 'ozone', 'atmosphere', 'smog', 'aqi', 'emission', 'stubble', 'burning',
    // Land & Forests
    'deforestation', 'rainforest', 'earth', 'planet', 'afforestation', 'land',
    // Agriculture & Crops (ENHANCED)
    'agriculture', 'farming', 'organic', 'soil', 'erosion', 'drought', 'flood', 'crop', 'crops',
    'wheat', 'rice', 'paddy', 'sugarcane', 'cotton', 'maize', 'vegetable', 'fruit', 'harvest',
    'fertilizer', 'pesticide', 'seed', 'cultivation', 'grow', 'growing', 'farmer', 'field',
    'punjab', 'india', 'indian', 'kharif', 'rabi', 'msp', 'yield', 'sowing', 'irrigation',
    // Wildlife
    'endangered', 'extinct', 'tiger', 'elephant', 'lion', 'peacock', 'sanctuary', 'national park',
    // Science
    'photosynthesis', 'oxygen', 'nitrogen', 'cycle', 'food chain', 'food web',
    // Biomes
    'biome', 'tundra', 'desert', 'grassland', 'wetland', 'mangrove', 'glacier', 'ice',
    // Disasters
    'hurricane', 'tornado', 'earthquake', 'volcano', 'disaster', 'tsunami',
    // Trees (Indian)
    'neem', 'peepal', 'banyan', 'mango', 'bamboo', 'teak', 'eucalyptus'
  ];

  // Load student data and chat history on mount
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedData = JSON.parse(userData);
      setStudentData(parsedData);
      loadChatHistory(parsedData.id);
    } else {
      setIsLoadingHistory(false);
      setChatHistory([{
        type: "ai",
        message: "👋 Hi! I'm EcoBot, your environmental science tutor. Ask me anything about nature, climate, animals, or the environment!",
        timestamp: new Date().toISOString()
      }]);
    }
  }, []);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, isLoading]);

  const loadChatHistory = async (studentId) => {
    try {
      setIsLoadingHistory(true);
      const response = await axios.get(`${API_URL}/ai-chat/history/${studentId}`);
      
      if (response.data.length === 0) {
        const welcomeMessage = {
          type: "ai",
          message: "🌿 Hi! I'm EcoBot, your friendly environmental science tutor!\n\nI can help you learn about climate, plants, animals, oceans, renewable energy, and more!\n\n📸 You can also upload nature photos for me to analyze!\n\nWhat would you like to learn about? 🌍",
          timestamp: new Date().toISOString()
        };
        setChatHistory([welcomeMessage]);
        await saveChatMessage(studentId, 'ai', welcomeMessage.message, 'welcome');
      } else {
        setChatHistory(response.data);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      setChatHistory([{
        type: "ai",
        message: "🌿 Hi! I'm EcoBot. Ask me anything about the environment!",
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const saveChatMessage = async (studentId, type, message, category = 'general', hasImage = false) => {
    try {
      await axios.post(`${API_URL}/ai-chat/message`, {
        studentId,
        type,
        message,
        category,
        hasImage
      });
    } catch (error) {
      console.error('Error saving chat message:', error);
    }
  };

  const clearChatHistory = async () => {
    if (!studentData) return;
    
    if (window.confirm('Clear all chat history?')) {
      try {
        await axios.delete(`${API_URL}/ai-chat/history/${studentData.id}`);
        const welcomeMessage = {
          type: "ai",
          message: "🌿 Chat cleared! What would you like to learn about?",
          timestamp: new Date().toISOString()
        };
        setChatHistory([welcomeMessage]);
        await saveChatMessage(studentData.id, 'ai', welcomeMessage.message, 'welcome');
      } catch (error) {
        console.error('Error clearing chat history:', error);
      }
    }
  };

  const startNewChat = async () => {
    if (studentData) {
      try {
        await axios.delete(`${API_URL}/ai-chat/history/${studentData.id}`);
      } catch (error) {
        console.error('Error clearing chat history:', error);
      }
    }
    setChatHistory([]);
    setChatInput("");
    setSelectedImage(null);
    setImagePreview(null);
  };

  const isEnvironmentalQuery = (query) => {
    const lowerQuery = query.toLowerCase();
    return environmentalKeywords.some(keyword => lowerQuery.includes(keyword));
  };

  const detectCategory = (query) => {
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('climate') || lowerQuery.includes('warming')) return 'Climate';
    if (lowerQuery.includes('solar') || lowerQuery.includes('energy')) return 'Energy';
    if (lowerQuery.includes('ocean') || lowerQuery.includes('marine')) return 'Marine';
    if (lowerQuery.includes('forest') || lowerQuery.includes('tree')) return 'Ecosystems';
    if (lowerQuery.includes('animal') || lowerQuery.includes('wildlife')) return 'Wildlife';
    if (lowerQuery.includes('recycle') || lowerQuery.includes('waste')) return 'Sustainability';
    return 'Environment';
  };

  // Convert image to base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Format AI message with enhanced styling
  const formatAIMessage = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    
    return lines.map((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return <div key={index} className="h-3" />;
      
      // Bold headers like **Header**
      if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**') && !trimmedLine.includes('** ')) {
        return (
          <h3 key={index} className="font-semibold text-emerald-300 mt-3 mb-2 text-base">
            {trimmedLine.slice(2, -2)}
          </h3>
        );
      }
      
      // Bullet points with potential bold header like "• **Title:** content" or "* **Title:** content"
      if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
        const bulletContent = trimmedLine.slice(1).trim();
        
        // Check for bold header pattern like "**Title:** content" or "**Title** content"
        const boldHeaderMatch = bulletContent.match(/^\*\*([^*]+)\*\*:?\s*(.*)/);
        
        if (boldHeaderMatch) {
          const [, header, rest] = boldHeaderMatch;
          return (
            <div key={index} className="flex items-start gap-2 my-2">
              <span className="text-emerald-400 mt-1 flex-shrink-0">•</span>
              <div className="flex-1">
                <span className="font-semibold text-emerald-400">{header}:</span>
                {rest && <span className="text-gray-200"> {formatInlineText(rest)}</span>}
              </div>
            </div>
          );
        }
        
        return (
          <div key={index} className="flex items-start gap-2 my-1.5">
            <span className="text-emerald-400 mt-1 flex-shrink-0">•</span>
            <span className="text-gray-200">{formatInlineText(bulletContent)}</span>
          </div>
        );
      }
      
      // Numbered lists
      const numberedMatch = trimmedLine.match(/^(\d+)\.\s+(.+)/);
      if (numberedMatch) {
        const content = numberedMatch[2];
        const boldHeaderMatch = content.match(/^\*\*([^*]+)\*\*:?\s*(.*)/);
        
        if (boldHeaderMatch) {
          const [, header, rest] = boldHeaderMatch;
          return (
            <div key={index} className="flex items-start gap-3 my-2">
              <span className="bg-[#237a57] text-white rounded-fill w-5 h-5 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                {numberedMatch[1]}
              </span>
              <div className="flex-1">
                <span className="font-semibold text-emerald-400">{header}:</span>
                {rest && <span className="text-gray-200"> {formatInlineText(rest)}</span>}
              </div>
            </div>
          );
        }
        
        return (
          <div key={index} className="flex items-start gap-3 my-1.5">
            <span className="bg-emerald-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
              {numberedMatch[1]}
            </span>
            <span className="text-gray-200">{formatInlineText(content)}</span>
          </div>
        );
      }
      
      return <p key={index} className="text-gray-200 my-1.5 leading-relaxed">{formatInlineText(trimmedLine)}</p>;
    });
  };

  const formatInlineText = (text) => {
    if (!text) return text;
    
    // Split by bold markers **text**
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-semibold text-emerald-400">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Send message to Gemini API
  const sendToGemini = async (message, imageFile = null) => {
    try {
      setIsLoading(true);
      
      if (!imageFile && message.trim() && !isEnvironmentalQuery(message)) {
        return "🌿 I'm EcoBot, specialized in environmental science!\n\nI can help with topics like:\n• Climate change & weather\n• Plants, animals & ecosystems\n• Oceans & marine life\n• Renewable energy\n• Recycling & sustainability\n\nPlease ask something about the environment! 🌍";
      }
      
      let requestBody = { contents: [{ parts: [] }] };

      const studentFriendlyPrompt = `You are EcoBot, a friendly environmental science tutor for Indian students, with special focus on Punjab and India.

EXPERTISE AREAS:
🌳 TREES & FORESTS: Afforestation, deforestation, agroforestry, sacred groves, Punjab's forest cover, Shivalik hills, tree plantation drives, benefits of trees
🌾 CROPS & AGRICULTURE: Punjab's wheat/rice cultivation, organic farming, crop rotation, soil health, pesticide impact, sustainable agriculture, MSP, Green Revolution effects
🌡️ CLIMATE: Global warming, monsoons, heat waves, Punjab's climate patterns, climate change impact on agriculture, seasonal changes, carbon footprint
💨 AIR POLLUTION: Stubble burning in Punjab, Delhi NCR pollution, AQI, smog, vehicular emissions, industrial pollution, Graded Response Action Plan (GRAP)
💧 WATER: Sutlej, Beas, Ravi rivers, groundwater depletion in Punjab, water conservation, rainwater harvesting, canal irrigation, water pollution
🗑️ WASTE MANAGEMENT: Solid waste, plastic ban, e-waste, composting, swachh bharat, biogas, recycling initiatives
🐅 WILDLIFE: Punjab's wildlife (Nilgai, Peacock, Black buck), Indian wildlife (Tigers, Elephants, Lions), biodiversity, sanctuaries, national parks
⚡ RENEWABLE ENERGY: Solar power in Punjab, wind energy, biogas from agricultural waste, green energy policies, rooftop solar schemes
🌍 ENVIRONMENTAL POLICIES: National Action Plan on Climate Change (NAPCC), Punjab State Action Plan, NGT orders, environment protection acts, Wetland conservation

RULES:
1. ONLY answer about environmental science, nature, ecology, climate, pollution, agriculture, wildlife, water, sustainability topics.
2. If NOT about environment, politely redirect to environmental topics.
3. Use simple language suitable for students (ages 10-18).
4. Include fun facts with emojis 🌿🌍🐘.
5. Use bullet points and short paragraphs for easy reading.
6. Keep responses MEDIUM length (4-6 bullet points max, 150-250 words).
7. ALWAYS prioritize Indian/Punjab context:
   - Use data from Punjab Government, Central Pollution Control Board, Ministry of Environment
   - Reference real Indian environmental issues (stubble burning, Ganga cleaning, Project Tiger)
   - Include Punjab-specific examples (groundwater crisis, paddy straw management, crop diversification)
   - Mention local flora/fauna (Neem, Peepal, Banyan trees, Punjab's state animal/bird)
8. Use Indian measurement units (hectares, kilometers, ₹ for costs, lakhs/crores for large numbers)
9. Suggest actionable tips students can do in their daily life

Student's question: ${message}

Provide a helpful, educational response with Indian/Punjab focus:`;

      if (message.trim()) {
        requestBody.contents[0].parts.push({ text: studentFriendlyPrompt });
      }

      if (imageFile) {
        const base64Image = await convertToBase64(imageFile);
        requestBody.contents[0].parts.push({
          inline_data: { mime_type: imageFile.type, data: base64Image }
        });
        
        if (!message.trim()) {
          requestBody.contents[0].parts.push({
            text: `You are EcoBot, an environmental tutor for Indian students (focus on Punjab/India).

Analyze this image from an environmental perspective:
🌳 If trees/plants: Identify species (especially Indian trees like Neem, Peepal, Banyan, Mango), their environmental benefits
🌾 If crops/agriculture: Identify crop type, relate to Punjab's agriculture, sustainable farming practices
💨 If pollution/urban: Discuss air quality, causes, solutions relevant to Indian cities
💧 If water bodies: Discuss water conservation, pollution, relate to Punjab's rivers
🐅 If wildlife: Identify species, conservation status in India, habitat information
🗑️ If waste/garbage: Discuss proper disposal, recycling, Swachh Bharat initiatives

Provide fun educational facts with emojis.
Use simple student-friendly language.
Relate to Indian/Punjab context wherever applicable.
Keep response MEDIUM length (4-6 points, 150-250 words).
Suggest what students can do to help.`
          });
        }
      }

      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded');
        }
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't process that. Please try again!";
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      
      // Provide user-friendly error messages
      if (error.message.includes('429') || error.message.includes('Rate limit')) {
        return "⏰ **Rate Limit Reached!**\n\nThe AI chat has reached its quota limit.\n\n**Solutions:**\n1. ⏳ Wait 1-2 hours and try again\n2. 🆕 Create a new Google Cloud project with a fresh API key\n3. 💳 Enable billing for unlimited access\n\n💡 Tip: The free tier has strict limits!";
      }
      
      return "🌿 Connection issue. Please check your internet and try again!";
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (chatInput.trim() || selectedImage) {
      // Rate limiting check
      const now = Date.now();
      const timeSinceLastRequest = now - lastRequestTime;
      
      if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
        const waitTime = Math.ceil((MIN_REQUEST_INTERVAL - timeSinceLastRequest) / 1000);
        const warningMessage = {
          type: "ai",
          message: `⏳ Please wait ${waitTime} second${waitTime > 1 ? 's' : ''} before sending another message to avoid rate limits.`,
          timestamp: new Date().toISOString(),
          category: 'System'
        };
        setChatHistory(prev => [...prev, warningMessage]);
        return;
      }
      
      setLastRequestTime(now);
      
      const messageText = chatInput || (selectedImage ? "🖼 Analyze this image" : "");
      const category = selectedImage ? 'AI Vision' : detectCategory(messageText);
      const hasImage = !!selectedImage;
      
      const userMessage = {
        type: "user",
        message: messageText,
        timestamp: new Date().toISOString(),
        image: imagePreview,
        category
      };
      
      setChatHistory(prev => [...prev, userMessage]);
      
      if (studentData) {
        await saveChatMessage(studentData.id, 'user', messageText, category, hasImage);
      }
      
      const currentInput = chatInput;
      const currentImage = selectedImage;
      setChatInput("");
      removeImage();
      
      const aiResponse = await sendToGemini(currentInput, currentImage);
      
      const aiMessage = {
        type: "ai",
        message: aiResponse,
        timestamp: new Date().toISOString(),
        category
      };
      
      setChatHistory(prev => [...prev, aiMessage]);
      
      if (studentData) {
        await saveChatMessage(studentData.id, 'ai', aiResponse, category);
      }
    }
  };

  const handleSuggestionClick = (text) => {
    setChatInput(`Tell me about ${text}`);
  };

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <Navigation userType="student" />
      
      <main className="pt-16 h-screen flex flex-col">
        {/* Sidebar-like header for mobile */}
        <div className="md:hidden bg-[#161b22] border-b border-gray-800 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-white">EcoBot</span>
            </div>
            {studentData && (
              <button
                onClick={clearChatHistory}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar - Desktop */}
          <div className="hidden md:flex w-64 bg-[#161b22] border-r border-gray-800 flex-col">
            <div className="p-4">
              <button 
                onClick={startNewChat}
                className="w-full flex items-center gap-3 px-4 py-3 bg-[#21262d] hover:bg-[#30363d] border border-gray-700 rounded-xl text-white text-sm transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                New Chat
              </button>
            </div>
            
            <div className="flex-1 px-3 overflow-y-auto">
              <p className="text-xs text-gray-500 px-2 mb-2">Recent</p>
              <div className="space-y-1">
                <div className="flex items-center gap-2 px-3 py-2 bg-[#21262d] rounded-lg text-gray-300 text-sm">
                  <MessageSquare className="w-4 h-4 text-gray-500" />
                  <span className="truncate">Current conversation</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-800">
              <div className="flex items-center gap-3 px-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <span className="text-xs font-semibold text-white">
                    {studentData?.name?.charAt(0).toUpperCase() || 'S'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{studentData?.name || 'Student'}</p>
                  <p className="text-xs text-gray-500">Free plan</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col bg-[#0d1117]">
            {/* Chat Messages */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto"
            >
              {isLoadingHistory ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                    <span className="text-gray-400 text-sm">Loading conversation...</span>
                  </div>
                </div>
              ) : chatHistory.length === 0 ? (
                /* Welcome Screen */
                <div className="h-full flex flex-col items-center justify-center px-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
                    <Leaf className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-2xl font-semibold text-white mb-2">How can I help you today?</h1>
                  <p className="text-gray-400 text-center max-w-md mb-8">
                    I'm EcoBot, your environmental science tutor. Ask me about climate, ecosystems, wildlife, renewable energy, and more!
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3 max-w-2xl w-full">
                    {[
                      { title: "Explain climate change", desc: "in simple terms", icon: Sun },
                      { title: "How do solar panels", desc: "generate electricity?", icon: Sparkles },
                      { title: "Tell me about", desc: "rainforest ecosystems", icon: TreePine },
                      { title: "Why are oceans", desc: "important for Earth?", icon: Waves },
                    ].map((item, index) => (
                      <button
                        key={index}
                        onClick={() => setChatInput(`${item.title} ${item.desc}`)}
                        className="flex items-start gap-3 p-4 bg-[#161b22] hover:bg-[#21262d] border border-gray-800 hover:border-gray-700 rounded-xl text-left transition-all duration-200 group"
                      >
                        <item.icon className="w-5 h-5 text-emerald-500 mt-0.5 group-hover:scale-110 transition-transform" />
                        <div>
                          <p className="text-sm text-white font-medium">{item.title}</p>
                          <p className="text-xs text-gray-500">{item.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Chat Messages */
                <div className="max-w-3xl mx-auto w-full">
                  {chatHistory.map((message, index) => (
                    <div 
                      key={index} 
                      className={`px-4 py-6 ${message.type === 'ai' ? 'bg-[#161b22]' : ''}`}
                    >
                      <div className="max-w-3xl mx-auto flex gap-4">
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${
                          message.type === 'ai' 
                            ? 'bg-[#237a57]' 
                            : 'bg-[#3b9b8f]'
                        }`}>
                          {message.type === 'ai' ? (
                            <Leaf className="w-4 h-4 text-white" />
                          ) : (
                            <span className="text-xs font-semibold text-white">
                              {studentData?.name?.charAt(0).toUpperCase() || 'Y'}
                            </span>
                          )}
                        </div>
                        
                        {/* Message Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white mb-1">
                            {message.type === 'ai' ? 'EcoBot' : (studentData?.name || 'You')}
                          </p>
                          
                          {message.image && (
                            <div className="mb-3">
                              <img 
                                src={message.image} 
                                alt="Uploaded" 
                                className="max-w-sm h-auto rounded-lg border border-gray-800"
                              />
                            </div>
                          )}
                          
                          <div className="text-gray-300 text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
                            {message.type === 'ai' ? formatAIMessage(message.message) : (
                              <p className="whitespace-pre-wrap">{message.message}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Typing Indicator */}
                  {isLoading && (
                    <div className="px-4 py-6 bg-[#161b22]">
                      <div className="max-w-3xl mx-auto flex gap-4">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                          <Leaf className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-white mb-2">EcoBot</p>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Spacer for input */}
                  <div className="h-32"></div>
                </div>
              )}
            </div>

            {/* Input Area - Fixed at bottom */}
            <div className="absolute bottom-0 left-0 right-0 md:left-64 bg-gradient-to-t from-[#0d1117] via-[#0d1117] to-transparent pt-6 pb-4 px-4">
              <div className="max-w-3xl mx-auto">
                {/* Quick Suggestions */}
                {chatHistory.length <= 1 && !isLoading && (
                  <div className="flex flex-wrap gap-2 mb-3 justify-center">
                    {quickSuggestions.slice(0, 4).map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion.text)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#21262d] hover:bg-[#30363d] border border-gray-700 rounded-full text-xs text-gray-300 transition-colors"
                      >
                        <suggestion.icon className="w-3 h-3 text-emerald-500" />
                        {suggestion.text}
                      </button>
                    ))}
                  </div>
                )}

                {/* Image Preview */}
                {imagePreview && (
                  <div className="mb-2 flex items-center gap-2 p-2 bg-[#21262d] rounded-lg border border-gray-700 w-fit">
                    <img src={imagePreview} alt="Preview" className="w-10 h-10 object-cover rounded" />
                    <span className="text-xs text-gray-400">Image attached</span>
                    <button onClick={removeImage} className="p-1 hover:bg-gray-700 rounded">
                      <X className="w-3 h-3 text-gray-400" />
                    </button>
                  </div>
                )}

                {/* Input Box */}
                <div className="relative bg-[#161b22] border border-gray-700 rounded-2xl shadow-lg">
                  <div className="flex items-end gap-2 p-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                      className="p-2 text-gray-400 hover:text-white hover:bg-[#21262d] rounded-lg transition-colors disabled:opacity-50"
                      title="Upload image"
                    >
                      <ImageIcon className="w-5 h-5" />
                    </button>
                    
                    <textarea
                      value={chatInput}
                      onChange={(e) => {
                        setChatInput(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Message EcoBot..."
                      className="flex-1 bg-transparent text-white placeholder-gray-500 text-sm focus:outline-none resize-none min-h-[24px] max-h-[200px] py-2"
                      rows={1}
                      disabled={isLoading}
                    />
                    
                    <button
                      onClick={handleSendMessage}
                      disabled={isLoading || (!chatInput.trim() && !selectedImage)}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        chatInput.trim() || selectedImage
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-[#21262d] text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
                
                <p className="text-center text-xs text-gray-600 mt-2">
                  EcoBot can make mistakes. Consider checking important information.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Custom Styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #30363d;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #484f58;
        }
      `}</style>
    </div>
  );
};

export default AI;