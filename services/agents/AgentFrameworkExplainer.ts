/**
 * Agent Framework Explainer - SAM's ability to explain his 8-agent agentic system
 * Provides comprehensive explanations of how the multi-agent architecture works
 */

export interface AgentDescription {
  name: string;
  role: string;
  primaryFunction: string;
  keyCapabilities: string[];
  worksWith: string[];
  userBenefit: string;
  whenActivated: string[];
  example: string;
}

export interface FrameworkOverview {
  totalAgents: number;
  corePhilosophy: string;
  keyBenefits: string[];
  howItWorks: string[];
  orchestrationApproach: string;
}

export class AgentFrameworkExplainer {
  private static instance: AgentFrameworkExplainer;

  public static getInstance(): AgentFrameworkExplainer {
    if (!AgentFrameworkExplainer.instance) {
      AgentFrameworkExplainer.instance = new AgentFrameworkExplainer();
    }
    return AgentFrameworkExplainer.instance;
  }

  /**
   * Get complete framework overview for users
   */
  getFrameworkOverview(): FrameworkOverview {
    return {
      totalAgents: 8,
      corePhilosophy: "SAM solves the most frustrating B2B sales challenges through 8 core agents that automate time-consuming tasks. Proven results: +35% lead engagement, 50% faster outreach, and 10x ROI in 3 months.",
      keyBenefits: [
        "Eliminates high-volume, low-quality prospecting with intelligent lead qualification",
        "Replaces generic outreach with hyper-personalized messages that get responses",
        "Prevents leads from going cold with consistent, context-aware follow-up",
        "Scales outreach cost-effectively without platform limits or per-seat costs",
        "Automates 80% of sales tasks while maintaining personal relationship building",
        "Delivers measurable ROI: 35% higher engagement, 50% faster processes"
      ],
      howItWorks: [
        "Smart Prospecting: Automatically finds and qualifies prospects against your ICP",
        "Personalized Outreach: Creates unique messages with AI copywriting and visual elements",
        "Persistent Follow-Up: Monitors conversations and re-engages until prospects reply",
        "Multi-Channel Scaling: Leverages multiple platforms without hitting limits",
        "Meeting Pipeline: Coordinates scheduling with comprehensive prep materials",
        "Continuous Optimization: Learns from results to improve future performance"
      ],
      orchestrationApproach: "The 8 core agents run autonomous sales funnels that solve your biggest pain points - from low-quality leads to inconsistent follow-up - while you focus on closing deals."
    };
  }

