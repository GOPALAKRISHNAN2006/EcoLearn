import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Leaf, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  GraduationCap, 
  Users,
  ArrowLeft,
  AlertCircle
} from "lucide-react";

// backend
import { studentLogin, teacherLogin } from "@/services/authService";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userTypeParam = searchParams.get('type');
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(userTypeParam === 'teacher' ? 'teacher' : 'student');
  const [error, setError] = useState("");
  
  const [studentForm, setStudentForm] = useState({
    rollNumber: "",
    password: ""
  });
  
  const [teacherForm, setTeacherForm] = useState({
    teacherId: "",
    password: ""
  });

  const handleStudentLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const response = await studentLogin(studentForm.rollNumber, studentForm.password);
      
      if (response.success) {
        // Check if first login - redirect to change password page
        if (response.data.user.isFirstLogin) {
          navigate('/student/change-password', { 
            state: { 
              rollNumber: studentForm.rollNumber,
              userName: response.data.user.name
            } 
          });
        } else {
          // Navigate to student dashboard
          navigate('/student-dashboard');
        }
      }
    } catch (err) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTeacherLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const response = await teacherLogin(teacherForm.teacherId, teacherForm.password);
      
      if (response.success) {
        // Navigate to teacher dashboard
        navigate('/teacher-dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudentChange = (e) => {
    setStudentForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleTeacherChange = (e) => {
    setTeacherForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 group">
            <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:scale-105">
              <Leaf className="w-7 h-7 text-white" />
            </div>
            <span className="font-bold text-2xl text-[#237a57]">
              EcoLearn
            </span>
          </div>
          <p className="text-gray-600 mt-2">Welcome back! Please sign in to continue your learning journey.</p>
          <Alert variant="destructive" className="mb-4 bg-red-200">
            <AlertDescription>
              <b>
                <h1>
                  For Testing you can use Student
                  <h1>Roll number : 1234567890</h1>
                  <h1>Password : 1234567890</h1>
                </h1>
              </b>
            </AlertDescription>
          </Alert>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
            <CardDescription>
              Select your role to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="student" className="flex items-center space-x-2">
                  <GraduationCap className="w-4 h-4" />
                  <span>Student</span>
                </TabsTrigger>
                <TabsTrigger value="teacher" className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Teacher</span>
                </TabsTrigger>
              </TabsList>

              {/* Student Login */}
              <TabsContent value="student">
                <form onSubmit={handleStudentLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="student-rollNumber">Roll Number</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="student-rollNumber"
                        name="rollNumber"
                        type="text"
                        placeholder="Enter your roll number"
                        value={studentForm.rollNumber}
                        onChange={handleStudentChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="student-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={studentForm.password}
                        onChange={handleStudentChange}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-[#237a57] hover:bg-[#f59e0b] text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Signing in...
                      </>
                    ) : (
                      "Sign in as Student"
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Teacher Login */}
              <TabsContent value="teacher">
                <form onSubmit={handleTeacherLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="teacher-teacherId">Teacher ID</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="teacher-teacherId"
                        name="teacherId"
                        type="text"
                        placeholder="Enter your teacher ID"
                        value={teacherForm.teacherId}
                        onChange={handleTeacherChange}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="teacher-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="teacher-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={teacherForm.password}
                        onChange={handleTeacherChange}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-[#3b9b8f] hover:bg-[#f59e0b] text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Signing in...
                      </>
                    ) : (
                      "Sign in as Teacher"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Links */}
            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-gray-600">
                <Link to="/forgot-password" className="text-emerald-600 hover:text-emerald-700">
                  Forgot your password?
                </Link>
              </p>
              <p className="text-sm text-gray-600">
                New teacher?{" "}
                <Link to="/register" className="text-emerald-600 hover:text-emerald-700 font-medium">
                  Register here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
