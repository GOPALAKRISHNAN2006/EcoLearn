import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, Users, BookOpen, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

const GetStarted = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-amber-50">
      <Navigation />
      <main className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#f59e0b] rounded-full mb-6 shadow-lg">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#237a57] mb-4">
              Welcome to EcoLearn
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Choose your role to start your environmental education journey
            </p>
          </div>

          {/* Role Selection */}
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Student Card */}
            <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 hover:border-emerald-200">
              <CardContent className="p-8 text-center">
                <div className="w-24 h-24 bg-[#3b9b8f] rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <GraduationCap className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">I'm a Student</h2>
                <p className="text-gray-600 mb-6">
                  Access interactive learning modules, earn points, compete with classmates, and track your environmental education progress.
                </p>
                <ul className="text-left space-y-2 mb-8">
                  <li className="flex items-center gap-2 text-gray-600">
                    <Award className="w-4 h-4 text-emerald-500" />
                    Earn points and badges
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <BookOpen className="w-4 h-4 text-emerald-500" />
                    Interactive learning modules
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4 text-emerald-500" />
                    Compete with classmates
                  </li>
                </ul>
                <Button 
                  onClick={() => navigate('/login?type=student')}
                  className="w-full bg-[#237a57] hover:bg-[#f59e0b] text-white font-semibold py-3"
                >
                  Continue as Student
                </Button>
              </CardContent>
            </Card>

            {/* Teacher Card */}
            <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 hover:border-cyan-200">
              <CardContent className="p-8 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">I'm a Teacher</h2>
                <p className="text-gray-600 mb-6">
                  Manage your students, track their progress, create engaging assignments, and monitor institutional performance.
                </p>
                <ul className="text-left space-y-2 mb-8">
                  <li className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4 text-cyan-500" />
                    Manage student progress
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <Award className="w-4 h-4 text-cyan-500" />
                    Institution leaderboards
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <BookOpen className="w-4 h-4 text-cyan-500" />
                    Create assignments
                  </li>
                </ul>
                <Button 
                  onClick={() => navigate('/login?type=teacher')}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-3"
                >
                  Continue as Teacher
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Additional Info */}
          <div className="text-center mt-12">
            <p className="text-gray-500">
              Don't have an account? The app will guide you through the setup process.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GetStarted;