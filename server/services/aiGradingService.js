import fetch from "node-fetch";

class AIGradingService {
  constructor() {
    // API keys for server-side AI features
    this.apiKey = process.env.GEMINI_API_KEY_GRADING; // Default key for grading
    this.assignmentApiKey = process.env.GEMINI_API_KEY_ASSIGNMENT; // For assignment OCR/grading
    this.quizApiKey = process.env.GEMINI_API_KEY_QUIZ; // For quiz generation
    // Using gemini-2.5-flash model (latest stable version as of Dec 2025)
    this.apiUrl =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
    this.maxRetries = 3;
    this.baseDelay = 2000; // 2 seconds base delay
  }


  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Send request to Gemini API with retry logic for rate limiting
   * @param {string} prompt - The prompt to send
   * @param {number} retryCount - Current retry count
   * @param {string} apiKeyOverride - Optional API key to use instead of default
   */
  async callGeminiAPI(prompt, retryCount = 0, apiKeyOverride = null) {
    const apiKey = apiKeyOverride || this.apiKey;
    
    if (!apiKey) {
      console.error('❌ No API key available for Gemini!');
      throw new Error('Gemini API key not configured');
    }
    
    console.log('🔑 Using API key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'NONE');
    
    try {
      const response = await fetch(`${this.apiUrl}?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.1, // Lower temperature for more consistent, accurate grading
            maxOutputTokens: 4096,
          },
        }),
      });

      // Handle rate limiting (429) with retry
      if (response.status === 429) {
        if (retryCount < this.maxRetries) {
          const delay = this.baseDelay * Math.pow(2, retryCount); // Exponential backoff
          console.log(
            `Rate limited (429). Retrying in ${delay / 1000}s... (attempt ${
              retryCount + 1
            }/${this.maxRetries})`
          );
          await this.sleep(delay);
          return this.callGeminiAPI(prompt, retryCount + 1, apiKeyOverride);
        } else {
          throw new Error(
            "Rate limit exceeded. Please try again in a few minutes."
          );
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Gemini API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(`Gemini API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } catch (error) {
      // Retry on network errors too
      if (retryCount < this.maxRetries && error.message.includes("fetch")) {
        const delay = this.baseDelay * Math.pow(2, retryCount);
        console.log(
          `Network error. Retrying in ${delay / 1000}s... (attempt ${
            retryCount + 1
          }/${this.maxRetries})`
        );
        await this.sleep(delay);
        return this.callGeminiAPI(prompt, retryCount + 1, apiKeyOverride);
      }
      console.error("Gemini API Error:", error);
      throw error;
    }
  }

  /**
   * Parse JSON from AI response
   */
  parseJSONResponse(text) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return null;
    } catch (error) {
      console.error("JSON Parse Error:", error);
      return null;
    }
  }

