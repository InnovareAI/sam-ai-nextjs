/**
 * Enhanced B2B ICP Classification Framework
 * Comprehensive classification system for SAM to systematically define Ideal Customer Profiles
 * Based on industry standards, NAICS codes, LinkedIn Sales Navigator, Apollo.io criteria, and 2025 B2B best practices
 * 
 * Integration Points:
 * - LinkedIn Sales Navigator: Premium search filters, InMail targeting, saved searches
 * - Apollo.io: 65+ advanced filters, 275M+ contacts, technology tracking, buying intent
 * - NAICS/SIC codes for industry standardization
 * - Modern technographics and buying committee analysis
 */

export interface B2B_ICP_Classification {
  // Core Company Demographics
  industry: IndustryClassification;
  geography: GeographyClassification;
  annualRevenue: RevenueClassification;
  budget: BudgetClassification;
  companyHeadcount: HeadcountClassification;
  companyType: CompanyTypeClassification;
  
  // Decision Maker & Contact Information
  seniorityLevel: SeniorityClassification;
  functionRole: FunctionClassification;
  
  // Advanced B2B Characteristics (2025)
  technographics: TechnographicsProfile;
  buyingCommittee: BuyingCommitteeStructure;
  salesCycle: SalesCycleCharacteristics;
  valueMetrics: ValueMetricsProfile;
  
  // Apollo.io Specific Filters
  apolloFilters: ApolloSearchCriteria;
  
  // LinkedIn Sales Navigator Specific Filters  
  linkedinFilters: LinkedInNavigatorCriteria;
  
  // Cross-Platform Integration
  platformIntegration: PlatformIntegrationSettings;
}

// ==================== INDUSTRY CLASSIFICATION ====================
export interface IndustryClassification {
  primaryIndustry: string;
  subIndustry: string[];
  naicsCode?: string;
  sicCode?: string;
  industryMaturity: 'emerging' | 'growth' | 'mature' | 'declining';
}

export const B2B_INDUSTRIES = {
  // Technology & Software
  'Information Technology': {
    subCategories: [
      'Software as a Service (SaaS)',
      'Enterprise Software',
      'Cybersecurity',
      'Cloud Computing',
      'Data Analytics & Business Intelligence',
      'Artificial Intelligence/Machine Learning',
      'DevOps & Development Tools',
      'IT Services & Consulting',
      'Hardware & Infrastructure',
      'Telecommunications'
    ],
    naicsRange: '51-54'
  },
  
  // Healthcare & Life Sciences
  'Healthcare & Life Sciences': {
    subCategories: [
      'Healthcare Technology (HealthTech)',
      'Medical Devices',
      'Pharmaceuticals',
      'Biotechnology',
      'Healthcare Services',
      'Digital Health',
      'Medical Software',
      'Healthcare Analytics',
      'Clinical Research',
      'Telemedicine'
    ],
    naicsRange: '62, 3254, 3391'
  },
  
  // Financial Services
  'Financial Services': {
    subCategories: [
      'FinTech',
      'Banking',
      'Insurance',
      'Investment Management',
      'Payment Processing',
      'Wealth Management',
      'RegTech',
      'InsurTech',
      'Cryptocurrency/Blockchain',
      'Financial Analytics'
    ],
    naicsRange: '52'
  },
  
  // Manufacturing & Industrial
  'Manufacturing & Industrial': {
    subCategories: [
      'Automotive',
      'Aerospace & Defense',
      'Industrial Equipment',
      'Electronics Manufacturing',
      'Chemical Manufacturing',
      'Food & Beverage',
      'Pharmaceuticals Manufacturing',
      'Energy & Utilities',
      'Construction Materials',
      'Industrial IoT'
    ],
    naicsRange: '31-33'
  },
  
  // Professional Services
  'Professional Services': {
    subCategories: [
      'Management Consulting',
      'Legal Services',
      'Accounting & Finance',
      'Marketing & Advertising',
      'Human Resources',
      'Real Estate',
      'Architecture & Engineering',
      'Research & Development',
      'Training & Education',
      'Business Process Outsourcing'
    ],
    naicsRange: '54'
  },
  
  // Additional Key B2B Sectors
  'Retail & E-commerce': {
    subCategories: ['B2B E-commerce', 'Supply Chain', 'Logistics', 'Wholesale Trade'],
    naicsRange: '42, 44-45'
  },
  
  'Education': {
    subCategories: ['EdTech', 'Higher Education', 'K-12', 'Corporate Training'],
    naicsRange: '61'
  },
  
  'Government & Public Sector': {
    subCategories: ['Federal', 'State & Local', 'Defense Contractors', 'GovTech'],
    naicsRange: '92'
  }
};

