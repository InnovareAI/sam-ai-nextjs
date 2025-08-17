/**
 * N8N-Compatible Lead Scoring Service
 * Designed for N8N Code Node execution
 * Detects false positives using LinkedIn vs Website analysis
 */

export interface N8NLeadScore {
  profile_id: string;
  overall_score: number;
  classification: 'high_priority' | 'medium_priority' | 'low_priority' | 'false_positive';
  false_positive_score: number;
  false_positive_reason: string;
  strengths: string[];
  concerns: string[];
  personalization_hooks: string[];
  contact_method: 'email' | 'linkedin';
  recommended_action: string;
}

export interface N8NICPCriteria {
  target_job_titles: string[];
  target_industries: string[];
  target_company_sizes: string[];
  target_technologies: string[];
  target_keywords: string[];
  exclude_criteria: string[];
}

export class N8NLeadScoringService {
  private config = {
    scoring_weights: {
      profile_factors: 0.35,
      company_factors: 0.30,
      seo_content_factors: 0.20,
      geo_factors: 0.15
    },
    thresholds: {
      high_priority: 80,
      medium_priority: 60,
      low_priority: 40,
      false_positive: 40
    }
  };

  /**
   * Main scoring function for N8N Code Node
   */
  scoreAllProfiles(enrichedProfiles: any[], icpCriteria: N8NICPCriteria): {
    scored_leads: N8NLeadScore[];
    summary: {
      total: number;
      high_priority: number;
      false_positives: number;
      accuracy_rate: string;
      email_available: number;
      linkedin_only: number;
    };
  } {
    console.log(`🎯 Starting lead scoring for ${enrichedProfiles.length} profiles`);
    
    const scoredLeads = enrichedProfiles.map(profile => 
      this.scoreProfile(profile, icpCriteria)
    );

    const summary = this.generateSummary(scoredLeads);
    
    console.log(`✅ Lead scoring complete: ${summary.high_priority} high priority, ${summary.false_positives} false positives`);
    
    return {
      scored_leads: scoredLeads,
      summary
    };
  }

  /**
   * Score individual profile
   */
  private scoreProfile(profile: any, icp: N8NICPCriteria): N8NLeadScore {
    // Score all factors
    const profileScore = this.scoreProfileFactors(profile, icp);
    const companyScore = this.scoreCompanyFactors(profile, icp);
    const seoScore = this.scoreSEOFactors(profile, icp);
    const falsePositiveSignals = this.detectFalsePositiveSignals(profile, icp);
    
    // Calculate overall score
    const overallScore = Math.max(0, 
      (profileScore * this.config.scoring_weights.profile_factors +
       companyScore * this.config.scoring_weights.company_factors +
       seoScore * this.config.scoring_weights.seo_content_factors) - 
      falsePositiveSignals.score
    );
    
    const classification = this.classifyLead(overallScore);
    const contactMethod = this.determineContactMethod(profile);
    
    return {
      profile_id: profile.linkedin_url || profile.id,
      overall_score: Math.round(overallScore),
      classification,
      false_positive_score: falsePositiveSignals.score,
      false_positive_reason: falsePositiveSignals.reasoning,
      strengths: this.identifyStrengths(profile, profileScore, companyScore),
      concerns: this.identifyConcerns(profile, falsePositiveSignals),
      personalization_hooks: this.generatePersonalizationHooks(profile),
      contact_method: contactMethod,
      recommended_action: this.getRecommendedAction(classification, contactMethod)
    };
  }

