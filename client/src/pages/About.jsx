import React from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Earth, Heart, Lightbulb, Users2, Target, Award } from "lucide-react";

function About() {
  const values = [
    {
      icon: Earth,
      title: "Environmental Impact",
      description: "We believe education is the key to creating lasting environmental change."
    },
    {
      icon: Heart,
      title: "Passionate Learning",
      description: "Making environmental education engaging and accessible to everyone."
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "Using cutting-edge technology to revolutionize how we learn about sustainability."
    },
    {
      icon: Users2,
      title: "Community",
      description: "Building a global community of environmentally conscious learners."
    }
  ];

  const stats = [
    { value: "50K+", label: "Students Educated", icon: Users2 },
    { value: "200+", label: "Courses Available", icon: Target },
    { value: "95%", label: "Completion Rate", icon: Award },
    { value: "40+", label: "Countries Reached", icon: Earth }
  ];

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-subtle">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <Badge variant="secondary" className="mb-4">
                <Earth className="w-4 h-4 mr-2" />
                About EcoLearn
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold font-lato mb-6">
                Empowering the Next Generation of
                <span className="bg-gradient-eco bg-clip-text text-transparent"> Environmental Leaders</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                EcoLearn was founded with a simple mission: to make environmental education engaging, accessible, and impactful through innovative gamification and interactive learning experiences.
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-lato mb-4 sm:mb-6 px-4 sm:px-0">
                  Our Mission
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  We're on a mission to transform how people learn about environmental conservation. By combining gamification with comprehensive educational content, we make learning about sustainability fun, engaging, and rewarding.
                </p>
                <p className="text-lg text-muted-foreground">
                  Our platform serves as a bridge between complex environmental concepts and practical, actionable knowledge that learners can apply in their daily lives to make a positive impact on our planet.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat) => (
                  <Card key={stat.label} className="text-center card-interactive">
                    <CardContent className="p-6">
                      {React.createElement(stat.icon, { className: "w-8 h-8 mx-auto mb-3 text-primary" })}
                      <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-gradient-subtle">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-lato mb-4 sm:mb-6 px-4">
                Our Core Values
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                These principles guide everything we do at EcoLearn
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
              {values.map((value, index) => (
                <Card key={value.title} className={`card-interactive ${index % 2 === 0 ? 'md:translate-y-4' : ''}`}>
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-eco rounded-lg flex items-center justify-center shadow-eco mb-4">
                      {React.createElement(value.icon, { className: "w-6 h-6 text-primary-foreground" })}
                    </div>
                    <CardTitle className="text-2xl font-lato">{value.title}</CardTitle>
                    <CardDescription className="text-lg">{value.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold font-lato mb-6">
                Built by Environmental Enthusiasts
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
                Our team combines expertise in education, technology, and environmental science to create the most effective learning platform for sustainability education.
              </p>
              <div className="bg-gradient-eco p-12 rounded-2xl text-center text-primary-foreground">
                <h3 className="text-2xl font-bold mb-4">Join Our Mission</h3>
                <p className="text-lg opacity-90 mb-6">
                  Together, we can build a more sustainable future through education
                </p>
                <div className="flex justify-center space-x-8 text-sm">
                  <div>
                    <div className="text-2xl font-bold">2019</div>
                    <div className="opacity-80">Founded</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">25+</div>
                    <div className="opacity-80">Team Members</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">40+</div>
                    <div className="opacity-80">Countries</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default About;