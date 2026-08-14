import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Features from "./pages/Features";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import ExploreNature from "./pages/ExploreNature";
import GetStarted from "./pages/GetStarted";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import Games from "./pages/student/Games";
import Lessons from "./pages/student/Lessons";
import EnvironmentalStories from "./pages/student/EnvironmentalStories";
import AI from "./pages/student/AI";
import Profile from "./pages/student/Profile";
import Leaderboard from "./pages/student/Leaderboard";
import Achievements from "./pages/student/Achievements";
import Badges from "./pages/student/Badges";
import UploadAssignment from "./pages/student/UploadAssignment";
import ChangePassword from "./pages/student/ChangePassword";
import RewardsStore from "./pages/student/RewardsStore";
import SaveTheTreesGame from "./pages/student/SaveTheTreesGame";
import EcoQuestAdventure from "./pages/student/EcoQuestAdventure";
import OceanCleanupHero from "./pages/student/OceanCleanupHero";
import SolarPowerMaster from "./pages/student/SolarPowerMaster";
import RecyclingWizard from "./pages/student/RecyclingWizard";

// Climate Games
import EcoNinjaGame from "./games/EcoNinjaGame";
import EcoRunnerDash from "./games/EcoRunnerDash";
import EcoSnakeLadders from "./games/EcoSnakeLadders";
import EvEcoPuzzleGame from "./games/EvEcoPuzzleGame";
import EvWordSearchGame from "./games/EvWordSearchGame";
import NatureNinjasGame from "./games/NatureNinjasGame";
import NetZeroQuestGame from "./games/NetZeroQuestGame";
import { withGameCompletion } from "./components/GameCompletionWrapper";

// Wrap games with completion tracking
const EcoNinja = withGameCompletion(EcoNinjaGame, 'eco-ninja', 'Eco Ninja', 50);
const EcoRunner = withGameCompletion(EcoRunnerDash, 'eco-runner', 'Eco Runner Dash', 75);
const EcoSnakes = withGameCompletion(EcoSnakeLadders, 'eco-snakes-ladders', 'Eco Snake & Ladders', 60);
const EcoPuzzle = withGameCompletion(EvEcoPuzzleGame, 'eco-puzzle', 'Eco Puzzle', 70);
const WordSearch = withGameCompletion(EvWordSearchGame, 'word-search', 'Word Search', 40);
const NatureNinjas = withGameCompletion(NatureNinjasGame, 'nature-ninjas', 'Nature Ninjas', 100);
const NetZeroQuest = withGameCompletion(NetZeroQuestGame, 'net-zero-quest', 'Net Zero Quest', 120);
import WindFarmEngineer from "./pages/student/WindFarmEngineer";
import MountainRanger from "./pages/student/MountainRanger";
import AquaticLifeGuardian from "./pages/student/AquaticLifeGuardian";
import GlobalWeatherDetective from "./pages/student/GlobalWeatherDetective";
import ElectricVehicleCity from "./pages/student/ElectricVehicleCity";
import EcoLab from "./pages/student/EcoLab";
import ClassManagement from "./pages/teacher/ClassManagement";
import StudentProgressTracking from "./pages/teacher/StudentProgressTracking";
import AssignmentCreation from "./pages/teacher/AssignmentCreation";
import TeacherAnalytics from "./pages/teacher/TeacherAnalytics";
import StudentManagement from "./pages/teacher/StudentManagement";
import AssignmentSubmissions from "./pages/teacher/AssignmentSubmissions";
import VideoGeneration from "./pages/teacher/VideoGeneration";
import StudentDetails from "./pages/teacher/StudentDetails";

// Admin module imports
import AdminLogin from "./pages/admin/AdminLogin";
import UserManagement from "./pages/admin/UserManagement";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageStudents from "./pages/admin/ManageStudents";
import ManageTeachers from "./pages/admin/ManageTeachers";
import AIVideos from "./pages/admin/AIVideos";
import SyllabusVideoGenerator from "./pages/admin/SyllabusVideoGenerator";
import GameManagement from "./pages/admin/GameManagement";
import VideoUpload from "./pages/admin/VideoUpload";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/features" element={<Features />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/explore-nature" element={<ExploreNature />} />
          <Route path="/get-started" element={<GetStarted />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/student/games" element={<Games />} />
          <Route path="/student/badges" element={<Badges />} />
          <Route path="/student/lessons" element={<Lessons />} />
          <Route path="/environmental-stories" element={<EnvironmentalStories />} />
          <Route
            path="/student/upload-assignment"
            element={<UploadAssignment />}
          />
          <Route path="/student/change-password" element={<ChangePassword />} />
          <Route path="/student/ai" element={<AI />} />
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
          
          {/* Climate Games Routes */}
          <Route path="/student/games/eco-ninja" element={<EcoNinja />} />
          <Route path="/student/games/eco-runner" element={<EcoRunner />} />
          <Route path="/student/games/eco-snakes-ladders" element={<EcoSnakes />} />
          <Route path="/student/games/eco-puzzle" element={<EcoPuzzle />} />
          <Route path="/student/games/word-search" element={<WordSearch />} />
          <Route path="/student/games/nature-ninjas" element={<NatureNinjas />} />
          <Route path="/student/games/net-zero-quest" element={<NetZeroQuest />} />
          
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
          <Route path="/teacher/analytics" element={<TeacherAnalytics />} />
          <Route
            path="/teacher/video-generation"
            element={<VideoGeneration />}
          />
          <Route
            path="/teacher/assignment/:assignmentId/submissions"
            element={<AssignmentSubmissions />}
          />
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
          <Route
            path="/teacher/student-management"
            element={<StudentManagement />}
          />
          <Route
            path="/teacher/assignment/:assignmentId/submissions"
            element={<AssignmentSubmissions />}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;