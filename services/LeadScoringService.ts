/**
 * Lead Scoring Service
 * Determines if prospects are real targets or false positives
 * Uses LinkedIn profile data + company intelligence + SEO/GEO data
 */

import { EnrichedProfile } from './ProfileEnrichmentService';

export interface ICPCriteria {
  target_job_titles: string[];
  target_industries: string[];
  target_company_sizes: string[];
  target_technologies: string[];
  target_regions: string[];
  target_keywords: string[];
  must_have_criteria: string[];
  exclude_criteria: string[];
}

export interface LeadScore {
  profile_id: string;
  overall_score: number; // 0-100
  classification: 'high_priority' | 'medium_priority' | 'low_priority' | 'false_positive';
  confidence: number; // 0-100
  
  // Detailed scoring breakdown
  scoring_factors: {
    // LinkedIn profile factors
    job_title_match: { score: number; reasoning: string };
    seniority_level: { score: number; reasoning: string };
    company_match: { score: number; reasoning: string };
    experience_relevance: { score: number; reasoning: string };
    activity_engagement: { score: number; reasoning: string };
    network_quality: { score: number; reasoning: string };
    
    // Company intelligence factors
    company_size_match: { score: number; reasoning: string };
    industry_alignment: { score: number; reasoning: string };
    technology_stack_fit: { score: number; reasoning: string };
    service_offering_relevance: { score: number; reasoning: string };
    market_presence: { score: number; reasoning: string };
    
    // SEO & content intelligence
    seo_keyword_alignment: { score: number; reasoning: string };
    content_theme_match: { score: number; reasoning: string };
    target_persona_fit: { score: number; reasoning: string };
    competitor_awareness: { score: number; reasoning: string };
    
    // Geographic intelligence
    geographic_alignment: { score: number; reasoning: string };
    market_accessibility: { score: number; reasoning: string };
    regulatory_fit: { score: number; reasoning: string };
    
    // Negative indicators (false positive detection)
    false_positive_signals: { score: number; reasoning: string };
  };
  
  // Actionable insights
  qualification_insights: {
    strengths: string[];
    concerns: string[];
    opportunity_size: 'high' | 'medium' | 'low';
    urgency_indicators: string[];
    personalization_hooks: string[];
    recommended_approach: string;
  };
  
  // Next actions
  recommended_actions: {
    priority: 'immediate' | 'this_week' | 'this_month' | 'nurture' | 'disqualify';
    outreach_strategy: string;
    key_messaging: string[];
    timing_recommendations: string;
  };
}

export class LeadScoringService {
  private config = {
    scoring_weights: {
      profile_factors: 0.35,      // 35% weight on LinkedIn profile
      company_factors: 0.30,      // 30% weight on company intelligence
      seo_content_factors: 0.20,  // 20% weight on SEO/content alignment
      geo_factors: 0.15          // 15% weight on geographic fit
    },
    
    thresholds: {
      high_priority: 80,     // 80+ = High priority target
      medium_priority: 60,   // 60-79 = Medium priority target
      low_priority: 40,      // 40-59 = Low priority target
      false_positive: 40     // <40 = Likely false positive
    }
  };

