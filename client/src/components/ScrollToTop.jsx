import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const routeTitles = {
  "/": "EcoLearn - Gamified Environmental Education",
  "/features": "Features | EcoLearn",
  "/about": "About Us | EcoLearn",
  "/contact": "Contact Us | EcoLearn",
  "/explore-nature": "Explore Nature | EcoLearn",
  "/get-started": "Get Started | EcoLearn",
  "/login": "Login | EcoLearn",
  "/register": "Register | EcoLearn",
  "/forgot-password": "Reset Password | EcoLearn",
  "/student-dashboard": "Student Dashboard | EcoLearn",
  "/student/games": "Eco Games | EcoLearn",
  "/student/badges": "My Badges | EcoLearn",
  "/student/lessons": "Environmental Lessons | EcoLearn",
  "/environmental-stories": "Environmental Stories | EcoLearn",
  "/student/upload-assignment": "Submit Assignment | EcoLearn",
  "/student/change-password": "Change Password | EcoLearn",
  "/student/ai": "AI Eco Assistant | EcoLearn",
  "/student/profile": "Student Profile | EcoLearn",
  "/student/leaderboard": "Leaderboard | EcoLearn",
  "/student/achievements": "Achievements | EcoLearn",
  "/student/rewards-store": "Rewards Store | EcoLearn",
  "/teacher-dashboard": "Teacher Dashboard | EcoLearn",
  "/teacher/classes": "Class Management | EcoLearn",
  "/teacher/students": "Student Progress | EcoLearn",
  "/teacher/student-management": "Student Management | EcoLearn",
  "/teacher/assignments": "Create Assignment | EcoLearn",
  "/teacher/analytics": "Teacher Analytics | EcoLearn",
  "/teacher/video-generation": "Video Generation | EcoLearn",
  "/admin/dashboard": "Admin Dashboard | EcoLearn",
  "/admin/users": "User Management | EcoLearn",
  "/admin/students": "Manage Students | EcoLearn",
  "/admin/teachers": "Manage Teachers | EcoLearn",
  "/admin/upload-video": "Upload Video | EcoLearn",
  "/admin/ai-videos": "AI Videos | EcoLearn",
  "/admin/syllabus-video": "Syllabus to Video | EcoLearn",
  "/admin/game-management": "Game Management | EcoLearn",
  "/admin/login": "Admin Login | EcoLearn"
};

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top on navigation
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    // Update document title dynamically
    const cleanPath = pathname.split("?")[0];
    const title = routeTitles[cleanPath] || "EcoLearn - Gamified Environmental Education";
    document.title = title;
  }, [pathname]);

  return null;
};

export default ScrollToTop;
