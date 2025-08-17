/**
 * N8N-Compatible B2B Copywriting Agent
 * Designed for N8N Code Node execution
 * Generates personalized messages based on prospect pain points and offerings
 */

export interface N8NPersonalizedMessage {
  profile_id: string;
  contact_method: 'email' | 'linkedin';
  priority: string;
  personalization_score: number;
  subject?: string;
  body?: string;
  email_address?: string;
  connection_message?: string;
  follow_up_message?: string;
  linkedin_url?: string;
  pain_points: string[];
  value_propositions: string[];
  personalization_hooks: string[];
}

export interface N8NCompanyInfo {
  sender_name: string;
  company_name: string;
  industry_focus: string;
  value_props: {
    primary: string;
    secondary: string[];
  };
  social_proof: {
    [industry: string]: string;
  };
}

export class N8NB2BCopywritingAgent {
  private templates = {
    email: {
      high_priority: {
        subject: "Quick question about {{pain_point}}",
        body: `Hi {{first_name}},

I noticed {{personalization_hook}} and wanted to reach out.

{{value_proposition_specific}}

{{social_proof}}

Would you be open to a 15-minute call this week to discuss how we've helped similar {{industry}} companies {{specific_outcome}}?

Best regards,
{{sender_name}}`
      },
      medium_priority: {
        subject: "{{industry}} insights that might interest you",
        body: `Hi {{first_name}},

I came across {{company_name}} and was impressed by {{specific_strength}}.

{{industry_insight}}

{{value_proposition_general}}

I'd love to share how we've helped other {{industry}} companies. Would you be interested in a brief conversation?

Best,
{{sender_name}}`
      },
      low_priority: {
        subject: "Thought you might find this interesting",
        body: `Hi {{first_name}},

I came across your profile and thought you might find our recent {{industry}} insights valuable.

{{value_proposition_brief}}

Would you be interested in learning more about how {{industry}} companies are {{main_benefit}}?

Best regards,
{{sender_name}}`
      }
    },
    linkedin: {
      connection_request: "Hi {{first_name}}, I noticed your background in {{industry}} and {{personalization_hook}}. Would love to connect!",
      follow_up: "Thanks for connecting, {{first_name}}! {{value_proposition_brief}} Happy to share some insights about {{pain_point_area}} if you're interested.",
      direct_message: "Hi {{first_name}}, I saw {{personalization_hook}} and thought you might be interested in how we've helped {{industry}} companies {{main_benefit}}. Would you be open to a brief conversation?"
    }
  };

  private painPointsDB = {
    'technology': {
      primary: ['scaling infrastructure', 'technical debt', 'data integration'],
      secondary: ['automation gaps', 'security concerns', 'performance optimization']
    },
    'healthcare': {
      primary: ['patient data management', 'compliance requirements', 'operational efficiency'],
      secondary: ['cost reduction', 'quality improvement', 'staff productivity']
    },
    'finance': {
      primary: ['regulatory compliance', 'risk management', 'customer acquisition'],
      secondary: ['data analytics', 'process automation', 'cost optimization']
    },
    'retail': {
      primary: ['customer experience', 'inventory management', 'omnichannel integration'],
      secondary: ['digital transformation', 'supply chain', 'personalization']
    },
    'manufacturing': {
      primary: ['supply chain optimization', 'quality control', 'predictive maintenance'],
      secondary: ['operational efficiency', 'cost reduction', 'digital transformation']
    },
    'consulting': {
      primary: ['client acquisition', 'project efficiency', 'knowledge management'],
      secondary: ['team productivity', 'resource optimization', 'competitive advantage']
    },
    'default': {
      primary: ['operational efficiency', 'cost optimization', 'digital transformation'],
      secondary: ['competitive advantage', 'customer satisfaction', 'growth scaling']
    }
  };

  private valuePropositions = {
    'high_priority': {
      specific: 'Our AI-powered platform has helped companies like yours reduce {{pain_point}} by 40% while increasing {{benefit}} by 60%.',
      outcome: 'achieve {{specific_outcome}} in 90 days or less'
    },
    'medium_priority': {
      general: 'We specialize in helping {{industry}} companies {{specific_solution}} through intelligent automation.',
      outcome: 'streamline {{pain_point_area}} and boost productivity'
    },
    'low_priority': {
      brief: 'Our platform helps {{industry}} companies optimize {{main_area}} through AI-driven insights.',
      outcome: 'improve {{main_benefit}} significantly'
    }
  };

