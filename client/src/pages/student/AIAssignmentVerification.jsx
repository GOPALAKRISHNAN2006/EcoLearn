import React, { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import Navigation from "@/components/Navigation";
import { 
  Upload, 
  FileText, 
  Image, 
  Video, 
  File, 
  Check, 
  X, 
  Clock, 
  Calendar,
  BookOpen,
  AlertCircle,
  CheckCircle,
  Star,
  Trash2,
  Brain,
  Shield,
  Target,
  TrendingUp,
  Eye,
  Camera,
  Loader2,
  AlertTriangle,
  FileCheck,
  Sparkles,
  Award,
  BarChart3,
  RefreshCw
} from "lucide-react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AIAssignmentVerification = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    topic: "",
    description: "",
    files: [],
    handwrittenImages: []
  });
  
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [verificationResult, setVerificationResult] = useState(null);
  const [activeTab, setActiveTab] = useState("upload");
  const [pollingId, setPollingId] = useState(null);

  const subjects = [
    "Environmental Science",
    "Climate Change",
    "Renewable Energy",
    "Ecology",
    "Conservation Biology",
    "Sustainable Development",
    "Marine Biology",
    "Forestry",
    "Environmental Chemistry",
    "Green Technology"
  ];

  const topics = {
    "Environmental Science": ["Ecosystem Dynamics", "Biodiversity", "Pollution Control", "Environmental Impact Assessment"],
    "Climate Change": ["Global Warming", "Carbon Footprint", "Climate Adaptation", "Greenhouse Gases"],
    "Renewable Energy": ["Solar Power", "Wind Energy", "Hydroelectric Power", "Biomass Energy"],
    "Ecology": ["Food Webs", "Population Dynamics", "Ecological Succession", "Biomes"],
    "Conservation Biology": ["Species Conservation", "Habitat Protection", "Wildlife Management", "Endangered Species"],
    "Sustainable Development": ["Green Economy", "Circular Economy", "Sustainable Cities", "SDG Goals"],
    "Marine Biology": ["Ocean Ecosystems", "Coral Reefs", "Marine Conservation", "Ocean Acidification"],
    "Forestry": ["Forest Management", "Deforestation", "Afforestation", "Carbon Sequestration"],
    "Environmental Chemistry": ["Air Quality", "Water Chemistry", "Soil Chemistry", "Toxicology"],
    "Green Technology": ["Electric Vehicles", "Green Buildings", "Waste Management", "Clean Tech"]
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'subject' ? { topic: '' } : {})
    }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
  };

  const handleFiles = (files) => {
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });

    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...validFiles.map(file => ({
        file,
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
      }))]
    }));
  };

  const handleCameraCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          handwrittenImages: [...prev.handwrittenImages, {
            id: Date.now(),
            base64: event.target.result,
            preview: event.target.result,
            name: `Handwritten_Page_${prev.handwrittenImages.length + 1}.jpg`
          }]
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = (fileId) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter(f => f.id !== fileId)
    }));
  };

  const removeHandwrittenImage = (imageId) => {
    setFormData(prev => ({
      ...prev,
      handwrittenImages: prev.handwrittenImages.filter(img => img.id !== imageId)
    }));
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (fileType.startsWith('video/')) return <Video className="w-5 h-5" />;
    if (fileType.includes('pdf') || fileType.includes('document')) return <FileText className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Poll for verification status
  const pollVerificationStatus = useCallback(async (assignmentId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/assignment/status/${assignmentId}`);
      const data = response.data.data;
      
      if (data.status === 'verified' || data.status === 'flagged') {
        setVerificationStatus('complete');
        setVerificationResult(data);
        if (pollingId) {
          clearInterval(pollingId);
          setPollingId(null);
        }
      } else if (data.status === 'processing') {
        setVerificationStatus('processing');
      }
    } catch (error) {
      console.error('Polling error:', error);
    }
  }, [pollingId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.subject || !formData.topic || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setVerificationStatus('submitting');

    try {
      let response;
      
      const studentId = localStorage.getItem('studentId') || 'demo_student_id';

      if (formData.handwrittenImages.length > 0) {
        response = await axios.post(`${API_BASE_URL}/assignment/submit-handwritten`, {
          title: formData.title,
          subject: formData.subject,
          topic: formData.topic,
          description: formData.description,
          studentId,
          images: formData.handwrittenImages.map(img => img.base64)
        });
      } else {
        // Submit with files
        const formDataToSend = new FormData();
        formDataToSend.append('title', formData.title);
        formDataToSend.append('subject', formData.subject);
        formDataToSend.append('topic', formData.topic);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('studentId', studentId);
        
        formData.files.forEach(fileObj => {
          formDataToSend.append('files', fileObj.file);
        });

        response = await axios.post(`${API_BASE_URL}/assignment/submit`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (response.data.success) {
        setVerificationStatus('processing');
        
        // Start polling for verification status
        const assignmentId = response.data.data.assignmentId;
        const intervalId = setInterval(() => pollVerificationStatus(assignmentId), 3000);
        setPollingId(intervalId);
        
        // Initial poll
        setTimeout(() => pollVerificationStatus(assignmentId), 2000);
      }
    } catch (error) {
      console.error('Submission error:', error);
      setVerificationStatus('error');
      alert('Failed to submit assignment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      subject: "",
      topic: "",
      description: "",
      files: [],
      handwrittenImages: []
    });
    setVerificationStatus(null);
    setVerificationResult(null);
    if (pollingId) {
      clearInterval(pollingId);
      setPollingId(null);
    }
  };

  const getGradeColor = (grade) => {
    if (grade?.startsWith('A')) return 'bg-green-100 text-green-800 border-green-300';
    if (grade?.startsWith('B')) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (grade?.startsWith('C')) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (grade?.startsWith('D')) return 'bg-orange-100 text-orange-800 border-orange-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  const getFlagSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <Navigation userType="student" />
      
      <div className="container mx-auto px-4 py-24">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800">AI Assignment Verification</h1>
          </div>
          <p className="text-xl text-gray-600">
            Submit your assignment for AI-powered grading, plagiarism detection, and topic verification
          </p>
          
          {/* Feature badges */}
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            <Badge className="bg-purple-100 text-purple-700 px-3 py-1">
              <Shield className="w-4 h-4 mr-1" /> Plagiarism Detection
            </Badge>
            <Badge className="bg-blue-100 text-blue-700 px-3 py-1">
              <Target className="w-4 h-4 mr-1" /> Topic Relevance Check
            </Badge>
            <Badge className="bg-green-100 text-green-700 px-3 py-1">
              <Camera className="w-4 h-4 mr-1" /> Handwritten OCR
            </Badge>
            <Badge className="bg-orange-100 text-orange-700 px-3 py-1">
              <Sparkles className="w-4 h-4 mr-1" /> AI Content Detection
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        {!verificationResult ? (
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-xl border-2 border-emerald-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl text-emerald-800">
                  <FileCheck className="w-6 h-6" />
                  Submit Assignment for AI Verification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Assignment Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-lg font-semibold">Assignment Title *</Label>
                      <Input
                        id="title"
                        placeholder="Enter assignment title..."
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className="text-lg"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-lg font-semibold">Subject *</Label>
                      <Select value={formData.subject} onValueChange={(value) => handleInputChange('subject', value)}>
                        <SelectTrigger className="text-lg">
                          <SelectValue placeholder="Select a subject..." />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Topic Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="topic" className="text-lg font-semibold">Topic *</Label>
                    <Select 
                      value={formData.topic} 
                      onValueChange={(value) => handleInputChange('topic', value)}
                      disabled={!formData.subject}
                    >
                      <SelectTrigger className="text-lg">
                        <SelectValue placeholder={formData.subject ? "Select a topic..." : "Select subject first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.subject && topics[formData.subject]?.map((topic) => (
                          <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-500">AI will verify if your content matches this topic</p>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-lg font-semibold">Assignment Content *</Label>
                    <Textarea
                      id="description"
                      placeholder="Paste your assignment content here or upload files below..."
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="min-h-48 text-lg"
                      required
                    />
                    <p className="text-sm text-gray-500">
                      For best results, include your full assignment text. The AI will analyze this for grading.
                    </p>
                  </div>

                  {/* Upload Tabs */}
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="upload" className="flex items-center gap-2">
                        <Upload className="w-4 h-4" /> Upload Files
                      </TabsTrigger>
                      <TabsTrigger value="handwritten" className="flex items-center gap-2">
                        <Camera className="w-4 h-4" /> Handwritten (OCR)
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="upload" className="mt-4">
                      {/* File Upload Area */}
                      <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
                          dragActive 
                            ? 'border-green-400 bg-green-50' 
                            : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg text-gray-600 mb-2">
                          Drag and drop files or <span className="text-green-600 font-semibold">browse</span>
                        </p>
                        <p className="text-sm text-gray-500">
                          PDF, DOC, DOCX, Images (Max 10MB per file)
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          onChange={handleFileInput}
                          className="hidden"
                          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                        />
                      </div>

                      {/* File List */}
                      {formData.files.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <Label className="text-lg font-semibold">Uploaded Files ({formData.files.length})</Label>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {formData.files.map((fileObj) => (
                              <div key={fileObj.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  {getFileIcon(fileObj.type)}
                                  <div>
                                    <p className="font-medium text-sm">{fileObj.name}</p>
                                    <p className="text-xs text-gray-500">{formatFileSize(fileObj.size)}</p>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFile(fileObj.id)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="handwritten" className="mt-4">
                      {/* Handwritten Upload */}
                      <div className="space-y-4">
                        <Alert className="bg-blue-50 border-blue-200">
                          <Camera className="w-4 h-4 text-blue-600" />
                          <AlertDescription className="text-blue-800">
                            Take photos of your handwritten assignment. Our OCR will extract the text for AI analysis.
                          </AlertDescription>
                        </Alert>

                        <div className="flex gap-4">
                          <Button
                            type="button"
                            variant="outline"
                            className="flex-1 h-24 border-2 border-dashed border-blue-300 hover:border-blue-500 hover:bg-blue-50"
                            onClick={() => cameraInputRef.current?.click()}
                          >
                            <div className="text-center">
                              <Camera className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                              <span className="text-blue-600 font-medium">Capture Photo</span>
                            </div>
                          </Button>
                          <input
                            ref={cameraInputRef}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleCameraCapture}
                            className="hidden"
                          />
                        </div>

                        {/* Handwritten Images Preview */}
                        {formData.handwrittenImages.length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                            {formData.handwrittenImages.map((img, index) => (
                              <div key={img.id} className="relative group">
                                <img
                                  src={img.preview}
                                  alt={`Page ${index + 1}`}
                                  className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                                />
                                <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                                  Page {index + 1}
                                </div>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  className="absolute top-2 right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => removeHandwrittenImage(img.id)}
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white text-lg py-6"
                    disabled={isSubmitting || verificationStatus === 'processing'}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : verificationStatus === 'processing' ? (
                      <>
                        <Brain className="w-5 h-5 mr-2 animate-pulse" />
                        AI Verification in Progress...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Submit for AI Verification
                      </>
                    )}
                  </Button>

                  {/* Processing Status */}
                  {verificationStatus === 'processing' && (
                    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                      <CardContent className="py-6">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                              <Brain className="w-8 h-8 text-white animate-pulse" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full animate-ping" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-800 mb-1">AI Verification in Progress</h3>
                            <p className="text-gray-600 mb-2">
                              Our AI is analyzing your assignment for topic relevance, plagiarism, and content quality...
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <CheckCircle className="w-4 h-4 text-green-500" /> OCR Complete
                              </div>
                              <div className="flex items-center gap-1">
                                <Loader2 className="w-4 h-4 animate-spin text-blue-500" /> Analyzing...
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Verification Results */
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Result Header */}
            <Card className={`shadow-xl border-2 ${verificationResult.aiVerification?.overallAssessment?.passed ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
              <CardContent className="py-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center ${verificationResult.aiVerification?.overallAssessment?.passed ? 'bg-green-500' : 'bg-red-500'}`}>
                      {verificationResult.aiVerification?.overallAssessment?.passed ? (
                        <CheckCircle className="w-12 h-12 text-white" />
                      ) : (
                        <X className="w-12 h-12 text-white" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-gray-800">{verificationResult.title}</h2>
                      <p className="text-lg text-gray-600">{verificationResult.subject} - {verificationResult.topic}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge className={`text-lg px-4 py-1 ${getGradeColor(verificationResult.finalGrade?.grade)}`}>
                          <Award className="w-4 h-4 mr-1" />
                          Grade: {verificationResult.finalGrade?.grade}
                        </Badge>
                        <span className="text-2xl font-bold text-gray-700">
                          {verificationResult.finalGrade?.score}/100
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button onClick={resetForm} variant="outline" className="gap-2">
                    <RefreshCw className="w-4 h-4" /> Submit Another
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Flags/Warnings */}
            {verificationResult.flags && verificationResult.flags.length > 0 && (
              <Card className="border-2 border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-800">
                    <AlertTriangle className="w-5 h-5" />
                    Verification Flags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {verificationResult.flags.map((flag, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                        <div className={`w-3 h-3 rounded-full ${getFlagSeverityColor(flag.severity)}`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold capitalize">{flag.type.replace('_', ' ')}</span>
                            <Badge variant="outline" className="text-xs">{flag.severity}</Badge>
                          </div>
                          <p className="text-sm text-gray-600">{flag.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Detailed Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Topic Relevance */}
              <Card className="border-2 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Target className="w-5 h-5" />
                    Topic Relevance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg">Score</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {verificationResult.aiVerification?.topicRelevance?.score}%
                      </span>
                    </div>
                    <Progress value={verificationResult.aiVerification?.topicRelevance?.score} className="h-3" />
                    <p className="text-gray-600">
                      {verificationResult.aiVerification?.topicRelevance?.feedback}
                    </p>
                    {verificationResult.aiVerification?.topicRelevance?.keyTopicsFound?.length > 0 && (
                      <div>
                        <p className="font-semibold text-green-700 mb-2">Topics Found:</p>
                        <div className="flex flex-wrap gap-2">
                          {verificationResult.aiVerification?.topicRelevance?.keyTopicsFound.map((topic, i) => (
                            <Badge key={i} className="bg-green-100 text-green-700">{topic}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Plagiarism Check */}
              <Card className={`border-2 ${verificationResult.aiVerification?.plagiarismCheck?.isPlagiarized ? 'border-red-300' : 'border-green-200'}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className={verificationResult.aiVerification?.plagiarismCheck?.isPlagiarized ? 'text-red-600' : 'text-green-600'} />
                    <span className={verificationResult.aiVerification?.plagiarismCheck?.isPlagiarized ? 'text-red-800' : 'text-green-800'}>
                      Plagiarism Check
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg">Similarity</span>
                      <span className={`text-2xl font-bold ${verificationResult.aiVerification?.plagiarismCheck?.isPlagiarized ? 'text-red-600' : 'text-green-600'}`}>
                        {verificationResult.aiVerification?.plagiarismCheck?.score}%
                      </span>
                    </div>
                    <Progress 
                      value={verificationResult.aiVerification?.plagiarismCheck?.score} 
                      className={`h-3 ${verificationResult.aiVerification?.plagiarismCheck?.isPlagiarized ? '[&>div]:bg-red-500' : '[&>div]:bg-green-500'}`}
                    />
                    <p className="text-gray-600">
                      {verificationResult.aiVerification?.plagiarismCheck?.feedback}
                    </p>
                    {verificationResult.aiVerification?.plagiarismCheck?.isPlagiarized && (
                      <Alert className="bg-red-50 border-red-200">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                          High plagiarism detected. Please ensure your work is original.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Content Quality */}
              <Card className="border-2 border-purple-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-800">
                    <BarChart3 className="w-5 h-5" />
                    Content Quality
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Grammar</p>
                        <div className="flex items-center gap-2">
                          <Progress value={verificationResult.aiVerification?.contentQuality?.grammar} className="h-2 flex-1" />
                          <span className="text-sm font-semibold">{verificationResult.aiVerification?.contentQuality?.grammar}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Clarity</p>
                        <div className="flex items-center gap-2">
                          <Progress value={verificationResult.aiVerification?.contentQuality?.clarity} className="h-2 flex-1" />
                          <span className="text-sm font-semibold">{verificationResult.aiVerification?.contentQuality?.clarity}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Depth</p>
                        <div className="flex items-center gap-2">
                          <Progress value={verificationResult.aiVerification?.contentQuality?.depth} className="h-2 flex-1" />
                          <span className="text-sm font-semibold">{verificationResult.aiVerification?.contentQuality?.depth}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Structure</p>
                        <div className="flex items-center gap-2">
                          <Progress value={verificationResult.aiVerification?.contentQuality?.structure} className="h-2 flex-1" />
                          <span className="text-sm font-semibold">{verificationResult.aiVerification?.contentQuality?.structure}%</span>
                        </div>
                      </div>
                    </div>
                    <Separator />
                    <p className="text-gray-600 text-sm">
                      {verificationResult.aiVerification?.contentQuality?.feedback}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* AI Content Detection */}
              <Card className={`border-2 ${verificationResult.aiVerification?.aiContentDetection?.isAIGenerated ? 'border-orange-300' : 'border-green-200'}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className={verificationResult.aiVerification?.aiContentDetection?.isAIGenerated ? 'text-orange-600' : 'text-green-600'} />
                    <span className={verificationResult.aiVerification?.aiContentDetection?.isAIGenerated ? 'text-orange-800' : 'text-green-800'}>
                      AI Content Detection
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg">AI Probability</span>
                      <span className={`text-2xl font-bold ${verificationResult.aiVerification?.aiContentDetection?.isAIGenerated ? 'text-orange-600' : 'text-green-600'}`}>
                        {verificationResult.aiVerification?.aiContentDetection?.score}%
                      </span>
                    </div>
                    <Progress 
                      value={verificationResult.aiVerification?.aiContentDetection?.score} 
                      className={`h-3 ${verificationResult.aiVerification?.aiContentDetection?.isAIGenerated ? '[&>div]:bg-orange-500' : '[&>div]:bg-green-500'}`}
                    />
                    <p className="text-gray-600">
                      {verificationResult.aiVerification?.aiContentDetection?.feedback}
                    </p>
                    {verificationResult.aiVerification?.aiContentDetection?.isAIGenerated && (
                      <Alert className="bg-orange-50 border-orange-200">
                        <Sparkles className="w-4 h-4 text-orange-600" />
                        <AlertDescription className="text-orange-800">
                          This content appears to be AI-generated. Please ensure your work is original.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Feedback */}
            <Card className="border-2 border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <BookOpen className="w-5 h-5" />
                  Detailed Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <div 
                    className="whitespace-pre-wrap text-gray-700"
                    dangerouslySetInnerHTML={{ 
                      __html: verificationResult.aiVerification?.overallAssessment?.detailedFeedback?.replace(/\n/g, '<br/>').replace(/##/g, '<h3>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') || ''
                    }}
                  />
                </div>
                
                {/* Strengths and Improvements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" /> Strengths
                    </h4>
                    <ul className="space-y-2">
                      {verificationResult.aiVerification?.overallAssessment?.strengths?.map((strength, i) => (
                        <li key={i} className="flex items-center gap-2 text-green-700">
                          <CheckCircle className="w-4 h-4" /> {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-bold text-yellow-800 mb-3 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" /> Areas for Improvement
                    </h4>
                    <ul className="space-y-2">
                      {verificationResult.aiVerification?.overallAssessment?.areasForImprovement?.map((area, i) => (
                        <li key={i} className="flex items-center gap-2 text-yellow-700">
                          <Star className="w-4 h-4" /> {area}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAssignmentVerification;