  /**
   * Generate expected answer and key points using AI
   */
  async generateExpectedAnswer(
    title,
    description,
    subject,
    maxPoints,
    classLevel = ""
  ) {
    const prompt = `
You are an expert teacher creating a model answer for a student assignment.

CLASS LEVEL: ${classLevel || "School student"}
SUBJECT: ${subject}
ASSIGNMENT TITLE: ${title}
ASSIGNMENT DESCRIPTION/QUESTION: ${description || title}
MAX POINTS: ${maxPoints}

Generate a comprehensive model answer appropriate for the class level. The answer should be:
- Clear and simple enough for the student's grade level
- Cover all essential concepts
- Include specific facts, dates, names, or formulas that MUST be correct

Respond in this exact JSON format only:
{
  "expectedAnswer": "A comprehensive model answer covering all important aspects. Include specific facts that must be correct.",
  "keyPoints": [
    "Specific key point 1 that MUST be in the answer",
    "Specific key point 2 that MUST be in the answer",
    "Specific key point 3 that MUST be in the answer",
    "Specific key point 4 that MUST be in the answer",
    "Specific key point 5 that MUST be in the answer"
  ],
  "mustIncludeFacts": [
    "Specific fact, date, name, or formula that must be correct",
    "Another essential fact that must be accurate"
  ],
  "commonMistakes": [
    "Common wrong answer students might give",
    "Another incorrect concept to watch for"
  ]
}
`;

    try {
      const response = await this.callGeminiAPI(prompt);
      const result = this.parseJSONResponse(response);

      if (result) {
        return {
          success: true,
          expectedAnswer: result.expectedAnswer || "",
          keyPoints: result.keyPoints || [],
          mustIncludeFacts: result.mustIncludeFacts || [],
          commonMistakes: result.commonMistakes || [],
        };
      }

      return { success: false, error: "Failed to parse AI response" };
    } catch (error) {
      console.error("Error generating expected answer:", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * STRICT Answer Verification - Core grading function
   * Gives LOW marks for wrong/irrelevant content
   */
  async verifyAnswer(
    studentContent,
    expectedAnswer,
    keyPoints,
    topic,
    subject,
    classLevel = ""
  ) {
    const keyPointsList =
      keyPoints && keyPoints.length > 0
        ? keyPoints.map((p, i) =>`${i + 1}. ${p}`).join("\n")
        : "No specific key points provided";

    const prompt = `
You are a STRICT but fair teacher grading a student's assignment. Be ACCURATE in your evaluation.

CLASS LEVEL: ${classLevel || "School student"}
SUBJECT: ${subject}
TOPIC/QUESTION: ${topic}

EXPECTED ANSWER (What the student should have written):
${
  expectedAnswer ||
  "Evaluate based on the topic - check if content is factually correct"
}

KEY POINTS THAT MUST BE COVERED:
${keyPointsList}

STUDENT'S ANSWER:
${studentContent.substring(0, 10000)}

STRICT GRADING RULES:
1. If the answer is COMPLETELY WRONG or talks about something else entirely → Score 0-20
2. If the answer has MAJOR FACTUAL ERRORS → Score 20-40
3. If the answer is PARTIALLY CORRECT but missing key points → Score 40-60
4. If the answer is MOSTLY CORRECT with minor issues → Score 60-80
5. If the answer is EXCELLENT and covers everything → Score 80-100

BE STRICT:
- Wrong facts = Major penalty
- Off-topic content = Major penalty  
- Missing key concepts = Penalty
- Copied/generic content = Penalty
- Gibberish or random text = Score 0-10

Evaluate and respond in this exact JSON format only:
{
  "contentAccuracy": <number 0-100 - BE STRICT! Wrong content = LOW score>,
  "isCorrect": <boolean - true only if answer is substantially correct>,
  "wrongFacts": ["List any factually incorrect statements the student made"],
  "keyPointsCovered": ["List key points the student correctly addressed"],
  "keyPointsMissing": ["List important points the student missed"],
  "understanding": <number 0-100 - does student actually understand the topic?>,
  "feedback": "2-3 sentences explaining what was right and what was wrong. Be specific and simple."
}

Remember: A wrong answer should get a LOW score. Don't be generous with incorrect content.
`;

    const response = await this.callGeminiAPI(prompt);
    const result = this.parseJSONResponse(response);

    return (
      result || {
        contentAccuracy: 0,
        isCorrect: false,
        wrongFacts: [],
        keyPointsCovered: [],
        keyPointsMissing: keyPoints || [],
        understanding: 0,
        feedback: "Unable to verify answer",
      }
    );
  }

  /**
   * Check if content is relevant to the topic
   * Gives 0 for completely off-topic
   */
  async checkTopicRelevance(content, topic, subject) {
    const prompt = `
You are checking if a student's answer is relevant to the assigned topic.

SUBJECT: ${subject}
ASSIGNED TOPIC/QUESTION: ${topic}

STUDENT'S ANSWER:
${content.substring(0, 8000)}

STRICT EVALUATION:
- If the answer is about a COMPLETELY DIFFERENT topic → Score 0-15
- If the answer only slightly relates to the topic → Score 15-40
- If the answer is about the topic but misses the main point → Score 40-60
- If the answer addresses the topic reasonably → Score 60-80
- If the answer directly and fully addresses the topic → Score 80-100

Respond in this exact JSON format only:
{
  "score": <number 0-100 - be strict with off-topic content>,
  "isRelevant": <boolean - false if score below 40>,
  "topicMatch": "What topic does the student's answer actually discuss?",
  "feedback": "Simple 1-2 sentence explanation"
}
`;

    const response = await this.callGeminiAPI(prompt);
    const result = this.parseJSONResponse(response);

    return (
      result || {
        score: 0,
        isRelevant: false,
        topicMatch: "Unable to determine",
        feedback: "Unable to analyze topic relevance",
      }
    );
  }

  /**
   * Analyze content quality with simple feedback
   */
  async analyzeContentQuality(content, topic, subject, classLevel = "") {
    const prompt = `
You are a teacher evaluating the quality of a student's writing.

CLASS LEVEL: ${classLevel || "School student"}  
SUBJECT: ${subject}
TOPIC: ${topic}

STUDENT'S ANSWER:
${content.substring(0, 8000)}

Evaluate the writing quality appropriate for their class level.

STRICT GRADING:
- Random text or gibberish → Score 0-20
- Very poor grammar/structure → Score 20-40
- Basic but understandable → Score 40-60
- Good quality writing → Score 60-80
- Excellent writing → Score 80-100

Respond in this exact JSON format only:
{
  "score": <number 0-100>,
  "grammar": <number 0-100>,
  "clarity": <number 0-100>,
  "effort": <number 0-100 - did the student put in genuine effort?>,
  "strengths": ["1-2 simple things the student did well"],
  "improvements": ["1-2 simple things to improve, written for a student to understand"]
}
`;

    const response = await this.callGeminiAPI(prompt);
    const result = this.parseJSONResponse(response);

    return (
      result || {
        score: 0,
        grammar: 0,
        clarity: 0,
        effort: 0,
        strengths: [],
        improvements: [],
      }
    );
  }

  /**
   * Check for copied/AI content
   */
  async checkOriginality(content) {
    const prompt = `
Analyze if this appears to be original student work or copied/AI-generated content.

CONTENT:
${content.substring(0, 6000)}

Signs of NOT original work:
- Perfect, professional writing unlikely for a student
- Generic content that could apply to any similar topic
- Wikipedia-style or textbook-copied content
- Overly sophisticated vocabulary for a student
- AI-typical phrases like "In conclusion", "It's important to note", etc.

Respond in this exact JSON format only:
{
  "originalityScore": <number 0-100 - 100 means definitely original student work>,
  "isLikelyOriginal": <boolean>,
  "concerns": ["Any concerns about originality"],
  "feedback": "Brief assessment"
}
`;

    const response = await this.callGeminiAPI(prompt);
    const result = this.parseJSONResponse(response);

    return (
      result || {
        originalityScore: 50,
        isLikelyOriginal: true,
        concerns: [],
        feedback: "Unable to check originality",
      }
    );
  }

  /**
   * Main grading function - STRICT and ACCURATE
   */
  async gradeAssignment(studentContent, assignment, previousSubmissions = []) {
    console.log("Starting STRICT AI grading for:", assignment.title);

    const { title, subject, expectedAnswer, keyPoints, maxPoints, className } =
      assignment;

    // Extract class level from className (e.g., "Grade 5th - Section A" -> "5th grade")
    const classLevel = className || "";

    try {
      // Run checks SEQUENTIALLY to avoid rate limiting (429 errors)
      // Add small delays between calls
      const answerVerification = await this.verifyAnswer(
        studentContent,
        expectedAnswer,
        keyPoints,
        title,
        subject,
        classLevel
      );
      await this.sleep(500); // 500ms delay between API calls

      const topicRelevance = await this.checkTopicRelevance(
        studentContent,
        title,
        subject
      );
      await this.sleep(500);

      const contentQuality = await this.analyzeContentQuality(
        studentContent,
        title,
        subject,
        classLevel
      );
      await this.sleep(500);

      const originality = await this.checkOriginality(studentContent);

      // STRICT SCORING LOGIC
      let contentScore = answerVerification.contentAccuracy || 0;
      let relevanceScore = topicRelevance.score || 0;
      let qualityScore = contentQuality.score || 0;
      let originalityScore = originality.originalityScore || 50;

      // PENALTIES for wrong content
      // If answer is completely wrong or off-topic, cap the total score
      if (!answerVerification.isCorrect && contentScore < 30) {
        contentScore = Math.min(contentScore, 25);
      }

      if (!topicRelevance.isRelevant) {
        relevanceScore = Math.min(relevanceScore, 30);
        contentScore = Math.min(contentScore, 40); // Off-topic means content can't be fully right
      }

      // If there are wrong facts, penalize
      if (
        answerVerification.wrongFacts &&
        answerVerification.wrongFacts.length > 0
      ) {
        const penalty = Math.min(30, answerVerification.wrongFacts.length * 10);
        contentScore = Math.max(0, contentScore - penalty);
      }

      // Calculate weighted overall score
      // Content accuracy is most important (50%), then relevance (25%), then quality (15%), originality (10%)
      const overallScore = Math.round(
        contentScore * 0.5 +
          relevanceScore * 0.25 +
          qualityScore * 0.15 +
          originalityScore * 0.1
      );

      // Determine grade - STRICT grading scale
      let grade;
      if (overallScore >= 90) grade = "A+";
      else if (overallScore >= 85) grade = "A";
      else if (overallScore >= 80) grade = "A-";
      else if (overallScore >= 75) grade = "B+";
      else if (overallScore >= 70) grade = "B";
      else if (overallScore >= 65) grade = "B-";
      else if (overallScore >= 60) grade = "C+";
      else if (overallScore >= 55) grade = "C";
      else if (overallScore >= 50) grade = "C-";
      else if (overallScore >= 45) grade = "D+";
      else if (overallScore >= 40) grade = "D";
      else grade = "F";

      // Calculate actual score out of maxPoints
      const actualScore = Math.round((overallScore / 100) * maxPoints);

      // Compile flags
      const flags = [];

      if (!answerVerification.isCorrect) {
        flags.push({
          type: "incorrect_answer",
          severity: contentScore < 30 ? "critical" : "high",
          message: `Answer contains significant errors or is incorrect`,
        });
      }

      if (
        answerVerification.wrongFacts &&
        answerVerification.wrongFacts.length > 0
      ) {
        flags.push({
          type: "factual_errors",
          severity: "high",
          message: `Found ${answerVerification.wrongFacts.length} factual error(s)`,
        });
      }

      if (!topicRelevance.isRelevant) {
        flags.push({
          type: "off_topic",
          severity: relevanceScore < 20 ? "critical" : "high",
          message: `Answer is off-topic or doesn't address the question`,
        });
      }

      if (!originality.isLikelyOriginal) {
        flags.push({
          type: "originality_concern",
          severity: "medium",
          message: `Content may not be original student work`,
        });
      }

      // Generate SIMPLE, CLASS-LEVEL feedback
      const studentFeedback = this.generateSimpleFeedback(
        grade,
        actualScore,
        maxPoints,
        contentScore,
        relevanceScore,
        qualityScore,
        originalityScore,
        answerVerification,
        topicRelevance,
        contentQuality,
        classLevel
      );

      return {
        success: true,
        grade,
        score: actualScore,
        maxPoints,
        feedback: studentFeedback,
        aiGrading: {
          isGraded: true,
          gradedAt: new Date(),
          scores: {
            contentAccuracy: contentScore,
            uniqueness: originalityScore,
            relevance: relevanceScore,
            quality: qualityScore,
            overall: overallScore,
          },
          analysis: {
            isCorrect: answerVerification.isCorrect,
            wrongFacts: answerVerification.wrongFacts || [],
            keyPointsCovered: answerVerification.keyPointsCovered || [],
            keyPointsMissing: answerVerification.keyPointsMissing || [],
            strengths: contentQuality.strengths || [],
            improvements: contentQuality.improvements || [],
            topicMatch: topicRelevance.topicMatch,
          },
          flags,
          feedback: studentFeedback,
          confidence: this.calculateConfidence(
            answerVerification,
            topicRelevance,
            contentQuality
          ),
        },
      };
    } catch (error) {
      console.error("AI Grading Error:", error);
      return {
        success: false,
        error: error.message,
        aiGrading: {
          isGraded: false,
          flags: [
            {
              type: "grading_error",
              severity: "high",
              message: `AI grading failed: ${error.message}`,
            },
          ],
        },
      };
    }
  }

  /**
   * Generate SIMPLE feedback appropriate for class level
   */
  generateSimpleFeedback(
    grade,
    actualScore,
    maxPoints,
    contentScore,
    relevanceScore,
    qualityScore,
    originalityScore,
    answerVerification,
    topicRelevance,
    contentQuality,
    classLevel
  ) {
    let feedback = "";

    // Start with what went wrong (if anything)
    if (!answerVerification.isCorrect || contentScore < 50) {
      feedback +=`⚠ **Your answer needs improvement.**\n\n`;

      if (!topicRelevance.isRelevant) {
        feedback += `❌ **Problem:** Your answer was about "${topicRelevance.topicMatch}" but the question asked about something different.\n\n`;
      }

      if (
        answerVerification.wrongFacts &&
        answerVerification.wrongFacts.length > 0
      ) {
        feedback += `❌ **Mistakes in your answer:**\n`;
        answerVerification.wrongFacts.slice(0, 3).forEach((fact) => {
          feedback += `• ${fact}\n`;
        });
        feedback += `\n`;
      }

      if (answerVerification.feedback) {
        feedback += `📝 **What you should know:** ${answerVerification.feedback}\n\n`;
      }
    } else {
      // Good answer
      if (grade.startsWith("A")) {
        feedback += `🌟 **Excellent work!** You understood the topic very well.\n\n`;
      } else if (grade.startsWith("B")) {
        feedback += `👍 **Good job!** You got most of it right.\n\n`;
      } else {
        feedback += `📚 **Okay work.** You understood the basics.\n\n`;
      }
    }

    // What they got right
    if (
      answerVerification.keyPointsCovered &&
      answerVerification.keyPointsCovered.length > 0
    ) {
      feedback += `✅ **What you did well:**\n`;
      answerVerification.keyPointsCovered.slice(0, 3).forEach((point) => {
        feedback += `• ${point}\n`;
      });
      feedback += `\n`;
    }

    // What they missed
    if (
      answerVerification.keyPointsMissing &&
      answerVerification.keyPointsMissing.length > 0
    ) {
      feedback += `📖 **What you should add next time:**\n`;
      answerVerification.keyPointsMissing.slice(0, 3).forEach((point) => {
        feedback += `• ${point}\n`;
      });
      feedback += `\n`;
    }

    // Simple improvements from quality analysis
    if (contentQuality.improvements && contentQuality.improvements.length > 0) {
      feedback += `💡 **Tips to improve:**\n`;
      contentQuality.improvements.slice(0, 2).forEach((imp) => {
        feedback += ` • ${imp}\n`;
      });
      feedback += `\n`;
    }

    // Encouragement based on score
    if (actualScore < maxPoints * 0.4) {
      feedback += `💪 Don't give up! Read your textbook again and try to understand the topic better. You can do it!\n`;
    } else if (actualScore < maxPoints * 0.6) {
      feedback += `📚 Keep studying! You're getting there. Focus on the points mentioned above.\n`;
    } else if (actualScore < maxPoints * 0.8) {
      feedback += `👏 Good effort! A little more detail would make your answer even better.\n`;
    } else {
      feedback += `⭐ Great work! Keep it up!\n`;
    }

    return feedback;
  }

  /**
   * Calculate confidence score
   */
  calculateConfidence(answerVerification, topicRelevance, contentQuality) {
    let confidence = 0;

    if (answerVerification.contentAccuracy !== undefined) confidence += 35;
    if (topicRelevance.score !== undefined) confidence += 35;
    if (contentQuality.score !== undefined) confidence += 30;

    return Math.min(100, confidence);
  }

  /**
   * Legacy function for backward compatibility
   */
  async verifyAssignment(content, topic, subject) {
    return this.gradeAssignment(content, {
      title: topic,
      subject: subject,
      maxPoints: 100,
    });
  }

  /**
   * Generate quiz questions from syllabus content using AI
   * @param {Object} syllabusData - The syllabus data containing title, subject, grade, content, topics
   * @returns {Object} - Generated quiz with 10 MCQ questions
   */
  async generateQuizFromSyllabus(syllabusData) {
    const { title, subject, grade, content, topics, description } =
      syllabusData;

    const topicsText =
      topics && topics.length > 0
        ? topics
            .map((t) => `- ${t.topicName}: ${t.description || ""}`)
            .join("\n")
        : "";

    // Build context based on what's available
    let contextInfo = "";
    if (content && content.trim()) {
      contextInfo += `\nContent Details: ${content}`;
    }
    if (description && description.trim()) {
      contextInfo += `\nDescription: ${description}`;
    }
    if (topicsText) {
      contextInfo += `\nTopics Covered:\n${topicsText}`;
    }

    const prompt = `
You are an expert educational content creator and teacher. Generate a quiz with exactly 10 multiple choice questions.

TOPIC: "${title}"
SUBJECT: ${subject || "General"}
GRADE LEVEL: ${grade || "School level"}
${contextInfo}

YOUR TASK:
Based on the TOPIC "${title}", create 10 educational multiple choice questions that test knowledge about this subject. Use your expertise to generate questions covering the key concepts, facts, definitions, and applications related to "${title}".

IMPORTANT GUIDELINES:
1. Create exactly 10 MCQ questions about "${title}"
2. Each question must have exactly 4 options (A, B, C, D)
3. Questions should cover different aspects of the topic:
   - Basic definitions and concepts (2-3 questions)
   - Key facts and information (2-3 questions)
   - Applications and examples (2-3 questions)
   - Understanding and analysis (2-3 questions)
4. Questions should be appropriate for ${grade || "school"} level students
5. Include a mix of easy, medium, and challenging questions
6. Each question must have ONE clear correct answer
7. Provide a brief, educational explanation for each correct answer
8. Make sure all facts in questions and answers are ACCURATE

Respond in this EXACT JSON format only (no additional text before or after):
{
  "questions": [
    {
      "question": "What is [specific question about ${title}]?",
      "options": ["Correct answer", "Wrong option B", "Wrong option C", "Wrong option D"],
      "correctAnswer": 0,
      "explanation": "Brief explanation of why this answer is correct"
    },
    {
      "question": "Second question about ${title}?",
      "options": ["Wrong A", "Correct answer", "Wrong C", "Wrong D"],
      "correctAnswer": 1,
      "explanation": "Explanation for question 2"
    }
  ]
}

IMPORTANT:
- "correctAnswer" is the INDEX (0-3) of the correct option in the options array
- 0 = first option (A), 1 = second option (B), 2 = third option (C), 3 = fourth option (D)
- Generate exactly 10 questions
- Make questions educational and relevant to the syllabus content
`;

    try {
      console.log("Generating quiz questions for:", title);
      // Use quiz-specific API key
      const response = await this.callGeminiAPI(prompt, 0, this.quizApiKey);
      const result = this.parseJSONResponse(response);

      if (result && result.questions && Array.isArray(result.questions)) {
        // Validate and ensure we have exactly 10 questions
        const validQuestions = result.questions
          .filter(
            (q) =>
              q.question &&
              q.options &&
              Array.isArray(q.options) &&
              q.options.length === 4 &&
              typeof q.correctAnswer === "number" &&
              q.correctAnswer >= 0 &&
              q.correctAnswer <= 3
          )
          .slice(0, 10)
          .map((q) => ({
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || "No explanation provided",
          }));

        // If we don't have 10 valid questions, pad with empty ones
        while (validQuestions.length < 10) {
          validQuestions.push({
            question: "",
            options: ["", "", "", ""],
            correctAnswer: 0,
            explanation: "",
          });
        }

        console.log(
          `Successfully generated ${validQuestions.length} quiz questions`
        );

        return {
          success: true,
          quiz: {
            questions: validQuestions,
            passingScore: 70,
            timeLimit: 600, // 10 minutes in seconds
          },
        };
      }

      console.error("Failed to parse quiz response:", response);
      return {
        success: false,
        error: "Failed to parse AI response for quiz generation",
        quiz: null,
      };
    } catch (error) {
      console.error("Error generating quiz:", error);
      return {
        success: false,
        error: error.message,
        quiz: null,
      };
    }
  }
}

export default new AIGradingService();