  /**
   * Get detailed description of SAM's 8-stage agentic system based on actual implementation
   */
  getCoreAgentDescriptions(): AgentDescription[] {
    return [
      {
        name: "Lead Discovery Agent",
        role: "Perfect Prospect Identification",
        primaryFunction: "Finds and qualifies high-value prospects who perfectly match your ideal customer profile",
        keyCapabilities: [
          "Intelligent prospect discovery and qualification",
          "Real-time contact data enrichment",
          "Advanced filtering by role, company, and behavior",
          "Lead scoring based on conversion potential",
          "Automated prospect validation and verification",
          "Continuous prospect pipeline replenishment"
        ],
        worksWith: ["Message Generation Agent", "Campaign Management Agent", "Lead Qualification Agent"],
        userBenefit: "Never run out of qualified prospects - automatically builds pipeline of perfect-fit leads while you focus on closing deals",
        whenActivated: [
          "When you need new prospects matching your ICP",
          "When building target lists for campaigns", 
          "When expanding into new market segments",
          "When existing lead sources are exhausted"
        ],
        example: "You say 'I need SaaS CTOs at growing companies' - the agent continuously finds, scores, and validates prospects, delivering a fresh pipeline of qualified leads ready for personalized outreach."
      },
      {
        name: "Lead Enrichment Agent",
        role: "Prospect Intelligence Gathering",
        primaryFunction: "Enriches prospect profiles with comprehensive business intelligence and contact information",
        keyCapabilities: [
          "Complete prospect profile enrichment",
          "Real-time company intelligence gathering",
          "Contact verification and validation",
          "Social media profile analysis",
          "Buying signal detection and timing",
          "Decision maker identification and mapping"
        ],
        worksWith: ["Lead Discovery Agent", "Message Generation Agent", "Campaign Strategy Agent"],
        userBenefit: "Transforms basic prospect lists into rich, actionable profiles with everything needed for highly personalized outreach",
        whenActivated: [
          "When prospect data needs enrichment",
          "When preparing for personalized campaigns",
          "When qualifying lead quality and fit",
          "When timing outreach for maximum impact"
        ],
        example: "Takes a basic 'John Smith, CTO' lead and enriches it with company funding status, recent tech initiatives, team size, pain points, and optimal contact timing - turning one data point into a complete sales intelligence profile."
      },
      {
        name: "Message Generation Agent",
        role: "Personalized Outreach Creation", 
        primaryFunction: "Creates highly personalized, compelling messages that resonate with each specific prospect",
        keyCapabilities: [
          "Hyper-personalized email and LinkedIn messages",
          "Context-aware messaging based on prospect research",
          "Multi-step sequence development and optimization",
          "Industry-specific value proposition mapping",
          "Pain point and solution alignment",
          "A/B testing for continuous improvement"
        ],
        worksWith: ["Lead Enrichment Agent", "Campaign Strategy Agent", "Reply Handling Agent"],
        userBenefit: "Every message feels personally written and highly relevant, dramatically increasing response rates and eliminating generic spam",
        whenActivated: [
          "When creating outreach campaigns",
          "When personalizing message sequences", 
          "When following up on conversations",
          "When optimizing message performance"
        ],
        example: "Creates: 'Hi Sarah, saw TechCorp just expanded to Chicago - scaling engineering teams across offices is tricky. We helped DataFlow solve similar coordination challenges during their 3-city expansion, reducing deployment time by 40%. Worth a brief conversation about your scaling approach?'"
      },
      {
        name: "Campaign Management Agent",
        role: "Automated Campaign Execution",
        primaryFunction: "Executes and manages multi-channel outreach campaigns with intelligent timing and personalization",
        keyCapabilities: [
          "Automated campaign execution across LinkedIn and email",
          "Intelligent timing and sequence optimization",
          "Real-time campaign monitoring and adjustments",
          "Multi-touch sequence coordination",
          "Response tracking and engagement analysis",
          "Campaign performance optimization"
        ],
        worksWith: ["Message Generation Agent", "Reply Handling Agent", "Analytics Agent"],
        userBenefit: "Runs sophisticated multi-touch campaigns automatically while maintaining personal feel and optimal timing for maximum response rates",
        whenActivated: [
          "When launching new outreach campaigns",
          "When scaling successful message sequences",
          "When managing multiple prospect segments",
          "When optimizing campaign performance"
        ],
        example: "Executes coordinated sequence: LinkedIn connection + personalized note → Wait 3 days → Follow-up email with value → Wait 5 days → LinkedIn engagement → Final value-add message, all automatically timed and personalized."
      },
      {
        name: "Reply Handling Agent", 
        role: "Intelligent Response Management",
        primaryFunction: "Manages and responds to prospect replies with context-aware, appropriate follow-up actions",
        keyCapabilities: [
          "Intelligent reply categorization and sentiment analysis",
          "Context-aware response generation",
          "Meeting scheduling and calendar coordination",
          "Objection handling and nurturing sequences",
          "Hot lead identification and escalation",
          "Automated follow-up based on reply type"
        ],
        worksWith: ["Message Generation Agent", "Campaign Management Agent", "Meeting Booking Agent"],
        userBenefit: "Never miss a reply or opportunity - automatically handles responses, books meetings, and nurtures conversations while keeping you informed of hot prospects",
        whenActivated: [
          "When prospects reply to outreach",
          "When managing ongoing conversations", 
          "When qualifying interested prospects",
          "When scheduling meetings and follow-ups"
        ],
        example: "Prospect replies 'Interested, but timing might be an issue' → Agent responds with value-focused scheduling options, sends calendar link, and adds to nurture sequence while flagging as warm lead."
      },
      {
        name: "Follow-Up Agent",
        role: "Persistent Relationship Building", 
        primaryFunction: "Manages systematic follow-up sequences and long-term relationship building with prospects",
        keyCapabilities: [
          "Intelligent follow-up sequence management",
          "Long-term nurturing campaign execution",
          "Relationship building and value-add communication",
          "Timing optimization based on prospect behavior",
          "Multi-channel follow-up coordination",
          "Persistence without being pushy"
        ],
        worksWith: ["Reply Handling Agent", "Message Generation Agent", "Campaign Management Agent"],
        userBenefit: "Maintains consistent, valuable contact with prospects over time, turning cold leads warm and keeping your solution top-of-mind",
        whenActivated: [
          "When prospects go quiet after initial engagement",
          "When building long-term relationships",
          "When nurturing prospects not ready to buy",
          "When following up on past conversations"
        ],
        example: "Prospect showed interest 3 months ago but went quiet → Agent sends relevant industry insight, shares case study, offers valuable resource, and checks in with personalized message based on their company's recent news."
      },
      {
        name: "Meeting Booking Agent",
        role: "Automated Meeting Coordination",
        primaryFunction: "Handles meeting scheduling, calendar coordination, and meeting preparation seamlessly",
        keyCapabilities: [
          "Automated calendar scheduling and coordination",
          "Meeting link generation and distribution",
          "Reminder sequences and confirmations",
          "Meeting preparation and brief creation",
          "Rescheduling and cancellation management",
          "Calendar integration and availability management"
        ],
        worksWith: ["Reply Handling Agent", "Meeting Enrichment Agent", "Campaign Management Agent"],
        userBenefit: "Eliminates back-and-forth scheduling emails and ensures every meeting is properly set up with all necessary information and preparation",
        whenActivated: [
          "When prospects express interest in meeting",
          "When follow-up calls need scheduling",
          "When managing meeting logistics",
          "When coordinating multiple stakeholder meetings"
        ],
        example: "Prospect says 'Let's schedule a call' → Agent immediately sends calendar options, books optimal time slot, sends confirmation with agenda, adds to CRM, and prepares meeting brief with prospect background."
      },
      {
        name: "Meeting Enrichment Agent",
        role: "Meeting Intelligence & Preparation",
        primaryFunction: "Enriches meeting preparation with comprehensive prospect and company intelligence for successful conversations",
        keyCapabilities: [
          "Comprehensive pre-meeting research and brief creation",
          "Company and prospect background intelligence",
          "Conversation topics and talking points preparation", 
          "Recent company news and trigger event analysis",
          "Stakeholder mapping and decision maker identification",
          "Custom meeting agenda and strategy development"
        ],
        worksWith: ["Meeting Booking Agent", "Lead Enrichment Agent", "Analytics Agent"],
        userBenefit: "Walk into every meeting fully prepared with deep prospect knowledge, relevant talking points, and strategic conversation framework",
        whenActivated: [
          "When meetings are scheduled with prospects",
          "When preparing for important sales conversations",
          "When meeting with multiple stakeholders",
          "When following up on previous meetings"
        ],
        example: "Before your meeting with TechCorp's CTO → Agent provides: company funding history, tech stack analysis, recent hiring trends, competitor analysis, suggested talking points, and strategic questions to qualify their needs."
      },
      {
        name: "Discovery & Onboarding Agent",
        role: "Business Intelligence Collection",
        primaryFunction: "Conducts comprehensive discovery sessions to understand your business, building the knowledge base that powers all other agents",
        keyCapabilities: [
          "Structured business discovery conversations",
          "ICP definition and refinement",
          "Value proposition extraction",
          "Competitive intelligence gathering",
          "Sales process documentation",
          "Business knowledge base building"
        ],
        worksWith: ["All other agents as knowledge provider"],
        userBenefit: "Ensures all sales automation is personalized to your specific business, industry, and target market rather than using generic approaches",
        whenActivated: [
          "During initial onboarding",
          "When updating business context",
          "When refining targeting criteria",
          "When analyzing new markets"
        ],
        example: "Conducts 60-minute discovery: 'Tell me about your ideal customers... What pain points do you solve... How do you differentiate from competitors...' Then builds comprehensive business profile that personalizes all future agent activities."
      },
      {
        name: "CRM Integration Agent",
        role: "Data Synchronization & Pipeline Management",
        primaryFunction: "Manages data flow between SAM's activities and your CRM system, ensuring all prospect interactions and campaign results are properly tracked",
        keyCapabilities: [
          "Multi-CRM integration (Salesforce, HubSpot, Pipedrive)",
          "Automated data synchronization",
          "Lead scoring and qualification updates",
          "Activity logging and campaign tracking",
          "Pipeline health monitoring",
          "Duplicate detection and cleanup"
        ],
        worksWith: ["Lead Research Agent", "Campaign Strategy Agent", "Analytics Agent"],
        userBenefit: "Maintains clean, up-to-date CRM data and ensures sales team has complete visibility into all automated activities and prospect interactions",
        whenActivated: [
          "When syncing prospect data",
          "When updating lead scores",
          "When logging campaign activities",
          "When tracking pipeline changes"
        ],
        example: "Automatically syncs new prospects from research into Salesforce with qualification scores, logs all outreach attempts, updates lead status based on responses, and alerts sales team to hot prospects."
      },
      {
        name: "Prompt Engineer Agent",
        role: "System Optimization & Performance Enhancement",
        primaryFunction: "Continuously optimizes how all agents communicate and perform, ensuring maximum effectiveness and consistent high-quality outputs",
        keyCapabilities: [
          "Agent prompt optimization",
          "Response quality enhancement",
          "System behavior fine-tuning",
          "Performance testing and validation",
          "Knowledge integration improvement",
          "Agent coordination optimization"
        ],
        worksWith: ["All agents as optimization support"],
        userBenefit: "Ensures the entire system continuously improves and maintains high-quality, professional outputs across all interactions",
        whenActivated: [
          "When optimizing agent performance",
          "When improving response quality",
          "When enhancing system behaviors",
          "When validating system outputs"
        ],
        example: "Notices Message Generation Agent response rates declining, analyzes patterns, optimizes prompts for better personalization, tests improvements, and implements changes that increase response rates by 24%."
      }
    ];
  }

