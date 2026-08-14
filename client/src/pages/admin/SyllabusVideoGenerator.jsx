import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../../components/admin/AdminNavbar";
import {
  BookOpen,
  Video,
  Plus,
  Edit,
  Trash2,
  Play,
  RefreshCw,
  X,
  FileText,
  Sparkles,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader,
  Eye,
  Download,
  Settings,
  Loader2,
} from "lucide-react";
import {
  createSyllabus,
  getAllSyllabi,
  updateSyllabus,
  deleteSyllabus,
  generateVideoFromSyllabus,
  checkVideoStatus,
  regenerateQuiz,
} from "../../services/syllabusService";

const SyllabusVideoGenerator = () => {
  const navigate = useNavigate();
  const [syllabi, setSyllabi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedSyllabus, setSelectedSyllabus] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [generatingVideo, setGeneratingVideo] = useState({});
  const [pollingTasks, setPollingTasks] = useState({});
  const [activeTab, setActiveTab] = useState("details"); // 'details' or 'quiz'
  const [generatingQuiz, setGeneratingQuiz] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    subject: "Environmental Science",
    grade: "Grade 1",
    description: "",
    content: "",
    topics: [{ topicName: "", description: "", duration: "" }],
    quiz: {
      questions: Array(10)
        .fill(null)
        .map(() => ({
          question: "",
          options: ["", "", "", ""],
          correctAnswer: 0,
          explanation: "",
        })),
      passingScore: 70,
      timeLimit: 600,
    },
  });

  // Video generation options
  const [videoOptions, setVideoOptions] = useState({
    duration: "5",
    aspectRatio: "16:9",
    mode: "std",
    customPrompt: "",
  });

  const subjects = ["Environmental Science"];

  const grades = [
    "Grade 1",
    "Grade 2",
    "Grade 3",
    "Grade 4",
    "Grade 5",
    "Grade 6",
    "Grade 7",
    "Grade 8",
    "Grade 9",
    "Grade 10",
    "Grade 11",
    "Grade 12",
  ];

  useEffect(() => {
    const adminData = localStorage.getItem("admin");
    if (!adminData) {
      navigate("/admin/login");
      return;
    }
    fetchSyllabi();
  }, [navigate]);

  // Poll for video status updates
  useEffect(() => {
    const pollInterval = setInterval(() => {
      Object.keys(pollingTasks).forEach(async (syllabusId) => {
        if (pollingTasks[syllabusId]) {
          try {
            const response = await checkVideoStatus(syllabusId);
            if (response.success) {
              const { status, videoUrl, thumbnailUrl } = response.data;

              if (status === "succeed" || status === "completed") {
                // Update syllabus in state
                setSyllabi((prev) =>
                  prev.map((s) =>
                    s._id === syllabusId
                      ? {
                          ...s,
                          videoGenerationStatus: "completed",
                          videoUrl,
                          thumbnailUrl,
                        }
                      : s
                  )
                );
                // Remove from polling
                setPollingTasks((prev) => {
                  const updated = { ...prev };
                  delete updated[syllabusId];
                  return updated;
                });
                setGeneratingVideo((prev) => ({
                  ...prev,
                  [syllabusId]: false,
                }));
                setSuccessMessage("Video generated successfully!");
              } else if (status === "failed") {
                setSyllabi((prev) =>
                  prev.map((s) =>
                    s._id === syllabusId
                      ? { ...s, videoGenerationStatus: "failed" }
                      : s
                  )
                );
                setPollingTasks((prev) => {
                  const updated = { ...prev };
                  delete updated[syllabusId];
                  return updated;
                });
                setGeneratingVideo((prev) => ({
                  ...prev,
                  [syllabusId]: false,
                }));
                setError("Video generation failed. Please try again.");
              }
            }
          } catch (err) {
            console.error("Error polling video status:", err);
          }
        }
      });
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(pollInterval);
  }, [pollingTasks]);

  const fetchSyllabi = async () => {
    try {
      setLoading(true);
      const response = await getAllSyllabi();
      if (response.success) {
        setSyllabi(response.data);
        // Check for any generating videos and add to polling
        const generating = {};
        response.data.forEach((s) => {
          if (s.videoGenerationStatus === "generating" && s.videoTaskId) {
            generating[s._id] = true;
          }
        });
        setPollingTasks(generating);
      }
    } catch (err) {
      setError("Failed to fetch syllabi");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      subject: "Environmental Science",
      grade: "Grade 1",
      description: "",
      content: "",
      topics: [{ topicName: "", description: "", duration: "" }],
      quiz: {
        questions: Array(10)
          .fill(null)
          .map(() => ({
            question: "",
            options: ["", "", "", ""],
            correctAnswer: 0,
            explanation: "",
          })),
        passingScore: 70,
        timeLimit: 600,
      },
    });
    setActiveTab("details");
  };

  // Quiz helper functions
  const updateQuizQuestion = (index, field, value) => {
    const updatedQuestions = [...formData.quiz.questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setFormData({
      ...formData,
      quiz: { ...formData.quiz, questions: updatedQuestions },
    });
  };

  const updateQuizOption = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...formData.quiz.questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setFormData({
      ...formData,
      quiz: { ...formData.quiz, questions: updatedQuestions },
    });
  };

  const updateQuizSettings = (field, value) => {
    setFormData({
      ...formData,
      quiz: { ...formData.quiz, [field]: value },
    });
  };

  const handleCreateSyllabus = async () => {
    try {
      if (
        !formData.title ||
        !formData.subject ||
        !formData.grade ||
        !formData.content
      ) {
        setError("Please fill in all required fields");
        return;
      }

      // Don't send quiz - let backend auto-generate it
      const syllabusData = {
        title: formData.title,
        subject: formData.subject,
        grade: formData.grade,
        description: formData.description,
        content: formData.content,
        topics: formData.topics,
        generateQuiz: true, // Tell backend to auto-generate quiz
      };

      const admin = JSON.parse(localStorage.getItem("admin"));
      const response = await createSyllabus({
        ...syllabusData,
        adminId: admin?.id,
      });

      if (response.success) {
        setSyllabi([response.data, ...syllabi]);
        setShowCreateModal(false);
        resetForm();

        // Check if quiz was generated
        const quizGenerated = response.data.quiz?.questions?.length > 0;
        setSuccessMessage(
          quizGenerated
            ? `Syllabus created with ${response.data.quiz.questions.length} AI-generated quiz questions! You can edit them anytime.`
            : "Syllabus created successfully!"
        );
      }
    } catch (err) {
      setError(err.message || "Failed to create syllabus");
    }
  };

  const handleUpdateSyllabus = async () => {
    try {
      if (!selectedSyllabus) return;

      const response = await updateSyllabus(selectedSyllabus._id, formData);

      if (response.success) {
        setSyllabi(
          syllabi.map((s) =>
            s._id === selectedSyllabus._id ? response.data : s
          )
        );
        setShowEditModal(false);
        setSelectedSyllabus(null);
        resetForm();
        setSuccessMessage("Syllabus updated successfully!");
      }
    } catch (err) {
      setError(err.message || "Failed to update syllabus");
    }
  };

  const handleDeleteSyllabus = async (id) => {
    if (!window.confirm("Are you sure you want to delete this syllabus?"))
      return;

    try {
      const response = await deleteSyllabus(id);
      if (response.success) {
        setSyllabi(syllabi.filter((s) => s._id !== id));
        setSuccessMessage("Syllabus deleted successfully!");
      }
    } catch (err) {
      setError(err.message || "Failed to delete syllabus");
    }
  };

  const handleGenerateVideo = async (syllabus) => {
    try {
      setGeneratingVideo((prev) => ({ ...prev, [syllabus._id]: true }));
      setError("");

      const response = await generateVideoFromSyllabus(syllabus._id, {
        duration: videoOptions.duration,
        aspectRatio: videoOptions.aspectRatio,
        mode: videoOptions.mode,
        customPrompt: videoOptions.customPrompt || undefined,
      });

      if (response.success) {
        // Update syllabus status
        setSyllabi((prev) =>
          prev.map((s) =>
            s._id === syllabus._id
              ? {
                  ...s,
                  videoGenerationStatus: "generating",
                  videoTaskId: response.data.taskId,
                }
              : s
          )
        );

        // Add to polling
        setPollingTasks((prev) => ({ ...prev, [syllabus._id]: true }));

        setShowVideoModal(false);
        setSuccessMessage(
          "Video generation started! This may take 1-2 minutes."
        );
      }
    } catch (err) {
      setGeneratingVideo((prev) => ({ ...prev, [syllabus._id]: false }));
      setError(err.message || "Failed to start video generation");
    }
  };

  const openEditModal = (syllabus) => {
    setSelectedSyllabus(syllabus);
    // Prepare quiz questions - pad to 10 if less
    const existingQuestions = syllabus.quiz?.questions || [];
    const paddedQuestions = [...existingQuestions];
    while (paddedQuestions.length < 10) {
      paddedQuestions.push({
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        explanation: "",
      });
    }

    setFormData({
      title: syllabus.title,
      subject: syllabus.subject,
      grade: syllabus.grade,
      description: syllabus.description || "",
      content: syllabus.content,
      topics:
        syllabus.topics?.length > 0
          ? syllabus.topics
          : [{ topicName: "", description: "", duration: "" }],
      quiz: {
        questions: paddedQuestions,
        passingScore: syllabus.quiz?.passingScore || 70,
        timeLimit: syllabus.quiz?.timeLimit || 600,
      },
    });
    setActiveTab("details");
    setShowEditModal(true);
  };

  const openPromptModal = (syllabus) => {
    setSelectedSyllabus(syllabus);
    setShowPromptModal(true);
  };

  const openVideoModal = (syllabus) => {
    setSelectedSyllabus(syllabus);
    setVideoOptions({
      duration: "5",
      aspectRatio: "16:9",
      mode: "std",
      customPrompt: syllabus.generatedPrompt || "",
    });
    setShowVideoModal(true);
  };

  const addTopic = () => {
    setFormData({
      ...formData,
      topics: [
        ...formData.topics,
        { topicName: "", description: "", duration: "" },
      ],
    });
  };

  const removeTopic = (index) => {
    setFormData({
      ...formData,
      topics: formData.topics.filter((_, i) => i !== index),
    });
  };

  const updateTopic = (index, field, value) => {
    const updatedTopics = [...formData.topics];
    updatedTopics[index][field] = value;
    setFormData({ ...formData, topics: updatedTopics });
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: "#f59e0b", icon: Clock, text: "Pending" },
      generating: { color: "#3b82f6", icon: Loader, text: "Generating..." },
      completed: { color: "#22c55e", icon: CheckCircle, text: "Completed" },
      failed: { color: "#ef4444", icon: AlertCircle, text: "Failed" },
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;

    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.25rem",
          padding: "0.25rem 0.75rem",
          backgroundColor: `${badge.color}20`,
          color: badge.color,
          borderRadius: "9999px",
          fontSize: "0.75rem",
          fontWeight: "500",
        }}
      >
        <Icon
          size={14}
          className={status === "generating" ? "animate-spin" : ""}
        />
        {badge.text}
      </span>
    );
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f3f4f6" }}>
      <AdminNavbar />

      <div
        style={{ maxWidth: "1400px", margin: "0 auto", padding: "2rem 1rem" }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "1.875rem",
                fontWeight: "bold",
                color: "#1f2937",
                marginBottom: "0.5rem",
              }}
            >
              Syllabus to Video Generator
            </h1>
            <p style={{ color: "#6b7280" }}>
              Create syllabus and generate animated educational videos using AI
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75rem 1.5rem",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
              cursor: "pointer",
              fontWeight: "500",
            }}
          >
            <Plus size={18} />
            Create Syllabus
          </button>
        </div>

        {/* Messages */}
        {successMessage && (
          <div
            style={{
              padding: "1rem",
              backgroundColor: "#dcfce7",
              color: "#166534",
              borderRadius: "0.5rem",
              marginBottom: "1rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>{successMessage}</span>
            <button
              onClick={() => setSuccessMessage("")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "1.25rem",
              }}
            >
              ×
            </button>
          </div>
        )}
        {error && (
          <div
            style={{
              padding: "1rem",
              backgroundColor: "#fee2e2",
              color: "#991b1b",
              borderRadius: "0.5rem",
              marginBottom: "1rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>{error}</span>
            <button
              onClick={() => setError("")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "1.25rem",
              }}
            >
              ×
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          {[
            {
              label: "Total Syllabi",
              value: syllabi.length,
              color: "#3b82f6",
              icon: BookOpen,
            },
            {
              label: "Videos Generated",
              value: syllabi.filter(
                (s) => s.videoGenerationStatus === "completed"
              ).length,
              color: "#22c55e",
              icon: Video,
            },
            {
              label: "In Progress",
              value: syllabi.filter(
                (s) => s.videoGenerationStatus === "generating"
              ).length,
              color: "#f59e0b",
              icon: Loader,
            },
            {
              label: "Pending",
              value: syllabi.filter(
                (s) =>
                  s.videoGenerationStatus === "pending" ||
                  !s.videoGenerationStatus
              ).length,
              color: "#8b5cf6",
              icon: Clock,
            },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                style={{
                  backgroundColor: "white",
                  padding: "1.5rem",
                  borderRadius: "1rem",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    padding: "0.75rem",
                    backgroundColor: `${stat.color}20`,
                    borderRadius: "0.75rem",
                  }}
                >
                  <Icon size={24} color={stat.color} />
                </div>
                <div>
                  <p
                    style={{
                      color: "#6b7280",
                      fontSize: "0.875rem",
                      marginBottom: "0.25rem",
                    }}
                  >
                    {stat.label}
                  </p>
                  <p
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: "bold",
                      color: stat.color,
                    }}
                  >
                    {stat.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Syllabi List */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <Loader
              size={48}
              className="animate-spin"
              style={{ color: "#3b82f6", margin: "0 auto" }}
            />
            <p style={{ color: "#6b7280", marginTop: "1rem" }}>
              Loading syllabi...
            </p>
          </div>
        ) : syllabi.length === 0 ? (
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "1rem",
              padding: "3rem",
              textAlign: "center",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <BookOpen
              size={48}
              color="#9ca3af"
              style={{ margin: "0 auto 1rem" }}
            />
            <h3
              style={{
                fontSize: "1.25rem",
                fontWeight: "600",
                color: "#1f2937",
                marginBottom: "0.5rem",
              }}
            >
              No syllabi yet
            </h3>
            <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
              Create your first syllabus to get started generating educational
              videos
            </p>
            <button
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "0.5rem",
                cursor: "pointer",
              }}
            >
              Create Syllabus
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {syllabi.map((syllabus) => (
              <div
                key={syllabus._id}
                style={{
                  backgroundColor: "white",
                  borderRadius: "1rem",
                  overflow: "hidden",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                {/* Video Preview / Thumbnail */}
                <div
                  style={{
                    height: "200px",
                    backgroundColor: "#e5e7eb",
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {syllabus.videoUrl ? (
                    <video
                      src={syllabus.videoUrl}
                      poster={syllabus.thumbnailUrl}
                      controls
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : syllabus.videoGenerationStatus === "generating" ? (
                    <div style={{ textAlign: "center" }}>
                      <Loader
                        size={48}
                        color="#3b82f6"
                        className="animate-spin"
                      />
                      <p style={{ color: "#6b7280", marginTop: "0.5rem" }}>
                        Generating video...
                      </p>
                    </div>
                  ) : (
                    <div style={{ textAlign: "center" }}>
                      <Video size={48} color="#9ca3af" />
                      <p style={{ color: "#6b7280", marginTop: "0.5rem" }}>
                        No video yet
                      </p>
                    </div>
                  )}
                  {/* Status Badge */}
                  <div
                    style={{
                      position: "absolute",
                      top: "0.75rem",
                      right: "0.75rem",
                    }}
                  >
                    {getStatusBadge(syllabus.videoGenerationStatus)}
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: "1.25rem" }}>
                  <h3
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: "600",
                      color: "#1f2937",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {syllabus.title}
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      marginBottom: "0.75rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        padding: "0.25rem 0.75rem",
                        backgroundColor: "#dbeafe",
                        color: "#1d4ed8",
                        borderRadius: "9999px",
                        fontSize: "0.75rem",
                      }}
                    >
                      {syllabus.subject}
                    </span>
                    <span
                      style={{
                        padding: "0.25rem 0.75rem",
                        backgroundColor: "#fef3c7",
                        color: "#92400e",
                        borderRadius: "9999px",
                        fontSize: "0.75rem",
                      }}
                    >
                      {syllabus.grade}
                    </span>
                    {syllabus.quiz?.questions?.length > 0 && (
                      <span
                        style={{
                          padding: "0.25rem 0.75rem",
                          backgroundColor: "#dcfce7",
                          color: "#166534",
                          borderRadius: "9999px",
                          fontSize: "0.75rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem",
                        }}
                      >
                        📝 {syllabus.quiz.questions.length} Quiz Questions
                      </span>
                    )}
                  </div>
                  <p
                    style={{
                      color: "#6b7280",
                      fontSize: "0.875rem",
                      marginBottom: "1rem",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {syllabus.description || syllabus.content.substring(0, 100)}
                    ...
                  </p>

                  {/* Actions */}
                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      paddingTop: "1rem",
                      borderTop: "1px solid #e5e7eb",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      onClick={() => openPromptModal(syllabus)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        padding: "0.5rem 0.75rem",
                        backgroundColor: "#f3f4f6",
                        border: "none",
                        borderRadius: "0.375rem",
                        cursor: "pointer",
                        fontSize: "0.875rem",
                        color: "#374151",
                      }}
                    >
                      <Eye size={16} />
                      View Prompt
                    </button>
                    <button
                      onClick={() => openVideoModal(syllabus)}
                      disabled={
                        generatingVideo[syllabus._id] ||
                        syllabus.videoGenerationStatus === "generating"
                      }
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        padding: "0.5rem 0.75rem",
                        backgroundColor:
                          generatingVideo[syllabus._id] ||
                          syllabus.videoGenerationStatus === "generating"
                            ? "#9ca3af"
                            : "#3b82f6",
                        color: "white",
                        border: "none",
                        borderRadius: "0.375rem",
                        cursor:
                          generatingVideo[syllabus._id] ||
                          syllabus.videoGenerationStatus === "generating"
                            ? "not-allowed"
                            : "pointer",
                        fontSize: "0.875rem",
                      }}
                    >
                      {generatingVideo[syllabus._id] ||
                      syllabus.videoGenerationStatus === "generating" ? (
                        <>
                          <Loader size={16} className="animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} />
                          Generate Video
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => openEditModal(syllabus)}
                      style={{
                        padding: "0.5rem",
                        backgroundColor: "#dbeafe",
                        border: "none",
                        borderRadius: "0.375rem",
                        cursor: "pointer",
                      }}
                    >
                      <Edit size={16} color="#3b82f6" />
                    </button>
                    <button
                      onClick={() => handleDeleteSyllabus(syllabus._id)}
                      style={{
                        padding: "0.5rem",
                        backgroundColor: "#fee2e2",
                        border: "none",
                        borderRadius: "0.375rem",
                        cursor: "pointer",
                      }}
                    >
                      <Trash2 size={16} color="#ef4444" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Modal */}
        {(showCreateModal || showEditModal) && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "1rem",
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "1rem",
                padding: "2rem",
                maxWidth: "700px",
                width: "100%",
                maxHeight: "90vh",
                overflowY: "auto",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1.5rem",
                }}
              >
                <h3 style={{ fontSize: "1.25rem", fontWeight: "600" }}>
                  {showCreateModal ? "Create New Syllabus" : "Edit Syllabus"}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setSelectedSyllabus(null);
                    resetForm();
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <X size={24} color="#6b7280" />
                </button>
              </div>

              {/* Tabs */}
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  marginBottom: "1.5rem",
                  borderBottom: "2px solid #e5e7eb",
                  paddingBottom: "0.5rem",
                }}
              >
                <button
                  onClick={() => setActiveTab("details")}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor:
                      activeTab === "details" ? "#3b82f6" : "transparent",
                    color: activeTab === "details" ? "white" : "#6b7280",
                    border: "none",
                    borderRadius: "0.375rem",
                    cursor: "pointer",
                    fontWeight: "500",
                  }}
                >
                  📚 Syllabus Details
                </button>
                <button
                  onClick={() => setActiveTab("quiz")}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor:
                      activeTab === "quiz" ? "#3b82f6" : "transparent",
                    color: activeTab === "quiz" ? "white" : "#6b7280",
                    border: "none",
                    borderRadius: "0.375rem",
                    cursor: "pointer",
                    fontWeight: "500",
                  }}
                >
                  📝 Quiz Questions (10)
                </button>
              </div>

              {/* Details Tab */}
              {activeTab === "details" && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: "500",
                        color: "#374151",
                      }}
                    >
                      Title <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="e.g., Introduction to Photosynthesis"
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid #e5e7eb",
                        borderRadius: "0.5rem",
                        fontSize: "0.875rem",
                      }}
                    />
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "1rem",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "0.5rem",
                          fontWeight: "500",
                          color: "#374151",
                        }}
                      >
                        Subject <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <select
                        value={formData.subject}
                        onChange={(e) =>
                          setFormData({ ...formData, subject: e.target.value })
                        }
                        style={{
                          width: "100%",
                          padding: "0.75rem",
                          border: "1px solid #e5e7eb",
                          borderRadius: "0.5rem",
                          fontSize: "0.875rem",
                        }}
                      >
                        {subjects.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "0.5rem",
                          fontWeight: "500",
                          color: "#374151",
                        }}
                      >
                        Grade <span style={{ color: "#ef4444" }}>*</span>
                      </label>
                      <select
                        value={formData.grade}
                        onChange={(e) =>
                          setFormData({ ...formData, grade: e.target.value })
                        }
                        style={{
                          width: "100%",
                          padding: "0.75rem",
                          border: "1px solid #e5e7eb",
                          borderRadius: "0.5rem",
                          fontSize: "0.875rem",
                        }}
                      >
                        <option value="">Select Grade</option>
                        {grades.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: "500",
                        color: "#374151",
                      }}
                    >
                      Description
                    </label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Brief description of the syllabus"
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid #e5e7eb",
                        borderRadius: "0.5rem",
                        fontSize: "0.875rem",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: "500",
                        color: "#374151",
                      }}
                    >
                      Content <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                      }
                      placeholder="Enter the syllabus content. This will be used to generate the video prompt..."
                      rows={5}
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid #e5e7eb",
                        borderRadius: "0.5rem",
                        fontSize: "0.875rem",
                        resize: "vertical",
                      }}
                    />
                  </div>

                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <label style={{ fontWeight: "500", color: "#374151" }}>
                        Topics
                      </label>
                      <button
                        onClick={addTopic}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem",
                          padding: "0.25rem 0.5rem",
                          backgroundColor: "#dbeafe",
                          color: "#1d4ed8",
                          border: "none",
                          borderRadius: "0.25rem",
                          cursor: "pointer",
                          fontSize: "0.75rem",
                        }}
                      >
                        <Plus size={14} />
                        Add Topic
                      </button>
                    </div>
                    {formData.topics.map((topic, index) => (
                      <div
                        key={index}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr auto auto",
                          gap: "0.5rem",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <input
                          type="text"
                          value={topic.topicName}
                          onChange={(e) =>
                            updateTopic(index, "topicName", e.target.value)
                          }
                          placeholder="Topic name"
                          style={{
                            padding: "0.5rem",
                            border: "1px solid #e5e7eb",
                            borderRadius: "0.375rem",
                            fontSize: "0.875rem",
                          }}
                        />
                        <input
                          type="text"
                          value={topic.description}
                          onChange={(e) =>
                            updateTopic(index, "description", e.target.value)
                          }
                          placeholder="Description"
                          style={{
                            padding: "0.5rem",
                            border: "1px solid #e5e7eb",
                            borderRadius: "0.375rem",
                            fontSize: "0.875rem",
                          }}
                        />
                        <input
                          type="text"
                          value={topic.duration}
                          onChange={(e) =>
                            updateTopic(index, "duration", e.target.value)
                          }
                          placeholder="Duration"
                          style={{
                            width: "80px",
                            padding: "0.5rem",
                            border: "1px solid #e5e7eb",
                            borderRadius: "0.375rem",
                            fontSize: "0.875rem",
                          }}
                        />
                        {formData.topics.length > 1 && (
                          <button
                            onClick={() => removeTopic(index)}
                            style={{
                              padding: "0.5rem",
                              backgroundColor: "#fee2e2",
                              border: "none",
                              borderRadius: "0.375rem",
                              cursor: "pointer",
                            }}
                          >
                            <X size={16} color="#ef4444" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quiz Tab Content */}
              {activeTab === "quiz" && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1.5rem",
                  }}
                >
                  {/* AI Generate Quiz Button */}
                  <div
                    style={{
                      backgroundColor: "#eff6ff",
                      padding: "1rem",
                      borderRadius: "0.5rem",
                      border: "1px solid #bfdbfe",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "1rem",
                    }}
                  >
                    <div>
                      <h4
                        style={{
                          marginBottom: "0.25rem",
                          color: "#1e40af",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <Sparkles size={18} />
                        AI Quiz Generator
                      </h4>
                      <p
                        style={{
                          fontSize: "0.875rem",
                          color: "#3b82f6",
                          margin: 0,
                        }}
                      >
                        Automatically generate 10 MCQ questions based on the
                        syllabus content
                      </p>
                    </div>
                    <button
                      onClick={async () => {
                        if (!formData.title || !formData.content) {
                          setError(
                            "Please fill in the title and content first (in Details tab)"
                          );
                          return;
                        }

                        setGeneratingQuiz(true);
                        setError("");

                        try {
                          // If editing existing syllabus, use regenerate API
                          if (showEditModal && selectedSyllabus) {
                            const response = await regenerateQuiz(
                              selectedSyllabus._id
                            );
                            if (response.success && response.data.quiz) {
                              setFormData((prev) => ({
                                ...prev,
                                quiz: response.data.quiz,
                              }));
                              setSuccessMessage(
                                "Quiz generated successfully with AI!"
                              );
                            }
                          } else {
                            // For new syllabus, we'll create it first with quiz generation
                            setSuccessMessage(
                              "Quiz will be auto-generated when you create the syllabus"
                            );
                          }
                        } catch (err) {
                          setError(err.message || "Failed to generate quiz");
                        } finally {
                          setGeneratingQuiz(false);
                        }
                      }}
                      disabled={
                        generatingQuiz || (!showEditModal && !selectedSyllabus)
                      }
                      style={{
                        padding: "0.75rem 1.5rem",
                        backgroundColor: generatingQuiz ? "#93c5fd" : "#3b82f6",
                        color: "white",
                        border: "none",
                        borderRadius: "0.5rem",
                        cursor: generatingQuiz ? "wait" : "pointer",
                        fontWeight: "500",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {generatingQuiz ? (
                        <>
                          <Loader2
                            size={16}
                            className="animate-spin"
                            style={{ animation: "spin 1s linear infinite" }}
                          />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} />
                          Generate with AI
                        </>
                      )}
                    </button>
                  </div>

                  {/* Quiz Settings */}
                  <div
                    style={{
                      backgroundColor: "#f0fdf4",
                      padding: "1rem",
                      borderRadius: "0.5rem",
                      border: "1px solid #bbf7d0",
                    }}
                  >
                    <h4 style={{ marginBottom: "1rem", color: "#166534" }}>
                      Quiz Settings
                    </h4>
                    <div style={{ display: "flex", gap: "1rem" }}>
                      <div style={{ flex: 1 }}>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "0.25rem",
                            fontSize: "0.875rem",
                            color: "#374151",
                          }}
                        >
                          Passing Score (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={formData.quiz.passingScore}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              quiz: {
                                ...prev.quiz,
                                passingScore: parseInt(e.target.value) || 70,
                              },
                            }))
                          }
                          style={{
                            width: "100%",
                            padding: "0.5rem",
                            borderRadius: "0.375rem",
                            border: "1px solid #d1d5db",
                          }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "0.25rem",
                            fontSize: "0.875rem",
                            color: "#374151",
                          }}
                        >
                          Time Limit (minutes)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="60"
                          value={formData.quiz.timeLimit}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              quiz: {
                                ...prev.quiz,
                                timeLimit: parseInt(e.target.value) || 10,
                              },
                            }))
                          }
                          style={{
                            width: "100%",
                            padding: "0.5rem",
                            borderRadius: "0.375rem",
                            border: "1px solid #d1d5db",
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Questions */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1rem",
                    }}
                  >
                    {formData.quiz.questions.map((question, qIndex) => (
                      <div
                        key={qIndex}
                        style={{
                          backgroundColor: "#f9fafb",
                          padding: "1rem",
                          borderRadius: "0.5rem",
                          border: "1px solid #e5e7eb",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "0.75rem",
                          }}
                        >
                          <span
                            style={{
                              fontWeight: "600",
                              color: "#3b82f6",
                              fontSize: "0.875rem",
                            }}
                          >
                            Question {qIndex + 1} of 10
                          </span>
                        </div>

                        {/* Question Text */}
                        <div style={{ marginBottom: "0.75rem" }}>
                          <input
                            type="text"
                            placeholder={`Enter question ${qIndex + 1}...`}
                            value={question.question}
                            onChange={(e) =>
                              updateQuizQuestion(
                                qIndex,
                                "question",
                                e.target.value
                              )
                            }
                            style={{
                              width: "100%",
                              padding: "0.5rem",
                              borderRadius: "0.375rem",
                              border: "1px solid #d1d5db",
                              fontSize: "0.875rem",
                            }}
                          />
                        </div>

                        {/* Options */}
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "0.5rem",
                            marginBottom: "0.75rem",
                          }}
                        >
                          {question.options.map((option, oIndex) => (
                            <div
                              key={oIndex}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                              }}
                            >
                              <input
                                type="radio"
                                name={`correct-${qIndex}`}
                                checked={question.correctAnswer === oIndex}
                                onChange={() =>
                                  updateQuizQuestion(
                                    qIndex,
                                    "correctAnswer",
                                    oIndex
                                  )
                                }
                                style={{ cursor: "pointer" }}
                              />
                              <input
                                type="text"
                                placeholder={`Option ${String.fromCharCode(
                                  65 + oIndex
                                )}`}
                                value={option}
                                onChange={(e) =>
                                  updateQuizOption(
                                    qIndex,
                                    oIndex,
                                    e.target.value
                                  )
                                }
                                style={{
                                  flex: 1,
                                  padding: "0.375rem 0.5rem",
                                  borderRadius: "0.375rem",
                                  border:
                                    question.correctAnswer === oIndex
                                      ? "2px solid #22c55e"
                                      : "1px solid #d1d5db",
                                  backgroundColor:
                                    question.correctAnswer === oIndex
                                      ? "#f0fdf4"
                                      : "white",
                                  fontSize: "0.875rem",
                                }}
                              />
                            </div>
                          ))}
                        </div>

                        {/* Explanation */}
                        <div>
                          <input
                            type="text"
                            placeholder="Explanation (shown after answer)..."
                            value={question.explanation}
                            onChange={(e) =>
                              updateQuizQuestion(
                                qIndex,
                                "explanation",
                                e.target.value
                              )
                            }
                            style={{
                              width: "100%",
                              padding: "0.375rem 0.5rem",
                              borderRadius: "0.375rem",
                              border: "1px solid #d1d5db",
                              fontSize: "0.75rem",
                              color: "#6b7280",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Quiz Validation Message */}
                  <div
                    style={{
                      padding: "0.75rem",
                      backgroundColor: "#dbeafe",
                      borderRadius: "0.5rem",
                      border: "1px solid #93c5fd",
                      fontSize: "0.875rem",
                      color: "#1e40af",
                    }}
                  >
                    🤖 <strong>AI Auto-Generation:</strong> When you create a
                    new syllabus, the quiz will be automatically generated using
                    AI based on your content. You can also click "Generate with
                    AI" to regenerate questions, or manually edit them below.
                  </div>
                </div>
              )}

              <div
                style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}
              >
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setSelectedSyllabus(null);
                    resetForm();
                  }}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    backgroundColor: "#f3f4f6",
                    color: "#374151",
                    border: "none",
                    borderRadius: "0.5rem",
                    cursor: "pointer",
                    fontWeight: "500",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={
                    showCreateModal
                      ? handleCreateSyllabus
                      : handleUpdateSyllabus
                  }
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    backgroundColor: "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: "0.5rem",
                    cursor: "pointer",
                    fontWeight: "500",
                  }}
                >
                  {showCreateModal ? "Create Syllabus" : "Update Syllabus"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Prompt Modal */}
        {showPromptModal && selectedSyllabus && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "1rem",
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "1rem",
                padding: "2rem",
                maxWidth: "600px",
                width: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1.5rem",
                }}
              >
                <h3 style={{ fontSize: "1.25rem", fontWeight: "600" }}>
                  Generated Prompt
                </h3>
                <button
                  onClick={() => {
                    setShowPromptModal(false);
                    setSelectedSyllabus(null);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <X size={24} color="#6b7280" />
                </button>
              </div>

              <div
                style={{
                  padding: "1rem",
                  backgroundColor: "#f3f4f6",
                  borderRadius: "0.5rem",
                  marginBottom: "1.5rem",
                }}
              >
                <p
                  style={{
                    color: "#374151",
                    lineHeight: "1.6",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {selectedSyllabus.generatedPrompt ||
                    'No prompt generated yet. Click "Generate Video" to create a prompt automatically.'}
                </p>
              </div>

              <button
                onClick={() => {
                  setShowPromptModal(false);
                  setSelectedSyllabus(null);
                }}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  backgroundColor: "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: "0.5rem",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Generate Video Modal */}
        {showVideoModal && selectedSyllabus && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "1rem",
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "1rem",
                padding: "2rem",
                maxWidth: "600px",
                width: "100%",
                maxHeight: "90vh",
                overflowY: "auto",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1.5rem",
                }}
              >
                <h3 style={{ fontSize: "1.25rem", fontWeight: "600" }}>
                  <Sparkles
                    size={20}
                    style={{
                      display: "inline",
                      marginRight: "0.5rem",
                      color: "#8b5cf6",
                    }}
                  />
                  Generate Video with AI
                </h3>
                <button
                  onClick={() => {
                    setShowVideoModal(false);
                    setSelectedSyllabus(null);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <X size={24} color="#6b7280" />
                </button>
              </div>

              <div
                style={{
                  padding: "1rem",
                  backgroundColor: "#fef3c7",
                  borderRadius: "0.5rem",
                  marginBottom: "1.5rem",
                  fontSize: "0.875rem",
                  color: "#92400e",
                }}
              >
                <strong>Note:</strong> Video generation typically takes 1-2
                minutes. You can close this modal and the video will continue
                generating in the background.
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: "500",
                      color: "#374151",
                    }}
                  >
                    Prompt (Edit if needed)
                  </label>
                  <textarea
                    value={videoOptions.customPrompt}
                    onChange={(e) =>
                      setVideoOptions({
                        ...videoOptions,
                        customPrompt: e.target.value,
                      })
                    }
                    rows={5}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #e5e7eb",
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem",
                      resize: "vertical",
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "1rem",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: "500",
                        color: "#374151",
                      }}
                    >
                      Duration
                    </label>
                    <select
                      value={videoOptions.duration}
                      onChange={(e) =>
                        setVideoOptions({
                          ...videoOptions,
                          duration: e.target.value,
                        })
                      }
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid #e5e7eb",
                        borderRadius: "0.5rem",
                        fontSize: "0.875rem",
                      }}
                    >
                      <option value="5">5 seconds</option>
                      <option value="10">10 seconds</option>
                    </select>
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: "500",
                        color: "#374151",
                      }}
                    >
                      Aspect Ratio
                    </label>
                    <select
                      value={videoOptions.aspectRatio}
                      onChange={(e) =>
                        setVideoOptions({
                          ...videoOptions,
                          aspectRatio: e.target.value,
                        })
                      }
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid #e5e7eb",
                        borderRadius: "0.5rem",
                        fontSize: "0.875rem",
                      }}
                    >
                      <option value="16:9">16:9 (Landscape)</option>
                      <option value="9:16">9:16 (Portrait)</option>
                      <option value="1:1">1:1 (Square)</option>
                    </select>
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: "500",
                        color: "#374151",
                      }}
                    >
                      Quality Mode
                    </label>
                    <select
                      value={videoOptions.mode}
                      onChange={(e) =>
                        setVideoOptions({
                          ...videoOptions,
                          mode: e.target.value,
                        })
                      }
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid #e5e7eb",
                        borderRadius: "0.5rem",
                        fontSize: "0.875rem",
                      }}
                    >
                      <option value="std">Standard</option>
                      <option value="pro">Professional</option>
                    </select>
                  </div>
                </div>
              </div>

              <div
                style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}
              >
                <button
                  onClick={() => {
                    setShowVideoModal(false);
                    setSelectedSyllabus(null);
                  }}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    backgroundColor: "#f3f4f6",
                    color: "#374151",
                    border: "none",
                    borderRadius: "0.5rem",
                    cursor: "pointer",
                    fontWeight: "500",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleGenerateVideo(selectedSyllabus)}
                  disabled={generatingVideo[selectedSyllabus._id]}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    padding: "0.75rem",
                    backgroundColor: generatingVideo[selectedSyllabus._id]
                      ? "#9ca3af"
                      : "#8b5cf6",
                    color: "white",
                    border: "none",
                    borderRadius: "0.5rem",
                    cursor: generatingVideo[selectedSyllabus._id]
                      ? "not-allowed"
                      : "pointer",
                    fontWeight: "500",
                  }}
                >
                  {generatingVideo[selectedSyllabus._id] ? (
                    <>
                      <Loader size={18} className="animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Generate Video
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default SyllabusVideoGenerator;