  /**
   * Score a lead against ICP criteria
   */
  async scoreProfile(profile: EnrichedProfile, icp: ICPCriteria): Promise<LeadScore> {
    console.log(`🎯 Scoring lead: ${profile.name} at ${profile.company}`);
    
    // Score all factors
    const profileScores = this.scoreProfileFactors(profile, icp);
    const companyScores = this.scoreCompanyFactors(profile, icp);
    const seoScores = this.scoreSEOContentFactors(profile, icp);
    const geoScores = this.scoreGeographicFactors(profile, icp);
    const negativeSignals = this.detectFalsePositiveSignals(profile, icp);
    
    // Calculate weighted overall score
    const overallScore = this.calculateOverallScore(
      profileScores, companyScores, seoScores, geoScores, negativeSignals
    );
    
    // Classify lead based on score
    const classification = this.classifyLead(overallScore);
    
    // Generate insights and recommendations
    const insights = this.generateQualificationInsights(profile, profileScores, companyScores, seoScores, geoScores);
    const actions = this.generateRecommendedActions(profile, classification, overallScore, insights);
    
    console.log(`✅ Lead scored: ${overallScore}/100 (${classification})`);
    
    return {
      profile_id: profile.linkedin_url,
      overall_score: overallScore,
      classification,
      confidence: this.calculateConfidence(profile, overallScore),
      
      scoring_factors: {
        ...profileScores,
        ...companyScores,
        ...seoScores,
        ...geoScores,
        false_positive_signals: negativeSignals
      },
      
      qualification_insights: insights,
      recommended_actions: actions
    };
  }

  /**
   * Score LinkedIn profile factors
   */
  private scoreProfileFactors(profile: EnrichedProfile, icp: ICPCriteria) {
    const jobTitleScore = this.scoreJobTitleMatch(profile.title, icp.target_job_titles);
    const seniorityScore = this.scoreSeniorityLevel(profile.estimated_seniority);
    const companyScore = this.scoreCompanyMatch(profile.company, icp);
    const experienceScore = this.scoreExperienceRelevance(profile.experience, icp);
    const activityScore = this.scoreActivityEngagement(profile.recent_posts, profile.activity_insights);
    const networkScore = this.scoreNetworkQuality(profile.connections_count, profile.followers_count);

    return {
      job_title_match: {
        score: jobTitleScore,
        reasoning: jobTitleScore >= 80 ? 'Perfect title match' : 
                  jobTitleScore >= 60 ? 'Good title alignment' : 
                  jobTitleScore >= 40 ? 'Partial title match' : 'Poor title fit'
      },
      seniority_level: {
        score: seniorityScore,
        reasoning: this.getSeniorityReasoning(profile.estimated_seniority)
      },
      company_match: {
        score: companyScore,
        reasoning: companyScore >= 80 ? 'Excellent company fit' : 
                  companyScore >= 60 ? 'Good company alignment' : 'Limited company match'
      },
      experience_relevance: {
        score: experienceScore,
        reasoning: `${profile.experience.length} relevant positions in background`
      },
      activity_engagement: {
        score: activityScore,
        reasoning: profile.recent_posts.length > 0 ? 
          `Active on LinkedIn (${profile.recent_posts.length} recent posts)` : 
          'Limited LinkedIn activity'
      },
      network_quality: {
        score: networkScore,
        reasoning: `${profile.connections_count} connections, ${profile.followers_count} followers`
      }
    };
  }

  /**
   * Score company intelligence factors
   */
  private scoreCompanyFactors(profile: EnrichedProfile, icp: ICPCriteria) {
    const sizeScore = this.scoreCompanySize(profile.company_details.size, icp.target_company_sizes);
    const industryScore = this.scoreIndustryAlignment(profile.company_details.industry, icp.target_industries);
    const techScore = this.scoreTechnologyFit(profile.company_details.technologies, icp.target_technologies);
    const serviceScore = this.scoreServiceRelevance(profile.company_details.service_offerings, icp);
    const presenceScore = this.scoreMarketPresence(profile.company_details, icp);

    return {
      company_size_match: {
        score: sizeScore,
        reasoning: sizeScore >= 80 ? 'Perfect size match' : 
                  sizeScore >= 60 ? 'Good size fit' : 'Size mismatch'
      },
      industry_alignment: {
        score: industryScore,
        reasoning: `${profile.company_details.industry} industry alignment`
      },
      technology_stack_fit: {
        score: techScore,
        reasoning: `${profile.company_details.technologies.length} technologies identified`
      },
      service_offering_relevance: {
        score: serviceScore,
        reasoning: profile.company_details.service_offerings ? 
          `${profile.company_details.service_offerings.length} relevant services` : 
          'Limited service visibility'
      },
      market_presence: {
        score: presenceScore,
        reasoning: profile.company_details.website ? 'Strong web presence' : 'Limited online presence'
      }
    };
  }

