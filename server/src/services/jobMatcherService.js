const Job = require('../models/Job');
const Skill = require('../models/Skill');
const CandidateProfile = require('../models/CandidateProfile');
const ApiError = require('../utils/ApiError');

// Education rankings for matching
const EDUCATION_RANKINGS = {
  'high-school': 1,
  'diploma': 2,
  'bachelor': 3,
  'master': 4,
  'doctorate': 5,
};

class JobMatcherService {
  /**
   * Helper to determine education level ranking from degree string.
   */
  static _getEducationLevel(degreeStr) {
    if (!degreeStr) return 0;
    const str = degreeStr.toLowerCase();
    if (str.includes('phd') || str.includes('doctorate') || str.includes('doctor')) return EDUCATION_RANKINGS['doctorate'];
    if (str.includes('master') || str.includes('mba') || str.includes('mtech') || str.includes('m.tech') || str.includes('msc') || str.includes('m.sc') || str.includes('mca') || str.includes('ms')) return EDUCATION_RANKINGS['master'];
    if (str.includes('bachelor') || str.includes('btech') || str.includes('b.tech') || str.includes('bsc') || str.includes('b.sc') || str.includes('bca') || str.includes('be') || str.includes('b.e') || str.includes('bs') || str.includes('degree')) return EDUCATION_RANKINGS['bachelor'];
    if (str.includes('diploma')) return EDUCATION_RANKINGS['diploma'];
    if (str.includes('high school') || str.includes('10th') || str.includes('12th') || str.includes('school')) return EDUCATION_RANKINGS['high-school'];
    return EDUCATION_RANKINGS['bachelor']; // default level
  }

  /**
   * Resolves list of skill names from candidate skills and customSkills.
   */
  static async _resolveSkillNames(profileOrJob) {
    const skillNames = new Set();
    
    // Add custom/string skills directly
    if (profileOrJob.customSkills && Array.isArray(profileOrJob.customSkills)) {
      profileOrJob.customSkills.forEach(s => skillNames.add(s.toLowerCase().trim()));
    }

    // Add populated skills or query them
    if (profileOrJob.skills && Array.isArray(profileOrJob.skills)) {
      const idsToQuery = [];
      profileOrJob.skills.forEach(skill => {
        if (typeof skill === 'object' && skill.name) {
          skillNames.add(skill.name.toLowerCase().trim());
        } else if (skill) {
          idsToQuery.push(skill);
        }
      });

      if (idsToQuery.length > 0) {
        const skillsFromDb = await Skill.find({ _id: { $in: idsToQuery } }).select('name');
        skillsFromDb.forEach(s => skillNames.add(s.name.toLowerCase().trim()));
      }
    }

    return Array.from(skillNames);
  }

  /**
   * Computes match details between a candidate profile and a job description.
   * 
   * @param {object} candidateProfile - Candidate Profile DB object
   * @param {object} job - Job DB object
   * @returns {Promise<{matchScore: number, matchingSkills: string[], missingSkills: string[]}>}
   */
  static async calculateMatch(candidateProfile, job) {
    if (!candidateProfile || !job) {
      throw ApiError.badRequest('Candidate profile and Job details are required to match');
    }

    // 1. Resolve Skill lists
    const candidateSkills = await this._resolveSkillNames(candidateProfile);
    const jobSkills = await this._resolveSkillNames(job);

    // Calculate Skill Match Score (60% weight)
    let skillScore;
    let matchingSkills = [];
    let missingSkills = [...jobSkills];

    if (jobSkills.length > 0) {
      matchingSkills = jobSkills.filter((s) => candidateSkills.includes(s));
      missingSkills = jobSkills.filter((s) => !candidateSkills.includes(s));
      skillScore = matchingSkills.length / jobSkills.length;
    } else {
      skillScore = 1.0; // If job requires no skills, it's a 100% skill match
    }

    // 2. Experience Fit Score (25% weight)
    // Compare candidate total experience (in years) against job min experience requirements
    let experienceScore;
    const requiredExpMin = (job.experienceRequired && job.experienceRequired.min) || 0;
    const candidateExp = candidateProfile.totalExperience || 0;

    if (requiredExpMin === 0) {
      experienceScore = 1.0;
    } else {
      experienceScore = Math.min(candidateExp / requiredExpMin, 1.0);
    }

    // 3. Education Fit Score (15% weight)
    let educationScore; // Default score is 50% for education
    const requiredEducation = job.educationRequired || '';
    
    // Find candidate highest education rank
    let candidateMaxLevel = 0;
    if (candidateProfile.education && Array.isArray(candidateProfile.education)) {
      candidateProfile.education.forEach(edu => {
        const lvl = this._getEducationLevel(edu.degree);
        if (lvl > candidateMaxLevel) {
          candidateMaxLevel = lvl;
        }
      });
    }

    const jobRequiredLevel = this._getEducationLevel(requiredEducation);

    if (jobRequiredLevel === 0 || candidateMaxLevel >= jobRequiredLevel) {
      educationScore = 1.0;
    } else {
      educationScore = 0.5; // Has some education but does not meet level requirements
    }

    // Compute weighted total match percentage
    const matchPercentage = Math.round(
      (skillScore * 0.60 + experienceScore * 0.25 + educationScore * 0.15) * 100
    );

    return {
      matchScore: matchPercentage,
      matchingSkills,
      missingSkills,
    };
  }

  /**
   * Fetches job recommendations for a specific candidate based on match score.
   */
  static async getRecommendationsForCandidate(candidateProfile, limit = 10) {
    try {
      // Find active jobs
      const jobs = await Job.find({ status: 'active' }).populate('company');
      const recommendations = [];

      for (const job of jobs) {
        const matchData = await this.calculateMatch(candidateProfile, job);
        recommendations.push({
          job,
          ...matchData,
        });
      }

      // Sort by match score in descending order
      recommendations.sort((a, b) => b.matchScore - a.matchScore);

      return recommendations.slice(0, limit);
    } catch (error) {
      throw ApiError.internal(`Failed to generate job recommendations: ${error.message}`);
    }
  }

  /**
   * Fetches top matching candidates for a specific job.
   */
  static async getMatchingCandidatesForJob(job, limit = 10) {
    try {
      const candidates = await CandidateProfile.find({ searchable: true }).populate('userId');
      const matches = [];

      for (const candidate of candidates) {
        const matchData = await this.calculateMatch(candidate, job);
        matches.push({
          candidate,
          ...matchData,
        });
      }

      // Sort by match score in descending order
      matches.sort((a, b) => b.matchScore - a.matchScore);

      return matches.slice(0, limit);
    } catch (error) {
      throw ApiError.internal(`Failed to fetch matching candidates for job: ${error.message}`);
    }
  }
}

module.exports = JobMatcherService;