// ==================== GEOGRAPHY CLASSIFICATION ====================
export interface GeographyClassification {
  primaryMarkets: string[];
  secondaryMarkets: string[];
  excludedMarkets: string[];
  timeZonePreferences: string[];
  regulatoryRequirements: string[];
}

export const GEOGRAPHY_OPTIONS = {
  'North America': {
    regions: ['United States', 'Canada', 'Mexico'],
    subRegions: {
      'United States': ['West Coast', 'East Coast', 'Midwest', 'South', 'Southwest', 'Mountain West'],
      'Canada': ['Ontario', 'Quebec', 'British Columbia', 'Alberta', 'Other Provinces']
    }
  },
  'Europe': {
    regions: ['United Kingdom', 'Germany', 'France', 'Netherlands', 'Nordics', 'Eastern Europe'],
    regulatoryNotes: 'GDPR compliance required'
  },
  'Asia-Pacific': {
    regions: ['Australia', 'Japan', 'Singapore', 'India', 'South Korea', 'Southeast Asia']
  },
  'Global/Remote-First': {
    regions: ['Worldwide', 'English-speaking markets', 'No geographic restrictions']
  }
};

// ==================== REVENUE CLASSIFICATION ====================
export interface RevenueClassification {
  annualRevenue: string;
  revenueGrowthRate: string;
  fundingStage?: string;
  revenueModel: string[];
}

export const REVENUE_TIERS = {
  'Startup': '$0 - $1M',
  'Small Business': '$1M - $10M',
  'SMB': '$10M - $50M',
  'Mid-Market': '$50M - $500M',
  'Enterprise': '$500M - $1B',
  'Large Enterprise': '$1B+'
};

export const FUNDING_STAGES = [
  'Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C+', 
  'Pre-IPO', 'Public Company', 'Private Equity Backed', 
  'Bootstrapped', 'Profitable & Self-Funded'
];

// ==================== BUDGET CLASSIFICATION ====================
export interface BudgetClassification {
  annualBudgetRange: string;
  budgetCycle: 'Monthly' | 'Quarterly' | 'Annual' | 'Project-based';
  budgetAuthority: string;
  costCenter: string[];
  roiExpectations: string;
}

export const BUDGET_RANGES = {
  'Micro': '$1K - $5K',
  'Small': '$5K - $25K', 
  'Medium': '$25K - $100K',
  'Large': '$100K - $500K',
  'Enterprise': '$500K - $2M',
  'Strategic': '$2M+'
};

// ==================== COMPANY HEADCOUNT ====================
export const COMPANY_HEADCOUNT = {
  'Solopreneur': '1',
  'Micro': '2-10',
  'Small': '11-50', 
  'Medium': '51-200',
  'Large': '201-500',
  'Enterprise': '501-1000',
  'Large Enterprise': '1001-5000',
  'Fortune 500': '5001-10000',
  'Fortune 100': '10000+'
};

// ==================== COMPANY TYPE ====================
export const COMPANY_TYPES = {
  'Public Company': 'Publicly traded corporation',
  'Privately Held': 'Private corporation with external investors',
  'Partnership': 'Business partnership structure',
  'LLC': 'Limited Liability Company',
  'Non-Profit': 'Non-profit organization',
  'Educational Institution': 'Universities, schools, training organizations',
  'Government Agency': 'Federal, state, or local government',
  'Startup': 'Early-stage company (typically < 5 years)',
  'Scale-up': 'High-growth company (5-10 years)',
  'Family Business': 'Family-owned business',
  'Cooperative': 'Member-owned organization'
};