  /**
   * Score SEO and content factors
   */
  private scoreSEOContentFactors(profile: EnrichedProfile, icp: ICPCriteria) {
    const seoScore = this.scoreSEOAlignment(profile.company_details.seo_insights, icp.target_keywords);
    const contentScore = this.scoreContentThemes(profile.company_details.seo_insights, icp);
    const personaScore = this.scoreTargetPersonaFit(profile.company_details.seo_insights, icp);
    const competitorScore = this.scoreCompetitorAwareness(profile.company_details.seo_insights);

    return {
      seo_keyword_alignment: {
        score: seoScore,
        reasoning: seoScore >= 70 ? 'Strong keyword alignment' : 'Limited keyword match'
      },
      content_theme_match: {
        score: contentScore,
        reasoning: `Content themes align with target criteria`
      },
      target_persona_fit: {
        score: personaScore,
        reasoning: `Target persona alignment detected`
      },
      competitor_awareness: {
        score: competitorScore,
        reasoning: competitorScore >= 60 ? 'Competitor-aware market' : 'Limited competitive context'
      }
    };
  }

  /**
   * Score geographic factors
   */
  private scoreGeographicFactors(profile: EnrichedProfile, icp: ICPCriteria) {
    const geoScore = this.scoreGeographicAlignment(profile.company_details.geo_intelligence, icp.target_regions);
    const accessScore = this.scoreMarketAccessibility(profile.location, profile.company_details.geo_intelligence);
    const regulatoryScore = this.scoreRegulatoryFit(profile.company_details.geo_intelligence, icp);

    return {
      geographic_alignment: {
        score: geoScore,
        reasoning: `Geographic alignment with target markets`
      },
      market_accessibility: {
        score: accessScore,
        reasoning: `Market accessibility and reach`
      },
      regulatory_fit: {
        score: regulatoryScore,
        reasoning: `Regulatory and compliance alignment`
      }
    };
  }

  /**
   * Detect false positive signals - especially LinkedIn vs Website mismatches
   */
  private detectFalsePositiveSignals(profile: EnrichedProfile, icp: ICPCriteria): { score: number; reasoning: string } {
    let falsePositiveScore = 0;
    const signals: string[] = [];

    // CRITICAL: LinkedIn vs Website Industry Mismatch Detection
    const linkedinVsWebsiteMismatch = this.detectIndustryMismatch(profile);
    if (linkedinVsWebsiteMismatch.isMismatch) {
      falsePositiveScore += linkedinVsWebsiteMismatch.severity;
      signals.push(linkedinVsWebsiteMismatch.reason);
    }

    // Technology Claims vs Reality Check
    const techClaimsMismatch = this.detectTechnologyClaimsMismatch(profile);
    if (techClaimsMismatch.isMismatch) {
      falsePositiveScore += techClaimsMismatch.severity;
      signals.push(techClaimsMismatch.reason);
    }

    // Company Size Claims vs SEO/Content Reality
    const sizeMismatch = this.detectCompanySizeMismatch(profile);
    if (sizeMismatch.isMismatch) {
      falsePositiveScore += sizeMismatch.severity;
      signals.push(sizeMismatch.reason);
    }

    // Service Offering Misalignment
    const serviceMismatch = this.detectServiceMisalignment(profile, icp);
    if (serviceMismatch.isMismatch) {
      falsePositiveScore += serviceMismatch.severity;
      signals.push(serviceMismatch.reason);
    }

    // Check for exclusion criteria
    icp.exclude_criteria.forEach(criteria => {
      if (this.profileContainsCriteria(profile, criteria)) {
        falsePositiveScore += 20;
        signals.push(`Contains excluded criteria: ${criteria}`);
      }
    });

    // Check for low-quality signals
    if (profile.enrichment_status.total_confidence < 60) {
      falsePositiveScore += 15;
      signals.push('Low data confidence');
    }

    if (profile.recent_posts.length === 0 && profile.connections_count < 100) {
      falsePositiveScore += 10;
      signals.push('Inactive or fake profile');
    }

    if (!profile.company_details.website) {
      falsePositiveScore += 15;
      signals.push('No company website - potential false representation');
    }

    // Website vs LinkedIn Content Consistency Check
    const contentConsistency = this.checkContentConsistency(profile);
    if (!contentConsistency.isConsistent) {
      falsePositiveScore += contentConsistency.severity;
      signals.push(contentConsistency.reason);
    }

    return {
      score: Math.min(falsePositiveScore, 100),
      reasoning: signals.length > 0 ? signals.join('; ') : 'No false positive signals detected'
    };
  }

