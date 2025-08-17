/**
 * ICP Discovery Framework
 * Comprehensive framework for building Ideal Customer Profiles during SAM's discovery sessions
 */

export interface ICPCharacteristics {
  // Company Demographics
  companySize: {
    employees: string;
    revenue: string;
    stage: 'startup' | 'growth' | 'mature' | 'enterprise';
  };
  
  // Industry & Market
  industry: string[];
  subIndustry: string[];
  geography: string[];
  
  // Technology & Operations
  technologyStack: string[];
  currentTools: string[];
  techMaturity: 'basic' | 'intermediate' | 'advanced';
  
  // Business Model
  businessModel: string;
  revenueModel: string;
  customersServed: string;
  
  // Pain Points & Challenges
  primaryPainPoints: string[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  currentSolutions: string[];
  solutionGaps: string[];
  
  // Value Alignment
  valueDrivers: string[];
  successMetrics: string[];
  budgetRange: string;
  decisionMakingProcess: string;
  
  // Behavioral Characteristics
  buyingBehavior: string;
  informationSources: string[];
  preferredChannels: string[];
  salesCycleLength: string;
}

export interface ICPDisqualifiers {
  companySize: string[];
  industries: string[];
  budgetConstraints: string[];
  technicalLimitations: string[];
  behavioralFlags: string[];
}

export class ICPDiscoveryFramework {
  
  /**
   * Phase 1: Company Foundation Questions
   */
  static getCompanyFoundationQuestions(): string[] {
    return [
      "Tell me about your company - what do you do and who do you serve?",
      "What's your company size in terms of employees and approximate revenue?",
      "What industry are you in, and are there specific sub-sectors you focus on?",
      "Where are your customers located geographically?",
      "What's your business model - how do you make money?"
    ];
  }

  /**
   * Phase 2: Current Customer Analysis Questions
   */
  static getCurrentCustomerQuestions(): string[] {
    return [
      "Who are your best customers right now? What makes them great?",
      "Can you describe 2-3 of your most successful customer relationships?",
      "What do these top customers have in common in terms of company size, industry, or challenges?",
      "How did these customers find you, and what was their buying process like?",
      "What value do these customers get from working with you? How do you measure success?",
      "Are there customers you wish you'd never taken on? What made them problematic?",
      "What's the typical deal size and sales cycle length for your best customers?"
    ];
  }

  /**
   * Phase 3: Pain Points & Value Discovery Questions
   */
  static getPainPointDiscoveryQuestions(): string[] {
    return [
      "What problems do your best customers typically have before they find you?",
      "How urgent are these problems for them? What happens if they don't solve them?",
      "What solutions have they tried before that didn't work?",
      "Who else are you competing against when customers are evaluating solutions?",
      "What makes customers choose you over alternatives?",
      "What's the biggest transformation or result you deliver for customers?",
      "How do customers typically justify the investment in your solution?"
    ];
  }

  /**
   * Phase 4: Technology & Operations Questions
   */
  static getTechnologyDiscoveryQuestions(): string[] {
    return [
      "What technology stack do your ideal customers typically use?",
      "Are there specific tools or platforms that make integration easier?",
      "What's the technical maturity level of your best customers?",
      "Do you require any specific technical requirements or capabilities?",
      "How tech-savvy are the people who actually use your product/service?"
    ];
  }

  /**
   * Phase 5: Decision Making & Buying Process Questions
   */
  static getDecisionMakingQuestions(): string[] {
    return [
      "Who typically initiates the buying process for your solution?",
      "Who are all the people involved in the decision-making process?",
      "What's the typical budget range for your ideal customers?",
      "How do customers typically evaluate and compare solutions like yours?",
      "What information sources do they rely on during their research?",
      "What channels do they prefer for communication and engagement?",
      "How long does the typical sales process take from first contact to close?"
    ];
  }

  /**
   * Phase 6: Disqualification Criteria Questions
   */
  static getDisqualificationQuestions(): string[] {
    return [
      "What types of companies are definitely NOT a good fit for your solution?",
      "Are there industries or company sizes you avoid working with?",
      "What budget constraints would make someone unqualified?",
      "Are there technical limitations that would prevent success?",
      "What behavioral red flags indicate a prospect won't be successful?",
      "What situations would make you recommend they look elsewhere?"
    ];
  }

  /**
   * Generate contextual follow-up questions based on previous answers
   */
  static generateFollowUpQuestions(context: string, previousAnswer: string): string[] {
    const contextLower = context.toLowerCase();
    const answerLower = previousAnswer.toLowerCase();
    
    if (contextLower.includes('customer') && answerLower.includes('saas')) {
      return [
        "What's the typical ARR or contract value for these SaaS customers?",
        "Are they B2B or B2C SaaS companies?",
        "What stage are they in - early stage, growth, or mature?"
      ];
    }
    
    if (contextLower.includes('pain') && answerLower.includes('growth')) {
      return [
        "What specific growth challenges are they facing?",
        "Is this about scaling people, processes, or technology?",
        "How quickly are they trying to grow?"
      ];
    }
    
    if (contextLower.includes('size') && answerLower.includes('small')) {
      return [
        "When you say small, what's the employee range we're talking about?",
        "Do they have potential to grow, or do you prefer them to stay small?",
        "What's different about how small companies buy versus larger ones?"
      ];
    }
    
    return [
      "Can you give me a specific example of that?",
      "What makes that particularly important?",
      "How do you typically identify that characteristic in prospects?"
    ];
  }

  /**
   * ICP Framework Explanation for Users
   */
  static getICPExplanation(): string {
    return `An Ideal Customer Profile (ICP) is a detailed description of the type of customer that your business is most likely to successfully serve and who will derive the most value from your products or services.

Key characteristics of a strong ICP:
• **Data-driven**: Based on analysis of existing successful customers
• **Specific and detailed**: Concrete details about company size, industry, revenue, tech stack
• **Value-focused**: Customers most likely to achieve success with your solution
• **Actionable**: Serves as a guide for marketing, sales, and product development

Why this matters for your sales success:
• **Improved Targeting**: Focus efforts on most promising leads
• **Enhanced Marketing**: Tailor messaging to resonate with target audience  
• **Better Product Development**: Prioritize features for most valuable customers
• **Increased Sales Success**: Higher win rates and shorter sales cycles
• **Reduced Churn**: Target customers who are good fit for long-term success

We'll spend time building this foundation because without it, sales efforts become spray-and-pray instead of targeted and effective.`;
  }

  /**
   * Generate ICP summary from discovery data
   */
  static generateICPSummary(characteristics: Partial<ICPCharacteristics>): string {
    let summary = "**Your Ideal Customer Profile:**\n\n";
    
    if (characteristics.companySize) {
      summary += `**Company Size**: ${characteristics.companySize.employees} employees, ${characteristics.companySize.revenue} revenue\n`;
    }
    
    if (characteristics.industry?.length) {
      summary += `**Industry**: ${characteristics.industry.join(', ')}\n`;
    }
    
    if (characteristics.primaryPainPoints?.length) {
      summary += `**Primary Pain Points**: ${characteristics.primaryPainPoints.join(', ')}\n`;
    }
    
    if (characteristics.valueDrivers?.length) {
      summary += `**Value Drivers**: ${characteristics.valueDrivers.join(', ')}\n`;
    }
    
    if (characteristics.budgetRange) {
      summary += `**Budget Range**: ${characteristics.budgetRange}\n`;
    }
    
    summary += "\nThis profile will guide all prospect research and outreach efforts.";
    
    return summary;
  }
}

export default ICPDiscoveryFramework;