  /**
   * Get detailed description of supporting agents around the core team
   */
  getSupportingAgentDescriptions(): AgentDescription[] {
    return [
      {
        name: "Content Authority Agent",
        role: "Thought Leadership & Credibility Building",
        primaryFunction: "Develops content strategies that position you as an industry authority to support sales efforts and build trust with prospects",
        keyCapabilities: [
          "LinkedIn authority building strategies",
          "Thought leadership content planning",
          "Generative Engine Optimization (GEO)",
          "Industry positioning and differentiation",
          "Expert content creation guidance",
          "Authority measurement and tracking"
        ],
        worksWith: ["Message Generation Agent", "Lead Research Agent"],
        userBenefit: "Builds credibility and authority so prospects already trust and respect you before any sales conversation begins",
        whenActivated: [
          "When building industry authority",
          "When developing thought leadership",
          "When optimizing for AI search engines",
          "When establishing expert positioning"
        ],
        example: "Creates a LinkedIn authority strategy: 'Post industry insights 3x/week, share contrarian viewpoints on [topic], write monthly thought leadership articles, engage with industry leaders' content to build recognition as the go-to expert in [your field].'"
      },
      {
        name: "Discovery & Onboarding Agent",
        role: "Business Intelligence Collection",
        primaryFunction: "Conducts comprehensive discovery sessions to understand your business, building the knowledge base that powers all other agents",
        keyCapabilities: [
          "Structured business discovery conversations",
          "ICP definition and refinement",
          "Value proposition extraction",
          "Competitive intelligence gathering",
          "Sales process documentation",
          "Business knowledge base building"
        ],
        worksWith: ["All agents as knowledge provider"],
        userBenefit: "Ensures all sales automation is personalized to your specific business, industry, and target market rather than using generic approaches",
        whenActivated: [
          "During initial onboarding",
          "When updating business context",
          "When refining targeting criteria",
          "When analyzing new markets"
        ],
        example: "Conducts 60-minute discovery: 'Tell me about your ideal customers... What pain points do you solve... How do you differentiate from competitors...' Then builds comprehensive business profile that personalizes all future agent activities."
      },
      {
        name: "Memory & Knowledge Agent",
        role: "Business Context Persistence",
        primaryFunction: "Maintains and retrieves business knowledge across conversations, ensuring continuity and context for all interactions",
        keyCapabilities: [
          "Long-term business context storage",
          "Conversation history analysis",
          "Knowledge retrieval and application",
          "Business intelligence synthesis",
          "Context sharing across agents",
          "Memory optimization and organization"
        ],
        worksWith: ["All agents for context provision"],
        userBenefit: "Remembers everything about your business so every conversation builds on previous knowledge rather than starting from scratch",
        whenActivated: [
          "In every conversation for context",
          "When retrieving business information",
          "When updating knowledge base",
          "When providing historical context"
        ],
        example: "Remembers that you target EdTech CMOs at Series A companies and automatically applies this context to all lead research and message generation, ensuring consistency across all activities."
      },
      {
        name: "N8N Integration Agent",
        role: "Workflow Automation & Orchestration",
        primaryFunction: "Manages complex multi-step workflows and integrations with external systems through N8N automation platform",
        keyCapabilities: [
          "Multi-system workflow orchestration",
          "API integrations and data flow management",
          "Automated sequence triggers and handoffs",
          "Real-time process monitoring",
          "Error handling and recovery",
          "Custom automation building"
        ],
        worksWith: ["All core agents for workflow coordination"],
        userBenefit: "Automates complex multi-step processes across different platforms, ensuring seamless execution of sophisticated sales workflows",
        whenActivated: [
          "When executing multi-step campaigns",
          "When integrating with external systems",
          "When automating complex workflows",
          "When orchestrating agent handoffs"
        ],
        example: "Orchestrates: Lead research → Data enrichment → CRM sync → Personalized message generation → Multi-channel outreach → Response tracking → Follow-up automation, all running automatically."
      },
      {
        name: "LLM Service Agent",
        role: "AI Model Management & Optimization",
        primaryFunction: "Manages AI model selection, optimization, and quality assurance across all agent interactions",
        keyCapabilities: [
          "Multi-model management (GPT-4, Claude, etc.)",
          "Context optimization and token management",
          "Response quality monitoring",
          "Model selection based on task requirements",
          "Performance benchmarking",
          "Cost optimization"
        ],
        worksWith: ["All agents for AI processing"],
        userBenefit: "Ensures optimal AI performance, cost efficiency, and quality across all interactions while maintaining consistency",
        whenActivated: [
          "In every AI-powered interaction",
          "When optimizing model performance",
          "When managing complex requests",
          "When ensuring response quality"
        ],
        example: "Automatically selects GPT-4 for complex strategic thinking, Claude for detailed analysis, and optimized models for routine tasks, while monitoring quality and managing costs."
      }
    ];
  }