  /**
   * Detect industry mismatch between LinkedIn profile and website reality
   */
  private detectIndustryMismatch(profile: EnrichedProfile): { isMismatch: boolean; severity: number; reason: string } {
    const linkedinIndustry = profile.company_details.industry.toLowerCase();
    const websiteSEO = profile.company_details.seo_insights;
    
    // Extract actual business from SEO keywords and content
    const actualBusinessIndicators = [
      ...websiteSEO.primary_keywords || [],
      ...websiteSEO.secondary_keywords || [],
      ...websiteSEO.content_themes || []
    ].map(k => k.toLowerCase());

    // Common false tech company patterns
    const techKeywords = ['technology', 'software', 'ai', 'ml', 'cloud', 'saas', 'platform', 'digital'];
    const linkedinClaimsTech = techKeywords.some(keyword => linkedinIndustry.includes(keyword));

    if (linkedinClaimsTech) {
      // Check if website actually supports tech claims
      const websiteSupportsTech = actualBusinessIndicators.some(indicator => 
        techKeywords.some(tech => indicator.includes(tech))
      );

      if (!websiteSupportsTech) {
        // LinkedIn says tech, but website says otherwise
        const actualBusiness = this.identifyActualBusiness(actualBusinessIndicators);
        return {
          isMismatch: true,
          severity: 30,
          reason: `LinkedIn claims "${linkedinIndustry}" but website indicates "${actualBusiness}" - possible misrepresentation`
        };
      }
    }

    // Check for other common mismatches
    const consultingMismatch = this.checkConsultingMismatch(linkedinIndustry, actualBusinessIndicators);
    if (consultingMismatch.isMismatch) {
      return consultingMismatch;
    }

    return { isMismatch: false, severity: 0, reason: '' };
  }

  /**
   * Detect technology claims mismatch
   */
  private detectTechnologyClaimsMismatch(profile: EnrichedProfile): { isMismatch: boolean; severity: number; reason: string } {
    const claimedTechnologies = profile.company_details.technologies || [];
    const websiteTech = this.extractWebsiteTechnologies(profile.company_details.seo_insights);
    
    // If LinkedIn/profile claims advanced tech but website shows basic/no tech
    const advancedTechClaims = claimedTechnologies.filter(tech => 
      ['kubernetes', 'microservices', 'ai', 'ml', 'tensorflow', 'pytorch', 'aws', 'azure', 'gcp'].includes(tech.toLowerCase())
    );

    const basicWebsiteTech = websiteTech.filter(tech => 
      ['wordpress', 'shopify', 'squarespace', 'wix', 'basic html', 'jquery'].includes(tech.toLowerCase())
    );

    if (advancedTechClaims.length > 3 && basicWebsiteTech.length > 0) {
      return {
        isMismatch: true,
        severity: 25,
        reason: `Claims advanced tech (${advancedTechClaims.slice(0, 2).join(', ')}) but website uses basic tech (${basicWebsiteTech.slice(0, 2).join(', ')})`
      };
    }

    return { isMismatch: false, severity: 0, reason: '' };
  }

