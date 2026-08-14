import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Gamepad2, 
  BookOpen, 
  TrendingUp, 
  Gift, 
  Target, 
  Star,
  Trophy,
  Zap,
  Users,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import ecoBadges from "@/assets/eco-badges.jpg";
import learningModules from "@/assets/learning-modules.jpg";

const Features = () => {
  const features = [
    {
      icon: Gamepad2,
      title: "Interactive Games",
      description: "Learn through fun and engaging environmental games",
      image: ecoBadges,
      stats: "50+ Mini Games",
      color: "text-primary"
    },
    {
      icon: BookOpen,
      title: "AI-Powered Learning",
      description: "Get personalized learning experience with AI assistance",
      image: learningModules,
      stats: "200+ Lessons",
      color: "text-secondary"
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description: "Track your learning journey and achievements",
      image: null,
      stats: "Real-time Analytics",
      color: "text-accent"
    },
    {
      icon: Gift,
      title: "Earn Certificates",
      description: "Get certified for your environmental knowledge",
      image: null,
      stats: "100+ Rewards",
      color: "text-success"
    }
  ];

  const achievements = [
    { name: "Tree Planter", progress: 85, icon: Target },
    { name: "Energy Saver", progress: 72, icon: Zap },
    { name: "Recycling Pro", progress: 94, icon: Trophy },
    { name: "Climate Champion", progress: 68, icon: Star }
  ];

  return (
    <section className="py-20 bg-gradient-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            <Star className="w-4 h-4 mr-2" />
            Amazing Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold font-lato mb-6">
            Amazing Features
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to learn about the environment
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-16">
          {features.map((feature, index) => (
            <Card 
              key={feature.title} 
              className={`card-interactive group ${index % 2 === 0 ? 'md:translate-y-8' : ''}`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-eco flex items-center justify-center shadow-eco group-hover:shadow-glow transition-all duration-300`}>
                    <feature.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <Badge variant="outline" className="bg-accent/10">
                    {feature.stats}
                  </Badge>
                </div>
                <CardTitle className="text-2xl font-lato">{feature.title}</CardTitle>
                <CardDescription className="text-lg">{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {feature.image && (
                  <div className="relative overflow-hidden rounded-lg mb-4">
                    <img 
                      src={feature.image} 
                      alt={feature.title}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-eco opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  </div>
                )}
                {!feature.image && (
                  <div className="h-32 bg-gradient-eco rounded-lg mb-4 flex items-center justify-center">
                    <feature.icon className="w-16 h-16 text-primary-foreground opacity-80" />
                  </div>
                )}
                <Button variant="ghost" className="w-full group-hover:bg-accent/20">
                  Learn More
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Gamification Showcase */}
        <div className="bg-card rounded-2xl p-8 shadow-card border border-border">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="secondary" className="mb-4">
                <Trophy className="w-4 h-4 mr-2" />
                Your Progress
              </Badge>
              <h3 className="text-3xl font-bold font-lato mb-4">
                Track Your Environmental Impact
              </h3>
              <p className="text-lg text-muted-foreground mb-6">
                See your learning progress in real-time with our advanced tracking system. 
                Earn achievements and compete with friends!
              </p>
              
              <div className="space-y-4">
                {achievements.map((achievement) => (
                  <div key={achievement.name} className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-eco rounded-full flex items-center justify-center shadow-eco">
                      <achievement.icon className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{achievement.name}</span>
                        <span className="text-sm text-muted-foreground">{achievement.progress}%</span>
                      </div>
                      <div className="progress-eco h-2" data-value={achievement.progress}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-eco p-6 rounded-xl text-primary-foreground text-center">
                <Users className="w-8 h-8 mx-auto mb-2" />
                <div className="text-2xl font-bold">12,450</div>
                <div className="text-sm opacity-90">Community Members</div>
              </div>
              <div className="bg-gradient-ocean p-6 rounded-xl text-primary-foreground text-center">
                <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                <div className="text-2xl font-bold">5,890</div>
                <div className="text-sm opacity-90">Completed Courses</div>
              </div>
              <div className="bg-accent p-6 rounded-xl text-accent-foreground text-center">
                <Trophy className="w-8 h-8 mx-auto mb-2" />
                <div className="text-2xl font-bold">2,340</div>
                <div className="text-sm opacity-90">Badges Earned</div>
              </div>
              <div className="bg-success p-6 rounded-xl text-success-foreground text-center">
                <Star className="w-8 h-8 mx-auto mb-2" />
                <div className="text-2xl font-bold">98%</div>
                <div className="text-sm opacity-90">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;