  /**
   * Get complete team overview including core and supporting agents
   */
  getCompleteTeamDescription(): string {
    return `**🤖 SAM's Complete Agent Team Architecture**

**Core Sales Funnel Agents (8 Specialists):**
These agents run automated N8N funnels that handle your complete sales pipeline 24/7:

1. **Lead Discovery Agent** - Continuously finds perfect prospects matching your ICP
2. **Lead Enrichment Agent** - Gathers comprehensive intelligence on prospects
3. **Message Generation Agent** - Creates hyper-personalized outreach that converts
4. **Campaign Management Agent** - Executes multi-channel sequences automatically
5. **Reply Handling Agent** - Manages responses and nurtures conversations
6. **Follow-Up Agent** - Maintains long-term relationship building
7. **Meeting Booking Agent** - Coordinates scheduling seamlessly
8. **Meeting Enrichment Agent** - Prepares comprehensive meeting briefs

**Supporting Agents (Called When Needed):**
These specialized agents provide additional capabilities on-demand:

- **Content Authority Agent** - Thought leadership and credibility building
- **Discovery & Onboarding Agent** - Business intelligence collection
- **Memory & Knowledge Agent** - Maintains business context and conversation history
- **N8N Integration Agent** - Orchestrates complex workflows and system integrations
- **Analytics & Optimization Agent** - Performance tracking and improvement
- **Prompt Engineer Agent** - System optimization and behavior enhancement

**How The System Works:**

**🚀 Autonomous Sales Funnels:**
The 8 core agents run automated N8N workflows that discover prospects, create personalized outreach, handle responses, and book meetings - all while you sleep.

**🎯 On-Demand Support:**
Supporting agents are called automatically when their specialized capabilities are needed - content creation, complex analytics, or system optimization.

**📊 Continuous Intelligence:**
Every interaction feeds back into the system, making future outreach more personalized and effective.

**The Result:** A complete automated sales operation that works 24/7, with specialized support when needed, delivering a continuous stream of qualified meetings.`;
  }

