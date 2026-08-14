import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../../components/admin/AdminNavbar";
import {
  Video,
  Plus,
  Edit,
  Trash2,
  Play,
  X,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  Gamepad2,
  Save,
  Upload,
  Sparkles,
} from "lucide-react";
import {
  createVideoLesson,
  getAllVideoLessons,
  updateVideoLesson,
  deleteVideoLesson,
  uploadVideoFile,
  generateVideoQuiz,
} from "../../services/videoLessonService";

const VideoUpload = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // File upload states
  const [videoFile, setVideoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    subject: "Environmental Science",
    grade: "Grade 1",
    description: "",
    videoUrl: "",
    thumbnailUrl: "",
    duration: 0,
    videoType: "uploaded",
    gameType: "snake-ladder",
    watchPoints: 10,
    quizPoints: 20,
    gamePoints: 15,
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

  const gameTypes = [
    { value: "snake-ladder", label: "Snake & Ladder" },
    { value: "eco-ninja", label: "Eco Ninja" },
    { value: "word-search", label: "Word Search" },
    { value: "eco-puzzle", label: "Eco Puzzle" },
    { value: "none", label: "No Game" },
  ];

  useEffect(() => {
    const adminData = localStorage.getItem("admin");
    if (!adminData) {
      navigate("/admin/login");
      return;
    }
    fetchVideos();
  }, [navigate]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await getAllVideoLessons();
      if (response.success) {
        setVideos(response.data);
      }
    } catch (err) {
      setError("Failed to fetch videos");
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
      videoUrl: "",
      thumbnailUrl: "",
      duration: 0,
      videoType: "external",
      gameType: "snake-ladder",
      watchPoints: 10,
      quizPoints: 20,
      gamePoints: 15,
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
    setVideoFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle video file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if it's a video file
      if (!file.type.startsWith("video/")) {
        setError("Please select a video file (mp4, webm, ogg, mov, avi)");
        return;
      }
      // Check file size (500MB limit)
      if (file.size > 500 * 1024 * 1024) {
        setError("Video file size must be less than 500MB");
        return;
      }
      setVideoFile(file);
      setError("");
    }
  };

  // Upload video file to server
  const handleVideoUpload = async () => {
    if (!videoFile) {
      setError("Please select a video file first");
      return;
    }

    try {
      setUploading(true);
      setError("");
      
      const response = await uploadVideoFile(videoFile, (progress) => {
        setUploadProgress(progress);
      });

      if (response.success) {
        setFormData({ ...formData, videoUrl: response.data.videoUrl });
        setSuccessMessage("Video uploaded successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      setError(err.message || "Failed to upload video");
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");

      // Check if video is uploaded
      if (!formData.videoUrl) {
        setError("Please upload a video file first");
        setSaving(false);
        return;
      }

      // Check if title is provided
      if (!formData.title.trim()) {
        setError("Please enter a video title");
        setSaving(false);
        return;
      }

      // Auto-generate quiz using AI
      setSuccessMessage("Generating quiz questions using AI...");
      let generatedQuiz = { questions: [], passingScore: 70, timeLimit: 600 };
      
      try {
        const quizResponse = await generateVideoQuiz(
          formData.title,
          formData.description,
          formData.subject,
          formData.grade
        );
        
        if (quizResponse.success && quizResponse.data) {
          generatedQuiz = quizResponse.data;
          setSuccessMessage("Quiz generated! Creating video lesson...");
        }
      } catch (quizErr) {
        console.error("Quiz generation failed:", quizErr);
        // Continue without quiz if generation fails
        setSuccessMessage("Creating video lesson without quiz...");
      }

      const response = await createVideoLesson({
        ...formData,
        quiz: generatedQuiz,
      });

      if (response.success) {
        setSuccessMessage("Video lesson created successfully with auto-generated quiz!");
        setShowCreateModal(false);
        resetForm();
        fetchVideos();
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      setError(err.message || "Failed to create video lesson");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedVideo) return;

    try {
      setSaving(true);
      setError("");

      // Filter out empty quiz questions
      const filteredQuiz = {
        ...formData.quiz,
        questions: formData.quiz.questions.filter(
          (q) => q.question.trim() !== ""
        ),
      };

      const response = await updateVideoLesson(selectedVideo._id, {
        ...formData,
        quiz: filteredQuiz,
      });

      if (response.success) {
        setSuccessMessage("Video lesson updated successfully!");
        setShowEditModal(false);
        setSelectedVideo(null);
        resetForm();
        fetchVideos();
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      setError(err.message || "Failed to update video lesson");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this video lesson?"))
      return;

    try {
      const response = await deleteVideoLesson(id);
      if (response.success) {
        setSuccessMessage("Video lesson deleted successfully!");
        fetchVideos();
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      setError(err.message || "Failed to delete video lesson");
    }
  };

  const openEditModal = (video) => {
    setSelectedVideo(video);
    setFormData({
      title: video.title || "",
      subject: video.subject || "Environmental Science",
      grade: video.grade || "Grade 1",
      description: video.description || "",
      videoUrl: video.videoUrl || "",
      thumbnailUrl: video.thumbnailUrl || "",
      duration: video.duration || 0,
      videoType: video.videoType || "external",
      gameType: video.gameType || "snake-ladder",
      watchPoints: video.watchPoints || 10,
      quizPoints: video.quizPoints || 20,
      gamePoints: video.gamePoints || 15,
      quiz: video.quiz || {
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
    // Ensure we have 10 questions slots
    if (formData.quiz.questions.length < 10) {
      const remaining = 10 - formData.quiz.questions.length;
      for (let i = 0; i < remaining; i++) {
        formData.quiz.questions.push({
          question: "",
          options: ["", "", "", ""],
          correctAnswer: 0,
          explanation: "",
        });
      }
    }
    setShowEditModal(true);
  };

  // Styles
  const cardStyle = {
    backgroundColor: "white",
    borderRadius: "1rem",
    padding: "1.5rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  };

  const inputStyle = {
    width: "100%",
    padding: "0.75rem",
    borderRadius: "0.5rem",
    border: "1px solid #e5e7eb",
    fontSize: "0.875rem",
    outline: "none",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "0.5rem",
    fontWeight: "500",
    color: "#374151",
    fontSize: "0.875rem",
  };

  const buttonStyle = {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.75rem 1.5rem",
    borderRadius: "0.5rem",
    fontWeight: "500",
    cursor: "pointer",
    border: "none",
    transition: "all 0.2s",
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f3f4f6" }}>
      <AdminNavbar />

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "2rem 1rem" }}>
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
              📹 Upload Video Lessons
            </h1>
            <p style={{ color: "#6b7280" }}>
              Create video lessons with quizzes and games for students
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            style={{
              ...buttonStyle,
              backgroundColor: "#10b981",
              color: "white",
            }}
          >
            <Plus size={20} />
            Add New Video
          </button>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div
            style={{
              padding: "1rem",
              backgroundColor: "#d1fae5",
              color: "#065f46",
              borderRadius: "0.5rem",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <CheckCircle size={20} />
            {successMessage}
          </div>
        )}

        {error && (
          <div
            style={{
              padding: "1rem",
              backgroundColor: "#fee2e2",
              color: "#dc2626",
              borderRadius: "0.5rem",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <AlertCircle size={20} />
            {error}
            <button
              onClick={() => setError("")}
              style={{
                marginLeft: "auto",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Videos Grid */}
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "4rem",
            }}
          >
            <Loader2 className="animate-spin" size={40} color="#10b981" />
          </div>
        ) : videos.length === 0 ? (
          <div style={{ ...cardStyle, textAlign: "center", padding: "4rem" }}>
            <Video
              size={60}
              color="#9ca3af"
              style={{ margin: "0 auto 1rem" }}
            />
            <h3 style={{ fontSize: "1.25rem", color: "#374151", marginBottom: "0.5rem" }}>
              No Video Lessons Yet
            </h3>
            <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
              Create your first video lesson to get started
            </p>
            <button
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
              style={{
                ...buttonStyle,
                backgroundColor: "#10b981",
                color: "white",
                margin: "0 auto",
              }}
            >
              <Plus size={20} />
              Create Video Lesson
            </button>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {videos.map((video) => (
              <div key={video._id} style={cardStyle}>
                {/* Video Thumbnail */}
                <div
                  style={{
                    position: "relative",
                    borderRadius: "0.75rem",
                    overflow: "hidden",
                    marginBottom: "1rem",
                    backgroundColor: "#1f2937",
                    aspectRatio: "16/9",
                  }}
                >
                  {video.thumbnailUrl ? (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Video size={40} color="#6b7280" />
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setSelectedVideo(video);
                      setShowVideoModal(true);
                    }}
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: "50px",
                      height: "50px",
                      borderRadius: "50%",
                      backgroundColor: "rgba(16, 185, 129, 0.9)",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Play size={24} color="white" fill="white" />
                  </button>
                </div>

                {/* Video Info */}
                <h3
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: "600",
                    color: "#1f2937",
                    marginBottom: "0.5rem",
                  }}
                >
                  {video.title}
                </h3>

                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    flexWrap: "wrap",
                    marginBottom: "1rem",
                  }}
                >
                  <span
                    style={{
                      padding: "0.25rem 0.75rem",
                      backgroundColor: "#dbeafe",
                      color: "#1d4ed8",
                      borderRadius: "9999px",
                      fontSize: "0.75rem",
                      fontWeight: "500",
                    }}
                  >
                    {video.grade}
                  </span>
                  <span
                    style={{
                      padding: "0.25rem 0.75rem",
                      backgroundColor: "#d1fae5",
                      color: "#065f46",
                      borderRadius: "9999px",
                      fontSize: "0.75rem",
                      fontWeight: "500",
                    }}
                  >
                    {video.subject}
                  </span>
                  {video.quiz?.questions?.length > 0 && (
                    <span
                      style={{
                        padding: "0.25rem 0.75rem",
                        backgroundColor: "#fef3c7",
                        color: "#d97706",
                        borderRadius: "9999px",
                        fontSize: "0.75rem",
                        fontWeight: "500",
                      }}
                    >
                      📝 {video.quiz.questions.length} Questions
                    </span>
                  )}
                  {video.gameType !== "none" && (
                    <span
                      style={{
                        padding: "0.25rem 0.75rem",
                        backgroundColor: "#ede9fe",
                        color: "#7c3aed",
                        borderRadius: "9999px",
                        fontSize: "0.75rem",
                        fontWeight: "500",
                      }}
                    >
                      🎮 {gameTypes.find((g) => g.value === video.gameType)?.label}
                    </span>
                  )}
                </div>

                {video.description && (
                  <p
                    style={{
                      color: "#6b7280",
                      fontSize: "0.875rem",
                      marginBottom: "1rem",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {video.description}
                  </p>
                )}

                {/* Actions */}
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    onClick={() => openEditModal(video)}
                    style={{
                      ...buttonStyle,
                      flex: 1,
                      justifyContent: "center",
                      backgroundColor: "#3b82f6",
                      color: "white",
                      padding: "0.5rem",
                    }}
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(video._id)}
                    style={{
                      ...buttonStyle,
                      backgroundColor: "#fee2e2",
                      color: "#dc2626",
                      padding: "0.5rem",
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
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
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 50,
              padding: "1rem",
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "1rem",
                width: "100%",
                maxWidth: "900px",
                maxHeight: "90vh",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Modal Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "1.5rem",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                <h2 style={{ fontSize: "1.25rem", fontWeight: "600" }}>
                  {showEditModal ? "Edit Video Lesson" : "Create New Video Lesson"}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setSelectedVideo(null);
                    resetForm();
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "0.5rem",
                  }}
                >
                  <X size={24} color="#6b7280" />
                </button>
              </div>

              {/* Modal Body - No tabs, just video details */}
              <form
                onSubmit={showEditModal ? handleUpdate : handleCreate}
                style={{
                  flex: 1,
                  overflow: "auto",
                  padding: "1.5rem",
                }}
              >
                {/* AI Quiz Generation Info */}
                <div
                  style={{
                    backgroundColor: "#f0fdf4",
                    border: "1px solid #bbf7d0",
                    borderRadius: "0.75rem",
                    padding: "1rem",
                    marginBottom: "1.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <Sparkles size={24} style={{ color: "#16a34a" }} />
                  <div>
                    <p style={{ margin: 0, color: "#166534", fontWeight: "500" }}>
                      Quiz Auto-Generation Enabled
                    </p>
                    <p style={{ margin: 0, color: "#15803d", fontSize: "0.875rem" }}>
                      A 10-question quiz will be automatically generated based on your video title and description using AI.
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "1rem",
                    }}
                  >
                    {/* Title */}
                    <div style={{ gridColumn: "span 2" }}>
                      <label style={labelStyle}>Video Title *</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        placeholder="Enter video title"
                        required
                        style={inputStyle}
                      />
                    </div>

                    {/* Subject */}
                    <div>
                      <label style={labelStyle}>Subject *</label>
                      <select
                        value={formData.subject}
                        onChange={(e) =>
                          setFormData({ ...formData, subject: e.target.value })
                        }
                        style={inputStyle}
                      >
                        {subjects.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Grade */}
                    <div>
                      <label style={labelStyle}>Grade *</label>
                      <select
                        value={formData.grade}
                        onChange={(e) =>
                          setFormData({ ...formData, grade: e.target.value })
                        }
                        style={inputStyle}
                      >
                        {grades.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Video File Upload */}
                    <div style={{ gridColumn: "span 2" }}>
                      <label style={labelStyle}>Upload Video *</label>
                      <div
                        style={{
                          border: "2px dashed #d1d5db",
                          borderRadius: "0.5rem",
                          padding: "1.5rem",
                          backgroundColor: formData.videoUrl ? "#f0fdf4" : "#f9fafb",
                          textAlign: "center",
                        }}
                      >
                        {formData.videoUrl ? (
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                            <CheckCircle size={32} style={{ color: "#16a34a" }} />
                            <p style={{ color: "#16a34a", fontWeight: "500" }}>Video uploaded successfully!</p>
                            <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>{formData.videoUrl}</p>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, videoUrl: "" });
                                setVideoFile(null);
                                if (fileInputRef.current) {
                                  fileInputRef.current.value = "";
                                }
                              }}
                              style={{
                                ...buttonStyle,
                                backgroundColor: "#fee2e2",
                                color: "#dc2626",
                                marginTop: "0.5rem",
                              }}
                            >
                              <X size={16} /> Remove Video
                            </button>
                          </div>
                        ) : (
                          <>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo"
                              onChange={handleFileSelect}
                              style={{ display: "none" }}
                              id="video-file-input"
                            />
                            {!videoFile ? (
                              <>
                                <Upload size={40} style={{ color: "#9ca3af", margin: "0 auto" }} />
                                <p style={{ color: "#6b7280", marginTop: "0.5rem" }}>
                                  Select a video file to upload
                                </p>
                                <p style={{ color: "#9ca3af", fontSize: "0.75rem" }}>
                                  Supported formats: MP4, WebM, OGG, MOV, AVI (Max 500MB)
                                </p>
                                <button
                                  type="button"
                                  onClick={() => fileInputRef.current?.click()}
                                  style={{
                                    ...buttonStyle,
                                    backgroundColor: "#10b981",
                                    color: "white",
                                    margin: "1rem auto 0",
                                  }}
                                >
                                  <Plus size={16} /> Select Video
                                </button>
                              </>
                            ) : (
                              <>
                                <Video size={40} style={{ color: "#10b981", margin: "0 auto" }} />
                                <p style={{ color: "#374151", marginTop: "0.5rem", fontWeight: "500" }}>
                                  {videoFile.name}
                                </p>
                                <p style={{ color: "#6b7280", fontSize: "0.75rem" }}>
                                  Size: {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                                </p>
                                {uploading && (
                                  <div style={{ marginTop: "1rem", width: "100%" }}>
                                    <div
                                      style={{
                                        width: "100%",
                                        height: "8px",
                                        backgroundColor: "#e5e7eb",
                                        borderRadius: "4px",
                                        overflow: "hidden",
                                      }}
                                    >
                                      <div
                                        style={{
                                          width: `${uploadProgress}%`,
                                          height: "100%",
                                          backgroundColor: "#10b981",
                                          transition: "width 0.3s ease",
                                        }}
                                      />
                                    </div>
                                    <p style={{ color: "#6b7280", fontSize: "0.75rem", marginTop: "0.5rem" }}>
                                      Uploading: {uploadProgress}%
                                    </p>
                                  </div>
                                )}
                                <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginTop: "1rem" }}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setVideoFile(null);
                                      if (fileInputRef.current) {
                                        fileInputRef.current.value = "";
                                      }
                                    }}
                                    style={{
                                      ...buttonStyle,
                                      backgroundColor: "#fee2e2",
                                      color: "#dc2626",
                                    }}
                                  >
                                    <X size={16} /> Cancel
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleVideoUpload}
                                    disabled={uploading}
                                    style={{
                                      ...buttonStyle,
                                      backgroundColor: uploading ? "#9ca3af" : "#10b981",
                                      color: "white",
                                    }}
                                  >
                                    {uploading ? (
                                      <>
                                        <Loader2 size={16} className="animate-spin" /> Uploading...
                                      </>
                                    ) : (
                                      <>
                                        <Upload size={16} /> Upload Video
                                      </>
                                    )}
                                  </button>
                                </div>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Thumbnail URL */}
                    <div style={{ gridColumn: "span 2" }}>
                      <label style={labelStyle}>Thumbnail URL (Optional)</label>
                      <input
                        type="url"
                        value={formData.thumbnailUrl}
                        onChange={(e) =>
                          setFormData({ ...formData, thumbnailUrl: e.target.value })
                        }
                        placeholder="https://example.com/thumbnail.jpg"
                        style={inputStyle}
                      />
                    </div>

                    {/* Description */}
                    <div style={{ gridColumn: "span 2" }}>
                      <label style={labelStyle}>Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        placeholder="Enter video description"
                        rows={3}
                        style={{ ...inputStyle, resize: "vertical" }}
                      />
                    </div>

                    {/* Game Type */}
                    <div>
                      <label style={labelStyle}>
                        <Gamepad2
                          size={16}
                          style={{ display: "inline", marginRight: "0.5rem" }}
                        />
                        Game After Video
                      </label>
                      <select
                        value={formData.gameType}
                        onChange={(e) =>
                          setFormData({ ...formData, gameType: e.target.value })
                        }
                        style={inputStyle}
                      >
                        {gameTypes.map((g) => (
                          <option key={g.value} value={g.value}>
                            {g.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Video Type */}
                    <div>
                      <label style={labelStyle}>Video Type</label>
                      <select
                        value={formData.videoType}
                        onChange={(e) =>
                          setFormData({ ...formData, videoType: e.target.value })
                        }
                        style={inputStyle}
                      >
                        <option value="external">External URL</option>
                        <option value="youtube">YouTube</option>
                        <option value="upload">Uploaded</option>
                      </select>
                    </div>

                    {/* Points */}
                    <div>
                      <label style={labelStyle}>Watch Points</label>
                      <input
                        type="number"
                        value={formData.watchPoints}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            watchPoints: parseInt(e.target.value) || 0,
                          })
                        }
                        min={0}
                        style={inputStyle}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Game Points</label>
                      <input
                        type="number"
                        value={formData.gamePoints}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            gamePoints: parseInt(e.target.value) || 0,
                          })
                        }
                        min={0}
                        style={inputStyle}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Quiz Points</label>
                      <input
                        type="number"
                        value={formData.quizPoints}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            quizPoints: parseInt(e.target.value) || 0,
                          })
                        }
                        min={0}
                        style={inputStyle}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Passing Score (%)</label>
                      <input
                        type="number"
                        value={formData.quiz.passingScore}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            quiz: {
                              ...formData.quiz,
                              passingScore: parseInt(e.target.value) || 70,
                            },
                          })
                        }
                        min={0}
                        max={100}
                        style={inputStyle}
                      />
                    </div>
                  </div>
              </form>

              {/* Modal Footer */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "1rem",
                  padding: "1.5rem",
                  borderTop: "1px solid #e5e7eb",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setSelectedVideo(null);
                    resetForm();
                  }}
                  style={{
                    ...buttonStyle,
                    backgroundColor: "#f3f4f6",
                    color: "#374151",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={showEditModal ? handleUpdate : handleCreate}
                  disabled={saving}
                  style={{
                    ...buttonStyle,
                    backgroundColor: "#10b981",
                    color: "white",
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  {saving ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Save size={16} />
                  )}
                  {showEditModal ? "Update Video" : "Create Video"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Video Preview Modal */}
        {showVideoModal && selectedVideo && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 50,
              padding: "1rem",
            }}
          >
            <div
              style={{
                backgroundColor: "#1f2937",
                borderRadius: "1rem",
                width: "100%",
                maxWidth: "900px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "1rem",
                  borderBottom: "1px solid #374151",
                }}
              >
                <h3 style={{ color: "white", fontWeight: "600" }}>
                  {selectedVideo.title}
                </h3>
                <button
                  onClick={() => {
                    setShowVideoModal(false);
                    setSelectedVideo(null);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "0.5rem",
                  }}
                >
                  <X size={24} color="white" />
                </button>
              </div>
              <div style={{ aspectRatio: "16/9" }}>
                <video
                  src={selectedVideo.videoUrl}
                  controls
                  autoPlay
                  style={{ width: "100%", height: "100%" }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoUpload;
