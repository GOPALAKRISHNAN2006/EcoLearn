import Assignment from '../models/Assignment.js';
import Class from '../models/Class.js';
import Student from '../models/Student.js';
import fetch from 'node-fetch';

// Create a new assignment
export const createAssignment = async (req, res) => {
  try {
    const { title, subject, description, classId, className, maxPoints, type, teacherId, teacherName, dueDate, expectedAnswer, keyPoints, enableAIGrading } = req.body;

    // Validate required fields
    if (!title || !subject || !classId || !className || !teacherId || !teacherName || !dueDate) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields: title, subject, classId, className, teacherId, teacherName, dueDate' 
      });
    }

    // Get total students from class
    let totalStudents = 0;
    try {
      const classData = await Class.findById(classId);
      if (classData) {
        // Count students matching the class
        const studentCount = await Student.countDocuments({
          studentClass: { $regex: new RegExp(`${classData.grade}.*${classData.section}`, 'i') }
        });
        totalStudents = studentCount;
      }
    } catch (err) {
      console.error('Error counting students:', err);
    }

    const assignment = new Assignment({
      title,
      subject,
      description: description || '',
      classId,
      className,
      maxPoints: maxPoints || 100,
      type: type || 'traditional',
      dueDate,
      totalStudents,
      submissions: 0,
      avgScore: 0,
      teacherId,
      teacherName,
      status: 'published',
      expectedAnswer: expectedAnswer || '',
      keyPoints: keyPoints || [],
      enableAIGrading: enableAIGrading !== false
    });

    await assignment.save();

    res.status(201).json({
      success: true,
      message: 'Assignment published successfully',
      assignment
    });
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ success: false, message: 'Error creating assignment', error: error.message });
  }
};

// Get all assignments for a specific class
export const getAssignmentsByClass = async (req, res) => {
  try {
    const { classId } = req.params;

    const assignments = await Assignment.find({ 
      classId, 
      status: 'published' 
    }).sort({ createdAt: -1 });

    res.status(200).json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ message: 'Error fetching assignments', error: error.message });
  }
};

// Get all assignments for a teacher
export const getAssignmentsByTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;

    const assignments = await Assignment.find({ teacherId }).sort({ createdAt: -1 });

    res.status(200).json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ message: 'Error fetching assignments', error: error.message });
  }
};

// Get a single assignment by ID
export const getAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await Assignment.findById(id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    res.status(200).json(assignment);
  } catch (error) {
    console.error('Error fetching assignment:', error);
    res.status(500).json({ message: 'Error fetching assignment', error: error.message });
  }
};

// Update an assignment
export const updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const assignment = await Assignment.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    res.status(200).json({
      message: 'Assignment updated successfully',
      assignment
    });
  } catch (error) {
    console.error('Error updating assignment:', error);
    res.status(500).json({ message: 'Error updating assignment', error: error.message });
  }
};

// Delete an assignment
export const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await Assignment.findByIdAndDelete(id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    res.status(200).json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({ message: 'Error deleting assignment', error: error.message });
  }
};

// Get assignments by class grade and section
export const getAssignmentsByGradeSection = async (req, res) => {
  try {
    const { grade, section } = req.params;
    const className = `${grade}-${section}`;

    const assignments = await Assignment.find({ 
      className: { $regex: new RegExp(`^${grade}.*${section}$`, 'i') },
      status: 'published' 
    }).sort({ createdAt: -1 });

    res.status(200).json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ message: 'Error fetching assignments', error: error.message });
  }
};