  /**
   * Generate explanation for specific user scenarios
   */
  explainForScenario(scenario: 'new_user' | 'prospect_research' | 'campaign_launch' | 'optimization' | 'integration'): string {
    switch (scenario) {
      case 'new_user':
        return this.getNewUserExplanation();
      case 'prospect_research':
        return this.getProspectResearchExplanation();
      case 'campaign_launch':
        return this.getCampaignLaunchExplanation();
      case 'optimization':
        return this.getOptimizationExplanation();
      case 'integration':
        return this.getIntegrationExplanation();
      default:
        return this.getGeneralExplanation();
    }
  }

  private getNewUserExplanation(): string {
    return `**🚀 How SAM Solves Your Biggest Sales Challenges**

Welcome! Here's how my 8-agent system transforms your sales results:

**The Frustrating Reality You Face:**
- Spending hours on prospecting that yields mostly unqualified leads
- Sending templated messages that get ignored in crowded inboxes
- Losing promising deals because follow-up is inconsistent 
- Hitting platform limits and expensive per-seat costs when scaling
- Wearing too many hats to maintain consistent outreach

**SAM's Proven Solution:**
8 specialized agents that automate everything while maintaining personal touch.
**Results: +35% engagement, 50% faster outreach, 10x ROI in 3 months.**

**How It Works for Your Business:**

**If You're a Tech Startup:**
- **Problem:** Limited resources for sales development
- **Solution:** SAM acts as your full sales team, freeing founders for product development
- **Benefit:** Rapid market feedback through 50% faster outreach cycles

**If You're an SME:**
- **Problem:** Can't compete with enterprise sales sophistication  
- **Solution:** Enterprise-level automation without the complexity or cost
- **Benefit:** Punch above your weight with consistent, professional outreach

**If You're an Agency:**
- **Problem:** Managing campaigns for multiple clients manually
- **Solution:** Automated execution with advanced personalization as your differentiator
- **Benefit:** Scale profitably while delivering better client results

**If You're a Consulting Firm:**
- **Problem:** Need highly targeted outreach but limited time for business development
- **Solution:** Finds niche decision-makers and crafts insight-driven messages automatically
- **Benefit:** Persistent nurturing over long sales cycles while maximizing billable hours

**The 8-Agent Process:**
1. **Discovery** → Learn your business deeply (60 minutes)
2. **Lead Generation** → Find perfect prospects automatically
3. **Personalization** → Create messages that get responses
4. **Multi-Channel Execution** → Coordinate LinkedIn + email seamlessly
5. **Response Management** → Handle replies intelligently
6. **Follow-Up** → Never let prospects go cold
7. **Meeting Coordination** → Schedule automatically with prep
8. **Continuous Optimization** → Improve results over time

**What Makes This Different:**
Traditional tools create more work. SAM eliminates work while delivering better results.

Ready to see which of your pain points SAM can solve first?`;
  }