// ==================== SENIORITY LEVELS ====================
export interface SeniorityClassification {
  primaryLevel: string;
  secondaryLevels: string[];
  decisionMakingAuthority: 'Final Decision' | 'Recommender' | 'Influencer' | 'End User';
  budgetAuthority: string;
}

export const SENIORITY_LEVELS = {
  'C-Suite': {
    roles: ['CEO', 'CTO', 'CRO', 'CMO', 'CFO', 'CHRO', 'CPO', 'CSO'],
    authority: 'Final Decision',
    budgetRange: 'Unlimited to $10M+'
  },
  'VP Level': {
    roles: ['VP Engineering', 'VP Sales', 'VP Marketing', 'VP Operations', 'VP Product'],
    authority: 'Final Decision / Strong Recommender', 
    budgetRange: '$100K - $2M'
  },
  'Director Level': {
    roles: ['Director of IT', 'Sales Director', 'Marketing Director', 'Product Director'],
    authority: 'Recommender / Influencer',
    budgetRange: '$50K - $500K'
  },
  'Senior Manager': {
    roles: ['Senior Manager', 'Department Head', 'Team Lead', 'Principal'],
    authority: 'Recommender',
    budgetRange: '$10K - $100K'
  },
  'Manager': {
    roles: ['Manager', 'Project Manager', 'Program Manager'],
    authority: 'Influencer / End User',
    budgetRange: '$5K - $50K'
  },
  'Individual Contributor': {
    roles: ['Senior Specialist', 'Analyst', 'Coordinator', 'Administrator'],
    authority: 'End User / Influencer',
    budgetRange: '$1K - $10K'
  }
};

// ==================== FUNCTION/ROLE CLASSIFICATION ====================
export const FUNCTION_ROLES = {
  'Technology': [
    'Information Technology', 'Engineering', 'Data Science', 'DevOps', 
    'Cybersecurity', 'Cloud Architecture', 'Software Development'
  ],
  'Sales & Revenue': [
    'Sales', 'Business Development', 'Revenue Operations', 'Sales Engineering',
    'Customer Success', 'Account Management'
  ],
  'Marketing': [
    'Marketing', 'Digital Marketing', 'Product Marketing', 'Content Marketing',
    'Demand Generation', 'Marketing Operations', 'Brand Management'
  ],
  'Operations': [
    'Operations', 'Supply Chain', 'Procurement', 'Project Management',
    'Business Operations', 'Process Improvement'
  ],
  'Finance & Strategy': [
    'Finance', 'Accounting', 'Financial Planning & Analysis', 'Strategy',
    'Business Analysis', 'Corporate Development'
  ],
  'People & Culture': [
    'Human Resources', 'Talent Acquisition', 'People Operations',
    'Learning & Development', 'Compensation & Benefits'
  ],
  'Product & Design': [
    'Product Management', 'Product Design', 'User Experience', 'Research',
    'Product Strategy', 'Innovation'
  ],
  'Legal & Compliance': [
    'Legal', 'Compliance', 'Risk Management', 'Regulatory Affairs',
    'Intellectual Property', 'Contract Management'
  ]
};

// ==================== 2025 ADVANCED CHARACTERISTICS ====================

export interface TechnographicsProfile {
  primaryTechStack: string[];
  cloudPlatforms: string[];
  techMaturity: 'Basic' | 'Intermediate' | 'Advanced' | 'Cutting-edge';
  digitalTransformationStage: string;
  integrationRequirements: string[];
}

export interface BuyingCommitteeStructure {
  averageCommitteeSize: number;
  keyRoles: string[];
  championProfile: string;
  economicBuyer: string;
  technicalValidator: string;
  endUsers: string[];
}

export interface SalesCycleCharacteristics {
  averageLength: string;
  touchpointsRequired: number;
  preferredChannels: string[];
  evaluationCriteria: string[];
  competitiveAlternatives: string[];
}

