const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const Skill = require('../models/Skill');
const ApiError = require('../utils/ApiError');

/**
 * Service to extract and parse raw text from PDF/DOCX resumes.
 */
class ResumeParserService {
  /**
   * Extracts raw text from file buffer based on mimetype.
   * 
   * @param {Buffer} buffer - File buffer
   * @param {string} mimetype - Mimetype of file (pdf or docx)
   * @returns {Promise<string>} Raw extracted text
   */
  static async extractRawText(buffer, mimetype) {
    if (!buffer) {
      throw ApiError.badRequest('File buffer is required');
    }

    try {
      if (mimetype === 'application/pdf') {
        const data = await pdfParse(buffer);
        return data.text || '';
      } else if (
        mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        mimetype === 'application/msword'
      ) {
        const result = await mammoth.extractRawText({ buffer });
        return result.value || '';
      } else {
        throw ApiError.badRequest('Unsupported file type. Only PDF and DOCX are allowed.');
      }
    } catch (error) {
      console.error('Resume Text Extraction Error:', error.message);
      if (error instanceof ApiError) throw error;
      throw ApiError.internal(`Failed to extract text from resume: ${error.message}`);
    }
  }

  /**
   * Parses raw resume text to extract candidate details.
   * Matches candidate skills against active skills in the database.
   * 
   * @param {string} text - Raw extracted text
   * @returns {Promise<object>} Mapped candidate profile fields
   */
  static async parseResumeText(text) {
    if (!text || text.trim().length === 0) {
      return this._getDefaultParsedStructure();
    }

    try {
      // 1. Extract Email
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const emails = text.match(emailRegex) || [];
      const extractedEmail = emails[0] || null;

      // 2. Extract Phone
      const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,5}\)?[-.\s]?\d{2,5}[-.\s]?\d{2,9}/g;
      const phones = text.match(phoneRegex) || [];
      const extractedPhone = phones[0] ? phones[0].trim() : null;

      // 3. Extract Name (Heuristic: Look at first 3 non-empty lines)
      const lines = text
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
      let extractedName = null;

      // Filter out lines containing email/phone/website to find name
      const nameCandidateLines = lines.slice(0, 5).filter((line) => {
        const hasEmail = line.includes('@');
        const hasDigits = (line.match(/\d/g) || []).length > 5;
        const isCommonHeader = /curriculum|vitae|resume|page|contact|profile/i.test(line);
        return !hasEmail && !hasDigits && !isCommonHeader && line.length < 50;
      });

      if (nameCandidateLines.length > 0) {
        extractedName = nameCandidateLines[0];
      }

      // 4. Match Skills against database
      const dbSkills = await Skill.find({ isActive: true }).select('name');
      const extractedSkills = [];
      const lowerText = text.toLowerCase();

      for (const skill of dbSkills) {
        const skillName = skill.name;
        // Escape regex special chars
        const escapedName = skillName.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
        // Match skill name with word boundaries (e.g., matching "Java" but not "Javascript")
        // Also supports C++ / C# / .NET edge cases
        let boundaryPattern;
        if (/^[a-zA-Z0-9_]/.test(escapedName) && /[a-zA-Z0-9_]$/.test(escapedName)) {
          boundaryPattern = `\\b${escapedName}\\b`;
        } else {
          boundaryPattern = escapedName;
        }

        const skillRegex = new RegExp(boundaryPattern, 'i');
        if (skillRegex.test(lowerText)) {
          extractedSkills.push(skillName);
        }
      }

