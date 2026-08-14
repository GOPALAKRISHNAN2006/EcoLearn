import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Video,
  Sparkles,
  Send,
  Loader2,
  Play,
  Clock,
  CheckCircle,
  AlertCircle,
  Film,
  Wand2,
  Palette,
  RefreshCw,
  Download,
  Share2,
  Trash2,
  TreePine,
  Droplets,
  Sun,
  Globe,
  Recycle,
  Zap
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import api from "@/services/api";

const VideoGeneration = () => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentJob, setCurrentJob] = useState(null);
  const [generatedVideos, setGeneratedVideos] = useState([]);
  const [selectedStyle, setSelectedStyle] = useState("documentary");
  const [error, setError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Download video function
  const handleDownload = async (videoUrl, filename = 'eco-video.mp4') => {
    if (!videoUrl) return;
    
    setIsDownloading(true);
    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
      // Fallback: open in new tab
      window.open(videoUrl, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  const promptTemplates = [
    { 
      text: "The water cycle in nature showing evaporation, clouds, and rain",
      icon: Droplets,
      color: "from-blue-500 to-cyan-500"
    },
    { 
      text: "Photosynthesis process in a green forest with sunlight",
      icon: TreePine,
      color: "from-green-500 to-emerald-500"
    },
    { 
      text: "Solar panels collecting energy from the sun",
      icon: Sun,
      color: "from-yellow-500 to-orange-500"
    },
    { 
      text: "Earth from space showing climate patterns",
      icon: Globe,
      color: "from-blue-600 to-purple-500"
    },
    { 
      text: "Recycling process transforming waste into new products",
      icon: Recycle,
      color: "from-emerald-500 to-teal-500"
    },
    { 
      text: "Wind turbines generating clean renewable energy",
      icon: Zap,
      color: "from-purple-500 to-pink-500"
    },
  ];

  const videoStyles = [
    { id: "documentary", name: "Documentary", desc: "Professional nature documentary style" },
    { id: "animated", name: "Animated", desc: "Colorful 2D/3D animation style" },
    { id: "cinematic", name: "Cinematic", desc: "High-quality cinematic footage" },
    { id: "educational", name: "Educational", desc: "Clear, instructional visuals" },
  ];

  // Poll for job status
  useEffect(() => {
    let interval;
    // Only poll if we have a valid jobId and status is processing
    if (currentJob && currentJob.jobId && currentJob.status === 'processing') {
      interval = setInterval(async () => {
        try {
          const response = await api.get(`/video/status/${currentJob.jobId}`);
          if (response.data.success) {
            const updatedJob = { ...response.data.data, jobId: currentJob.jobId };
            setCurrentJob(updatedJob);
            if (response.data.data.status === 'completed') {
              setGeneratedVideos(prev => [
                { jobId: currentJob.jobId, ...response.data.data },
                ...prev
              ]);
              clearInterval(interval);
            } else if (response.data.data.status === 'failed') {
              setError('Video generation failed. Please try again.');
              clearInterval(interval);
            }
          }
        } catch (error) {
          console.error('Error checking status:', error);
          // If job not found (404), stop polling and reset
          if (error.response?.status === 404) {
            setCurrentJob(null);
            setIsGenerating(false);
            setError('Video job expired. Please generate a new video.');
            clearInterval(interval);
          }
        }
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentJob?.jobId, currentJob?.status]);

  const handleGenerateVideo = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);
    setCurrentJob(null);
    
    try {
      const response = await api.post('/video/generate', {
        prompt: `${prompt}. Style: ${selectedStyle}`,
        duration: 5,
        aspectRatio: '16:9'
      });

      if (response.data.success && response.data.data?.jobId) {
        setCurrentJob({
          jobId: response.data.data.jobId,
          status: 'processing',
          prompt,
          progress: 0
        });
      } else {
        setError('Failed to start video generation. Please try again.');
      }
    } catch (error) {
      console.error('Error generating video:', error);
      setError(error.response?.data?.message || 'Failed to generate video. Check if POLLO_API_KEY is configured.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTemplateClick = (template) => {
    setPrompt(template);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation userType="teacher" />
      <main className="pt-20 pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Video className="w-8 h-8 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                  AI Video Generator
                  <Sparkles className="w-6 h-6 text-yellow-400" />
                </h1>
                <p className="text-purple-200">Create educational videos with AI</p>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Video Generator */}
            <div className="lg:col-span-2 space-y-6">
              {/* Prompt Input Card */}
              <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Wand2 className="w-5 h-5 text-purple-400" />
                    <h2 className="text-lg font-semibold text-white">Describe Your Video</h2>
                  </div>
                  
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the educational video you want to create... e.g., 'A beautiful underwater scene showing coral reef ecosystem with colorful fish'"
                    className="min-h-[120px] bg-white/5 border-white/20 text-white placeholder:text-gray-400 resize-none mb-4"
                  />

                  {/* Style Selection */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Palette className="w-4 h-4 text-purple-400" />
                      <span className="text-sm text-purple-200">Video Style</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {videoStyles.map((style) => (
                        <button
                          key={style.id}
                          onClick={() => setSelectedStyle(style.id)}
                          className={`p-3 rounded-xl text-left transition-all ${
                            selectedStyle === style.id
                              ? 'bg-purple-500/30 border-2 border-purple-400'
                              : 'bg-white/5 border border-white/10 hover:bg-white/10'
                          }`}
                        >
                          <p className="text-sm font-medium text-white">{style.name}</p>
                          <p className="text-xs text-gray-400">{style.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Generate Button */}
                  <Button
                    onClick={handleGenerateVideo}
                    disabled={!prompt.trim() || isGenerating || (currentJob?.status === 'processing')}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-6 text-lg font-semibold shadow-lg shadow-purple-500/30"
                  >
                    {isGenerating || currentJob?.status === 'processing' ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating Video...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate Video with AI
                      </>
                    )}
                  </Button>

                  {/* Error Display */}
                  {error && (
                    <div className="mt-4 p-4 bg-red-500/20 border border-red-400/30 rounded-xl">
                      <p className="text-sm text-red-200 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Prompts */}
              <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <h2 className="text-lg font-semibold text-white">Quick Templates</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {promptTemplates.map((template, index) => (
                      <button
                        key={index}
                        onClick={() => handleTemplateClick(template.text)}
                        className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-left group"
                      >
                        <div className={`w-10 h-10 bg-gradient-to-br ${template.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <template.icon className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-sm text-gray-300 group-hover:text-white transition-colors">{template.text}</p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Current Generation Progress */}
              {currentJob && currentJob.status === 'processing' && (
                <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-xl border-purple-400/30">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-purple-500/30 rounded-xl flex items-center justify-center">
                          <Film className="w-6 h-6 text-purple-300 animate-pulse" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">Generating Your Video</h3>
                          <p className="text-sm text-purple-200 truncate max-w-md">{currentJob.prompt}</p>
                        </div>
                      </div>
                      <Badge className="bg-purple-500/30 text-purple-200 border-0">
                        <Clock className="w-3 h-3 mr-1" />
                        Processing
                      </Badge>
                    </div>
                    <Progress value={currentJob.progress || 0} className="h-3 bg-purple-900/50" />
                    <p className="text-sm text-purple-300 mt-2 text-center">{currentJob.progress || 0}% Complete</p>
                  </CardContent>
                </Card>
              )}

              {/* Completed Job */}
              {currentJob && currentJob.status === 'completed' && (
                <Card className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-xl border-green-400/30">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-green-500/30 rounded-xl flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">Video Generated Successfully!</h3>
                        <p className="text-sm text-green-200">Your educational video is ready</p>
                      </div>
                    </div>
                    
                    {/* Video Preview */}
                    <div className="relative aspect-video bg-black rounded-xl overflow-hidden mb-4">
                      {currentJob.videoUrl ? (
                        <video 
                          src={currentJob.videoUrl}
                          controls
                          preload="metadata"
                          className="w-full h-full object-contain"
                          poster={currentJob.thumbnailUrl}
                        >
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                          <div className="text-center">
                            <AlertCircle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                            <p className="text-white text-sm">Video URL not available</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Video URL for manual access */}
                    {currentJob.videoUrl && (
                      <div className="mb-4 p-3 bg-black/30 rounded-lg">
                        <p className="text-xs text-gray-400 mb-1">Video URL (click to open):</p>
                        <a 
                          href={currentJob.videoUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-400 hover:text-blue-300 break-all"
                        >
                          {currentJob.videoUrl}
                        </a>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {currentJob.videoUrl && (
                        <Button 
                          className="flex-1 bg-green-500 hover:bg-green-600"
                          onClick={() => handleDownload(currentJob.videoUrl, `eco-video-${Date.now()}.mp4`)}
                          disabled={isDownloading}
                        >
                          {isDownloading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4 mr-2" />
                          )}
                          {isDownloading ? 'Downloading...' : 'Download'}
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        className="border-white/20 text-white hover:bg-white/10"
                        onClick={() => {
                          if (currentJob.videoUrl) {
                            navigator.clipboard.writeText(currentJob.videoUrl);
                            alert('Video URL copied to clipboard!');
                          }
                        }}
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Copy Link
                      </Button>
                      <Button 
                        variant="outline" 
                        className="border-white/20 text-white hover:bg-white/10"
                        onClick={() => setCurrentJob(null)}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>

                    {currentJob.message && (
                      <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-400/30 rounded-lg">
                        <p className="text-sm text-yellow-200 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          {currentJob.message}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Generated Videos */}
            <div className="space-y-6">
              <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Film className="w-5 h-5 text-purple-400" />
                      Your Videos
                    </h2>
                    <Badge className="bg-purple-500/30 text-purple-200 border-0">
                      {generatedVideos.length}
                    </Badge>
                  </div>

                  {generatedVideos.length === 0 ? (
                    <div className="text-center py-8">
                      <Video className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                      <p className="text-gray-400">No videos generated yet</p>
                      <p className="text-sm text-gray-500">Create your first AI video above</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                      {generatedVideos.map((video, index) => (
                        <div 
                          key={video.jobId || index}
                          className="group p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all"
                        >
                          <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-2">
                            {video.videoUrl ? (
                              <video 
                                src={video.videoUrl}
                                controls
                                preload="metadata"
                                className="w-full h-full object-contain"
                                poster={video.thumbnailUrl}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-800">
                                <Video className="w-8 h-8 text-gray-500" />
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-300 truncate">{video.prompt}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">
                              {video.createdAt ? new Date(video.createdAt).toLocaleDateString() : 'Just now'}
                            </span>
                            <div className="flex gap-1">
                              {video.videoUrl && (
                                <button 
                                  className="p-1.5 hover:bg-green-500/20 rounded-lg transition-colors"
                                  onClick={() => handleDownload(video.videoUrl, `eco-video-${index}.mp4`)}
                                  title="Download video"
                                >
                                  <Download className="w-4 h-4 text-green-400" />
                                </button>
                              )}
                              <button 
                                className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors"
                                onClick={() => setGeneratedVideos(prev => prev.filter((_, i) => i !== index))}
                              >
                                <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Info Card */}
              <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl border-purple-400/30">
                <CardContent className="p-6">
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    About AI Video Generation
                  </h3>
                  <ul className="space-y-2 text-sm text-purple-200">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      Powered by Pollo AI video generation
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      Create educational content in seconds
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      Multiple styles and durations available
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      Perfect for environmental science lessons
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VideoGeneration;
