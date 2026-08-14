import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, TreePine } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-subtle">
      <div className="text-center space-y-8">
        <div className="animate-float">
          <TreePine className="w-24 h-24 mx-auto text-primary mb-6" />
        </div>
        
        <div>
          <h1 className="text-6xl md:text-8xl font-bold font-lato text-primary mb-4">404</h1>
          <h2 className="text-2xl md:text-3xl font-semibold mb-4">
            Oops! This path doesn't exist
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-md">
            Looks like you've wandered off the beaten path. Let's get you back to exploring our eco-learning platform.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="eco" size="lg">
            <Link to="/">
              <Home className="w-5 h-5 mr-2" />
              Return Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/features">
              Explore Features
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