  /**
   * Main function for N8N Code Node
   */
  generatePersonalizedMessages(
    scoredLeads: any[], 
    companyInfo: N8NCompanyInfo
  ): {
    personalized_messages: N8NPersonalizedMessage[];
    email_outreach: N8NPersonalizedMessage[];
    linkedin_outreach: N8NPersonalizedMessage[];
    summary: {
      total_messages: number;
      email_count: number;
      linkedin_count: number;
      high_priority_count: number;
      personalization_avg: number;
    };
  } {
    console.log(`✍️ Generating personalized messages for ${scoredLeads.length} qualified leads`);
    
    // Filter out false positives
    const qualifiedLeads = scoredLeads.filter(lead => 
      lead.classification !== 'false_positive'
    );
    
    const messagesGenerated = qualifiedLeads.map(lead => 
      this.createPersonalizedMessage(lead, companyInfo)
    );
    
    const summary = this.generateSummary(messagesGenerated);
    
    console.log(`📧 Generated ${messagesGenerated.length} personalized messages`);
    console.log(`📊 Summary: ${summary.email_count} emails, ${summary.linkedin_count} LinkedIn messages`);
    
    return {
      personalized_messages: messagesGenerated,
      email_outreach: messagesGenerated.filter(m => m.contact_method === 'email'),
      linkedin_outreach: messagesGenerated.filter(m => m.contact_method === 'linkedin'),
      summary
    };
  }

  private createPersonalizedMessage(
    lead: any, 
    companyInfo: N8NCompanyInfo
  ): N8NPersonalizedMessage {
    const profile = this.extractProfileData(lead);
    const industry = this.extractIndustry(profile);
    const painPoints = this.identifyPainPoints(industry, profile, lead);
    const personalizedHooks = lead.personalization_hooks || [];
    
    // Determine contact method
    const contactMethod = lead.contact_method || this.determineContactMethod(profile);
    
    const messageData: N8NPersonalizedMessage = {
      profile_id: lead.profile_id,
      contact_method: contactMethod,
      priority: lead.classification,
      personalization_score: this.calculatePersonalizationScore(lead, profile, personalizedHooks),
      pain_points: painPoints,
      value_propositions: this.generateValuePropositions(lead.classification, industry, painPoints),
      personalization_hooks: personalizedHooks,
      ...this.generateMessageContent(lead, profile, industry, painPoints, personalizedHooks, companyInfo)
    };
    
    return messageData;
  }

  private generateMessageContent(
    lead: any,
    profile: any,
    industry: string,
    painPoints: string[],
    hooks: string[],
    companyInfo: N8NCompanyInfo
  ) {
    const firstName = this.extractFirstName(profile.name);
    const companyName = profile.company || 'your company';
    const classification = lead.classification || 'medium_priority';
    
    const templateVars = {
      first_name: firstName,
      company_name: companyName,
      industry: industry,
      pain_point: painPoints[0] || 'operational challenges',
      personalization_hook: hooks[0] || `your work at ${companyName}`,
      specific_strength: this.identifySpecificStrength(profile, lead),
      sender_name: companyInfo.sender_name,
      value_proposition_specific: this.interpolateValueProp('specific', classification, industry, painPoints[0]),
      value_proposition_general: this.interpolateValueProp('general', classification, industry, painPoints[0]),
      value_proposition_brief: this.interpolateValueProp('brief', classification, industry, painPoints[0]),
      social_proof: this.generateSocialProof(industry, companyInfo),
      industry_insight: this.generateIndustryInsight(industry, painPoints[0]),
      specific_outcome: this.generateSpecificOutcome(painPoints[0]),
      pain_point_area: painPoints[0] || 'operational efficiency',
      main_benefit: this.generateMainBenefit(painPoints[0])
    };

    if (lead.contact_method === 'email' && profile.email) {
      // Email outreach
      const template = this.templates.email[classification] || this.templates.email.medium_priority;
      
      return {
        subject: this.interpolateTemplate(template.subject, templateVars),
        body: this.interpolateTemplate(template.body, templateVars),
        email_address: profile.email
      };
    } else {
      // LinkedIn outreach
      return {
        connection_message: this.interpolateTemplate(this.templates.linkedin.connection_request, templateVars),
        follow_up_message: this.interpolateTemplate(this.templates.linkedin.follow_up, templateVars),
        linkedin_url: profile.linkedin_url
      };
    }
  }