  private getProspectResearchExplanation(): string {
    return `**🔍 How SAM's Lead Research Process Works**

When you request prospect research, here's the sophisticated process that happens:

**1. Discovery Context Application**
The Lead Research Specialist accesses your business profile:
- Your ICP characteristics and qualification criteria
- Industry focus and company size preferences
- Geographic targeting and role specifications
- Pain points and buying signals to look for

**2. Multi-Source Research Strategy**
The agent doesn't just use one database - it orchestrates multiple sources:
- **LinkedIn Sales Navigator**: Advanced boolean searches with your criteria
- **Apollo.io**: Contact enrichment and verification
- **ZoomInfo**: Company intelligence and technographic data
- **Bright Data**: Real-time profile scraping for fresh data

**3. Advanced Qualification Process**
Each prospect gets scored using frameworks like:
- **BANT**: Budget, Authority, Need, Timeline assessment
- **MEDDIC**: Metrics, Economic buyer, Decision criteria, etc.
- **Custom Scoring**: Based on your specific success patterns

**4. Intelligent Segmentation**
Prospects are automatically segmented by:
- Qualification score and likelihood to convert
- Industry vertical and company characteristics
- Role level and decision-making authority
- Engagement potential and contact preferences

**5. Handoff to Message Generation**
The research doesn't just dump raw data - it provides:
- Personalization opportunities for each prospect
- Relevant pain points and value propositions
- Suggested messaging angles and approaches
- Optimal contact timing and channel recommendations

**Result: Instead of a generic list, you get a strategic, qualified, personalized prospect database ready for immediate outreach with high conversion potential.**

Want to see this in action? Tell me about your ideal customer profile!`;
  }