  /**
   * Detect company size mismatch
   */
  private detectCompanySizeMismatch(profile: EnrichedProfile): { isMismatch: boolean; severity: number; reason: string } {
    const claimedSize = profile.company_details.size.toLowerCase();
    const seoKeywords = profile.company_details.seo_insights.primary_keywords || [];
    
    // Check for enterprise claims vs small business reality
    const claimsEnterprise = claimedSize.includes('enterprise') || 
                           claimedSize.includes('1000+') || 
                           claimedSize.includes('large');
    
    const smallBusinessSEO = seoKeywords.some(keyword => 
      keyword.includes('small business') || 
      keyword.includes('local') || 
      keyword.includes('freelance') || 
      keyword.includes('startup')
    );

    if (claimsEnterprise && smallBusinessSEO) {
      return {
        isMismatch: true,
        severity: 20,
        reason: `Claims enterprise size but SEO targets small business keywords`
      };
    }

    return { isMismatch: false, severity: 0, reason: '' };
  }

  /**
   * Detect service offering misalignment
   */
  private detectServiceMisalignment(profile: EnrichedProfile, icp: ICPCriteria): { isMismatch: boolean; severity: number; reason: string } {
    const profileTitle = profile.title.toLowerCase();
    const serviceOfferings = profile.company_details.service_offerings || [];
    
    // If person claims to be in tech but company offers non-tech services
    const techTitle = ['cto', 'engineer', 'developer', 'architect', 'ai', 'ml', 'data scientist'].some(tech => 
      profileTitle.includes(tech)
    );

    const nonTechServices = serviceOfferings.filter(service => 
      ['accounting', 'legal', 'real estate', 'insurance', 'retail', 'restaurant', 'construction'].some(nonTech =>
        service.name.toLowerCase().includes(nonTech) || service.description.toLowerCase().includes(nonTech)
      )
    );

    if (techTitle && nonTechServices.length > 0) {
      return {
        isMismatch: true,
        severity: 25,
        reason: `Claims tech role (${profile.title}) but company offers non-tech services (${nonTechServices[0].name})`
      };
    }

    return { isMismatch: false, severity: 0, reason: '' };
  }

  /**
   * Check content consistency between LinkedIn and website
   */
  private checkContentConsistency(profile: EnrichedProfile): { isConsistent: boolean; severity: number; reason: string } {
    const linkedinPosts = profile.recent_posts.map(post => post.text.toLowerCase()).join(' ');
    const websiteContent = (profile.company_details.seo_insights.content_themes || []).join(' ').toLowerCase();
    
    // If LinkedIn posts are about completely different topics than website
    const linkedinTopics = this.extractTopicsFromText(linkedinPosts);
    const websiteTopics = this.extractTopicsFromText(websiteContent);
    
    const topicOverlap = linkedinTopics.filter(topic => websiteTopics.includes(topic)).length;
    const totalTopics = Math.max(linkedinTopics.length, websiteTopics.length);
    
    if (totalTopics > 0 && (topicOverlap / totalTopics) < 0.3) {
      return {
        isConsistent: false,
        severity: 15,
        reason: `LinkedIn content themes don't match website focus - possible role/company mismatch`
      };
    }

    return { isConsistent: true, severity: 0, reason: '' };
  }

  /**
   * Check for consulting company misrepresentation
   */
  private checkConsultingMismatch(linkedinIndustry: string, businessIndicators: string[]): { isMismatch: boolean; severity: number; reason: string } {
    const claimsProduct = linkedinIndustry.includes('saas') || 
                         linkedinIndustry.includes('platform') || 
                         linkedinIndustry.includes('product');
    
    const actuallyConsulting = businessIndicators.some(indicator => 
      indicator.includes('consulting') || 
      indicator.includes('services') || 
      indicator.includes('advisory')
    );

    if (claimsProduct && actuallyConsulting) {
      return {
        isMismatch: true,
        severity: 20,
        reason: `LinkedIn claims product company but website indicates consulting/services business`
      };
    }

    return { isMismatch: false, severity: 0, reason: '' };
  }