export interface ValueMetricsProfile {
  primaryKPIs: string[];
  roiExpectations: string;
  paybackPeriod: string;
  successMetrics: string[];
  churnRisk: 'Low' | 'Medium' | 'High';
}

// ==================== APOLLO.IO SEARCH CRITERIA ====================

export interface ApolloSearchCriteria {
  // Company Filters (65+ available in Apollo.io)
  companyFilters: {
    employeeRange: string[];
    revenueRange: string[];
    fundingStage: string[];
    yearFounded: string[];
    departmentHeadcount: Record<string, string>; // dept: range
    alexaRank: string;
    jobPostings: boolean;
    marketSegment: 'B2B' | 'B2C' | 'Both';
    buyingIntent: {
      enabled: boolean;
      intentTopics: string[];
      intentScore: 'High' | 'Medium' | 'Low';
    };
  };
  
  // Technology Filters (1,500+ technologies tracked)
  technologyFilters: {
    currentTechnologies: string[]; // CRM, Marketing, Analytics, etc.
    excludeTechnologies: string[];
    techCategories: string[]; // E-commerce, HR Tech, Sales Tech
    techMaturityLevel: 'Early Adopter' | 'Mainstream' | 'Late Adopter';
  };
  
  // Contact/People Filters
  contactFilters: {
    jobTitles: string[];
    departments: string[];
    seniorityLevels: string[];
    timeInRole: string;
    totalExperience: string;
    managementLevel: string[];
    persona: string[];
  };
  
  // Advanced Apollo Features
  advancedFeatures: {
    aiResearchTemplate: string;
    savedSearches: string[];
    listTargeting: boolean;
    emailVerificationRequired: boolean;
    phoneNumberRequired: boolean;
    socialMediaRequired: boolean;
  };
}

// ==================== LINKEDIN SALES NAVIGATOR CRITERIA ====================

export interface LinkedInNavigatorCriteria {
  // Company Filters
  companyFilters: {
    companyHeadcount: string[];
    industry: string[];
    companyType: string[];
    headquartersLocation: string[];
    companyGrowthRate: string;
    fortuneRanking: string;
    followersCount: string;
    recentlyPosted: boolean;
    recentlyMentioned: boolean;
    currentEvents: string[];
  };
  
  // Geography & Location
  locationFilters: {
    currentLocation: string[];
    pastLocation: string[];
    headquartersLocation: string[];
    timeZone: string[];
    includeRemote: boolean;
  };
  
  // Professional Experience  
  experienceFilters: {
    currentCompany: string[];
    pastCompany: string[];
    currentTitle: string[];
    pastTitle: string[];
    functionAreas: string[];
    seniorityLevel: string[];
    yearsOfExperience: string;
    yearsInCurrentRole: string;
    industryExperience: string[];
  };
  
  // Education & Skills
  educationFilters: {
    schools: string[];
    degreeTypes: string[];
    fieldsOfStudy: string[];
    skillsEndorsed: string[];
    languages: string[];
    certifications: string[];
  };
  
  // Engagement & Activity
  activityFilters: {
    postedContent: boolean;
    changedJobs: boolean;
    mentionedInNews: boolean;
    groupMemberships: string[];
    recentlyActive: boolean;
    connectionDegree: '1st' | '2nd' | '3rd+';
    openToOpportunities: boolean;
  };
  
  // Sales Navigator Premium Features
  premiumFeatures: {
    leadRecommendations: boolean;
    realTimeUpdates: boolean;
    advancedSearch: boolean;
    crmIntegration: string;
    inmailCredits: number;
    savedSearches: number;
    notes: boolean;
    teamLinkVisibility: boolean;
  };
}

// ==================== CROSS-PLATFORM INTEGRATION ====================

export interface PlatformIntegrationSettings {
  // Data Synchronization
  dataSync: {
    crossPlatformMatching: boolean;
    duplicateDetection: boolean;
    enrichmentPriority: 'Apollo' | 'LinkedIn' | 'Both';
    updateFrequency: 'Real-time' | 'Daily' | 'Weekly';
  };
  