  private identifyPainPoints(industry: string, profile: any, lead: any): string[] {
    const industryKey = industry.toLowerCase();
    const painPointsSet = this.painPointsDB[industryKey] || this.painPointsDB.default;
    
    // Start with industry-specific pain points
    const identifiedPainPoints = [...painPointsSet.primary];
    
    // Add pain points based on profile analysis
    const seoKeywords = profile.company_details?.seo_insights?.primary_keywords || [];
    const serviceOfferings = profile.company_details?.service_offerings || [];
    
    // Analyze SEO keywords for specific challenges
    seoKeywords.forEach(keyword => {
      if (keyword.includes('scale') || keyword.includes('growth')) {
        identifiedPainPoints.push('scaling challenges');
      }
      if (keyword.includes('efficiency') || keyword.includes('optimize')) {
        identifiedPainPoints.push('operational efficiency');
      }
      if (keyword.includes('cost') || keyword.includes('budget')) {
        identifiedPainPoints.push('cost optimization');
      }
      if (keyword.includes('data') || keyword.includes('analytics')) {
        identifiedPainPoints.push('data management');
      }
    });
    
    // Analyze company size for specific challenges
    const companySize = profile.company_details?.size?.toLowerCase() || '';
    if (companySize.includes('startup') || companySize.includes('small')) {
      identifiedPainPoints.push('resource constraints', 'rapid scaling');
    }
    if (companySize.includes('enterprise') || companySize.includes('large')) {
      identifiedPainPoints.push('process standardization', 'coordination challenges');
    }
    
    // Remove duplicates and return top 3
    return [...new Set(identifiedPainPoints)].slice(0, 3);
  }

  private generateValuePropositions(classification: string, industry: string, painPoints: string[]): string[] {
    const props = [];
    const primaryPainPoint = painPoints[0] || 'operational challenges';
    
    props.push(`Reduce ${primaryPainPoint} by 40% through intelligent automation`);
    props.push(`Streamline ${industry} operations with AI-powered insights`);
    props.push(`Join 500+ ${industry} companies improving efficiency with our platform`);
    
    return props;
  }

  private identifySpecificStrength(profile: any, lead: any): string {
    if (lead.strengths?.length > 0) {
      return lead.strengths[0];
    }
    
    if (profile.recent_posts?.length > 0) {
      return 'your recent LinkedIn activity';
    }
    
    if (profile.company_details?.website) {
      return 'your company\'s online presence';
    }
    
    return 'your professional background';
  }

  private generateSocialProof(industry: string, companyInfo: N8NCompanyInfo): string {
    const industryKey = industry.toLowerCase();
    
    if (companyInfo.social_proof?.[industryKey]) {
      return companyInfo.social_proof[industryKey];
    }
    
    const defaultProofs = {
      'technology': 'Companies like TechCorp and InnovateLabs have seen 50% faster development cycles.',
      'healthcare': 'Healthcare organizations using our platform report 60% improved patient satisfaction.',
      'finance': 'Financial services firms have reduced compliance costs by 45% with our solution.',
      'retail': 'Retail brands have increased customer engagement by 70% using our platform.',
      'manufacturing': 'Manufacturing companies have reduced downtime by 35% with our predictive analytics.',
      'consulting': 'Consulting firms have increased project efficiency by 50% with our automation tools.'
    };
    
    return defaultProofs[industryKey] || 'Our clients typically see 40-60% improvements in their key metrics.';
  }