  /**
   * Identify actual business from website indicators
   */
  private identifyActualBusiness(indicators: string[]): string {
    const businessTypes = {
      'consulting': ['consulting', 'advisory', 'services'],
      'retail': ['shop', 'store', 'retail', 'ecommerce'],
      'real estate': ['real estate', 'property', 'mortgage'],
      'healthcare': ['health', 'medical', 'clinic', 'doctor'],
      'finance': ['finance', 'accounting', 'tax', 'insurance'],
      'legal': ['legal', 'law', 'attorney', 'lawyer'],
      'marketing': ['marketing', 'advertising', 'seo', 'digital marketing']
    };

    for (const [business, keywords] of Object.entries(businessTypes)) {
      if (keywords.some(keyword => indicators.some(indicator => indicator.includes(keyword)))) {
        return business;
      }
    }

    return 'unclear business model';
  }

  /**
   * Extract website technologies from SEO analysis
   */
  private extractWebsiteTechnologies(seoInsights: any): string[] {
    const keywords = seoInsights.primary_keywords || [];
    const techKeywords = keywords.filter(keyword => 
      ['wordpress', 'shopify', 'react', 'angular', 'vue', 'node', 'python', 'java', 'aws', 'azure'].some(tech =>
        keyword.toLowerCase().includes(tech)
      )
    );
    return techKeywords;
  }

  /**
   * Extract topics from text content
   */
  private extractTopicsFromText(text: string): string[] {
    const topics = [
      'technology', 'software', 'ai', 'machine learning', 'cloud', 'data',
      'marketing', 'sales', 'business', 'finance', 'healthcare', 'education',
      'real estate', 'retail', 'consulting', 'legal', 'manufacturing'
    ];
    
    return topics.filter(topic => text.includes(topic));
  }

  /**
   * Calculate overall weighted score
   */
  private calculateOverallScore(
    profileScores: any, 
    companyScores: any, 
    seoScores: any, 
    geoScores: any, 
    negativeSignals: any
  ): number {
    const profileAvg = this.averageScores(Object.values(profileScores));
    const companyAvg = this.averageScores(Object.values(companyScores));
    const seoAvg = this.averageScores(Object.values(seoScores));
    const geoAvg = this.averageScores(Object.values(geoScores));

    const weightedScore = (
      profileAvg * this.config.scoring_weights.profile_factors +
      companyAvg * this.config.scoring_weights.company_factors +
      seoAvg * this.config.scoring_weights.seo_content_factors +
      geoAvg * this.config.scoring_weights.geo_factors
    );

    // Apply negative signal penalty
    const finalScore = Math.max(0, weightedScore - negativeSignals.score);
    
    return Math.round(finalScore);
  }

  /**
   * Classify lead based on score
   */
  private classifyLead(score: number): 'high_priority' | 'medium_priority' | 'low_priority' | 'false_positive' {
    if (score >= this.config.thresholds.high_priority) return 'high_priority';
    if (score >= this.config.thresholds.medium_priority) return 'medium_priority';
    if (score >= this.config.thresholds.low_priority) return 'low_priority';
    return 'false_positive';
  }