  // Workflow Integration
  workflow: {
    searchSequence: ('Apollo' | 'LinkedIn')[];
    backupPlatform: 'Apollo' | 'LinkedIn';
    verificationSteps: string[];
    qualificationCriteria: string[];
  };
  
  // Export & Campaign Management
  campaignIntegration: {
    listSynchronization: boolean;
    campaignTracking: boolean;
    responseTracking: boolean;
    engagementMetrics: boolean;
    roiTracking: boolean;
  };
  
  // Compliance & Data Quality
  compliance: {
    gdprCompliance: boolean;
    dataRetention: string;
    consentTracking: boolean;
    emailVerification: boolean;
    phoneVerification: boolean;
  };
}

/**
 * SAM's ICP Discovery Questions Generator
 * Uses this classification framework to generate systematic discovery questions
 */
export class SAM_ICP_Discovery {
  
  static generateIndustryQuestions(): string[] {
    return [
      "What industry is your company in? (e.g., Technology, Healthcare, Financial Services, Manufacturing)",
      "Are there specific sub-sectors or niches within that industry you focus on?",
      "How would you describe your industry's maturity - emerging, growth phase, mature, or declining?",
      "What are the unique characteristics or challenges of your specific industry vertical?"
    ];
  }

  static generateGeographyQuestions(): string[] {
    return [
      "What geographic markets do you primarily serve?",
      "Are there specific regions where you see the most success?",
      "Are there any geographic markets you avoid or that don't work well for your business?",
      "Do you have any regulatory or compliance requirements that limit your geographic reach?",
      "What time zones do your customers typically operate in?"
    ];
  }

  static generateRevenueQuestions(): string[] {
    return [
      "What's the typical annual revenue range of your best customers?",
      "Are you focused on startups, SMBs, mid-market, or enterprise companies?",
      "Do you have a preference for companies at certain funding stages?",
      "What revenue growth rate do your ideal customers typically have?",
      "How does company size (by revenue) affect their ability to get value from your solution?"
    ];
  }

  static generateBudgetQuestions(): string[] {
    return [
      "What's the typical budget range your customers have for solutions like yours?",
      "Is this usually an annual budget, project-based, or monthly recurring?",
      "What department or cost center does this budget typically come from?",
      "What ROI or payback period do your customers typically expect?",
      "How do budget cycles affect when customers are most likely to buy?"
    ];
  }

  static generateSeniorityQuestions(): string[] {
    return [
      "Who typically initiates the conversation about solutions like yours?",
      "What's the seniority level of the person who has final decision-making authority?",
      "Besides the decision maker, who else is typically involved in the evaluation process?",
      "What's the budget authority level of your typical champions?",
      "Do you find more success selling to C-suite, VPs, Directors, or Managers?"
    ];
  }

  static generateFunctionQuestions(): string[] {
    return [
      "What department or function do your primary contacts typically work in?",
      "Are there specific roles or job titles that tend to be your best champions?",
      "Who are the end users of your solution within the organization?",
      "Which departments typically get involved in the buying process?",
      "Are there certain functions that tend to be blockers or create friction?"
    ];
  }

  static generateAdvancedCharacteristicsQuestions(): string[] {
    return [
      "What technology stack do your most successful customers typically use?",
      "How tech-savvy or digitally mature are your ideal customers?",
      "How many people are typically involved in the buying committee?",
      "What's the typical sales cycle length for your best deals?",
      "What are the main alternatives or competitors your prospects evaluate?",
      "What metrics do your customers use to measure success with your solution?"
    ];
  }

  static generateTechnographicsQuestions(): string[] {
    return [
      "What specific technologies does your ideal customer use? (CRM, Marketing Automation, Analytics platforms)",
      "Are there technologies your prospects should NOT be using (competitors, incompatible systems)?",
      "What department sizes matter most for your solution? (Marketing team size, Sales team size, etc.)",
      "Do you find companies with recent job postings are better prospects?",
      "What signals indicate a prospect is actively looking for solutions like yours?",
      "What level of digital maturity or tech adoption do your best customers typically have?",
      "Does website traffic or online presence correlate with good prospects?",
      "Are there specific funding stages that work better for your sales process?",
      "Do you work better with newer companies or more established ones?"
    ];
  }

