import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import Navigation from "@/components/Navigation";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  User,
  Calendar,
  Award,
  Target,
  Sparkles,
  BarChart3,
  MessageSquare,
  RefreshCw,
  Loader2,
  Brain,
  TrendingUp,
  Clock,
  Flag
} from "lucide-react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AssignmentReview = () => {
  const [assignments, setAssignments] = useState([]);
  const [flaggedAssignments, setFlaggedAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    manualGrade: '',
    manualScore: '',
    teacherFeedback: '',
    overrideAI: false
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/assignment/flagged`);
      if (response.data.success) {
        setFlaggedAssignments(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignmentDetails = async (assignmentId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/assignment/report/${assignmentId}`);
      if (response.data.success) {
        setSelectedAssignment(response.data.data);
        setReviewDialogOpen(true);
      }
    } catch (error) {
      console.error('Error fetching assignment details:', error);
    }
  };

  const submitReview = async () => {
    if (!selectedAssignment) return;
    
    try {
      setSubmitting(true);
      const teacherId = localStorage.getItem('teacherId') || 'demo_teacher_id';
      
      await axios.post(`${API_BASE_URL}/assignment/review/${selectedAssignment.assignment.id}`, {
        teacherId,
        manualGrade: reviewForm.manualGrade,
        manualScore: parseInt(reviewForm.manualScore),
        teacherFeedback: reviewForm.teacherFeedback,
        overrideAI: reviewForm.overrideAI
      });

      setReviewDialogOpen(false);
      setReviewForm({ manualGrade: '', manualScore: '', teacherFeedback: '', overrideAI: false });
      fetchAssignments();
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getFlagSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getFlagIcon = (type) => {
    switch (type) {
      case 'plagiarism': return <Shield className="w-4 h-4" />;
      case 'ai_content': return <Sparkles className="w-4 h-4" />;
      case 'off_topic': return <Target className="w-4 h-4" />;
      case 'low_quality': return <BarChart3 className="w-4 h-4" />;
      default: return <Flag className="w-4 h-4" />;
    }
  };

  const getGradeColor = (grade) => {
    if (grade?.startsWith('A')) return 'bg-green-100 text-green-800';
    if (grade?.startsWith('B')) return 'bg-blue-100 text-blue-800';
    if (grade?.startsWith('C')) return 'bg-yellow-100 text-yellow-800';
    if (grade?.startsWith('D')) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const sampleFlaggedAssignments = [
    {
      id: '1',
      title: 'Climate Change Impact Study',
      subject: 'Environmental Science',
      topic: 'Global Warming',
      student: { name: 'John Doe', rollNumber: 'STU001', class: '10A' },
      flags: [
        { type: 'plagiarism', severity: 'high', message: 'Plagiarism detected: 45%' },
        { type: 'ai_content', severity: 'medium', message: 'AI-generated content suspected: 35%' }
      ],
      submittedAt: '2025-12-01T10:30:00Z',
      aiGrade: { score: 42, grade: 'F' }
    },
    {
      id: '2',
      title: 'Renewable Energy Sources',
      subject: 'Green Technology',
      topic: 'Solar Power',
      student: { name: 'Jane Smith', rollNumber: 'STU002', class: '10B' },
      flags: [
        { type: 'off_topic', severity: 'critical', message: 'Assignment appears off-topic: 25% relevance' }
      ],
      submittedAt: '2025-12-01T09:15:00Z',
      aiGrade: { score: 35, grade: 'F' }
    },
    {
      id: '3',
      title: 'Ocean Conservation Methods',
      subject: 'Marine Biology',
      topic: 'Coral Reefs',
      student: { name: 'Mike Johnson', rollNumber: 'STU003', class: '10A' },
      flags: [
        { type: 'ai_content', severity: 'critical', message: 'AI-generated content suspected: 85%' }
      ],
      submittedAt: '2025-11-30T14:45:00Z',
      aiGrade: { score: 28, grade: 'F' }
    }
  ];

  const displayAssignments = flaggedAssignments.length > 0 ? flaggedAssignments : sampleFlaggedAssignments;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Navigation userType="teacher" />
      
      <div className="container mx-auto px-4 py-24">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Assignment Review Center</h1>
              <p className="text-gray-600">Review AI-flagged assignments and provide manual evaluation</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                  <Flag className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-700">{displayAssignments.length}</p>
                  <p className="text-sm text-red-600">Flagged Assignments</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-700">
                    {displayAssignments.filter(a => a.flags.some(f => f.type === 'plagiarism')).length}
                  </p>
                  <p className="text-sm text-orange-600">Plagiarism Cases</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-700">
                    {displayAssignments.filter(a => a.flags.some(f => f.type === 'ai_content')).length}
                  </p>
                  <p className="text-sm text-purple-600">AI Content Cases</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-700">Pending</p>
                  <p className="text-sm text-blue-600">Review Status</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Assignments List */}
        <Card className="shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Flagged Assignments
            </CardTitle>
            <Button variant="outline" onClick={fetchAssignments} className="gap-2">
              <RefreshCw className="w-4 h-4" /> Refresh
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : displayAssignments.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700">All Clear!</h3>
                <p className="text-gray-500">No flagged assignments require review</p>
              </div>
            ) : (
              <div className="space-y-4">
                {displayAssignments.map((assignment) => (
                  <Card key={assignment.id} className="border-2 border-orange-200 hover:border-orange-300 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-800">{assignment.title}</h3>
                            <Badge className={getGradeColor(assignment.aiGrade?.grade)}>
                              AI Grade: {assignment.aiGrade?.grade} ({assignment.aiGrade?.score}%)
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {assignment.student?.name} ({assignment.student?.rollNumber})
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="w-4 h-4" />
                              {assignment.subject} - {assignment.topic}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(assignment.submittedAt).toLocaleDateString()}
                            </span>
                          </div>

                          {/* Flags */}
                          <div className="flex flex-wrap gap-2">
                            {assignment.flags.map((flag, index) => (
                              <Badge 
                                key={index} 
                                className={`flex items-center gap-1 ${getFlagSeverityColor(flag.severity)}`}
                              >
                                {getFlagIcon(flag.type)}
                                <span className="capitalize">{flag.type.replace('_', ' ')}</span>
                                <span className="ml-1 text-xs">({flag.severity})</span>
                              </Badge>
                            ))}
                          </div>

                          <p className="text-sm text-gray-500 mt-2">
                            {assignment.flags[0]?.message}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            className="gap-2"
                            onClick={() => fetchAssignmentDetails(assignment.id)}
                          >
                            <Eye className="w-4 h-4" /> View Details
                          </Button>
                          <Button 
                            className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600"
                            onClick={() => {
                              setSelectedAssignment({ assignment });
                              setReviewDialogOpen(true);
                            }}
                          >
                            <MessageSquare className="w-4 h-4" /> Review
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        
        {/* Review Dialog */}
        <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Review Assignment
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {selectedAssignment && (
                <>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-lg">{selectedAssignment.assignment?.title}</h3>
                    <p className="text-gray-600">
                      {selectedAssignment.assignment?.subject} - {selectedAssignment.assignment?.topic}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Student: {selectedAssignment.student?.name || 'N/A'}
                    </p>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="manualGrade">Manual Grade</Label>
                      <Input
                        id="manualGrade"
                        placeholder="e.g., A, B+, C"
                        value={reviewForm.manualGrade}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, manualGrade: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="manualScore">Score (0-100)</Label>
                      <Input
                        id="manualScore"
                        type="number"
                        min="0"
                        max="100"
                        placeholder="e.g., 75"
                        value={reviewForm.manualScore}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, manualScore: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="feedback">Teacher Feedback</Label>
                    <Textarea
                      id="feedback"
                      placeholder="Provide detailed feedback for the student..."
                      className="min-h-32"
                      value={reviewForm.teacherFeedback}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, teacherFeedback: e.target.value }))}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="overrideAI"
                      checked={reviewForm.overrideAI}
                      onChange={(e) => setReviewForm(prev => ({ ...prev, overrideAI: e.target.checked }))}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="overrideAI" className="text-sm">
                      Override AI grade with manual grade
                    </Label>
                  </div>

                  <Alert className="bg-blue-50 border-blue-200">
                    <Brain className="w-4 h-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      If you override the AI grade, your manual grade will be used as the final grade for this assignment.
                    </AlertDescription>
                  </Alert>

                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={submitReview}
                      disabled={submitting || !reviewForm.manualGrade || !reviewForm.manualScore}
                      className="bg-gradient-to-r from-green-600 to-emerald-600"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Submit Review
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AssignmentReview;