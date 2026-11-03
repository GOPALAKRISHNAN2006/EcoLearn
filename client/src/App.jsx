import { lazy, Suspense } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { withGameCompletion } from "./components/GameCompletionWrapper";

// Lazy-load pages and dashboards
const Index = lazy(() => import("./pages/Index"));
const Features = lazy(() => import("./pages/Features"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ExploreNature = lazy(() => import("./pages/ExploreNature"));
const GetStarted = lazy(() => import("./pages/GetStarted"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const StudentDashboard = lazy(() => import("./pages/StudentDashboard"));
const TeacherDashboard = lazy(() => import("./pages/TeacherDashboard"));
const Games = lazy(() => import("./pages/student/Games"));
const Lessons = lazy(() => import("./pages/student/Lessons"));
const EnvironmentalStories = lazy(() => import("./pages/student/EnvironmentalStories"));
const AI = lazy(() => import("./pages/student/AI"));
const Profile = lazy(() => import("./pages/student/Profile"));
const Leaderboard = lazy(() => import("./pages/student/Leaderboard"));
const Achievements = lazy(() => import("./pages/student/Achievements"));
const Badges = lazy(() => import("./pages/student/Badges"));
const UploadAssignment = lazy(() => import("./pages/student/UploadAssignment"));
const ChangePassword = lazy(() => import("./pages/student/ChangePassword"));
const RewardsStore = lazy(() => import("./pages/student/RewardsStore"));
const AIAssignmentVerification = lazy(() => import("./pages/student/AIAssignmentVerification"));
const SaveTheTreesGame = lazy(() => import("./pages/student/SaveTheTreesGame"));
const EcoQuestAdventure = lazy(() => import("./pages/student/EcoQuestAdventure"));
const OceanCleanupHero = lazy(() => import("./pages/student/OceanCleanupHero"));
const SolarPowerMaster = lazy(() => import("./pages/student/SolarPowerMaster"));
const RecyclingWizard = lazy(() => import("./pages/student/RecyclingWizard"));

// Climate Games
const EcoNinjaGame = lazy(() => import("./games/EcoNinjaGame"));
const EcoRunnerDash = lazy(() => import("./games/EcoRunnerDash"));
const EcoSnakeLadders = lazy(() => import("./games/EcoSnakeLadders"));
const EvEcoPuzzleGame = lazy(() => import("./games/EvEcoPuzzleGame"));
const EvWordSearchGame = lazy(() => import("./games/EvWordSearchGame"));
const NatureNinjasGame = lazy(() => import("./games/NatureNinjasGame"));
const NetZeroQuestGame = lazy(() => import("./games/NetZeroQuestGame"));

// Wrap games with completion tracking
const EcoNinja = withGameCompletion(EcoNinjaGame, 'eco-ninja', 'Eco Ninja', 50);
const EcoRunner = withGameCompletion(EcoRunnerDash, 'eco-runner', 'Eco Runner Dash', 75);
const EcoSnakes = withGameCompletion(EcoSnakeLadders, 'eco-snakes-ladders', 'Eco Snake & Ladders', 60);
const EcoPuzzle = withGameCompletion(EvEcoPuzzleGame, 'eco-puzzle', 'Eco Puzzle', 70);
const WordSearch = withGameCompletion(EvWordSearchGame, 'word-search', 'Word Search', 40);
const NatureNinjas = withGameCompletion(NatureNinjasGame, 'nature-ninjas', 'Nature Ninjas', 100);
const NetZeroQuest = withGameCompletion(NetZeroQuestGame, 'net-zero-quest', 'Net Zero Quest', 120);

const WindFarmEngineer = lazy(() => import("./pages/student/WindFarmEngineer"));
const MountainRanger = lazy(() => import("./pages/student/MountainRanger"));
const AquaticLifeGuardian = lazy(() => import("./pages/student/AquaticLifeGuardian"));
const GlobalWeatherDetective = lazy(() => import("./pages/student/GlobalWeatherDetective"));
const ElectricVehicleCity = lazy(() => import("./pages/student/ElectricVehicleCity"));
const EcoLab = lazy(() => import("./pages/student/EcoLab"));

const ClassManagement = lazy(() => import("./pages/teacher/ClassManagement"));
const StudentProgressTracking = lazy(() => import("./pages/teacher/StudentProgressTracking"));
const AssignmentCreation = lazy(() => import("./pages/teacher/AssignmentCreation"));
const AssignmentReview = lazy(() => import("./pages/teacher/AssignmentReview"));
const TeacherAnalytics = lazy(() => import("./pages/teacher/TeacherAnalytics"));
const StudentManagement = lazy(() => import("./pages/teacher/StudentManagement"));
const AssignmentSubmissions = lazy(() => import("./pages/teacher/AssignmentSubmissions"));
const VideoGeneration = lazy(() => import("./pages/teacher/VideoGeneration"));
const StudentDetails = lazy(() => import("./pages/teacher/StudentDetails"));

// Admin module imports
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const UserManagement = lazy(() => import("./pages/admin/UserManagement"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const ManageStudents = lazy(() => import("./pages/admin/ManageStudents"));
const ManageTeachers = lazy(() => import("./pages/admin/ManageTeachers"));
const AIVideos = lazy(() => import("./pages/admin/AIVideos"));
const SyllabusVideoGenerator = lazy(() => import("./pages/admin/SyllabusVideoGenerator"));
const GameManagement = lazy(() => import("./pages/admin/GameManagement"));
const VideoUpload = lazy(() => import("./pages/admin/VideoUpload"));

const queryClient = new QueryClient();

// Premium, beautiful themed glassmorphism loading animation fallback
const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white font-sans">
    <div className="relative w-24 h-24 flex items-center justify-center">
      {/* Outer spinning ring */}
      <div className="absolute inset-0 rounded-full border-4 border-t-emerald-500 border-r-transparent border-b-teal-500 border-l-transparent animate-spin"></div>
      {/* Middle pulsing ring */}
      <div className="absolute w-16 h-16 rounded-full border-2 border-emerald-400 opacity-50 animate-ping"></div>
      {/* Inner glowing leaf icon circle */}
      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-[0_0_15px_rgba(16,185,129,0.5)] flex items-center justify-center">
        <svg className="w-5 h-5 text-slate-900 fill-current animate-pulse" viewBox="0 0 24 24">
          <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L7,18C12,19 18,17 22,12C22,12 14.5,12 17,8M12,2C12,2 6,4 4,11C4,11 11,8 12,2Z" />
        </svg>
      </div>
    </div>
    <h2 className="mt-8 text-xl font-bold tracking-wider text-emerald-400 animate-pulse">EcoLearn</h2>
    <p className="mt-2 text-sm text-slate-400 font-medium">Nurturing the green minds of tomorrow...</p>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public and Static Pages */}
            <Route path="/" element={<Index />} />
            <Route path="/features" element={<Features />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/explore-nature" element={<ExploreNature />} />
            <Route path="/get-started" element={<GetStarted />} />
            <Route path="/login" element={<Login />} />
            <Route path="/login/student" element={<Login />} />
            <Route path="/login/teacher" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/environmental-stories" element={<EnvironmentalStories />} />
            <Route path="/stories" element={<Navigate to="/environmental-stories" replace />} />
            <Route path="/lessons" element={<Lessons />} />

            {/* Role-based Dashboard and General Redirects */}
            <Route path="/dashboard" element={<Navigate to="/student-dashboard" replace />} />
            <Route path="/student" element={<Navigate to="/student-dashboard" replace />} />
            <Route path="/teacher" element={<Navigate to="/teacher-dashboard" replace />} />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/games" element={<Navigate to="/student/games" replace />} />
            <Route path="/badges" element={<Navigate to="/student/badges" replace />} />
            <Route path="/profile" element={<Navigate to="/student/profile" replace />} />
            <Route path="/leaderboard" element={<Navigate to="/student/leaderboard" replace />} />
            <Route path="/achievements" element={<Navigate to="/student/achievements" replace />} />
            <Route path="/upload" element={<Navigate to="/student/upload-assignment" replace />} />

            {/* Student Portal Pages */}
            <Route path="/student-dashboard" element={<StudentDashboard />} />
            <Route path="/student/games" element={<Games />} />
            <Route path="/student/badges" element={<Badges />} />
            <Route path="/student/lessons" element={<Lessons />} />
            <Route
              path="/student/upload-assignment"
              element={<UploadAssignment />}
            />
            <Route
              path="/student/upload-assignment/:assignmentId"
              element={<UploadAssignment />}
            />
            <Route
              path="/assignment/:assignmentId"
              element={<UploadAssignment />}
            />
            <Route path="/student/change-password" element={<ChangePassword />} />
            <Route path="/student/ai" element={<AI />} />
            <Route path="/student/ai-verification" element={<AIAssignmentVerification />} />
            <Route path="/student/verify-assignment" element={<AIAssignmentVerification />} />
            <Route path="/student/profile" element={<Profile />} />
            <Route path="/student/leaderboard" element={<Leaderboard />} />
            <Route path="/student/achievements" element={<Achievements />} />
            <Route path="/student/rewards-store" element={<RewardsStore />} />
            <Route
              path="/student/save-the-trees"
              element={<SaveTheTreesGame />}
            />
            <Route
              path="/student/ecoquest-adventure"
              element={<EcoQuestAdventure />}
            />
            <Route
              path="/student/ocean-cleanup-hero"
              element={<OceanCleanupHero />}
            />
            <Route
              path="/student/solar-power-master"
              element={<SolarPowerMaster />}
            />
            <Route
              path="/student/recycling-wizard"
              element={<RecyclingWizard />}
            />
            <Route
              path="/student/wind-farm-engineer"
              element={<WindFarmEngineer />}
            />
            <Route path="/student/mountain-ranger" element={<MountainRanger />} />
            <Route
              path="/student/aquatic-life-guardian"
              element={<AquaticLifeGuardian />}
            />
            <Route
              path="/student/global-weather-detective"
              element={<GlobalWeatherDetective />}
            />
            <Route
              path="/student/electric-vehicle-city"
              element={<ElectricVehicleCity />}
            />
            <Route path="/student/eco-lab" element={<EcoLab />} />
            <Route path="/student/green-chemistry-lab" element={<EcoLab />} />
            <Route path="/student/arctic-rescue-mission" element={<GlobalWeatherDetective />} />
            <Route path="/student/pollinator-paradise" element={<NatureNinjas />} />
            <Route path="/student/ecosystem-food-web" element={<EcoQuestAdventure />} />
            <Route path="/student/carbon-footprint-hunter" element={<NetZeroQuest />} />
            
            {/* Climate Games Routes and Aliases */}
            <Route path="/student/games/eco-ninja" element={<EcoNinja />} />
            <Route path="/student/games/eco-runner" element={<EcoRunner />} />
            <Route path="/student/games/eco-snakes-ladders" element={<EcoSnakes />} />
            <Route path="/student/games/eco-puzzle" element={<EcoPuzzle />} />
            <Route path="/student/games/word-search" element={<WordSearch />} />
            <Route path="/student/games/nature-ninjas" element={<NatureNinjas />} />
            <Route path="/student/games/net-zero-quest" element={<NetZeroQuest />} />
            <Route path="/student/games/save-the-trees" element={<SaveTheTreesGame />} />
            <Route path="/student/games/ecoquest-adventure" element={<EcoQuestAdventure />} />
            <Route path="/student/games/ocean-cleanup-hero" element={<OceanCleanupHero />} />
            <Route path="/student/games/solar-power-master" element={<SolarPowerMaster />} />
            <Route path="/student/games/recycling-wizard" element={<RecyclingWizard />} />
            <Route path="/student/games/wind-farm-engineer" element={<WindFarmEngineer />} />
            <Route path="/student/games/mountain-ranger" element={<MountainRanger />} />
            <Route path="/student/games/aquatic-life-guardian" element={<AquaticLifeGuardian />} />
            <Route path="/student/games/global-weather-detective" element={<GlobalWeatherDetective />} />
            <Route path="/student/games/electric-vehicle-city" element={<ElectricVehicleCity />} />
            <Route path="/student/games/eco-lab" element={<EcoLab />} />
            <Route path="/student/games/green-chemistry-lab" element={<EcoLab />} />
            <Route path="/student/games/arctic-rescue-mission" element={<GlobalWeatherDetective />} />
            <Route path="/student/games/pollinator-paradise" element={<NatureNinjas />} />
            <Route path="/student/games/ecosystem-food-web" element={<EcoQuestAdventure />} />
            <Route path="/student/games/carbon-footprint-hunter" element={<NetZeroQuest />} />
            
            {/* Teacher Portal Pages */}
            <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher/classes" element={<ClassManagement />} />
            <Route
              path="/teacher/students"
              element={<StudentProgressTracking />}
            />
            <Route
              path="/teacher/student-management"
              element={<StudentManagement />}
            />
            <Route
              path="/teacher/student/:studentId"
              element={<StudentDetails />}
            />
            <Route path="/teacher/assignments" element={<AssignmentCreation />} />
            <Route
              path="/teacher/assignments/edit/:assignmentId"
              element={<AssignmentCreation />}
            />
            <Route path="/teacher/assignment-review" element={<AssignmentReview />} />
            <Route path="/teacher/assignments/review" element={<AssignmentReview />} />
            <Route path="/teacher/analytics" element={<TeacherAnalytics />} />
            <Route
              path="/teacher/video-generation"
              element={<VideoGeneration />}
            />
            <Route
              path="/teacher/assignment/:assignmentId/submissions"
              element={<AssignmentSubmissions />}
            />

            {/* Admin Portal Pages */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/login/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/students" element={<ManageStudents />} />
            <Route path="/admin/teachers" element={<ManageTeachers />} />
            <Route path="/admin/upload-video" element={<VideoUpload />} />
            <Route path="/admin/ai-videos" element={<AIVideos />} />
            <Route
              path="/admin/syllabus-video"
              element={<SyllabusVideoGenerator />}
            />
            <Route path="/admin/game-management" element={<GameManagement />} />
            <Route path="/admin/analytics" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/moderation" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/settings" element={<Navigate to="/admin/dashboard" replace />} />

            {/* Fallback 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);
export default App;