  static generateProfessionalBackgroundQuestions(): string[] {
    return [
      "What job titles are your primary decision makers currently holding?",
      "Are there past job titles or companies that indicate good prospects?",
      "What educational backgrounds or schools correlate with good customers?",
      "Do prospects with specific certifications or skills perform better?",
      "Are there professional groups or associations your ideal customers participate in?",
      "Do recently active prospects (posting content, job changes) convert better?",
      "How important are existing professional connections to your outreach success?",
      "Do prospects who are actively job searching respond better to outreach?",
      "Are there specific company rankings (Fortune 500, Inc 5000) that work well?",
      "What geographic regions or time zones are most responsive to your outreach?"
    ];
  }

  static generatePlatformIntegrationQuestions(): string[] {
    return [
      "What tools are you currently using to find prospects?",
      "How do you currently verify contact information before outreach?",
      "What's your current process for managing prospect lists?",
      "How do you track engagement and responses from your outreach?",
      "What CRM or tools do you use to manage prospect data?",
      "Are there any compliance or data retention requirements you need to follow?",
      "How do you currently avoid duplicate outreach to the same prospects?",
      "What's working well in your current prospecting process that we should keep?"
    ];
  }

  static getDisqualificationQuestions(): string[] {
    return [
      "What types of companies are definitely NOT a good fit?",
      "Are there industry verticals you avoid?",
      "What company size (too small or too large) doesn't work well?",
      "What budget constraints would make someone unqualified?",
      "Are there technology limitations that would prevent success?",
      "What behavioral red flags indicate a prospect won't be successful?"
    ];
  }

  /**
   * Generate platform-specific search configuration based on ICP
   */
  static generateApolloSearchConfig(icp: Partial<B2B_ICP_Classification>): Partial<ApolloSearchCriteria> {
    const config: Partial<ApolloSearchCriteria> = {
      companyFilters: {
        employeeRange: [],
        revenueRange: [],
        fundingStage: [],
        yearFounded: [],
        departmentHeadcount: {},
        alexaRank: '',
        jobPostings: false,
        marketSegment: 'B2B',
        buyingIntent: {
          enabled: false,
          intentTopics: [],
          intentScore: 'Medium'
        }
      },
      technologyFilters: {
        currentTechnologies: icp.technographics?.primaryTechStack || [],
        excludeTechnologies: [],
        techCategories: [],
        techMaturityLevel: icp.technographics?.techMaturity === 'Advanced' ? 'Early Adopter' : 'Mainstream'
      },
      contactFilters: {
        jobTitles: [],
        departments: [],
        seniorityLevels: [],
        timeInRole: '',
        totalExperience: '',
        managementLevel: [],
        persona: []
      },
      advancedFeatures: {
        aiResearchTemplate: 'B2B Qualification',
        savedSearches: [],
        listTargeting: true,
        emailVerificationRequired: true,
        phoneNumberRequired: false,
        socialMediaRequired: false
      }
    };

    // Map ICP data to Apollo filters
    if (icp.companyHeadcount) {
      config.companyFilters!.employeeRange = [icp.companyHeadcount.toString()];
    }

    if (icp.annualRevenue) {
      config.companyFilters!.revenueRange = [icp.annualRevenue.annualRevenue];
    }

    if (icp.seniorityLevel) {
      config.contactFilters!.seniorityLevels = [icp.seniorityLevel.primaryLevel];
    }

    return config;
  }