  /**
   * Generate qualification insights
   */
  private generateQualificationInsights(
    profile: EnrichedProfile, 
    profileScores: any, 
    companyScores: any, 
    seoScores: any, 
    geoScores: any
  ) {
    const strengths: string[] = [];
    const concerns: string[] = [];
    const personalizationHooks: string[] = [];

    // Analyze strengths
    if (profileScores.job_title_match.score >= 80) {
      strengths.push('Perfect job title alignment');
    }
    if (companyScores.technology_stack_fit.score >= 70) {
      strengths.push('Strong technology stack match');
      personalizationHooks.push(`Technology alignment: ${profile.company_details.technologies.slice(0, 3).join(', ')}`);
    }
    if (profile.recent_posts.length > 0) {
      strengths.push('Active LinkedIn engagement');
      personalizationHooks.push(`Recent post topic: ${profile.recent_posts[0].text.substring(0, 100)}...`);
    }

    // Analyze concerns
    if (profileScores.network_quality.score < 50) {
      concerns.push('Limited professional network');
    }
    if (companyScores.company_size_match.score < 60) {
      concerns.push('Company size mismatch');
    }

    return {
      strengths,
      concerns,
      opportunity_size: this.assessOpportunitySize(profile),
      urgency_indicators: this.identifyUrgencyIndicators(profile),
      personalization_hooks: personalizationHooks,
      recommended_approach: this.recommendApproach(profile, strengths, concerns)
    };
  }

  /**
   * Generate recommended actions
   */
  private generateRecommendedActions(
    profile: EnrichedProfile, 
    classification: string, 
    score: number, 
    insights: any
  ) {
    let priority: 'immediate' | 'this_week' | 'this_month' | 'nurture' | 'disqualify';
    let strategy: string;
    let messaging: string[];

    switch (classification) {
      case 'high_priority':
        priority = 'immediate';
        strategy = 'Direct personalized outreach with senior stakeholder involvement';
        messaging = [
          'Reference specific technology challenges',
          'Mention recent company achievements',
          'Propose concrete value proposition'
        ];
        break;
      case 'medium_priority':
        priority = 'this_week';
        strategy = 'Targeted outreach with industry-specific messaging';
        messaging = [
          'Industry-focused value proposition',
          'Reference similar customer success stories',
          'Offer relevant content/resources'
        ];
        break;
      case 'low_priority':
        priority = 'this_month';
        strategy = 'Nurture with valuable content and industry insights';
        messaging = [
          'Educational content sharing',
          'Industry trend discussions',
          'Long-term relationship building'
        ];
        break;
      default:
        priority = 'disqualify';
        strategy = 'Remove from active targeting';
        messaging = ['Not a qualified prospect'];
    }

    return {
      priority,
      outreach_strategy: strategy,
      key_messaging: messaging,
      timing_recommendations: this.getTimingRecommendations(profile, insights)
    };
  }

  // Helper methods for scoring individual factors
  private scoreJobTitleMatch(title: string, targetTitles: string[]): number {
    const normalizedTitle = title.toLowerCase();
    for (const target of targetTitles) {
      if (normalizedTitle.includes(target.toLowerCase())) {
        return 90;
      }
    }
    // Check for partial matches
    const titleWords = normalizedTitle.split(' ');
    const targetWords = targetTitles.flatMap(t => t.toLowerCase().split(' '));
    const matches = titleWords.filter(word => targetWords.includes(word));
    return Math.min(80, matches.length * 20);
  }

  private scoreSeniorityLevel(seniority: string): number {
    const seniorityScores = {
      'C-Level': 100,
      'VP/Director': 90,
      'Manager': 70,
      'Senior': 60
    };
    return seniorityScores[seniority] || 50;
  }

  private scoreCompanySize(size: string, targetSizes: string[]): number {
    if (targetSizes.some(target => size.toLowerCase().includes(target.toLowerCase()))) {
      return 90;
    }
    return 50;
  }

  private scoreIndustryAlignment(industry: string, targetIndustries: string[]): number {
    if (targetIndustries.some(target => industry.toLowerCase().includes(target.toLowerCase()))) {
      return 85;
    }
    return 40;
  }

