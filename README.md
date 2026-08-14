# [🌱 EcoLearning - Environmental Education Platform](https://eco-learn-sih25.vercel.app/)

A comprehensive environmental education platform featuring AI-powered grading, real-world assignments, interactive lessons, student progress tracking, and gamified learning experiences.

## 🎯 Overview

EcoLearning is a full-stack web application designed to make environmental education engaging and actionable. Students complete hands-on projects in their communities while teachers monitor progress and provide feedback through an intuitive dashboard.

### ✨ Key Features

- 🤖 **AI-Powered Grading** - Automatic assignment evaluation using Gemini AI
- 🌍 **Real-World Assignments** - 30 predefined environmental projects (Land, Air, Water pollution)
- 👨‍🏫 **Teacher Dashboard** - Class management, assignment creation, student tracking
- 👨‍🎓 **Student Portal** - Assignment submission, progress tracking, achievements
- 📊 **Analytics** - Detailed insights into student performance
- 🎮 **Gamification** - Badges, achievements, and progress tracking
- 📹 **Video Integration** - AI-generated educational videos
- 💬 **AI Chat Assistant** - Environmental education chatbot
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile

## 🏗️ Tech Stack

### Frontend
- **Framework:** React 18 with Vite
- **UI Library:** Radix UI + Tailwind CSS
- **State Management:** React Query
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Forms:** React Hook Form
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js with Express
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (JSON Web Tokens)
- **File Upload:** Multer
- **AI Integration:** Google Gemini API
- **Video Generation:** Kling AI, Replicate

### Deployment
- **Platform:** Vercel (Frontend + Backend)
## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account (for database)
- Git

### Local Development Setup

#### 1. Clone the Repository

```bash
git clone https://github.com/Barathramesh/EcoLearning.git
cd EcoLearning
```

#### 2. Backend Setup

```bash
cd server
npm install

# Create environment file
cp .env.example .env
```

**Edit `server/.env` with your  configuration:**

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecolearning
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters

# AI API Keys
GEMINI_API_KEY_GRADING=your_gemini_api_key
GEMINI_API_KEY_ASSIGNMENT=your_gemini_api_key
GEMINI_API_KEY_QUIZ=your_gemini_api_key

# Video Generation (Optional)
KLING_ACCESS_KEY=your_kling_access_key
KLING_SECRET_KEY=your_kling_secret_key
```

**Start the backend server:**

```bash
npm run dev
```

Backend runs at: `http://localhost:5000`

#### 3. Frontend Setup

```bash
cd client
npm install

# Create environment file
echo "VITE_API_URL=http://localhost:5000/api" > .env

# Start development server
npm run dev
```

Frontend runs at: `http://localhost:3000`

#### 4. Seed Demo Data (Optional)

```bash
cd server
npm run seed
```

This creates demo users:
- Admin: `admin@ecolearning.com` / `admin123`
- Teacher: `teacher@ecolearning.com` / `teacher123`
- Student: `student@ecolearning.com` / `student123`

### 🔑 Getting API Keys

#### Google Gemini API
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy and paste into `.env` file