  /**
   * Detect false positive signals - LinkedIn vs Website analysis
   */
  private detectFalsePositiveSignals(profile: any, icp: N8NICPCriteria): { score: number; reasoning: string } {
    let falsePositiveScore = 0;
    const signals: string[] = [];
    
    // LinkedIn vs Website Industry Mismatch (CRITICAL)
    const linkedinIndustry = profile.company_details?.industry?.toLowerCase() || '';
    const websiteSEO = profile.company_details?.seo_insights || {};
    const seoKeywords = [
      ...(websiteSEO.primary_keywords || []), 
      ...(websiteSEO.secondary_keywords || [])
    ].map(k => k.toLowerCase());
    
    // Tech company false positive detection
    const techKeywords = ['technology', 'software', 'ai', 'ml', 'cloud', 'saas', 'platform', 'digital'];
    const linkedinClaimsTech = techKeywords.some(keyword => linkedinIndustry.includes(keyword));
    const websiteShowsTech = seoKeywords.some(keyword => 
      techKeywords.some(tech => keyword.includes(tech))
    );
    
    if (linkedinClaimsTech && !websiteShowsTech) {
      falsePositiveScore += 30;
      signals.push('LinkedIn claims tech industry but website SEO suggests otherwise');
    }
    
    // Company size mismatch
    const claimedSize = profile.company_details?.size?.toLowerCase() || '';
    const claimsEnterprise = claimedSize.includes('enterprise') || claimedSize.includes('1000+');
    const smallBusinessSEO = seoKeywords.some(keyword => 
      keyword.includes('small business') || keyword.includes('local') || keyword.includes('startup')
    );
    
    if (claimsEnterprise && smallBusinessSEO) {
      falsePositiveScore += 20;
      signals.push('Claims enterprise size but targets small business keywords');
    }
    
    // Service offering misalignment
    const profileTitle = profile.title?.toLowerCase() || '';
    const serviceOfferings = profile.company_details?.service_offerings || [];
    const techTitle = ['cto', 'engineer', 'developer', 'architect', 'ai', 'data scientist'].some(tech => 
      profileTitle.includes(tech)
    );
    const nonTechServices = serviceOfferings.some(service => 
      ['accounting', 'legal', 'real estate', 'insurance', 'retail', 'restaurant'].some(nonTech =>
        service.name?.toLowerCase().includes(nonTech)
      )
    );
    
    if (techTitle && nonTechServices) {
      falsePositiveScore += 25;
      signals.push(`Claims tech role but company offers non-tech services`);
    }
    
    // No website = potential false representation
    if (!profile.company_details?.website) {
      falsePositiveScore += 15;
      signals.push('No company website found');
    }
    
    // Low data confidence
    if ((profile.enrichment_status?.total_confidence || 0) < 60) {
      falsePositiveScore += 15;
      signals.push('Low data confidence score');
    }
    
    // Check exclude criteria
    icp.exclude_criteria.forEach(criteria => {
      if (this.profileContainsCriteria(profile, criteria)) {
        falsePositiveScore += 20;
        signals.push(`Contains excluded criteria: ${criteria}`);
      }
    });
    
    return {
      score: Math.min(falsePositiveScore, 100),
      reasoning: signals.length > 0 ? signals.join('; ') : 'No false positive signals detected'
    };
  }

  /**
   * Determine best contact method based on availability
   */
  private determineContactMethod(profile: any): 'email' | 'linkedin' {
    const hasEmail = profile.contact_info?.email || profile.email;
    return hasEmail ? 'email' : 'linkedin';
  }

  /**
   * Score profile factors (LinkedIn profile quality)
   */
  private scoreProfileFactors(profile: any, icp: N8NICPCriteria): number {
    const titleMatch = this.scoreJobTitleMatch(profile.title, icp.target_job_titles || []);
    const seniorityScore = this.scoreSeniority(profile.estimated_seniority);
    const activityScore = (profile.recent_posts?.length || 0) > 0 ? 80 : 40;
    const networkScore = this.scoreNetworkQuality(profile.connections_count, profile.followers_count);
    
    return (titleMatch + seniorityScore + activityScore + networkScore) / 4;
  }

  /**
   * Score company factors
   */
  private scoreCompanyFactors(profile: any, icp: N8NICPCriteria): number {
    const industryMatch = this.scoreIndustryMatch(profile.company_details?.industry, icp.target_industries || []);
    const sizeMatch = this.scoreSizeMatch(profile.company_details?.size, icp.target_company_sizes || []);
    const techMatch = this.scoreTechMatch(profile.company_details?.technologies || [], icp.target_technologies || []);
    
    return (industryMatch + sizeMatch + techMatch) / 3;
  }

  /**
   * Score SEO factors
   */
  private scoreSEOFactors(profile: any, icp: N8NICPCriteria): number {
    const seoKeywords = profile.company_details?.seo_insights?.primary_keywords || [];
    const targetKeywords = icp.target_keywords || [];
    
    if (targetKeywords.length === 0) return 50;
    
    const matchCount = targetKeywords.filter(target => 
      seoKeywords.some(seo => seo.toLowerCase().includes(target.toLowerCase()))
    ).length;
    
    return (matchCount / targetKeywords.length) * 100;
  }

  // Helper scoring methods
  private scoreJobTitleMatch(title: string, targetTitles: string[]): number {
    if (!title || targetTitles.length === 0) return 50;
    
    const normalizedTitle = title.toLowerCase();
    
    // Exact match
    for (const target of targetTitles) {
      if (normalizedTitle.includes(target.toLowerCase())) {
        return 90;
      }
    }
    
    // Partial match
    const titleWords = normalizedTitle.split(' ');
    const targetWords = targetTitles.flatMap(t => t.toLowerCase().split(' '));
    const matches = titleWords.filter(word => targetWords.includes(word));
    
    return Math.min(80, matches.length * 20);
  }

  private scoreSeniority(seniority: string): number {
    const scores = {
      'C-Level': 100,
      'VP/Director': 90,
      'Manager': 70,
      'Senior': 60
    };
    return scores[seniority] || 50;
  }

  private scoreNetworkQuality(connections: number, followers: number): number {
    const total = (connections || 0) + (followers || 0);
    if (total > 1000) return 90;
    if (total > 500) return 80;
    if (total > 100) return 70;
    return 50;
  }