  private scoreTechnologyFit(technologies: string[], targetTech: string[]): number {
    const matches = technologies.filter(tech => 
      targetTech.some(target => tech.toLowerCase().includes(target.toLowerCase()))
    );
    return Math.min(100, (matches.length / Math.max(targetTech.length, 1)) * 100);
  }

  // Additional helper methods...
  private averageScores(scores: any[]): number {
    const validScores = scores.filter(s => typeof s.score === 'number').map(s => s.score);
    return validScores.length > 0 ? validScores.reduce((a, b) => a + b, 0) / validScores.length : 0;
  }

  private getSeniorityReasoning(seniority: string): string {
    const reasons = {
      'C-Level': 'Executive decision maker - highest priority',
      'VP/Director': 'Senior leadership with budget authority',
      'Manager': 'Management level with influence',
      'Senior': 'Senior individual contributor'
    };
    return reasons[seniority] || 'Unknown seniority level';
  }

  private assessOpportunitySize(profile: EnrichedProfile): 'high' | 'medium' | 'low' {
    const size = profile.company_details.size.toLowerCase();
    if (size.includes('1000') || size.includes('enterprise')) return 'high';
    if (size.includes('200') || size.includes('500')) return 'medium';
    return 'low';
  }

  private identifyUrgencyIndicators(profile: EnrichedProfile): string[] {
    const indicators: string[] = [];
    
    // Check recent posts for urgency signals
    const urgentKeywords = ['hiring', 'scaling', 'funding', 'growth', 'expansion'];
    profile.recent_posts.forEach(post => {
      urgentKeywords.forEach(keyword => {
        if (post.text.toLowerCase().includes(keyword)) {
          indicators.push(`Recent post mentions ${keyword}`);
        }
      });
    });

    return indicators;
  }

  private recommendApproach(profile: EnrichedProfile, strengths: string[], concerns: string[]): string {
    if (strengths.length > concerns.length) {
      return 'Confident direct approach highlighting mutual fit';
    } else if (concerns.length > 0) {
      return 'Educational approach addressing potential concerns';
    }
    return 'Exploratory approach to better understand needs';
  }

  private getTimingRecommendations(profile: EnrichedProfile, insights: any): string {
    if (insights.urgency_indicators.length > 0) {
      return 'Immediate outreach - urgency indicators detected';
    }
    return 'Standard timing - no specific urgency detected';
  }

  // Placeholder methods for additional scoring logic
  private scoreCompanyMatch(company: string, icp: ICPCriteria): number { return 70; }
  private scoreExperienceRelevance(experience: any[], icp: ICPCriteria): number { return 75; }
  private scoreActivityEngagement(posts: any[], insights: any): number { return 80; }
  private scoreNetworkQuality(connections: number, followers: number): number { 
    return Math.min(100, (connections + followers) / 50); 
  }
  private scoreServiceRelevance(services: any, icp: ICPCriteria): number { return 65; }
  private scoreMarketPresence(companyDetails: any, icp: ICPCriteria): number { return 70; }
  private scoreSEOAlignment(seoInsights: any, keywords: string[]): number { return 75; }
  private scoreContentThemes(seoInsights: any, icp: ICPCriteria): number { return 70; }
  private scoreTargetPersonaFit(seoInsights: any, icp: ICPCriteria): number { return 80; }
  private scoreCompetitorAwareness(seoInsights: any): number { return 60; }
  private scoreGeographicAlignment(geoIntel: any, regions: string[]): number { return 85; }
  private scoreMarketAccessibility(location: string, geoIntel: any): number { return 80; }
  private scoreRegulatoryFit(geoIntel: any, icp: ICPCriteria): number { return 75; }
  private profileContainsCriteria(profile: EnrichedProfile, criteria: string): boolean { return false; }
  private calculateConfidence(profile: EnrichedProfile, score: number): number { 
    return Math.min(100, profile.enrichment_status.total_confidence + (score > 80 ? 10 : 0)); 
  }
}

export default LeadScoringService;