// Helper function to call Gemini API with retry logic
const callGeminiWithRetry = async (prompt, apiKey, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048
          }
        })
      }
    );

    if (response.ok) {
      return response;
    }

    if (response.status === 429 && attempt < maxRetries) {
      // Rate limited - wait with exponential backoff (5s, 10s, 20s)
      const waitTime = Math.pow(2, attempt) * 2500;
      console.log(`Rate limited. Waiting ${waitTime/1000}s before retry ${attempt + 1}/${maxRetries}...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      continue;
    }

    throw new Error(`Gemini API error: ${response.status}`);
  }
};

// Generate expected answer using Gemini AI
export const generateExpectedAnswer = async (req, res) => {
  try {
    const { title, description, subject, maxPoints } = req.body;

    if (!title || !subject) {
      return res.status(400).json({
        success: false,
        message: 'Title and subject are required'
      });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY_ASSIGNMENT;
    
    if (!GEMINI_API_KEY) {
      return res.status(500).json({
        success: false,
        message: 'Gemini API key for assignments not configured'
      });
    }

    const prompt = `You are an expert teacher creating a model answer for an environmental science assignment.

Assignment Details:
- Title: ${title}
- Subject: ${subject}
- Description: ${description || 'Not provided'}
- Maximum Points: ${maxPoints || 100}

Please generate:
1. A comprehensive expected answer (300-500 words) that would receive full marks
2. 5 key points that should be included in a good answer

Format your response as JSON:
{
  "expectedAnswer": "The detailed model answer here...",
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3", "Key point 4", "Key point 5"]
}

Focus on environmental science concepts and ensure the answer is educational and appropriate for students.`;

    const response = await callGeminiWithRetry(prompt, GEMINI_API_KEY);

    const data = await response.json();
    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiText) {
      throw new Error('No response from Gemini API');
    }

    console.log('=== AI RESPONSE DEBUG ===');
    console.log('Raw AI text length:', aiText.length);
    console.log('First 500 chars:', aiText.substring(0, 500));
    console.log('========================');

    // Parse the JSON response from AI
    let parsedResponse;
    let cleanText = '';
    try {
      // Remove markdown code blocks if present
      cleanText = aiText.replace(/json\s*/g, '').replace(/\s*/g, '').trim();
      
      console.log('Clean text length:', cleanText.length);
      console.log('Clean text preview:', cleanText.substring(0, 100));
      
      // Try to parse the entire cleanText as JSON first
      try {
        parsedResponse = JSON.parse(cleanText);
        console.log('✅ Successfully parsed entire text as JSON');
      } catch (directParseError) {
        // If that fails, try to extract JSON object
        console.log('Direct parse failed, trying to extract JSON...');
        const jsonMatch = cleanText.match(/(\{[\s\S]*\})/);
        if (jsonMatch) {
          parsedResponse = JSON.parse(jsonMatch[1]);
          console.log('✅ Successfully parsed extracted JSON');
        } else {
          throw new Error('No JSON found in response');
        }
      }
      
      console.log('Expected Answer length:', parsedResponse.expectedAnswer?.length || 0);
      console.log('Key Points:', parsedResponse.keyPoints);
      console.log('Key Points count:', parsedResponse.keyPoints?.length || 0);
      
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError.message);
      console.log('Clean text sample:', cleanText.substring(0, 500));
      
      // If parsing fails, use the raw text as expected answer
      parsedResponse = {
        expectedAnswer: aiText,
        keyPoints: []
      };
    }

    // Ensure keyPoints is an array
    if (!Array.isArray(parsedResponse.keyPoints)) {
      parsedResponse.keyPoints = [];
    }

    res.status(200).json({
      success: true,
      expectedAnswer: parsedResponse.expectedAnswer || aiText,
      keyPoints: parsedResponse.keyPoints
    });

  } catch (error) {
    console.error('Error generating expected answer:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating expected answer',
      error: error.message
    });
  }
};

// Extract text from image using Gemini Vision API
export const extractTextFromImage = async (req, res) => {
  try {
    const { image, filename, mimeType } = req.body;

    console.log('Extract text request received:', { 
      hasImage: !!image, 
      imageLength: image?.length || 0,
      filename,
      mimeType 
    });

    if (!image) {
      return res.status(400).json({
        success: false,
        message: 'Image data is required'
      });
    }

    // Clean the base64 data - remove any data URL prefix if present
    let cleanImage = image;
    if (image.includes(',')) {
      cleanImage = image.split(',')[1];
    }
    // Remove any whitespace or newlines
    cleanImage = cleanImage.replace(/\s/g, '');

    console.log('Cleaned image length:', cleanImage.length);

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY_ASSIGNMENT;
    
    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY_ASSIGNMENT not found in environment');
      return res.status(500).json({
        success: false,
        message: 'Gemini API key for assignments not configured'
      });
    }

    // Detect MIME type from base64 header
    let detectedMimeType = mimeType || 'image/jpeg';
    if (cleanImage.startsWith('/9j/')) {
      detectedMimeType = 'image/jpeg';
    } else if (cleanImage.startsWith('iVBOR')) {
      detectedMimeType = 'image/png';
    } else if (cleanImage.startsWith('R0lGO')) {
      detectedMimeType = 'image/gif';
    } else if (cleanImage.startsWith('UklGR')) {
      detectedMimeType = 'image/webp';
    }

    console.log('Detected MIME type:', detectedMimeType);

    const prompt = `Extract ALL text from this image. Return ONLY the extracted text, nothing else.`;

    console.log('Calling Gemini API...');

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                inline_data: {
                  mime_type: detectedMimeType,
                  data: cleanImage
                }
              },
              { text: prompt }
            ]
          }]
        })
      }
    );

    console.log('Gemini API response status:', response.status);

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', errorData);
      
      // Handle rate limit specifically
      if (response.status === 429) {
        return res.status(429).json({
          success: false,
          message: 'API rate limit exceeded. Please wait a moment and try again.',
          error: 'Rate limit exceeded'
        });
      }
      
      throw new Error(`Gemini API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    const extractedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Calculate word count
    const wordCount = extractedText.trim().split(/\s+/).filter(w => w.length > 0).length;
    
    // Estimate quality based on word count
    let quality = 'good';
    let confidence = 85;
    let tips = [];

    if (wordCount < 10) {
      quality = 'poor';
      confidence = 40;
      tips = ['Image may be blurry or too dark', 'Try taking a clearer photo', 'Ensure good lighting'];
    } else if (wordCount < 30) {
      quality = 'fair';
      confidence = 65;
      tips = ['Some text may be unclear', 'Consider retaking if text is missing'];
    } else {
      confidence = 90;
      tips = ['Text extracted successfully'];
    }

    res.status(200).json({
      success: true,
      text: extractedText.trim(),
      wordCount,
      confidence,
      quality,
      tips
    });

  } catch (error) {
    console.error('Error extracting text from image:', error);
    res.status(500).json({
      success: false,
      message: 'Error extracting text from image',
      error: error.message
    });
  }
};