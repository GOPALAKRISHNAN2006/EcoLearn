// Predefined real-world assignments for Land, Air, and Water pollution projects

export const predefinedAssignments = {
  'land-pollution': [
    {
      title: 'Community Clean-Up Drive',
      description: 'Organize and participate in a community clean-up drive in your local area. Document the process by collecting photos before and after the clean-up, noting the types of waste collected (plastic, paper, organic, etc.), and the total weight/volume of waste removed.',
      instructions: 'Select a polluted area (park, street, vacant lot), gather volunteers, collect waste, segregate it properly, and document the entire process with photos and videos.',
      minVideoDuration: 3,
      maxVideoDuration: 5,
      requireLocation: true,
      locationInstructions: 'Provide exact location (area name, landmark, city/town). Mark the coordinates if possible and describe the initial state of pollution.'
    },
    {
      title: 'Plastic Waste Audit at Home',
      description: 'Conduct a week-long plastic waste audit of your household. Track all plastic items used, categorize them (single-use vs reusable, recyclable vs non-recyclable), weigh the total plastic waste, and create a plan to reduce plastic consumption by 30%.',
      instructions: 'Keep a daily log, photograph all plastic items before disposal, weigh the waste each day, and create charts showing consumption patterns and reduction strategies.',
      minVideoDuration: 2,
      maxVideoDuration: 4,
      requireLocation: false
    },
    {
      title: 'School/Office Waste Segregation System',
      description: 'Design and implement a waste segregation system in your school or office. Create labeled bins for different waste types (wet waste, dry waste, recyclables, e-waste), educate people about proper usage, and monitor the effectiveness over 2 weeks.',
      instructions: 'Create clear signage, conduct awareness sessions, track daily segregation compliance, and document behavioral changes with photos and interviews.',
      minVideoDuration: 4,
      maxVideoDuration: 6,
      requireLocation: true,
      locationInstructions: 'Specify the institution name, area where bins are placed, and number of people using the facility.'
    },
    {
      title: 'Composting Project - Kitchen Waste to Fertilizer',
      description: 'Set up a home composting system to convert kitchen waste into organic fertilizer. Document the entire process from setting up the compost bin, daily waste addition, monitoring decomposition stages, to harvesting ready compost after 45-60 days.',
      instructions: 'Show the setup process, daily maintenance routine, temperature and moisture monitoring, turning schedule, and the final compost product. Use the compost in a garden and show results.',
      minVideoDuration: 3,
      maxVideoDuration: 5,
      requireLocation: false
    },
    {
      title: 'E-Waste Collection and Proper Disposal Drive',
      description: 'Organize an e-waste collection drive in your neighborhood. Collect old electronics (phones, chargers, batteries, broken appliances), educate people about e-waste hazards, and ensure proper disposal through authorized recycling centers.',
      instructions: 'Create awareness posters, set up collection points, document types and quantities of e-waste collected, visit an authorized e-waste recycler, and show the proper disposal process.',
      minVideoDuration: 4,
      maxVideoDuration: 7,
      requireLocation: true,
      locationInstructions: 'Provide collection point locations, recycling center name and address, and area coverage of the drive.'
    },
    {
      title: 'Single-Use Plastic Alternative Campaign',
      description: 'Launch a 30-day campaign to eliminate single-use plastics from your daily life. Replace plastic bags with cloth bags, plastic bottles with reusable bottles, plastic straws with metal/bamboo alternatives, and document your journey with daily updates.',
      instructions: 'Show before/after comparisons, calculate cost savings, interview family members about the change, create awareness content for social media, and track plastic waste reduction quantitatively.',
      minVideoDuration: 3,
      maxVideoDuration: 5,
      requireLocation: false
    },
    {
      title: 'Urban Garden on Polluted Land Reclamation',
      description: 'Identify a small polluted or unused land patch in your locality and convert it into a small urban garden. Clean the area, test soil quality, add compost, plant native species, and maintain the garden for at least one month.',
      instructions: 'Document soil testing results, cleanup process, plant selection based on local climate, watering and maintenance schedule, and growth progress with weekly photos.',
      minVideoDuration: 4,
      maxVideoDuration: 6,
      requireLocation: true,
      locationInstructions: 'Provide exact location with GPS coordinates, land area in square meters, initial pollution level, and ownership/permission details.'
    },
    {
      title: 'Landfill Site Visit and Impact Study',
      description: 'Visit a local landfill or dumping ground with proper permission and safety precautions. Study the waste composition, interview waste workers, understand the environmental and health impacts on nearby communities, and propose solutions.',
      instructions: 'Record safety gear used, waste types observed, leachate issues, bird/animal presence, nearby water body contamination, interview 2-3 workers, and create a detailed impact report with photos and videos.',
      minVideoDuration: 5,
      maxVideoDuration: 8,
      requireLocation: true,
      locationInstructions: 'Name and location of landfill, distance from nearest residential area, and permission/authorization received for visit.'
    },
    {
      title: 'Vermicomposting Workshop and Implementation',
      description: 'Set up a vermicomposting unit using earthworms to convert organic waste into nutrient-rich fertilizer. Document the setup, worm species used, feeding schedule, harvesting process, and demonstrate the quality of vermicompost produced.',
      instructions: 'Show bin preparation, worm introduction, ideal temperature/moisture conditions, types of waste suitable, harvesting technique, and comparison of plant growth using vermicompost vs regular soil.',
      minVideoDuration: 3,
      maxVideoDuration: 5,
      requireLocation: false
    },
    {
      title: 'Zero-Waste Challenge Documentation',
      description: 'Attempt a 7-day zero-waste lifestyle challenge. Document every purchase decision, packaging choices, waste generation, and creative solutions to avoid waste. Calculate the waste weight difference compared to a normal week.',
      instructions: 'Keep a video diary of daily challenges, shopping with reusable containers, meal planning to avoid food waste, DIY solutions for household items, and a final before/after waste comparison with weight measurements.',
      minVideoDuration: 4,
      maxVideoDuration: 6,
      requireLocation: false
    }
  ],

  'air-pollution': [
    {
      title: 'Air Quality Monitoring in Your Locality',
      description: 'Conduct air quality monitoring at 5 different locations in your area using portable AQI monitors or smartphone apps. Record PM2.5, PM10 levels at different times of day, compare readings near roads vs parks, and analyze patterns.',
      instructions: 'Take readings at morning, afternoon, and evening. Document traffic density, nearby industrial activity, and greenery at each location. Create graphs showing AQI variations and identify pollution hotspots.',
      minVideoDuration: 4,
      maxVideoDuration: 6,
      requireLocation: true,
      locationInstructions: 'List all 5 monitoring locations with landmarks, GPS coordinates, and approximate distance from your home. Note nearby pollution sources.'
    },
    {
      title: 'Tree Plantation Drive for Air Purification',
      description: 'Organize a tree plantation drive planting at least 20 saplings of native, air-purifying species (Neem, Peepal, Areca Palm). Research which species remove maximum pollutants, ensure proper planting technique, and establish a maintenance schedule.',
      instructions: 'Document species selection research, sapling procurement, pit preparation, planting process, watering system setup, and commit to weekly maintenance updates for 1 month.',
      minVideoDuration: 4,
      maxVideoDuration: 7,
      requireLocation: true,
      locationInstructions: 'Provide exact plantation site address, land area covered, permission obtained, and photos marking each planted tree with labels.'
    },
    {
      title: 'Vehicle Emission Check Campaign',
      description: 'Organize a free vehicle emission checking camp in your neighborhood. Collaborate with local mechanics, check emissions of 15-20 vehicles, educate owners about pollution under control (PUC) certificates, and promote regular vehicle maintenance.',
      instructions: 'Set up the camp, document the testing process, record emission levels, counsel vehicle owners about maintenance, and create awareness material about emission standards.',
      minVideoDuration: 3,
      maxVideoDuration: 5,
      requireLocation: true,
      locationInstructions: 'Camp location, date, number of vehicles tested, and collaboration details with mechanics or NGOs.'
    },
    {
      title: 'Public Transport Promotion Campaign',
      description: 'Create and execute a 7-day campaign promoting public transport over private vehicles. Document your journey using only buses/metro/trains, calculate carbon emissions saved, interview fellow commuters, and create awareness content.',
      instructions: 'Track daily routes, travel time comparisons, cost analysis, comfort level, carbon footprint calculations, and create persuasive social media content encouraging others to use public transport.',
      minVideoDuration: 3,
      maxVideoDuration: 5,
      requireLocation: true,
      locationInstructions: 'List your city/town, regular commute route, distance traveled, and public transport options used.'
    },
    {
      title: 'Indoor Air Quality Improvement Project',
      description: 'Assess and improve indoor air quality in your home or classroom. Install air-purifying plants, ensure proper ventilation, identify pollution sources (cooking smoke, cleaning chemicals), and measure improvement over 2 weeks.',
      instructions: 'Conduct before/after air quality measurements, install 10+ air-purifying plants (Snake Plant, Spider Plant, Peace Lily), document ventilation changes, and show AQI improvement with data.',
      minVideoDuration: 3,
      maxVideoDuration: 5,
      requireLocation: false
    },
    {
      title: 'Anti-Burning Campaign (Crackers/Waste/Leaves)',
      description: 'Launch a community awareness campaign against open burning of waste, leaves, and firecrackers. Create informative posters, conduct door-to-door awareness, demonstrate alternative disposal methods, and track behavioral change.',
      instructions: 'Design campaign materials, conduct at least 20 household visits, show alternatives like composting for leaves, proper waste disposal, and green celebrations. Document commitment pledges from families.',
      minVideoDuration: 4,
      maxVideoDuration: 6,
      requireLocation: true,
      locationInstructions: 'Campaign area (colony/neighborhood name), number of households covered, and observed incidents of open burning.'
    },
    {
      title: 'Bicycle Commuting Challenge',
      description: 'Switch to bicycle commuting for all short-distance travel (under 5 km) for 10 days. Document daily trips, calculate fuel saved, emissions prevented, health benefits gained, and promote cycling infrastructure improvements.',
      instructions: 'Record daily distance cycled, routes taken, time comparisons with motorized transport, safety challenges faced, calories burned, and cost savings. Interview other cyclists about their experience.',
      minVideoDuration: 3,
      maxVideoDuration: 5,
      requireLocation: true,
      locationInstructions: 'Your city/locality, regular cycling routes, cycling infrastructure availability (dedicated lanes, parking).'
    },
    {
      title: 'Industrial Air Pollution Study',
      description: 'Visit an industrial area (with permission and safety gear) to study air pollution sources. Observe smoke stacks, dust generation, odor issues, impact on nearby vegetation and communities, and interview affected residents.',
      instructions: 'Document types of industries, visible emissions, health complaints from locals (with consent), distance to residential areas, and any pollution control measures in place. Suggest improvements.',
      minVideoDuration: 5,
      maxVideoDuration: 8,
      requireLocation: true,
      locationInstructions: 'Industrial area name, city, types of factories, distance from residential zones, and safety permissions obtained.'
    },
    {
      title: 'Carpool Organization Initiative',
      description: 'Organize a carpooling system for your school/office. Find at least 10 people with similar routes, create a carpool schedule, calculate cumulative emissions saved, and demonstrate the cost and environmental benefits over 2 weeks.',
      instructions: 'Create carpool groups, schedule coordination, track daily rides, calculate vehicles taken off road, fuel savings, carbon emissions prevented, and participant satisfaction surveys.',
      minVideoDuration: 3,
      maxVideoDuration: 5,
      requireLocation: true,
      locationInstructions: 'Institution name and location, routes covered, number of participants, and distance covered daily.'
    },
    {
      title: 'Construction Dust Control Monitoring',
      description: 'Identify a nearby construction site and monitor dust control measures. Document if they use water sprinklers, cover material piles, have wheel-washing systems, and use proper barriers. Interview workers and nearby residents about dust issues.',
      instructions: 'Record existing dust control measures, AQI readings near the site, talk to site manager about pollution norms, interview 3-5 nearby residents about health impacts, and suggest improvements.',
      minVideoDuration: 4,
      maxVideoDuration: 6,
      requireLocation: true,
      locationInstructions: 'Construction site address, project type (residential/commercial), distance from residential area, and duration of construction.'
    }
  ],

  'water-pollution': [
    {
      title: 'Local Water Body Cleanup Drive',
      description: 'Organize a cleanup of a local river, lake, pond, or canal. Collect solid waste, document types of pollutants (plastic, industrial waste, sewage), measure water quality parameters before and after cleanup, and involve community members.',
      instructions: 'Form a team of at least 10 volunteers, arrange cleanup tools, wear safety gear, segregate collected waste, test water pH/TDS/dissolved oxygen, and properly dispose of hazardous waste.',
      minVideoDuration: 5,
      maxVideoDuration: 8,
      requireLocation: true,
      locationInstructions: 'Name and location of water body, GPS coordinates, pollution severity level, and permission from local authorities.'
    },
    {
      title: 'Household Greywater Recycling System',
      description: 'Design and implement a greywater recycling system at home to reuse water from washing machines, bathrooms, and kitchen (excluding toilet water). Filter and treat the water for garden irrigation and floor cleaning purposes.',
      instructions: 'Show system design, filtration setup, collection tanks, treatment process (natural filters using sand/charcoal), usage applications, and calculate liters of water saved per day.',
      minVideoDuration: 4,
      maxVideoDuration: 6,
      requireLocation: false
    },
    {
      title: 'Rainwater Harvesting Installation',
      description: 'Install a rainwater harvesting system on your building rooftop. Connect gutters, install first-flush systems, set up storage tanks, and demonstrate how collected rainwater can reduce groundwater extraction and be used for various purposes.',
      instructions: 'Document complete installation process, calculate roof area and potential water collection, show filtration stages, measure quantity collected during first rain, and demonstrate usage for gardening/washing.',
      minVideoDuration: 4,
      maxVideoDuration: 7,
      requireLocation: true,
      locationInstructions: 'Building address, roof area, expected rainfall in your region, storage tank capacity, and usage plan.'
    },
    {
      title: 'Water Quality Testing in Your Area',
      description: 'Collect water samples from 5 different sources (tap water, well, river, pond, packaged water) and conduct comprehensive testing for pH, TDS, turbidity, dissolved oxygen, coliform bacteria, and heavy metals using testing kits or lab services.',
      instructions: 'Show proper sample collection technique, testing procedures, record all parameter readings, create comparison charts, identify contamination sources, and assess safety for drinking/other uses.',
      minVideoDuration: 4,
      maxVideoDuration: 6,
      requireLocation: true,
      locationInstructions: 'List all 5 sampling locations with addresses, source types, and distance from potential contamination sources.'
    },
    {
      title: 'Kitchen Water Conservation Challenge',
      description: 'Implement 10 water-saving practices in your kitchen for one week. Use methods like washing vegetables in a basin instead of running water, reusing RO reject water, fixing leaky taps, and measuring daily water consumption to show reduction.',
      instructions: 'Document baseline water usage, implement conservation methods (show each technique), measure daily consumption using a meter, calculate percentage reduction, and estimate annual water savings.',
      minVideoDuration: 3,
      maxVideoDuration: 5,
      requireLocation: false
    },
    {
      title: 'Industrial Effluent Pollution Investigation',
      description: 'Investigate industrial water pollution in your area. Identify factories discharging effluents into water bodies, document color/odor of discharge, collect water samples upstream and downstream, test for pH and toxicity, and interview affected communities.',
      instructions: 'Visit with safety precautions, photograph discharge points, conduct water testing, document aquatic life impact, interview fishermen/farmers using the water, and report findings to environmental authorities.',
      minVideoDuration: 5,
      maxVideoDuration: 8,
      requireLocation: true,
      locationInstructions: 'Factory name and location, water body affected, distance between discharge point and water source, and type of industry.'
    },
    {
      title: 'Sewage Treatment Awareness Project',
      description: 'Visit a sewage treatment plant (with permission), understand the treatment process, document each stage from primary to tertiary treatment, learn about sludge disposal, and create educational content explaining why proper sewage treatment is crucial.',
      instructions: 'Show all treatment stages, interview plant operators, understand capacity and daily processing volume, check if treated water meets discharge standards, and create an informative video for public awareness.',
      minVideoDuration: 5,
      maxVideoDuration: 7,
      requireLocation: true,
      locationInstructions: 'Treatment plant name, location, capacity, areas served, and permission details for visit.'
    },
    {
      title: 'Toilet-to-Tap Water Education Campaign',
      description: 'Create a comprehensive awareness campaign about the importance of not polluting water sources. Focus on proper toilet usage, not disposing medicines/chemicals in drains, oil disposal methods, and preventing plastic from entering water systems.',
      instructions: 'Design educational posters, conduct workshops in 3-5 households, demonstrate proper disposal methods, create short awareness videos, and measure knowledge improvement through pre/post surveys.',
      minVideoDuration: 3,
      maxVideoDuration: 5,
      requireLocation: true,
      locationInstructions: 'Campaign area (neighborhood/colony name), number of households reached, and major water pollution issues in that area.'
    },
    {
      title: 'Lake/Pond Restoration Project',
      description: 'Adopt a small polluted pond or lake for restoration. Clean the periphery, remove invasive weeds, stop sewage inflow points, introduce native aquatic plants for natural filtration, and monitor biodiversity improvement over 3-4 weeks.',
      instructions: 'Document initial condition with water testing, cleanup process, sewage diversion efforts, native plant plantation, before/after photos, and return of birds/fish as indicators of restoration.',
      minVideoDuration: 5,
      maxVideoDuration: 8,
      requireLocation: true,
      locationInstructions: 'Pond/lake name and location, water body area, initial pollution level, permission from authorities, and restoration partners (NGO/community group).'
    },
    {
      title: 'Water Footprint Reduction Challenge',
      description: 'Calculate your household water footprint (direct and indirect water consumption including in food and products). Implement strategies to reduce it by 25% over 2 weeks through shorter showers, efficient washing, water-wise food choices, and reuse practices.',
      instructions: 'Document water footprint calculation methodology, baseline consumption data, daily reduction strategies implemented, track weekly progress, create awareness about virtual water in products, and show final reduction achieved.',
      minVideoDuration: 4,
      maxVideoDuration: 6,
      requireLocation: false
    }
  ]
};

// Helper function to get assignments by type
export const getAssignmentsByType = (type) => {
  return predefinedAssignments[type] || [];
};

// Helper function to get all assignment types
export const getAllAssignmentTypes = () => {
  return Object.keys(predefinedAssignments);
};