  private scoreIndustryMatch(industry: string, targetIndustries: string[]): number {
    if (!industry || targetIndustries.length === 0) return 50;
    
    return targetIndustries.some(target => 
      industry.toLowerCase().includes(target.toLowerCase())
    ) ? 85 : 40;
  }

  private scoreSizeMatch(size: string, targetSizes: string[]): number {
    if (!size || targetSizes.length === 0) return 50;
    
    return targetSizes.some(target => 
      size.toLowerCase().includes(target.toLowerCase())
    ) ? 90 : 50;
  }

  private scoreTechMatch(technologies: string[], targetTech: string[]): number {
    if (!technologies.length || !targetTech.length) return 50;
    
    const matches = technologies.filter(tech => 
      targetTech.some(target => tech.toLowerCase().includes(target.toLowerCase()))
    );
    
    return Math.min(100, (matches.length / targetTech.length) * 100);
  }

  private classifyLead(score: number): 'high_priority' | 'medium_priority' | 'low_priority' | 'false_positive' {
    if (score >= this.config.thresholds.high_priority) return 'high_priority';
    if (score >= this.config.thresholds.medium_priority) return 'medium_priority';
    if (score >= this.config.thresholds.low_priority) return 'low_priority';
    return 'false_positive';
  }

  private identifyStrengths(profile: any, profileScore: number, companyScore: number): string[] {
    const strengths = [];
    
    if (profileScore >= 80) strengths.push('Strong job title alignment');
    if (companyScore >= 70) strengths.push('Good company-ICP fit');
    if ((profile.recent_posts?.length || 0) > 0) strengths.push('Active LinkedIn engagement');
    if (profile.company_details?.website) strengths.push('Strong web presence');
    if (profile.contact_info?.email) strengths.push('Email contact available');
    
    return strengths;
  }

  private identifyConcerns(profile: any, falsePositiveSignals: any): string[] {
    const concerns = [];
    
    if (falsePositiveSignals.score > 30) concerns.push('High false positive risk');
    if (!profile.company_details?.website) concerns.push('No company website');
    if ((profile.enrichment_status?.total_confidence || 0) < 60) concerns.push('Low data confidence');
    if (!profile.contact_info?.email && !profile.email) concerns.push('No email address available');
    
    return concerns;
  }

  private generatePersonalizationHooks(profile: any): string[] {
    const hooks = [];
    
    if (profile.recent_posts?.length > 0) {
      hooks.push(`Recent LinkedIn activity: ${profile.recent_posts[0].text.substring(0, 100)}...`);
    }
    
    if (profile.company_details?.technologies?.length > 0) {
      hooks.push(`Technology stack: ${profile.company_details.technologies.slice(0, 3).join(', ')}`);
    }
    
    if (profile.company_details?.service_offerings?.length > 0) {
      hooks.push(`Services: ${profile.company_details.service_offerings[0].name}`);
    }
    
    if (profile.company_details?.recent_blog_posts?.length > 0) {
      hooks.push(`Recent blog: ${profile.company_details.recent_blog_posts[0].title}`);
    }
    
    return hooks;
  }

  private getRecommendedAction(classification: string, contactMethod: string): string {
    const actions = {
      'high_priority': contactMethod === 'email' ? 'Send personalized email immediately' : 'Send LinkedIn connection request with personalized message',
      'medium_priority': contactMethod === 'email' ? 'Add to email nurture sequence' : 'Send LinkedIn connection request',
      'low_priority': 'Add to long-term nurture campaign',
      'false_positive': 'Remove from targeting - likely false positive'
    };
    
    return actions[classification] || 'Manual review required';
  }

  private profileContainsCriteria(profile: any, criteria: string): boolean {
    const searchText = [
      profile.title,
      profile.about,
      profile.company_details?.industry,
      profile.company_details?.description,
      ...(profile.company_details?.service_offerings?.map(s => s.name) || [])
    ].join(' ').toLowerCase();
    
    return searchText.includes(criteria.toLowerCase());
  }

  private generateSummary(scoredLeads: N8NLeadScore[]) {
    const total = scoredLeads.length;
    const highPriority = scoredLeads.filter(l => l.classification === 'high_priority').length;
    const falsePositives = scoredLeads.filter(l => l.classification === 'false_positive').length;
    const emailAvailable = scoredLeads.filter(l => l.contact_method === 'email').length;
    const linkedinOnly = scoredLeads.filter(l => l.contact_method === 'linkedin').length;
    
    return {
      total,
      high_priority: highPriority,
      false_positives: falsePositives,
      accuracy_rate: ((total - falsePositives) / total * 100).toFixed(1),
      email_available: emailAvailable,
      linkedin_only: linkedinOnly
    };
  }
}

// Export for N8N Code Node usage
export default N8NLeadScoringService;