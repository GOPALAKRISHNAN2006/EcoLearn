import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Leaf, 
  ArrowLeft, 
  Mail, 
  GraduationCap, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle,
  KeyRound,
  ShieldCheck
} from "lucide-react";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("student");
  const [submitted, setSubmitted] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [schoolName, setSchoolName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!identifier.trim()) return;
    setSubmitted(true);
  };

  const handleResetForm = () => {
    setSubmitted(false);
    setIdentifier("");
    setSchoolName("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Back Link */}
        <Link
          to="/login"
          className="inline-flex items-center text-sm font-medium text-emerald-700 hover:text-emerald-800 mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Login
        </Link>

        {/* Brand Header */}
        <div className="text-center">
          <div className="mx-auto w-14 h-14 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-4">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Account Recovery
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Recover access to your EcoLearn account
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Card className="shadow-xl border-emerald-100/60 backdrop-blur-sm bg-white/95">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-center text-gray-800">
              Password Assistance
            </CardTitle>
            <CardDescription className="text-center text-gray-500">
              Select your role to view password recovery instructions
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); setSubmitted(false); }} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="student" className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  Student
                </TabsTrigger>
                <TabsTrigger value="teacher" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Teacher / Admin
                </TabsTrigger>
              </TabsList>

              {/* Student Password Assistance */}
              <TabsContent value="student" className="space-y-4">
                {submitted ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      Request Recorded
                    </div>
                    <p className="text-sm text-emerald-700">
                      Your recovery request for Roll Number <span className="font-semibold text-emerald-900">{identifier}</span> has been noted.
                    </p>
                    <p className="text-xs text-emerald-600">
                      Please ask your teacher or school administrator in class to reset your password. They can generate a temporary password for you immediately from their teacher dashboard.
                    </p>
                    <Button
                      onClick={handleResetForm}
                      variant="outline"
                      size="sm"
                      className="w-full mt-2 border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                    >
                      Check Another Roll Number
                    </Button>
                  </div>
                ) : (
                  <>
                    <Alert className="bg-amber-50/70 border-amber-200 text-amber-900">
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                      <AlertDescription className="text-xs text-amber-800 leading-relaxed">
                        For student safety, student passwords are tied to school roll numbers and managed by your teachers.
                      </AlertDescription>
                    </Alert>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="student-roll" className="text-gray-700 font-medium text-sm">
                          Your Roll Number
                        </Label>
                        <div className="relative mt-1">
                          <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                          <Input
                            id="student-roll"
                            type="text"
                            placeholder="e.g. 2024-10-A-042"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            className="pl-9"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="school-name" className="text-gray-700 font-medium text-sm">
                          School Name (Optional)
                        </Label>
                        <Input
                          id="school-name"
                          type="text"
                          placeholder="Your school or institution"
                          value={schoolName}
                          onChange={(e) => setSchoolName(e.target.value)}
                          className="mt-1"
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium py-2.5 shadow-md shadow-emerald-600/20"
                      >
                        Get Help with Password
                      </Button>
                    </form>
                  </>
                )}
              </TabsContent>

              {/* Teacher Password Assistance */}
              <TabsContent value="teacher" className="space-y-4">
                {submitted ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      Instructions Sent
                    </div>
                    <p className="text-sm text-emerald-700">
                      If an account exists for <span className="font-semibold text-emerald-900">{identifier}</span>, password reset instructions have been forwarded to the registered email address.
                    </p>
                    <p className="text-xs text-emerald-600">
                      Please check your inbox or spam folder. You can also contact your school administrator to reset your credentials.
                    </p>
                    <Button
                      onClick={handleResetForm}
                      variant="outline"
                      size="sm"
                      className="w-full mt-2 border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                    >
                      Try Another Email / ID
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="teacher-id" className="text-gray-700 font-medium text-sm">
                        Teacher ID or Email Address
                      </Label>
                      <div className="relative mt-1">
                        <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                        <Input
                          id="teacher-id"
                          type="text"
                          placeholder="teacher@school.edu or Teacher ID"
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          className="pl-9"
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-medium py-2.5 shadow-md shadow-cyan-600/20"
                    >
                      Request Password Reset
                    </Button>
                  </form>
                )}
              </TabsContent>
            </Tabs>

            {/* Quick Actions */}
            <div className="pt-4 border-t border-gray-100 space-y-2 text-center text-xs text-gray-600">
              <p>
                Have your current password?{" "}
                <Link to="/student/change-password" className="text-emerald-600 hover:text-emerald-700 font-medium underline">
                  Change Password directly
                </Link>
              </p>
              <p>
                Still having trouble?{" "}
                <Link to="/contact" className="text-emerald-600 hover:text-emerald-700 font-medium underline">
                  Contact EcoLearn Support
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;