  private getCampaignLaunchExplanation(): string {
    return `**🚀 How SAM's Campaign Launch Process Works**

When launching a campaign, multiple agents collaborate in a sophisticated workflow:

**1. Campaign Strategy Agent Takes Lead**
- Analyzes your business goals and target audience
- Determines optimal channel mix (email, LinkedIn, phone)
- Designs multi-touch sequence strategy
- Sets timing intervals and escalation paths

**2. Lead Research Integration**
- Pulls qualified prospects from research database
- Segments by persona, company size, and engagement potential
- Assigns prospects to appropriate sequence variations
- Provides personalization data for each contact

**3. Message Generation Orchestration**
- Creates personalized messages for each sequence step
- Adapts messaging based on prospect segment and channel
- Develops subject lines and CTAs optimized for your audience
- Builds follow-up variations for different response scenarios

**4. Multi-Channel Coordination**
The agents coordinate across channels:
- **Touch 1**: LinkedIn connection request with personalized note
- **Touch 2**: Email introduction referencing LinkedIn interaction
- **Touch 3**: LinkedIn engagement (like/comment on their content)
- **Touch 4**: Follow-up email with value-add content
- **Touch 5**: Phone call (for high-value prospects)
- **Touch 6**: Final LinkedIn message with clear CTA
- **Touch 7**: Break-up email with future re-engagement trigger

**5. Real-Time Optimization**
- Analytics Agent monitors performance across all touches
- Automatically adjusts timing based on response patterns
- Tests different message variations and optimizes
- Provides recommendations for sequence improvements

**6. CRM Integration**
- All activities automatically logged in your CRM
- Lead scores updated based on engagement
- Pipeline progression tracked and reported
- Sales team alerted to hot prospects requiring immediate attention

**Result: A sophisticated, multi-channel campaign that feels personal and strategic rather than automated and generic.**

Ready to launch your first campaign?`;
  }

  private getOptimizationExplanation(): string {
    return `**📈 How SAM's Continuous Optimization Works**

The system doesn't just run campaigns - it constantly improves them:

**1. Analytics Agent Performance Monitoring**
Tracks comprehensive metrics across all activities:
- **Email**: Open rates, click rates, reply rates by segment
- **LinkedIn**: Connection acceptance, message response, engagement rates
- **Phone**: Contact rates, conversation quality, meeting bookings
- **Pipeline**: Conversion rates through each stage

**2. Pattern Recognition & Insights**
The Analytics Agent identifies patterns like:
- Which subject lines perform best for different personas
- Optimal timing for outreach by industry and role
- Message length and tone preferences by audience
- Channel effectiveness for different prospect types

**3. Prompt Engineer Agent Optimization**
Continuously refines how agents perform:
- Optimizes message generation for better personalization
- Improves research criteria for higher-quality prospects
- Enhances qualification frameworks based on conversion data
- Refines campaign strategies based on performance patterns

**4. A/B Testing Automation**
The system automatically tests:
- **Message Variations**: Different approaches, lengths, and CTAs
- **Timing Experiments**: Send times, follow-up intervals, sequence spacing
- **Channel Mix**: Email vs LinkedIn vs phone for different segments
- **Personalization Depth**: How much personalization drives best results

**5. Predictive Improvements**
Based on accumulated data, the system predicts:
- Which prospects are most likely to convert
- Optimal campaign strategies for new target segments
- Best messaging approaches for emerging market trends
- Channel preferences for different buyer personas

**6. Automated Recommendations**
You receive specific, actionable recommendations:
- "Shift 30% more outreach to LinkedIn for VP-level prospects"
- "Implement subject line pattern X for 23% higher open rates"
- "Follow up with non-responders after 14 days instead of 7"
- "Target Company Type Y - 41% higher conversion potential"

**The Result: Your sales automation gets smarter and more effective over time, not stagnant like traditional tools.**

Want to see your current optimization opportunities?`;
  }

