import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import Navigation from "@/components/Navigation";
import { 
  Upload, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Calendar,
  BookOpen,
  Star,
  File,
  Image,
  Video,
  Trash2,
  Send,
  Award,
  Timer,
  User,
  MessageSquare,
  AlertTriangle,
  Loader2,
  Camera,
  ScanLine,
  Eye,
  X,
  RotateCcw,
  Sparkles,
  Wand2,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Bot,
  BarChart3,
  ThumbsUp,
  Target,
  Edit3,
  Lightbulb,
  Zap,
  Info,
  FileCheck
} from "lucide-react";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const UploadAssignment = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentData, setStudentData] = useState(null);
  
  // Submission dialog state
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [submissionContent, setSubmissionContent] = useState("");
  const [submissionFiles, setSubmissionFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  
  // AI Grading Result State
  const [showGradingResult, setShowGradingResult] = useState(false);
  const [gradingResult, setGradingResult] = useState(null);
  
  // OCR State
  const [isOcrMode, setIsOcrMode] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImages, setCapturedImages] = useState([]);
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const [ocrResults, setOcrResults] = useState([]);
  const [ocrError, setOcrError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [previewImage, setPreviewImage] = useState(null);
  
  const fileInputRef = useRef(null);
  const ocrImageInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    // Get student data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedData = JSON.parse(userData);
      setStudentData(parsedData);
      fetchAssignments(parsedData);
    }
  }, []);

  const fetchAssignments = async (student) => {
    try {
      setLoading(true);
      // Parse class like "10-A" into grade and section
      const classValue = student.class || "";
      const [grade, section] = classValue.split("-");
      
      if (!grade || !section) {
        setError("Invalid class format. Please contact your administrator.");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${API_URL}/submission/student/${student.id}/class/${grade}/${section}`
      );
      
      setAssignments(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching assignments:", err);
      setError("Failed to fetch assignments. Please try again.");
      setLoading(false);
    }
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
    const isPollutionProject = selectedAssignment?.type?.includes('pollution');
    const maxSize = isPollutionProject ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    const maxSizeLabel = isPollutionProject ? '100MB' : '10MB';
    
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Maximum size is ${maxSizeLabel}.`);
        return false;
      }
      return true;
    });

    setSubmissionFiles(prev => [
      ...prev,
      ...validFiles.map(file => ({
        file,
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type
      }))
    ]);
  };

  const removeFile = (fileId) => {
    setSubmissionFiles(prev => prev.filter(f => f.id !== fileId));
  };

  // ==================== OCR FUNCTIONS ====================
  
  // Start camera for capturing handwritten documents
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraOpen(true);
      setOcrError(null);
    } catch (err) {
      console.error('Camera error:', err);
      setOcrError('Unable to access camera. Please check permissions or use file upload instead.');
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  // Capture image from camera
  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImages(prev => [...prev, {
      id: Date.now(),
      data: imageData,
      processed: false,
      text: ''
    }]);
  };

  // Handle OCR image upload
  const handleOcrImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setCapturedImages(prev => [...prev, {
            id: Date.now() + Math.random(),
            data: event.target.result,
            processed: false,
            text: '',
            fileName: file.name
          }]);
        };
        reader.readAsDataURL(file);
      }
    });
    e.target.value = '';
  };

  // Remove captured image
  const removeCapturedImage = (imageId) => {
    setCapturedImages(prev => prev.filter(img => img.id !== imageId));
    setOcrResults(prev => prev.filter(r => r.imageId !== imageId));
  };

  // Process single image with OCR
  const processImageWithOcr = async (image) => {
    try {
      // Extract base64 data (remove data:image/jpeg;base64, prefix)
      const base64Data = image.data.split(',')[1] || image.data;
      
      const response = await axios.post(`${API_URL}/assignment/extract-text`, {
        image: base64Data,
        filename: image.fileName || `capture_${image.id}.jpg`
      });
      
      return {
        imageId: image.id,
        success: response.data.success,
        text: response.data.text || '',
        confidence: response.data.confidence || 0,
        quality: response.data.quality || 'unknown',
        wordCount: response.data.wordCount || 0,
        tips: response.data.tips || []
      };
    } catch (err) {
      console.error('OCR Error:', err);
      return {
        imageId: image.id,
        success: false,
        text: '',
        confidence: 0,
        error: err.response?.data?.message || 'Failed to extract text'
      };
    }
  };

  // Process all captured images with OCR
  const processAllImagesWithOcr = async () => {
    if (capturedImages.length === 0) {
      setOcrError('Please capture or upload at least one image first.');
      return;
    }
    
    setIsProcessingOcr(true);
    setOcrError(null);
    const results = [];
    
    for (let i = 0; i < capturedImages.length; i++) {
      setCurrentImageIndex(i);
      const image = capturedImages[i];
      
      if (!image.processed) {
        const result = await processImageWithOcr(image);
        results.push(result);
        
        // Update image as processed
        setCapturedImages(prev => prev.map(img => 
          img.id === image.id ? { ...img, processed: true, text: result.text } : img
        ));
      }
    }
    
    setOcrResults(results);
    setIsProcessingOcr(false);
    
    // Combine all extracted text
    const combinedText = results
      .filter(r => r.success && r.text)
      .map(r => r.text)
      .join('\n\n--- Page Break ---\n\n');
    
    if (combinedText) {
      setSubmissionContent(prev => prev ? `${prev}\n\n${combinedText}` : combinedText);
    }
  };

  // Get confidence color
  const getConfidenceColor = (confidence) => {
    if (confidence >= 70) return 'text-green-600 bg-green-100';
    if (confidence >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const getFileIcon = (fileType) => {
    if (fileType?.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (fileType?.startsWith('video/')) return <Video className="w-5 h-5" />;
    if (fileType?.includes('pdf') || fileType?.includes('document')) return <FileText className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysRemaining = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const openSubmitDialog = (assignment) => {
    setSelectedAssignment(assignment);
    setSubmissionContent("");
    setSubmissionFiles([]);
    setIsOcrMode(false);
    setCapturedImages([]);
    setOcrResults([]);
    setOcrError(null);
    setIsSubmitDialogOpen(true);
  };

  const handleSubmit = async () => {
    const isPollutionProject = selectedAssignment?.type?.includes('pollution');
    
    if (isPollutionProject) {
      if (submissionFiles.length === 0) {
        alert("Please upload your project video/files to submit.");
        return;
      }
    } else {
      if (!submissionContent.trim() && submissionFiles.length === 0) {
        alert("Please add some content or upload files to submit.");
        return;
      }
    }

    setIsSubmitting(true);
    setSubmitProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setSubmitProgress(prev => {
        if (prev >= 70) {
          clearInterval(progressInterval);
          return 70;
        }
        return prev + 10;
      });
    }, 200);

    try {
      // Create FormData to upload files
      const formData = new FormData();
      formData.append('assignmentId', selectedAssignment._id);
      formData.append('studentId', studentData.id);
      formData.append('studentName', studentData.name);
      formData.append('studentRollNumber', studentData.rollNumber);
      formData.append('content', submissionContent);
      
      // Append all files
      submissionFiles.forEach(fileObj => {
        formData.append('files', fileObj.file);
      });

      setSubmitProgress(75);
      
      const response = await axios.post(`${API_URL}/submission/submit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setSubmitProgress(Math.min(75 + (percentCompleted * 0.2), 95));
        }
      });

      clearInterval(progressInterval);
      setSubmitProgress(100);

      console.log('=== SUBMISSION RESPONSE ===');
      console.log('Full response:', response.data);
      console.log('AI Grading:', response.data.aiGrading);
      console.log('Is Graded:', response.data.aiGrading?.graded);
      console.log('========================');

      // Check if AI grading result is available
      if (response.data.aiGrading && response.data.aiGrading.graded) {
        console.log('✅ Showing AI grading result');
        setGradingResult(response.data.aiGrading);
        setShowGradingResult(true);
        setIsSubmitDialogOpen(false);
      } else {
        // No AI grading, just close dialog
        setIsSubmitDialogOpen(false);
      }

      // Refresh assignments
      await fetchAssignments(studentData);

      setTimeout(() => {
        setIsSubmitting(false);
        setSubmitProgress(0);
      }, 500);

    } catch (err) {
      clearInterval(progressInterval);
      console.error("Error submitting assignment:", err);
      alert(err.response?.data?.message || "Failed to submit assignment. Please try again.");
      setIsSubmitting(false);
      setSubmitProgress(0);
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'land-pollution': return 'bg-amber-100 text-amber-800';
      case 'air-pollution': return 'bg-sky-100 text-sky-800';
      case 'water-pollution': return 'bg-blue-100 text-blue-800';
      case 'project-based': return 'bg-[#3b9b8f]/20 text-[#3b9b8f]';
      case 'quiz-assessment': return 'bg-blue-100 text-blue-800';
      case 'multimedia': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGradeColor = (grade) => {
    if (grade?.startsWith('A')) return 'bg-green-100 text-green-800';
    if (grade?.startsWith('B')) return 'bg-blue-100 text-blue-800';
    if (grade?.startsWith('C')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  // Filter assignments
  const pendingAssignments = assignments.filter(a => !a.hasSubmitted && !a.isPastDue);
  const overdueAssignments = assignments.filter(a => !a.hasSubmitted && a.isPastDue);
  const submittedAssignments = assignments.filter(a => a.hasSubmitted);
  const gradedAssignments = submittedAssignments.filter(a => 
    a.submission?.status === 'graded' || a.submission?.status === 'ai-graded'
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-amber-50">
        <Navigation userType="student" />
        <div className="container mx-auto px-4 py-24">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            <span className="ml-3 text-lg text-gray-600">Loading assignments...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <Navigation userType="student" />
      
      <div className="container mx-auto px-4 py-24">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">📚 My Assignments</h1>
          <p className="text-xl text-gray-600">View and submit your class assignments</p>
          {studentData && (
            <p className="text-md text-green-600 mt-2">
              Class: <span className="font-semibold">{studentData.class}</span>
            </p>
          )}
        </div>

        {error && (
          <Alert className="max-w-4xl mx-auto mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
          <Card className="bg-[#f59e0b]/30 border-[#f59e0b]">
            <CardContent className="p-4 text-center">
              <Timer className="w-8 h-8 mx-auto mb-2 text-yellow-700" />
              <p className="text-2xl font-bold text-yellow-800">{pendingAssignments.length}</p>
              <p className="text-sm text-yellow-700">Pending</p>
            </CardContent>
          </Card>
          <Card className="bg-red-100 border-red-500">
            <CardContent className="p-4 text-center">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-700" />
              <p className="text-2xl font-bold text-red-800">{overdueAssignments.length}</p>
              <p className="text-sm text-red-700">Overdue</p>
            </CardContent>
          </Card>
          <Card className="bg-[#3b9b8f]/30 border-[#3b9b8f]">
            <CardContent className="p-4 text-center">
              <Send className="w-8 h-8 mx-auto mb-2 text-blue-700" />
              <p className="text-2xl font-bold text-blue-800">{submittedAssignments.length}</p>
              <p className="text-sm text-blue-700">Submitted</p>
            </CardContent>
          </Card>
          <Card className="bg-[#237a57]/30 border-[#237a57]">
            <CardContent className="p-4 text-center">
              <Award className="w-8 h-8 mx-auto mb-2 text-green-700" />
              <p className="text-2xl font-bold text-green-800">{gradedAssignments.length}</p>
              <p className="text-sm text-green-700">Graded</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="max-w-5xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="pending" className="text-lg">
              <Clock className="w-4 h-4 mr-2" />
              Pending ({pendingAssignments.length + overdueAssignments.length})
            </TabsTrigger>
            <TabsTrigger value="submitted" className="text-lg">
              <Send className="w-4 h-4 mr-2" />
              Submitted ({submittedAssignments.filter(a => a.submission?.status !== 'graded').length})
            </TabsTrigger>
            <TabsTrigger value="graded" className="text-lg">
              <Award className="w-4 h-4 mr-2" />
              Graded ({gradedAssignments.length})
            </TabsTrigger>
          </TabsList>

          {/* Pending Assignments Tab */}
          <TabsContent value="pending">
            <div className="space-y-4">
              {overdueAssignments.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-red-700 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Overdue Assignments
                  </h3>
                  {overdueAssignments.map((assignment) => (
                    <AssignmentCard 
                      key={assignment._id} 
                      assignment={assignment} 
                      isOverdue={true}
                      onSubmit={() => openSubmitDialog(assignment)}
                      getTypeColor={getTypeColor}
                      getDaysRemaining={getDaysRemaining}
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              )}

              {pendingAssignments.length > 0 ? (
                <div>
                  <h3 className="text-lg font-semibold text-yellow-700 mb-3 flex items-center gap-2">
                    <Timer className="w-5 h-5" />
                    Pending Assignments
                  </h3>
                  {pendingAssignments.map((assignment) => (
                    <AssignmentCard 
                      key={assignment._id} 
                      assignment={assignment} 
                      isOverdue={false}
                      onSubmit={() => openSubmitDialog(assignment)}
                      getTypeColor={getTypeColor}
                      getDaysRemaining={getDaysRemaining}
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              ) : pendingAssignments.length === 0 && overdueAssignments.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-400" />
                  <p className="text-xl">All caught up! No pending assignments.</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Submitted Assignments Tab */}
          <TabsContent value="submitted">
            <div className="space-y-4">
              {submittedAssignments.filter(a => a.submission?.status !== 'graded' && a.submission?.status !== 'ai-graded').length > 0 ? (
                submittedAssignments
                  .filter(a => a.submission?.status !== 'graded' && a.submission?.status !== 'ai-graded')
                  .map((assignment) => (
                    <SubmittedCard 
                      key={assignment._id} 
                      assignment={assignment}
                      getTypeColor={getTypeColor}
                      formatDate={formatDate}
                    />
                  ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Send className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-xl">No submitted assignments awaiting review.</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Graded Assignments Tab - Table View */}
          <TabsContent value="graded">
            <div className="space-y-6">
              {gradedAssignments.length > 0 ? (
                <>
                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[#237a57]/10 rounded-xl p-4 border border-[#237a57]">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-2xl font-black text-green-700">{gradedAssignments.length}</p>
                          <p className="text-xs text-green-600">Total Graded</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-[#3b9b8f]/10 rounded-xl p-4 border border-[#3b9b8f]">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500 rounded-lg">
                          <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-2xl font-black text-blue-700">
                            {gradedAssignments.length > 0 
                              ? Math.round(gradedAssignments.filter(a => a.submission?.score).reduce((acc, a) => acc + (a.submission?.score || 0), 0) / gradedAssignments.filter(a => a.submission?.score).length) || 0
                              : 0}%
                          </p>
                          <p className="text-xs text-blue-600">Avg Score</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500 rounded-lg">
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-2xl font-black text-purple-700">
                            {gradedAssignments.filter(a => a.submission?.status === 'ai-graded').length}
                          </p>
                          <p className="text-xs text-purple-600">AI Graded</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500 rounded-lg">
                          <Star className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-2xl font-black text-amber-700">
                            {gradedAssignments.filter(a => a.submission?.grade?.startsWith('A')).length}
                          </p>
                          <p className="text-xs text-amber-600">A Grades</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Grades Table */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    {/* Table Header */}
                    <div className="bg-[#237a57] px-6 py-4">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Award className="w-5 h-5" />
                        Your Graded Assignments
                      </h3>
                    </div>
                    
                    {/* Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Assignment</th>
                            <th className="text-left px-4 py-4 text-sm font-semibold text-gray-600">Subject</th>
                            <th className="text-center px-4 py-4 text-sm font-semibold text-gray-600">Grade</th>
                            <th className="text-center px-4 py-4 text-sm font-semibold text-gray-600">Score</th>
                            <th className="text-center px-4 py-4 text-sm font-semibold text-gray-600">Status</th>
                            <th className="text-left px-4 py-4 text-sm font-semibold text-gray-600">Submitted</th>
                            <th className="text-center px-4 py-4 text-sm font-semibold text-gray-600">Details</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {gradedAssignments.map((assignment, index) => (
                            <GradedTableRow 
                              key={assignment._id} 
                              assignment={assignment}
                              index={index}
                              getTypeColor={getTypeColor}
                              getGradeColor={getGradeColor}
                              formatDate={formatDate}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No Graded Assignments Yet</h3>
                  <p className="text-gray-500">Your graded assignments will appear here once your teacher reviews them.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Submit Dialog */}
      <Dialog open={isSubmitDialogOpen} onOpenChange={(open) => {
        if (!open) stopCamera();
        setIsSubmitDialogOpen(open);
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Submit Assignment</DialogTitle>
          </DialogHeader>
          
          {selectedAssignment && (
            <div className="space-y-4">
              {/* Assignment Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold text-lg text-gray-800">{selectedAssignment.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{selectedAssignment.subject}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Due: {formatDate(selectedAssignment.dueDate)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    {selectedAssignment.maxPoints} points
                  </span>
                </div>
                {selectedAssignment.description && (
                  <p className="text-sm text-gray-600 mt-3 border-t pt-3">
                    {selectedAssignment.description}
                  </p>
                )}
              </div>

              {/* Pollution Project Instructions */}
              {selectedAssignment.type?.includes('pollution') && (
                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="w-4 h-4" />
                  <AlertDescription className="text-sm">
                    <strong>Pollution Project Submission:</strong> Upload your video documentation (max 100MB) and any supporting files. 
                    {selectedAssignment.requireLocation && ' Include location details in your video.'}
                    {selectedAssignment.requireVideoDuration && ` Video must be ${selectedAssignment.minVideoDuration}-${selectedAssignment.maxVideoDuration} minutes long.`}
                  </AlertDescription>
                </Alert>
              )}

              {/* Mode Toggle - Only show for traditional assignments */}
              {selectedAssignment.type === 'traditional' && (
                <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                  <Button
                    variant={!isOcrMode ? "default" : "ghost"}
                    className={`flex-1 ${!isOcrMode ? 'bg-green-600 hover:bg-green-700' : ''}`}
                    onClick={() => { setIsOcrMode(false); stopCamera(); }}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Type Answer
                  </Button>
                  <Button
                    variant={isOcrMode ? "default" : "ghost"}
                    className={`flex-1 ${isOcrMode ? 'bg-[#f59e0b] hover:bg-[#237a57]' : ''}`}
                    onClick={() => setIsOcrMode(true)}
                  >
                    <ScanLine className="w-4 h-4 mr-2" />
                  Scan Handwritten
                  </Button>
                </div>
              )}

              {/* OCR Mode */}
              {isOcrMode ? (
                <div className="space-y-4">
                  {/* OCR Instructions */}
                  <Alert className="bg-[#f59e0b]/10 border-[#f59e0b]">
                    <Sparkles className="h-4 w-4 text-[#f59e0b]" />
                    <AlertDescription className="text-[#f59e0b]">
                      <strong>OCR Mode:</strong> Capture or upload photos of your handwritten assignment. 
                      Our AI will extract the text automatically!
                    </AlertDescription>
                  </Alert>

                  {/* Camera / Upload Options */}
                  {!isCameraOpen && (
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        onClick={startCamera}
                        className="h-24 flex-col gap-2 bg-[#f59e0b] hover:bg-[#237a57]"
                      >
                        <Camera className="w-8 h-8" />
                        <span>Open Camera</span>
                      </Button>
                      <Button
                        onClick={() => ocrImageInputRef.current?.click()}
                        variant="outline"
                        className="h-24 flex-col gap-2 border-2 border-dashed border-[#f59e0b] hover:border-[#237a57] hover:bg-[#f59e0b]/10"
                      >
                        <Upload className="w-8 h-8 text-[#f59e0b]" />
                        <span className="text-[#f59e0b]">Upload Images</span>
                      </Button>
                      <input
                        ref={ocrImageInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleOcrImageUpload}
                        className="hidden"
                      />
                    </div>
                  )}

                  {/* Camera View */}
                  {isCameraOpen && (
                    <div className="space-y-3">
                      <div className="relative bg-black rounded-lg overflow-hidden">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          className="w-full h-64 object-cover"
                        />
                        <canvas ref={canvasRef} className="hidden" />
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
                          <Button
                            onClick={captureImage}
                            className="rounded-full w-14 h-14 bg-white hover:bg-gray-100"
                          >
                            <Camera className="w-6 h-6 text-[#f59e0b]" />
                          </Button>
                          <Button
                            onClick={stopCamera}
                            variant="destructive"
                            className="rounded-full w-14 h-14"
                          >
                            <X className="w-6 h-6" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-center text-sm text-gray-500">
                        Position your handwritten document clearly and tap the camera button to capture
                      </p>
                    </div>
                  )}

                  {/* Captured Images Grid */}
                  {capturedImages.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-lg font-semibold flex items-center gap-2">
                          <Image className="w-5 h-5" />
                          Captured Pages ({capturedImages.length})
                        </Label>
                        <Button
                          onClick={() => ocrImageInputRef.current?.click()}
                          variant="outline"
                          size="sm"
                        >
                          <Upload className="w-4 h-4 mr-1" />
                          Add More
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3">
                        {capturedImages.map((img, index) => (
                          <div key={img.id} className="relative group">
                            <img
                              src={img.data}
                              alt={`Page ${index + 1}`}
                              className={`w-full h-32 object-cover rounded-lg border-2 cursor-pointer transition-all ${
                                img.processed ? 'border-green-400' : 'border-gray-200'
                              } hover:border-[#f59e0b]`}
                              onClick={() => setPreviewImage(img)}
                            />
                            <div className="absolute top-1 left-1 bg-black/60 text-white text-xs px-2 py-1 rounded">
                              Page {index + 1}
                            </div>
                            {img.processed && (
                              <div className="absolute top-1 right-8 bg-green-500 text-white p-1 rounded">
                                <CheckCircle className="w-3 h-3" />
                              </div>
                            )}
                            <Button
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeCapturedImage(img.id)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="secondary"
                              size="icon"
                              className="absolute bottom-1 right-1 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => setPreviewImage(img)}
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      {/* Process OCR Button */}
                      <Button
                        onClick={processAllImagesWithOcr}
                        disabled={isProcessingOcr || capturedImages.length === 0}
                        className="w-full bg-[#f59e0b] hover:bg-[#237a57]"
                      >
                        {isProcessingOcr ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing Page {currentImageIndex + 1} of {capturedImages.length}...
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-4 h-4 mr-2" />
                            Extract Text from {capturedImages.length} {capturedImages.length === 1 ? 'Image' : 'Images'}
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {/* OCR Results */}
                  {ocrResults.length > 0 && (
                    <div className="space-y-3">
                      <Label className="text-lg font-semibold">OCR Results</Label>
                      {ocrResults.map((result, index) => (
                        <div key={result.imageId} className={`p-3 rounded-lg border ${
                          result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">Page {index + 1}</span>
                            {result.success && (
                              <Badge className={getConfidenceColor(result.confidence)}>
                                {result.confidence}% confidence
                              </Badge>
                            )}
                          </div>
                          {result.success ? (
                            <p className="text-sm text-gray-700">
                              {result.wordCount} words extracted • Quality: {result.quality}
                            </p>
                          ) : (
                            <p className="text-sm text-red-600">{result.error}</p>
                          )}
                          {result.tips && result.tips.length > 0 && (
                            <div className="mt-2 text-xs text-gray-500">
                              💡 {result.tips[0]}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* OCR Error */}
                  {ocrError && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">{ocrError}</AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : null}

              {/* Content Input (shown in both modes) - Hide for pollution projects */}
              {!selectedAssignment.type?.includes('pollution') && (
                <div className="space-y-2">
                  <Label className="text-lg font-semibold">
                    {isOcrMode ? 'Extracted & Additional Text' : 'Your Answer / Notes'}
                  </Label>
                  <Textarea
                    placeholder={isOcrMode 
                      ? "Text extracted from your handwritten pages will appear here. You can also edit or add more content..."
                      : "Write your assignment answer, notes, or description here..."
                    }
                    value={submissionContent}
                    onChange={(e) => setSubmissionContent(e.target.value)}
                    className="min-h-32"
                  />
                  {submissionContent && (
                    <p className="text-xs text-gray-500 text-right">
                      {submissionContent.split(/\s+/).filter(w => w).length} words
                    </p>
                  )}
                </div>
              )}

              {/* File Upload (not in OCR mode) */}
              {!isOcrMode && (
                <div className="space-y-2">
                  <Label className="text-lg font-semibold">
                    {selectedAssignment.type?.includes('pollution') 
                      ? 'Upload Project Files (Required)' 
                      : 'Upload Files (Optional)'}
                  </Label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer ${
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
                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-1">
                      Drag and drop files or <span className="text-green-600 font-semibold">browse</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedAssignment.type?.includes('pollution') 
                        ? 'Max 100MB per file (videos, images, documents)' 
                        : 'Max 10MB per file'}
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileInput}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.mov,.avi,.mkv"
                    />
                  </div>
                </div>
              )}

              {/* File List */}
              {submissionFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>Files ({submissionFiles.length})</Label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {submissionFiles.map((fileObj) => (
                      <div key={fileObj.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          {getFileIcon(fileObj.type)}
                          <div>
                            <p className="text-sm font-medium">{fileObj.name}</p>
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

              {/* Progress */}
              {isSubmitting && (
                <div className="space-y-2">
                  <Progress value={submitProgress} className="h-2" />
                  <p className="text-sm text-center text-gray-600">Submitting... {submitProgress}%</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                stopCamera();
                setIsSubmitDialogOpen(false);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Assignment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Image Preview</DialogTitle>
          </DialogHeader>
          {previewImage && (
            <div className="space-y-4">
              <img
                src={previewImage.data}
                alt="Preview"
                className="w-full max-h-[60vh] object-contain rounded-lg"
              />
              {previewImage.processed && previewImage.text && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <Label className="text-sm font-semibold mb-2 block">Extracted Text:</Label>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{previewImage.text}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* AI Grading Result Dialog - Beautiful Student-Friendly UI */}
      <Dialog open={showGradingResult} onOpenChange={setShowGradingResult}>
        <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto p-0 bg-gradient-to-b from-slate-50 to-white">
          {/* Hidden title for accessibility */}
          <DialogTitle className="sr-only">AI Grading Result</DialogTitle>
          {/* Animated Header with Grade */}
          {gradingResult && (
            <>
              <div className="relative overflow-hidden">
                {/* Dynamic Background based on Grade */}
                <div className={`absolute inset-0 ${
                  gradingResult.grade?.startsWith('A') ? 'bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600' :
                  gradingResult.grade?.startsWith('B') ? 'bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600' :
                  gradingResult.grade?.startsWith('C') ? 'bg-gradient-to-br from-amber-400 via-orange-500 to-yellow-500' :
                  gradingResult.grade?.startsWith('D') ? 'bg-gradient-to-br from-orange-500 via-red-400 to-rose-500' :
                  'bg-gradient-to-br from-red-500 via-rose-500 to-pink-600'
                }`}></div>
                
                {/* Floating Shapes Animation */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute top-4 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse"></div>
                  <div className="absolute bottom-8 right-16 w-16 h-16 bg-white/10 rounded-full animate-bounce" style={{animationDuration: '3s'}}></div>
                  <div className="absolute top-12 right-24 w-8 h-8 bg-white/20 rounded-full animate-ping" style={{animationDuration: '2s'}}></div>
                </div>
                
                <div className="relative px-8 py-10 text-center text-white">
                  {/* AI Badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
                    <Bot className="w-4 h-4" />
                    AI-Powered Analysis Complete
                  </div>
                  
                  {/* Main Grade Display */}
                  <div className="flex flex-col items-center">
                    <div className="relative mb-4">
                      {/* Glowing Ring */}
                      <div className="absolute inset-0 w-36 h-36 rounded-full bg-white/30 animate-pulse blur-md"></div>
                      {/* Grade Circle */}
                      <div className="relative w-36 h-36 rounded-full bg-white shadow-2xl flex items-center justify-center">
                        <div className="text-center">
                          <span className={`text-5xl font-black ${
                            gradingResult.grade?.startsWith('A') ? 'text-emerald-500' :
                            gradingResult.grade?.startsWith('B') ? 'text-blue-500' :
                            gradingResult.grade?.startsWith('C') ? 'text-amber-500' :
                            gradingResult.grade?.startsWith('D') ? 'text-orange-500' :
                            'text-red-500'
                          }`}>{gradingResult.grade}</span>
                          <p className="text-xs text-gray-500 font-medium">GRADE</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Score Display */}
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-6xl font-black">{gradingResult.score}</span>
                      <span className="text-2xl font-medium text-white/70">/ {gradingResult.maxPoints}</span>
                    </div>
                    
                    {/* Motivational Message */}
                    <div className="flex items-center gap-2 text-xl font-semibold">
                      {gradingResult.grade?.startsWith('A') ? (
                        <><Star className="w-6 h-6 text-yellow-300 fill-yellow-300" /> Outstanding Performance!</>
                      ) : gradingResult.grade?.startsWith('B') ? (
                        <><ThumbsUp className="w-6 h-6" /> Great Work! Keep it up!</>
                      ) : gradingResult.grade?.startsWith('C') ? (
                        <><Target className="w-6 h-6" /> Good effort! Room to grow!</>
                      ) : gradingResult.grade?.startsWith('D') ? (
                        <><TrendingUp className="w-6 h-6" /> You can do better!</>
                      ) : (
                        <><BookOpen className="w-6 h-6" /> Let's work on this together!</>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Score Breakdown - Visual Meter Style */}
                {gradingResult.scores && (
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-100">
                      <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-indigo-500" />
                        📊 Your Performance Breakdown
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">See how you performed in each area</p>
                    </div>
                    
                    <div className="p-5 space-y-5">
                      {/* Content Accuracy */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                              <FileCheck className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">Content Accuracy</p>
                              <p className="text-xs text-gray-500">Is your information correct?</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`text-2xl font-black ${
                              gradingResult.scores.contentAccuracy >= 80 ? 'text-emerald-500' :
                              gradingResult.scores.contentAccuracy >= 60 ? 'text-blue-500' :
                              gradingResult.scores.contentAccuracy >= 40 ? 'text-amber-500' : 'text-red-500'
                            }`}>{gradingResult.scores.contentAccuracy}%</span>
                          </div>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${
                              gradingResult.scores.contentAccuracy >= 80 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' :
                              gradingResult.scores.contentAccuracy >= 60 ? 'bg-gradient-to-r from-blue-400 to-blue-500' :
                              gradingResult.scores.contentAccuracy >= 40 ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-gradient-to-r from-red-400 to-red-500'
                            }`}
                            style={{ width: `${gradingResult.scores.contentAccuracy}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      {/* Originality */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                              <Sparkles className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">Originality</p>
                              <p className="text-xs text-gray-500">How unique is your work?</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`text-2xl font-black ${
                              gradingResult.scores.uniqueness >= 80 ? 'text-emerald-500' :
                              gradingResult.scores.uniqueness >= 60 ? 'text-purple-500' :
                              gradingResult.scores.uniqueness >= 40 ? 'text-amber-500' : 'text-red-500'
                            }`}>{gradingResult.scores.uniqueness}%</span>
                          </div>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${
                              gradingResult.scores.uniqueness >= 80 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' :
                              gradingResult.scores.uniqueness >= 60 ? 'bg-gradient-to-r from-purple-400 to-purple-500' :
                              gradingResult.scores.uniqueness >= 40 ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-gradient-to-r from-red-400 to-red-500'
                            }`}
                            style={{ width: `${gradingResult.scores.uniqueness}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      {/* Topic Relevance */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                              <Target className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">Topic Relevance</p>
                              <p className="text-xs text-gray-500">Did you stay on topic?</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`text-2xl font-black ${
                              gradingResult.scores.relevance >= 80 ? 'text-emerald-500' :
                              gradingResult.scores.relevance >= 60 ? 'text-green-500' :
                              gradingResult.scores.relevance >= 40 ? 'text-amber-500' : 'text-red-500'
                            }`}>{gradingResult.scores.relevance}%</span>
                          </div>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${
                              gradingResult.scores.relevance >= 80 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' :
                              gradingResult.scores.relevance >= 60 ? 'bg-gradient-to-r from-green-400 to-green-500' :
                              gradingResult.scores.relevance >= 40 ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-gradient-to-r from-red-400 to-red-500'
                            }`}
                            style={{ width: `${gradingResult.scores.relevance}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      {/* Writing Quality */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                              <Edit3 className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">Writing Quality</p>
                              <p className="text-xs text-gray-500">Grammar & presentation</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`text-2xl font-black ${
                              gradingResult.scores.quality >= 80 ? 'text-emerald-500' :
                              gradingResult.scores.quality >= 60 ? 'text-orange-500' :
                              gradingResult.scores.quality >= 40 ? 'text-amber-500' : 'text-red-500'
                            }`}>{gradingResult.scores.quality}%</span>
                          </div>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${
                              gradingResult.scores.quality >= 80 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' :
                              gradingResult.scores.quality >= 60 ? 'bg-gradient-to-r from-orange-400 to-orange-500' :
                              gradingResult.scores.quality >= 40 ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-gradient-to-r from-red-400 to-red-500'
                            }`}
                            style={{ width: `${gradingResult.scores.quality}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Strengths & Improvements - Side by Side */}
                {gradingResult.feedback && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* What You Did Well */}
                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border border-emerald-200 overflow-hidden">
                      <div className="px-4 py-3 bg-emerald-100/50 border-b border-emerald-200">
                        <h4 className="font-bold text-emerald-800 flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                            <ThumbsUp className="w-4 h-4 text-white" />
                          </div>
                          💪 Your Strengths
                        </h4>
                      </div>
                      <div className="p-4">
                        <ul className="space-y-3">
                          {gradingResult.feedback.split('\n').filter(line => 
                            line.includes('✓') || line.includes('strength') || line.includes('good') || line.includes('well') || line.includes('Strength')
                          ).slice(0, 3).map((strength, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-emerald-800">
                              <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                              <span>{strength.replace(/^[-•✓]\s*/, '')}</span>
                            </li>
                          ))}
                          {/* Default strengths if parsing fails */}
                          {gradingResult.feedback.split('\n').filter(line => 
                            line.includes('✓') || line.includes('strength') || line.includes('good') || line.includes('well')
                          ).length === 0 && (
                            <>
                              <li className="flex items-start gap-2 text-sm text-emerald-800">
                                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                <span>You attempted the assignment on time</span>
                              </li>
                              <li className="flex items-start gap-2 text-sm text-emerald-800">
                                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                <span>Shows understanding of the topic</span>
                              </li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>
                    
                    {/* Areas to Improve */}
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 overflow-hidden">
                      <div className="px-4 py-3 bg-amber-100/50 border-b border-amber-200">
                        <h4 className="font-bold text-amber-800 flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center">
                            <Lightbulb className="w-4 h-4 text-white" />
                          </div>
                          💡 Areas to Improve
                        </h4>
                      </div>
                      <div className="p-4">
                        <ul className="space-y-3">
                          {gradingResult.feedback.split('\n').filter(line =>
                              line.includes('improve') || line.includes('suggest') || line.includes('could') || line.includes('should') || line.includes('Improve') || line.includes('Focus')
                          ).slice(0, 3).map((suggestion, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-amber-800">
                              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                              <span>{suggestion.replace(/^[-•]\s*/, '')}</span>
                            </li>
                          ))}
                          {/* Default suggestions if parsing fails */}
                          {gradingResult.feedback.split('\n').filter(line => 
                            line.includes('improve') || line.includes('suggest') || line.includes('could') || line.includes('should')
                          ).length === 0 && (
                            <li className="flex items-start gap-2 text-sm text-amber-800">
                              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                              <span>Review the feedback below for specific suggestions</span>
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Detailed AI Feedback */}
                {gradingResult.feedback && (
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-gray-100">
                      <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <Bot className="w-5 h-5 text-blue-500" />
                        🤖 Detailed AI Feedback
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">Here's what our AI found in your submission</p>
                    </div>
                    <div className="p-5">
                      <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                        {gradingResult.feedback.split('\n').map((paragraph, i) => (
                          paragraph.trim() && (
                            <p key={i} className="mb-3 last:mb-0 flex items-start gap-2">
                              {paragraph.includes('✓') || paragraph.toLowerCase().includes('strength') || paragraph.toLowerCase().includes('good') ? (
                                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 mt-2 flex-shrink-0"></span>
                              ) : paragraph.toLowerCase().includes('improve') || paragraph.toLowerCase().includes('suggest') ? (
                                <span className="inline-block w-2 h-2 rounded-full bg-amber-400 mt-2 flex-shrink-0"></span>
                              ) : (
                                <span className="inline-block w-2 h-2 rounded-full bg-blue-400 mt-2 flex-shrink-0"></span>
                              )}
                              <span>{paragraph}</span>
                            </p>
                          )
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Tips Card */}
                <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-5 text-white">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-2">💡 Quick Tips for Next Time</h4>
                      <ul className="space-y-2 text-sm text-white/90">
                        {gradingResult.score < 60 && (
                          <>
                            <li className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                              Review the topic materials before attempting
                            </li>
                            <li className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                              Take more time to organize your thoughts
                            </li>
                          </>
                        )}
                        {gradingResult.score >= 60 && gradingResult.score < 80 && (
                          <>
                            <li className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                              Add more specific examples to support your points
                            </li>
                            <li className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                              Double-check your grammar before submitting
                            </li>
                          </>
                        )}
                        {gradingResult.score >= 80 && (
                          <>
                            <li className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                              Excellent work! Keep up this quality
                            </li>
                            <li className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                              Consider adding citations for even better scores
                            </li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Info Note */}
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">About AI Grading</p>
                    <p className="text-xs text-blue-600 mt-1">
                      This grade was generated by AI analysis. Your teacher may review and adjust the final grade based on additional criteria. Don't worry if the AI missed something - your teacher will have the final say!
                    </p>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button 
                    onClick={() => setShowGradingResult(false)}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold py-3 rounded-xl shadow-lg shadow-green-200 transition-all hover:scale-[1.02]"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Got it, Thanks!
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Assignment Card Component for Pending assignments
const AssignmentCard = ({ assignment, isOverdue, onSubmit, getTypeColor, getDaysRemaining, formatDate }) => {
  const daysRemaining = getDaysRemaining(assignment.dueDate);

  return (
    <Card className={`mb-4 shadow-lg border-2 ${isOverdue ? 'border-red-300' : 'border-yellow-200'} hover:shadow-xl transition-shadow`  }>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-start gap-3 mb-2">
              <BookOpen className={`w-6 h-6 mt-1 ${isOverdue ? 'text-red-500' : 'text-yellow-600'}`} />
              <div>
                <h3 className="font-bold text-xl text-gray-800">{assignment.title}</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge className="bg-blue-100 text-blue-800">{assignment.subject}</Badge>
                  <Badge className={getTypeColor(assignment.type)}>{assignment.type}</Badge>
                </div>
              </div>
            </div>
            
            {assignment.description && (
              <p className="text-gray-600 text-sm mt-3 ml-9">{assignment.description}</p>
            )}
            
            <div className="flex flex-wrap items-center gap-4 mt-4 ml-9 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {assignment.teacherName}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Due: {formatDate(assignment.dueDate)}
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4" />
                {assignment.maxPoints} points
              </span>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-3">
            <div className={`px-4 py-2 rounded-full text-sm font-bold ${
              isOverdue ? 'bg-red-100 text-red-700' : 
              daysRemaining <= 1 ? 'bg-orange-100 text-orange-700' :
              daysRemaining <= 3 ? 'bg-yellow-100 text-yellow-700' :
              'bg-green-100 text-green-700'
            }`}>
              {isOverdue ? 'Overdue' : 
               daysRemaining === 0 ? 'Due Today' :
               daysRemaining === 1 ? 'Due Tomorrow' :
                `${daysRemaining} days left`}
            </div>
            <Button 
              onClick={onSubmit}
              className={`${isOverdue ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
            >
              <Send className="w-4 h-4 mr-2" />
              {isOverdue ? 'Submit Late' : 'Submit'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Submitted Card Component
const SubmittedCard = ({ assignment, getTypeColor, formatDate }) => {
  return (
    <Card className="mb-4 shadow-lg border-2 border-blue-200">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-start gap-3 mb-2">
              <Send className="w-6 h-6 mt-1 text-blue-500" />
              <div>
                <h3 className="font-bold text-xl text-gray-800">{assignment.title}</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge className="bg-blue-100 text-blue-800">{assignment.subject}</Badge>
                  <Badge className={getTypeColor(assignment.type)}>{assignment.type}</Badge>
                  <Badge className={assignment.submission?.status === 'late' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}>
                    {assignment.submission?.status === 'late' ? 'Submitted Late' : 'Submitted'}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 mt-4 ml-9 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Submitted: {formatDate(assignment.submission?.submittedAt)}
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4" />
                {assignment.maxPoints} points
              </span>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <div className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-bold flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Awaiting Review
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Graded Table Row Component with Expandable Details
const GradedTableRow = ({ assignment, index, getTypeColor, getGradeColor, formatDate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isAIGraded = assignment.submission?.status === 'ai-graded';
  const grade = assignment.submission?.grade;
  const score = assignment.submission?.score;
  
  const getGradeBgColor = (grade) => {
    if (!grade) return 'bg-gray-100 text-gray-600';
    if (grade.startsWith('A')) return 'bg-gradient-to-br from-emerald-400 to-green-500 text-white';
    if (grade.startsWith('B')) return 'bg-gradient-to-br from-blue-400 to-indigo-500 text-white';
    if (grade.startsWith('C')) return 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white';
    if (grade.startsWith('D')) return 'bg-gradient-to-br from-orange-400 to-red-400 text-white';
    return 'bg-gradient-to-br from-red-400 to-red-600 text-white';
  };

  const getScoreBarColor = (score) => {
    if (score >= 90) return 'from-emerald-400 to-green-500';
    if (score >= 80) return 'from-blue-400 to-indigo-500';
    if (score >= 70) return 'from-yellow-400 to-amber-500';
    if (score >= 60) return 'from-orange-400 to-orange-500';
    return 'from-red-400 to-red-500';
  };

  return (
    <>
      <tr className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
        {/* Assignment Name */}
        <td className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              grade?.startsWith('A') ? 'bg-emerald-100' :
              grade?.startsWith('B') ? 'bg-blue-100' :
              grade?.startsWith('C') ? 'bg-yellow-100' :
              'bg-gray-100'
            }`}>
              <BookOpen className={`w-5 h-5 ${
                grade?.startsWith('A') ? 'text-emerald-600' :
                grade?.startsWith('B') ? 'text-blue-600' :
                grade?.startsWith('C') ? 'text-yellow-600' :
                'text-gray-600'
              }`} />
            </div>
            <div>
              <p className="font-semibold text-gray-800">{assignment.title}</p>
              <p className="text-xs text-gray-500">{assignment.type}</p>
            </div>
          </div>
        </td>
        
        {/* Subject */}
        <td className="px-4 py-4">
          <Badge className="bg-blue-100 text-blue-700 border-0">{assignment.subject}</Badge>
        </td>
        
        {/* Grade */}
        <td className="px-4 py-4 text-center">
          {grade ? (
            <span className={`inline-flex items-center justify-center w-12 h-12 rounded-xl font-black text-xl shadow-lg ${getGradeBgColor(grade)}`}>
              {grade}
            </span>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </td>
        {/* Score */}
        <td className="px-4 py-4">
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-gray-800">{score ?? '-'}</span>
              <span className="text-sm text-gray-400">/{assignment.maxPoints}</span>
            </div>
            {score !== null && score !== undefined && (
              <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${getScoreBarColor(score)} rounded-full transition-all duration-500`}
                  style={{ width: `${(score / assignment.maxPoints) * 100}%` }}
                />
              </div>
            )}
          </div>
        </td>
        
        <td className="px-4 py-4 text-center">
          {isAIGraded ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
              <Bot className="w-3 h-3" />
              AI Graded
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
              <CheckCircle className="w-3 h-3" />
              Graded
            </span>
          )}
        </td>
        
        {/* Submitted Date */}
        <td className="px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-gray-400" />
            {formatDate(assignment.submission?.submittedAt)}
          </div>
        </td>
        
        {/* Expand Button */}
        <td className="px-4 py-4 text-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-2 rounded-lg transition-all ${
              isExpanded 
                ? 'bg-green-100 text-green-700' 
                : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </td>
      </tr>
      
      {/* Expanded Details Row */}
      {isExpanded && (
        <tr>
          <td colSpan={7} className="px-6 py-0">
            <div className="py-6 border-t border-gray-100 bg-gradient-to-br from-gray-50 to-white">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column - AI Analysis */}
                {assignment.submission?.aiGrading?.scores && (
                  <div className="bg-white rounded-xl p-5 border border-purple-200 shadow-sm">
                    <h4 className="font-semibold text-purple-700 mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      AI Performance Analysis
                    </h4>
                    <div className="space-y-4">
                      {/* Score Bars */}
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Content Accuracy</span>
                            <span className="font-bold text-blue-600">{assignment.submission.aiGrading.scores.contentAccuracy}%</span>
                          </div>
                          <div className="h-3 bg-blue-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-700"
                              style={{ width: `${assignment.submission.aiGrading.scores.contentAccuracy}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Originality</span>
                            <span className="font-bold text-purple-600">{assignment.submission.aiGrading.scores.uniqueness}%</span>
                          </div>
                          <div className="h-3 bg-purple-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transition-all duration-700`}
                              style={{ width: `${assignment.submission.aiGrading.scores.uniqueness}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Topic Relevance</span>
                            <span className="font-bold text-green-600">{assignment.submission.aiGrading.scores.relevance}%</span>
                          </div>
                          <div className="h-3 bg-green-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-700"
                              style={{ width: `${assignment.submission.aiGrading.scores.relevance}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Writing Quality</span>
                            <span className="font-bold text-orange-600">{assignment.submission.aiGrading.scores.quality}%</span>
                          </div>
                          <div className="h-3 bg-orange-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-700`}
                              style={{ width: `${assignment.submission.aiGrading.scores.quality}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Overall Score Circle */}
                      <div className="flex items-center justify-center pt-4 border-t border-purple-100">
                        <div className="text-center">
                          <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg ${getGradeBgColor(grade)}`}>
                            <span className="text-2xl font-black">{assignment.submission.aiGrading.scores.overall || score}%</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">Overall Score</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Right Column - Feedback */}
                <div className="space-y-4">
                  {/* Teacher/AI Feedback */}
                  {assignment.submission?.feedback && (
                    <div className="bg-white rounded-xl p-5 border border-green-200 shadow-sm">
                      <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" />
                        {isAIGraded ? 'AI Feedback' : 'Teacher Feedback'}
                      </h4>
                      <div className="bg-green-50 rounded-lg p-4 text-sm text-green-800 leading-relaxed max-h-48 overflow-y-auto">
                        {assignment.submission.feedback}
                      </div>
                    </div>
                  )}
                  
                  {/* Quick Stats */}
                  <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Assignment Details
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-500 text-xs">Max Points</p>
                        <p className="font-bold text-gray-800">{assignment.maxPoints}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-500 text-xs">Points Earned</p>
                        <p className="font-bold text-gray-800">{score || '-'}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-500 text-xs">Due Date</p>
                        <p className="font-bold text-gray-800">{formatDate(assignment.dueDate)}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-gray-500 text-xs">Graded By</p>
                        <p className="font-bold text-gray-800">{isAIGraded ? '🤖 AI' : '👨‍🏫 Teacher'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default UploadAssignment;