      // 5. Extract Education (Heuristic check for common degrees)
      const extractedEducation = [];
      const educationKeywords = [
        { degree: 'B.Tech', patterns: [/b\.?tech/i, /bachelor of technology/i] },
        { degree: 'M.Tech', patterns: [/m\.?tech/i, /master of technology/i] },
        { degree: 'B.E', patterns: [/\bbe\b/i, /b\.?e\.?\b/i, /bachelor of engineering/i] },
        { degree: 'M.E', patterns: [/\bme\b/i, /m\.?e\.?\b/i, /master of engineering/i] },
        { degree: 'B.Sc', patterns: [/b\.?sc/i, /bachelor of science/i] },
        { degree: 'M.Sc', patterns: [/m\.?sc/i, /master of science/i] },
        { degree: 'BCA', patterns: [/\bbca\b/i, /bachelor of computer applications/i] },
        { degree: 'MCA', patterns: [/\bmca\b/i, /master of computer applications/i] },
        { degree: 'MBA', patterns: [/\bmba\b/i, /master of business administration/i] },
        { degree: 'Ph.D', patterns: [/ph\.?d/i, /doctor of philosophy/i] },
        { degree: 'B.A', patterns: [/\bba\b/i, /b\.?a\.?\b/i, /bachelor of arts/i] },
        { degree: 'M.A', patterns: [/\bma\b/i, /m\.?a\.?\b/i, /master of arts/i] },
        { degree: 'Bachelor', patterns: [/bachelor/i] },
        { degree: 'Master', patterns: [/master/i] },
      ];

      // Scan lines for education degrees
      for (const line of lines) {
        for (const kw of educationKeywords) {
          let matches = false;
          for (const pattern of kw.patterns) {
            if (pattern.test(line)) {
              matches = true;
              break;
            }
          }

          if (matches) {
            // Found a degree! Let's extract institution and year from the surrounding line text
            // e.g., "B.Tech in Computer Science from IIT Bombay, 2020"
            const yearMatch = line.match(/\b(19|20)\d{2}\b/g) || [];
            const institutionMatch = line.match(/(?:from|at|university|college|institute)\s+([a-zA-Z\s,]{3,40})/i);
            
            extractedEducation.push({
              degree: kw.degree,
              institution: institutionMatch ? institutionMatch[1].replace(/,?\s*$/, '').trim() : 'Extracted Institution',
              fieldOfStudy: line.length < 100 ? line : kw.degree,
              startDate: null,
              endDate: yearMatch[0] ? new Date(`${yearMatch[0]}-05-01`) : null,
              grade: null,
              description: line,
            });
            break; // Stop checking other degrees for this line
          }
        }
      }

      // 6. Extract Experience
      const extractedExperience = [];
      const jobTitleKeywords = [
        'software engineer', 'developer', 'frontend developer', 'backend developer', 
        'full stack engineer', 'project manager', 'analyst', 'designer', 'consultant',
        'data scientist', 'tech lead', 'hr manager', 'team lead'
      ];

      for (const line of lines) {
        for (const title of jobTitleKeywords) {
          const titleRegex = new RegExp(`\\b${title}\\b`, 'i');
          if (titleRegex.test(line)) {
            const dateMatch = line.match(/\b(19|20)\d{2}\b/g) || [];
            const companyMatch = line.match(/(?:at|for|with|company)\s+([a-zA-Z\s,]{3,30})/i);
            
            extractedExperience.push({
              title: title.charAt(0).toUpperCase() + title.slice(1),
              company: companyMatch ? companyMatch[1].replace(/,?\s*$/, '').trim() : 'Extracted Company',
              location: '',
              startDate: dateMatch[0] ? new Date(`${dateMatch[0]}-01-01`) : new Date(),
              endDate: dateMatch[1] ? new Date(`${dateMatch[1]}-01-01`) : (line.toLowerCase().includes('present') ? null : new Date()),
              current: line.toLowerCase().includes('present'),
              description: line,
            });
            break;
          }
        }
      }

      return {
        rawText: text,
        extractedName,
        extractedEmail,
        extractedPhone,
        extractedSkills,
        extractedEducation,
        extractedExperience,
        parsedAt: new Date(),
      };
    } catch (error) {
      console.error('Resume Parsing Error:', error.message);
      throw ApiError.internal(`Resume parsing failed: ${error.message}`);
    }
  }

  /**
   * Helper to return default empty parsed structure.
   */
  static _getDefaultParsedStructure() {
    return {
      rawText: '',
      extractedName: null,
      extractedEmail: null,
      extractedPhone: null,
      extractedSkills: [],
      extractedEducation: [],
      extractedExperience: [],
      parsedAt: new Date(),
    };
  }
}

module.exports = ResumeParserService;