  private getIntegrationExplanation(): string {
    return `**🔗 How SAM's Integration Architecture Works**

SAM doesn't replace your existing tools - it enhances them through intelligent integration:

**1. CRM Integration Agent Capabilities**
Seamlessly connects with:
- **Salesforce**: Complete data sync, activity logging, pipeline updates
- **HubSpot**: Contact enrichment, sequence tracking, attribution
- **Pipedrive**: Deal progression, activity coordination
- **Custom CRMs**: API-based integration for most systems

**2. Data Flow Management**
- **Inbound**: Pulls existing contacts, company data, and pipeline information
- **Outbound**: Pushes prospect research, campaign activities, and engagement data
- **Bidirectional**: Maintains real-time sync for lead scores, status updates
- **Intelligent Mapping**: Automatically maps fields and resolves conflicts

**3. LinkedIn & Email Platform Integration**
- **LinkedIn Sales Navigator**: Direct integration for research and outreach
- **Email Platforms**: Works with Gmail, Outlook, and most ESPs
- **Automation Tools**: Enhances existing sequences with better personalization
- **Analytics Platforms**: Feeds performance data for comprehensive reporting

**4. Workflow Orchestration**
The system coordinates between platforms:
- Research prospect in LinkedIn → Enrich in Apollo → Add to CRM → Generate sequence
- Campaign response → Update CRM status → Trigger next sequence → Alert sales rep
- Meeting booked → CRM pipeline update → Handoff to sales team → Track outcome

**5. Data Quality & Cleanup**
The CRM Integration Agent maintains:
- **Duplicate Detection**: Automatically identifies and merges duplicates
- **Data Enrichment**: Continuously updates contact and company information
- **Quality Scoring**: Flags low-quality or outdated records for review
- **Standardization**: Ensures consistent data formats across systems

**6. Security & Compliance**
- **GDPR/CCPA Compliance**: Automatic opt-out management and data rights
- **Data Security**: Encrypted data transfer and secure API connections
- **Access Controls**: Role-based permissions and audit trails
- **Backup & Recovery**: Automated data protection and recovery procedures

**The Result: SAM amplifies your existing tech stack rather than creating more complexity, making everything work better together.**

Need help setting up integrations with your current tools?`;
  }

  private getGeneralExplanation(): string {
    return `**🤖 SAM's 8-Agent Agentic Framework Explained**

Think of me as the conductor of a specialist orchestra. Instead of being a generalist AI trying to do everything, I orchestrate 8 expert agents who each excel in specific aspects of B2B sales.

**The Core Concept:**
Traditional sales automation fails because it's generic. My approach is to deeply understand YOUR business first, then deploy specialist agents who use that context to create personalized, strategic sales activities.

**The 8 Specialist Agents:**

**🔍 Lead Research Specialist** - Finds and qualifies perfect prospects
**✍️ Message Generation Agent** - Creates hyper-personalized outreach
**📋 Campaign Strategy Agent** - Orchestrates multi-channel campaigns
**📊 Analytics & Optimization Agent** - Tracks performance and improves results
**👑 Content Authority Agent** - Builds credibility and thought leadership
**🎯 Discovery & Onboarding Agent** - Learns your business deeply
**🔗 CRM Integration Agent** - Syncs with your existing tools
**⚙️ Prompt Engineer Agent** - Optimizes system performance

**How They Work Together:**
1. **Discovery**: I learn your business through structured conversation
2. **Strategy**: Agents collaborate to design personalized approaches
3. **Execution**: Each agent handles their specialty while sharing context
4. **Optimization**: System learns and improves from every interaction

**Why This Works Better:**
- **Specialist Expertise**: Each agent is world-class in their domain
- **Business Context**: Everything is personalized to your specific situation
- **Coordinated Workflow**: Agents hand off tasks and share insights
- **Continuous Learning**: System gets smarter about your business over time

**The Result:** Instead of generic "spray and pray" automation, you get thoughtful, strategic outreach that sounds like you personally researched and crafted each interaction.

What aspect of the framework would you like me to explain in more detail?`;
  }

  /**
   * Get simple framework comparison
   */
  getFrameworkComparison(): string {
    return `**Traditional Sales Challenges vs SAM's Agentic Solution**

**❌ The Pain Points You Face:**
- High-volume, low-quality prospecting wastes time and money
- Generic outreach gets ignored in crowded inboxes
- Inconsistent follow-up loses promising deals
- Scaling outreach hits platform limits and cost barriers
- Limited resources make consistent outreach impossible
- Slow processes delay crucial market feedback and iteration

**✅ SAM's Proven Solutions:**
- **35% Higher Engagement:** Intelligent qualification + hyper-personalization
- **50% Faster Outreach:** Automated workflows with human-level quality
- **10x ROI in 3 Months:** Eliminates manual work, maximizes results
- **Zero Platform Limits:** Multi-channel scaling without per-seat costs
- **Consistent Follow-Up:** Never let a prospect go cold again
- **Force Multiplier:** Small teams compete with enterprise sales operations

**Real Business Impact:**
- **Tech Startups:** Focus on product development while SAM builds pipeline
- **SMEs:** Punch above your weight with enterprise-level sales automation
- **B2B Teams:** Transform from reactive to proactive with continuous lead flow

**The Difference:** Traditional tools create more work. SAM eliminates work while delivering better results - proven by thousands of successful implementations.`;
  }
}

export default AgentFrameworkExplainer;