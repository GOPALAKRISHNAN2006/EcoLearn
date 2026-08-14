import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import {
  createVideo,
  getAllVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
  getVideosByGrade,
  submitVideoQuiz,
  awardVideoWatchPoints,
  awardGamePoints,
  generateQuiz,
} from "../controllers/videoLessonController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/videos"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `video-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  // Accept video files only
  const allowedTypes = ["video/mp4", "video/webm", "video/ogg", "video/quicktime", "video/x-msvideo"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only video files are allowed (mp4, webm, ogg, mov, avi)"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
});

const videoLessonRouter = express.Router();

// Upload video file endpoint
videoLessonRouter.post("/upload", upload.single("video"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No video file uploaded",
      });
    }

    const videoUrl = `/uploads/videos/${req.file.filename}`;
    
    res.status(200).json({
      success: true,
      message: "Video uploaded successfully",
      data: {
        videoUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
      },
    });
  } catch (error) {
    console.error("Video upload error:", error);
    res.status(500).json({
      success: false,
      message: "Error uploading video",
      error: error.message,
    });
  }
});

// Admin routes
videoLessonRouter.post("/generate-quiz", generateQuiz);
videoLessonRouter.post("/", createVideo);
videoLessonRouter.get("/", getAllVideos);
videoLessonRouter.get("/:id", getVideoById);
videoLessonRouter.put("/:id", updateVideo);
videoLessonRouter.delete("/:id", deleteVideo);

// Student routes
videoLessonRouter.get("/grade/:grade", getVideosByGrade);
videoLessonRouter.post("/:id/quiz/submit", submitVideoQuiz);
videoLessonRouter.post("/:id/watch-points", awardVideoWatchPoints);
videoLessonRouter.post("/:id/game-points", awardGamePoints);

export default videoLessonRouter;