  /**
   * Generate LinkedIn Sales Navigator search configuration
   */
  static generateLinkedInSearchConfig(icp: Partial<B2B_ICP_Classification>): Partial<LinkedInNavigatorCriteria> {
    const config: Partial<LinkedInNavigatorCriteria> = {
      companyFilters: {
        companyHeadcount: [],
        industry: icp.industry ? [icp.industry.primaryIndustry] : [],
        companyType: [],
        headquartersLocation: icp.geography ? icp.geography.primaryMarkets : [],
        companyGrowthRate: '',
        fortuneRanking: '',
        followersCount: '',
        recentlyPosted: false,
        recentlyMentioned: false,
        currentEvents: []
      },
      locationFilters: {
        currentLocation: icp.geography ? icp.geography.primaryMarkets : [],
        pastLocation: [],
        headquartersLocation: icp.geography ? icp.geography.primaryMarkets : [],
        timeZone: icp.geography ? icp.geography.timeZonePreferences : [],
        includeRemote: true
      },
      experienceFilters: {
        currentCompany: [],
        pastCompany: [],
        currentTitle: [],
        pastTitle: [],
        functionAreas: [],
        seniorityLevel: icp.seniorityLevel ? [icp.seniorityLevel.primaryLevel] : [],
        yearsOfExperience: '',
        yearsInCurrentRole: '',
        industryExperience: icp.industry ? [icp.industry.primaryIndustry] : []
      },
      educationFilters: {
        schools: [],
        degreeTypes: [],
        fieldsOfStudy: [],
        skillsEndorsed: [],
        languages: [],
        certifications: []
      },
      activityFilters: {
        postedContent: false,
        changedJobs: false,
        mentionedInNews: false,
        groupMemberships: [],
        recentlyActive: false,
        connectionDegree: '2nd',
        openToOpportunities: false
      },
      premiumFeatures: {
        leadRecommendations: true,
        realTimeUpdates: true,
        advancedSearch: true,
        crmIntegration: '',
        inmailCredits: 0,
        savedSearches: 10,
        notes: true,
        teamLinkVisibility: false
      }
    };

    return config;
  }

  /**
   * Create integrated search strategy combining both platforms
   */
  static createIntegratedSearchStrategy(icp: Partial<B2B_ICP_Classification>): {
    apolloConfig: Partial<ApolloSearchCriteria>;
    linkedinConfig: Partial<LinkedInNavigatorCriteria>;
    integrationSettings: Partial<PlatformIntegrationSettings>;
    searchSequence: string[];
    qualificationCriteria: string[];
  } {
    const apolloConfig = this.generateApolloSearchConfig(icp);
    const linkedinConfig = this.generateLinkedInSearchConfig(icp);
    
    const integrationSettings: Partial<PlatformIntegrationSettings> = {
      dataSync: {
        crossPlatformMatching: true,
        duplicateDetection: true,
        enrichmentPriority: 'Both',
        updateFrequency: 'Daily'
      },
      workflow: {
        searchSequence: ['Apollo', 'LinkedIn'],
        backupPlatform: 'LinkedIn',
        verificationSteps: ['Email Verification', 'LinkedIn Profile Check', 'Company Verification'],
        qualificationCriteria: ['Title Match', 'Company Size Match', 'Industry Match']
      },
      campaignIntegration: {
        listSynchronization: true,
        campaignTracking: true,
        responseTracking: true,
        engagementMetrics: true,
        roiTracking: true
      },
      compliance: {
        gdprCompliance: true,
        dataRetention: '2 years',
        consentTracking: true,
        emailVerification: true,
        phoneVerification: false
      }
    };

    const searchSequence = [
      '1. Start with Apollo.io broad search using company and technology filters',
      '2. Export initial prospect list for verification',
      '3. Cross-reference with LinkedIn Sales Navigator for profile enrichment',
      '4. Verify contact information and recent activity',
      '5. Apply final qualification criteria before campaign enrollment'
    ];

    const qualificationCriteria = [
      'Company matches ICP size and industry requirements',
      'Contact has decision-making authority in target function',
      'Recent activity indicates engagement potential',
      'Contact information verified across platforms',
      'No duplicate entries in existing campaigns'
    ];

    return {
      apolloConfig,
      linkedinConfig,
      integrationSettings,
      searchSequence,
      qualificationCriteria
    };
  }
}

export default SAM_ICP_Discovery;