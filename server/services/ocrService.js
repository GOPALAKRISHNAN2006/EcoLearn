import Tesseract from 'tesseract.js';

/**
 * OCR Service - Extract text from images using Tesseract.js
 * Optimized for handwritten and cursive text recognition
 * No Python required - pure JavaScript implementation
 */

class OCRService {
  constructor() {
    this.worker = null;
    this.isWorkerReady = false;
  }

  /**
   * Extract text from an image file with enhanced handwriting support
   * @param {Buffer|string} imageInput - Image buffer or base64 string
   * @param {boolean} isHandwritten - Whether the document is handwritten
   * @returns {Promise<{text: string, confidence: number}>}
   */
  async extractTextFromImage(imageInput, isHandwritten = true) {
    try {
      console.log('Starting OCR extraction...');

      // Use Tesseract.recognize directly (simpler and more reliable)
      // Note: logger removed as it causes DataCloneError in Node.js workers
      const result = await Tesseract.recognize(
        imageInput,
        'eng'
      );
      
      console.log('OCR recognition completed');

      // Post-process the text for better readability
      let processedText = this.postProcessText(result.data.text);
      
      // Extract individual words with confidence
      const wordDetails = result.data.words?.map(w => ({
        text: w.text,
        confidence: w.confidence
      })) || [];

      // Calculate average word confidence
      const avgWordConfidence = wordDetails.length > 0
        ? wordDetails.reduce((sum, w) => sum + w.confidence, 0) / wordDetails.length
        : (result.data.confidence || 0);

      console.log(`OCR Complete: ${wordDetails.length} words, ${avgWordConfidence.toFixed(1)}% avg confidence`);

      return {
        text: processedText,
        rawText: result.data.text,
        confidence: Math.round(avgWordConfidence),
        words: wordDetails.length,
        paragraphs: result.data.paragraphs?.length || 0,
        lines: result.data.lines?.length || 0,
        wordDetails: wordDetails.slice(0, 200) // first 200 words
      };
    } catch (error) {
      console.error('OCR Error:', error);
      throw new Error(`OCR extraction failed: ${error.message}`);
    }
  }

  /**
   * Post-process extracted text to clean up common OCR errors
   * @param {string} text - Raw OCR text
   * @returns {string} - Cleaned text
   */
  postProcessText(text) {
    if (!text) return '';

    let processed = text
      // Fix common OCR mistakes
      .replace(/\|/g, 'l')  // Pipe often misread as 'l'
      .replace(/0(?=[a-zA-Z])/g, 'O')  // Zero before letters -> O
      .replace(/(?<=[a-zA-Z])0/g, 'o')  // Zero after letters -> o
      .replace(/1(?=[a-zA-Z])/g, 'l')  // One before letters -> l
      .replace(/rn/g, 'm')  // 'rn' often misread as 'm'
      .replace(/vv/g, 'w')  // 'vv' often misread as 'w'
      .replace(/\s+/g, ' ')  // Multiple spaces to single
      .replace(/\n\s*\n/g, '\n\n')  // Clean up multiple newlines
      .trim();

    // Fix common word breaks in cursive
    processed = processed
      .replace(/(\w)\s+(?=ing\b)/gi, '$1')  // Fix broken "-ing"
      .replace(/(\w)\s+(?=tion\b)/gi, '$1')  // Fix broken "-tion"
      .replace(/(\w)\s+(?=ed\b)/gi, '$1')  // Fix broken "-ed"
      .replace(/(\w)\s+(?=ly\b)/gi, '$1');  // Fix broken "-ly"

    return processed;
  }

  /**
   * Extract text from multiple images
   * @param {Array} images - Array of image buffers or base64 strings
   * @returns {Promise<Array>}
   */
  async extractTextFromMultipleImages(images) {
    const results = [];
    
    for (let i = 0; i < images.length; i++) {
      try {
        console.log(`Processing image ${i + 1}/${images.length}...`);
        const result = await this.extractTextFromImage(images[i], true);
        results.push({
          index: i,
          success: true,
          ...result
        });
      } catch (error) {
        results.push({
          index: i,
          success: false,
          error: error.message,
          text: ''
        });
      }
    }

    return results;
  }

  /**
   * Extract text from base64 encoded image
   * @param {string} base64String - Base64 encoded image
   * @returns {Promise<{text: string, confidence: number}>}
   */
  async extractTextFromBase64(base64String) {
    try {
      // Remove data URL prefix if present
      const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      
      console.log(`Processing base64 image (${Math.round(buffer.length / 1024)}KB)...`);
      
      return await this.extractTextFromImage(buffer, true);
    } catch (error) {
      console.error('Base64 OCR Error:', error);
      throw new Error(`OCR extraction from base64 failed: ${error.message}`);
    }
  }

  /**
   * Check if text is readable (quality check)
   * @param {string} text - Extracted text
   * @param {number} confidence - OCR confidence score
   * @returns {{isReadable: boolean, quality: string, message: string}}
   */
  checkTextQuality(text, confidence) {
    const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
    
    // Adjusted thresholds for handwritten text (lower expectations)
    if (confidence >= 70 && wordCount >= 10) {
      return {
        isReadable: true,
        quality: 'excellent',
        message: 'Text extracted with high confidence'
      };
    } else if (confidence >= 50 && wordCount >= 5) {
      return {
        isReadable: true,
        quality: 'good',
        message: 'Text extracted with acceptable confidence'
      };
    } else if (confidence >= 30 && wordCount >= 3) {
      return {
        isReadable: true,
        quality: 'fair',
        message: 'Text partially readable - handwriting may affect accuracy'
      };
    } else if (wordCount >= 2) {
      return {
        isReadable: true,
        quality: 'low',
        message: 'Limited text detected - please ensure clear handwriting'
      };
    } else {
      return {
        isReadable: false,
        quality: 'poor',
        message: 'Unable to read text - try better lighting or clearer handwriting'
      };
    }
  }
}

export default new OCRService();
