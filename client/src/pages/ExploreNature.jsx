import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Upload, Leaf, TreePine, Flower, Search } from "lucide-react";
import { useState } from "react";

const ExploreNature = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [identificationResult, setIdentificationResult] = useState(null);
  const [isIdentifying, setIsIdentifying] = useState(false);

  const handleCameraOpen = () => {
    // Camera functionality would be implemented here
    alert("Opening camera... (Camera API would be implemented here)");
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result);
        // Mock identification after image selection
        setTimeout(() => {
          setIsIdentifying(true);
          setTimeout(() => {
            setIdentificationResult({
              species: "Quercus alba",
              commonName: "White Oak",
              confidence: 92,
              family: "Fagaceae",
              habitat: "Deciduous forests, parks",
              conservation: "Least Concern",
              facts: [
                "Can live over 300 years",
                "Produces acorns that feed wildlife",
                "Important for carbon sequestration"
              ]
            });
            setIsIdentifying(false);
          }, 2000);
        }, 500);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <Navigation />
      <main className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mb-6 shadow-lg">
              <Leaf className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4">
              Explore Nature
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover and identify plant species around you. Use your camera or upload photos to learn about trees, flowers, and plants instantly!
            </p>
          </div>

          {/* Upload Options */}
          {!selectedImage && (
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
                <CardContent className="p-8 text-center" onClick={handleCameraOpen}>
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                    <Camera className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Open Camera</h3>
                  <p className="text-gray-600">Take a photo of a plant or tree to identify it instantly</p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-200 transition-colors">
                    <Upload className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Upload Image</h3>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Button variant="outline" className="border-emerald-500 text-emerald-600 hover:bg-emerald-50">
                      Choose File
                    </Button>
                    <input
                      id="file-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-gray-600 text-sm mt-2">Select an image from your device</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Image Preview and Identification */}
          {selectedImage && (
            <div className="mb-12">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="w-5 h-5" />
                    Plant Identification
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <img 
                        src={selectedImage} 
                        alt="Uploaded plant" 
                        className="w-full h-64 object-cover rounded-lg shadow-md"
                      />
                      <Button 
                        onClick={() => {
                          setSelectedImage(null);
                          setIdentificationResult(null);
                        }}
                        variant="outline" 
                        className="mt-4 w-full"
                      >
                        Try Another Image
                      </Button>
                    </div>

                    <div>
                      {isIdentifying && (
                        <div className="text-center py-8">
                          <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                          <p className="text-gray-600">Identifying plant species...</p>
                        </div>
                      )}

                      {identificationResult && !isIdentifying && (
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-2xl font-bold text-gray-800">{identificationResult.commonName}</h3>
                            <p className="text-gray-600 italic">{identificationResult.species}</p>
                            <Badge variant="secondary" className="mt-2">
                              {identificationResult.confidence}% confidence
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="font-semibold text-gray-700">Family:</p>
                              <p className="text-gray-600">{identificationResult.family}</p>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-700">Conservation:</p>
                              <p className="text-gray-600">{identificationResult.conservation}</p>
                            </div>
                          </div>

                          <div>
                            <p className="font-semibold text-gray-700 mb-2">Habitat:</p>
                            <p className="text-gray-600">{identificationResult.habitat}</p>
                          </div>

                          <div>
                            <p className="font-semibold text-gray-700 mb-2">Interesting Facts:</p>
                            <ul className="space-y-1">
                              {identificationResult.facts.map((fact, index) => (
                                <li key={index} className="text-gray-600 flex items-start gap-2">
                                  <TreePine className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                  {fact}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="pt-4 border-t">
                            <Button className="w-full bg-green-600 hover:bg-green-700">
                              <Flower className="w-4 h-4 mr-2" />
                              Add to My Collection
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Recent Discoveries */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Discoveries</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { name: "Red Maple", species: "Acer rubrum", image: "🍁" },
                { name: "Blue Jay", species: "Cyanocitta cristata", image: "🐦" },
                { name: "Sunflower", species: "Helianthus annuus", image: "🌻" }
              ].map((item, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 text-center">
                    <div className="text-4xl mb-2">{item.image}</div>
                    <h3 className="font-semibold text-gray-800">{item.name}</h3>
                    <p className="text-gray-600 text-sm italic">{item.species}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ExploreNature;