#### Kling AI (Optional - for video generation)
1. Sign up at [Kling AI](https://app.klingai.com/)
2. Get your access and secret keys
3. Add to `.env` file

#### MongoDB Atlas
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Create database user
4. Whitelist your IP: `0.0.0.0/0` for development
5. Get connection string and add to `.env`

## 📚 Core Features Explained

### 🎯 30 Predefined Real-World Assignments

The platform includes 30 professionally designed environmental assignments across three categories:

#### 🌱 Land Pollution (10 Assignments)
- Community Clean-Up Drive
- Plastic Waste Audit at Home
- School/Office Waste Segregation System
- Composting Project
- E-Waste Collection Drive
- Single-Use Plastic Alternative Campaign
- Urban Garden on Polluted Land
- Landfill Site Visit and Impact Study
- Vermicomposting Workshop
- Zero-Waste Challenge

#### 💨 Air Pollution (10 Assignments)
- Air Quality Monitoring
- Tree Plantation Drive
- Vehicle Emission Check Campaign
- Public Transport Promotion
- Indoor Air Quality Improvement
- Anti-Burning Campaign
- Bicycle Commuting Challenge
- Industrial Air Pollution Study
- Carpool Organization
- Construction Dust Control Monitoring

#### 💧 Water Pollution (10 Assignments)
- Local Water Body Cleanup
- Household Greywater Recycling
- Rainwater Harvesting Installation
- Water Quality Testing
- Kitchen Water Conservation Challenge
- Industrial Effluent Investigation
- Sewage Treatment Awareness
- Water Education Campaign
- Lake/Pond Restoration Project
- Water Footprint Reduction Challenge

### 🤖 AI-Powered Features

#### Automatic Grading
- **Content Accuracy Analysis** (40%)
- **Originality/Uniqueness Detection** (25%)
- **Topic Relevance Check** (20%)
- **Writing Quality Assessment** (15%)

#### AI Assignment Generation
- Generates expected answers based on assignment title
- Creates key points students should cover
- Customizable grading criteria

#### AI Chat Assistant
- Answers environmental questions
- Provides guidance on assignments
- Educational support for students

### 👨‍🏫 Teacher Dashboard

- **Class Management:** Create and manage multiple classes
- **Student Management:** Add students, track progress
- **Assignment Creation:** 
  - Traditional assignments with AI grading
  - Pollution projects with predefined templates
  - Custom requirements (location, video duration)
- **Submission Review:** View and grade student work
- **Analytics:** Track class performance and trends
- **Video Lesson Generation:** AI-powered educational videos

### 👨‍🎓 Student Portal

- **Assignment Submission:** Upload text, images, videos
- **Progress Tracking:** View grades and feedback
- **Achievement System:** Earn badges and rewards
- **AI Chat:** Get instant help with questions
- **Interactive Games:** Learn through play
- **Video Lessons:** Watch educational content

## 🌐 Production Deployment to Vercel

### Quick Deployment (15 minutes)

#### Step 1: Prepare MongoDB Atlas

1. Create account at [MongoDB Atlas](https://cloud.mongodb.com)
2. Create free cluster
3. Create database user with password
4. Network Access: Allow `0.0.0.0/0` (for Vercel)
5. Copy connection string

#### Step 2: Deploy Backend

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository
4. **Settings:**
   - Root Directory: **`server`**
   - Framework Preset: **Other**
   - Build Command: (leave empty)
   - Output Directory: (leave empty)

5. **Environment Variables:**
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_minimum_32_chars
GEMINI_API_KEY_GRADING=your_key
GEMINI_API_KEY_ASSIGNMENT=your_key
GEMINI_API_KEY_QUIZ=your_key
KLING_ACCESS_KEY=your_key
KLING_SECRET_KEY=your_key
```

6. Click **Deploy**
7. **Copy backend URL:** `https://your-backend.vercel.app`

#### Step 3: Deploy Frontend

1. In Vercel Dashboard, click **"Add New"** → **"Project"**
2. Import **same** GitHub repository
3. **Settings:**
   - Root Directory: **`client`**
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Environment Variables:**
```env
VITE_API_URL=https://your-backend.vercel.app/api
```

5. Click **Deploy**
6. **Done!** Your app is live! 🎉

#### Step 4: Test Deployment

- ✅ Visit backend URL (shows "API is Working")
- ✅ Visit frontend URL
- ✅ Test registration and login
- ✅ Create a class and assignment
- ✅ Check browser console for errors

### Alternative: Deploy via CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy backend
cd server
vercel login
vercel --prod

# Deploy frontend
cd ../client
vercel --prod
```

## 📖 API Documentation

### Base URL
- Development: `http://localhost:5000/api`
- Production: `https://your-backend.vercel.app/api`

### Authentication
Most endpoints require JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Main Endpoints

#### Authentication
- `POST /api/student/register` - Register student
- `POST /api/student/login` - Student login
- `POST /api/teacher/register` - Register teacher
- `POST /api/teacher/login` - Teacher login
- `POST /api/admin/login` - Admin login

#### Classes
- `GET /api/class/teacher/:teacherId` - Get teacher's classes
- `POST /api/class/create` - Create new class
- `GET /api/class/:classId` - Get class details
- `PUT /api/class/:classId` - Update class
- `DELETE /api/class/:classId` - Delete class

#### Assignments
- `POST /api/assignment/create` - Create assignment
- `GET /api/assignment/class/:classId` - Get class assignments
- `POST /api/assignment/generate-answer` - AI generate expected answer
- `GET /api/assignment/:assignmentId` - Get assignment details
- `DELETE /api/assignment/:assignmentId` - Delete assignment

#### Submissions
- `POST /api/submission/submit` - Submit assignment
- `GET /api/submission/assignment/:assignmentId` - Get all submissions
- `GET /api/submission/student/:studentId` - Get student submissions
- `PUT /api/submission/:submissionId/grade` - Grade submission

#### AI Chat
- `POST /api/ai-chat/send` - Send message to AI assistant
- `GET /api/ai-chat/history/:userId` - Get chat history

#### Video Lessons
- `POST /api/video-lesson/generate` - Generate AI video
- `GET /api/video-lesson/:lessonId` - Get video lesson

## 🔧 Configuration Files

### `client/vercel.json`
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "installCommand": "npm install"
}
```

### `server/vercel.json`
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/uploads/(.*)",
      "dest": "/uploads/$1"
    },
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

## 🧪 Testing

### Manual Testing

1. **Authentication Flow:**
   - Register new accounts (student, teacher)
   - Login with credentials
   - Verify JWT token storage

2. **Teacher Workflow:**
   - Create a class
   - Add students to class
   - Create traditional assignment
   - Create pollution project assignment
   - Review submissions

3. **Student Workflow:**
   - View assigned work
   - Submit assignment
   - Check grades and feedback
   - Use AI chat assistant

4. **AI Features:**
   - Test AI grading
   - Generate expected answers
   - Use chat assistant

## 🐛 Troubleshooting

### Common Issues

**Issue:** Cannot connect to MongoDB
**Solution:** 
- Check MongoDB connection string format
- Verify network access allows `0.0.0.0/0`
- Ensure database user has correct permissions

**Issue:** API calls return 404
**Solution:**
- Verify `VITE_API_URL` ends with `/api`
- Check backend is running
- Verify endpoint URLs in frontend code

**Issue:** CORS errors
**Solution:**
- Backend already configured for CORS
- If custom domain, update CORS origin in `server.js`

**Issue:** File uploads fail
**Solution:**
- Vercel has file size limits (4.5MB for free tier)
- Consider using cloud storage (AWS S3, Cloudinary)

**Issue:** Environment variables not working
**Solution:**
- Redeploy after adding/changing variables
- Verify variable names match exactly (case-sensitive)
- Check `.env` files not committed to git

## 📊 Project Statistics

- **Total Lines of Code:** ~15,000+
- **Components:** 50+ React components
- **API Endpoints:** 40+ REST endpoints
- **Database Models:** 12 MongoDB schemas
- **Predefined Assignments:** 30 real-world projects
- **AI Integrations:** 3 (Gemini, Kling, Replicate)

## 🤝 Contributing

We welcome contributions! Here's how:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/YourFeature`
3. Commit changes: `git commit -m 'Add YourFeature'`
4. Push to branch: `git push origin feature/YourFeature`
5. Open a Pull Request

### Development Guidelines

- Follow existing code style
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation if needed
- Add comments for complex logic

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- **Barathramesh** - *Initial work* - [GitHub](https://github.com/Barathramesh)

## 🙏 Acknowledgments

- Google Gemini AI for grading capabilities
- MongoDB Atlas for database hosting
- Vercel for seamless deployment
- Radix UI and Tailwind CSS for beautiful UI components
- All contributors and testers

## 📞 Support

For questions or issues:
- Open an issue on GitHub
- Email: support@ecolearning.com (if available)
- Documentation: Check this README thoroughly

## 🚀 Roadmap

### Upcoming Features

- [ ] Mobile app (React Native)
- [ ] Real-time notifications
- [ ] Parent portal
- [ ] Advanced analytics dashboard
- [ ] Integration with LMS platforms
- [ ] Multi-language support
- [ ] Offline mode
- [ ] Video conferencing integration
- [ ] Enhanced gamification
- [ ] Social features (student collaboration)

## 💡 Tips for Success

1. **Start Local:** Test everything locally before deploying
2. **Environment Variables:** Keep them secure, never commit `.env`
3. **MongoDB:** Use indexes for better performance
4. **Error Handling:** Check browser console and server logs
5. **API Keys:** Monitor usage to avoid rate limits
6. **Backups:** Regular database backups recommended
7. **Updates:** Keep dependencies updated for security

---

**Built with ❤️ for environmental education**

*Last Updated: December 14, 2025*

```bash
cd Backend
npm install
npm run dev
```

The backend will run on `http://localhost:5000`