  private generateIndustryInsight(industry: string, painPoint: string): string {
    const insights = {
      'technology': `Recent studies show 73% of tech companies struggle with ${painPoint}. Leading organizations are turning to AI-powered solutions.`,
      'healthcare': `Healthcare industry research indicates ${painPoint} costs organizations 30% more than necessary. Smart automation is the key.`,
      'finance': `Financial services data reveals ${painPoint} as a top priority for 68% of executives this year.`,
      'retail': `Retail analytics show companies addressing ${painPoint} see 45% better customer satisfaction scores.`,
      'manufacturing': `Manufacturing trends indicate ${painPoint} optimization can improve margins by 25-40%.`,
      'default': `Industry leaders are addressing ${painPoint} through intelligent automation and seeing significant ROI.`
    };
    
    return insights[industry.toLowerCase()] || insights.default;
  }

  private generateSpecificOutcome(painPoint: string): string {
    const outcomes = {
      'scaling infrastructure': 'handle 300% more load with the same resources',
      'operational efficiency': 'reduce operational costs by 35%',
      'data management': 'process data 10x faster with 99.9% accuracy',
      'customer experience': 'achieve 90% customer satisfaction scores',
      'cost optimization': 'cut operational expenses by 25-40%',
      'default': 'achieve 40% improvement in key performance metrics'
    };
    
    return outcomes[painPoint] || outcomes.default;
  }

  private generateMainBenefit(painPoint: string): string {
    const benefits = {
      'scaling infrastructure': 'scale efficiently',
      'operational efficiency': 'boost productivity',
      'data management': 'leverage data insights',
      'customer experience': 'delight customers',
      'cost optimization': 'reduce costs',
      'default': 'improve performance'
    };
    
    return benefits[painPoint] || benefits.default;
  }

  private interpolateValueProp(type: string, classification: string, industry: string, painPoint: string): string {
    const propTemplates = this.valuePropositions[classification];
    if (!propTemplates) return '';
    
    const template = propTemplates[type];
    if (!template) return '';
    
    return template
      .replace(/\{\{pain_point\}\}/g, painPoint)
      .replace(/\{\{industry\}\}/g, industry)
      .replace(/\{\{benefit\}\}/g, this.generateMainBenefit(painPoint))
      .replace(/\{\{specific_solution\}\}/g, `optimize ${painPoint}`)
      .replace(/\{\{specific_outcome\}\}/g, this.generateSpecificOutcome(painPoint))
      .replace(/\{\{pain_point_area\}\}/g, painPoint)
      .replace(/\{\{main_area\}\}/g, painPoint)
      .replace(/\{\{main_benefit\}\}/g, this.generateMainBenefit(painPoint));
  }

  private calculatePersonalizationScore(lead: any, profile: any, hooks: string[]): number {
    let score = 0;
    
    if (hooks.length > 0) score += 30;
    if (profile.recent_posts?.length > 0) score += 25;
    if (profile.company_details?.website) score += 20;
    if (profile.email) score += 15;
    if (lead.strengths?.length > 0) score += 10;
    
    return Math.min(100, score);
  }

  // Helper methods
  private extractProfileData(lead: any): any {
    // Assuming the profile data is embedded in the lead or available from the workflow context
    return lead.profile_data || lead;
  }

  private extractIndustry(profile: any): string {
    return profile.company_details?.industry || profile.industry || 'business';
  }

  private extractFirstName(fullName: string): string {
    return fullName?.split(' ')[0] || 'there';
  }

  private determineContactMethod(profile: any): 'email' | 'linkedin' {
    return profile.email || profile.contact_info?.email ? 'email' : 'linkedin';
  }

  private interpolateTemplate(template: string, variables: any): string {
    let result = template;
    
    Object.keys(variables).forEach(key => {
      const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      result = result.replace(placeholder, variables[key] || '');
    });
    
    return result;
  }

  private generateSummary(messages: N8NPersonalizedMessage[]) {
    const emailCount = messages.filter(m => m.contact_method === 'email').length;
    const linkedinCount = messages.filter(m => m.contact_method === 'linkedin').length;
    const highPriorityCount = messages.filter(m => m.priority === 'high_priority').length;
    const avgPersonalization = messages.reduce((sum, m) => sum + m.personalization_score, 0) / messages.length;
    
    return {
      total_messages: messages.length,
      email_count: emailCount,
      linkedin_count: linkedinCount,
      high_priority_count: highPriorityCount,
      personalization_avg: Math.round(avgPersonalization)
    };
  }
}

export default N8NB2BCopywritingAgent;