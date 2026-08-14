import Navigation from "@/components/Navigation";
import Features from "@/components/Features";

const FeaturesPage = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pt-16">
        <Features />
      </main>
    </div>
  );
};

export default FeaturesPage;