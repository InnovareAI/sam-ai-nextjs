/**
 * ICP Conversation Demo Component
 * Shows how SAM AI extracts ICP from conversation and triggers lead generation
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MessageCircle, 
  Brain, 
  Target, 
  Users, 
  Download,
  Play,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';

interface ConversationStep {
  type: 'user' | 'sam' | 'system';
  content: string;
  timestamp: string;
  metadata?: any;
}

export default function ICPConversationDemo() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [conversation, setConversation] = useState<ConversationStep[]>([]);
  const [extractedICP, setExtractedICP] = useState(null);
  const [leadResults, setLeadResults] = useState(null);

  const conversationFlow = [
    {
      type: 'user',
      content: "I need to find CEOs and VPs of Sales at SaaS companies in San Francisco with 50-200 employees that have raised Series A-C funding",
      delay: 1000
    },
    {
      type: 'system',
      content: "SAM AI analyzing conversation for ICP extraction...",
      delay: 2000
    },
    {
      type: 'sam',
      content: "Perfect! I understand you're looking for senior executives at growing SaaS companies. Let me extract your ideal customer profile and start the lead generation process.",
      delay: 1500
    },
    {
      type: 'system',
      content: "ICP Extracted: SaaS industry, CEO/VP Sales titles, San Francisco location, 50-200 employees, Series A-C stage",
      delay: 2000,
      metadata: {
        industry: 'SaaS',
        jobTitles: ['CEO', 'VP Sales'],
        location: 'San Francisco',
        companySize: '50-200 employees',
        companyStage: 'Series A-C',
        targetCount: 1000
      }
    },
    {
      type: 'sam',
      content: "🎯 I'll find 1,000 profiles matching your criteria. This will cost approximately $1.50 for complete LinkedIn profile data including recent posts and contact information. Starting lead generation now...",
      delay: 1500
    },
    {
      type: 'system',
      content: "N8N workflow triggered - Job ID: demo_12345",
      delay: 3000
    },
    {
      type: 'sam',
      content: "✅ Lead generation started! I'm now searching LinkedIn for profiles matching your criteria. I'll update you with progress...",
      delay: 2000
    },
    {
      type: 'system',
      content: "Progress: Found 892 LinkedIn URLs, scraping profiles...",
      delay: 4000
    },
    {
      type: 'sam',
      content: "📊 Great progress! Found 892 relevant LinkedIn profiles. Now extracting complete profile data including recent posts and contact information.",
      delay: 3000
    },
    {
      type: 'system',
      content: "Progress: 950/1000 profiles scraped, cost $1.43",
      delay: 3000
    },
    {
      type: 'sam',
      content: "🎉 Perfect! I've successfully generated 1,000 complete lead profiles for you:\n\n• Total Profiles: 1,000\n• Email Addresses: 450 found\n• Recent Posts: 850 profiles\n• Total Cost: $1.50\n\nReady for export!",
      delay: 2000,
      metadata: {
        totalProfiles: 1000,
        emailsFound: 450,
        postsCollected: 850,
        cost: 1.50
      }
    }
  ];

  const startDemo = async () => {
    setIsRunning(true);
    setCurrentStep(0);
    setConversation([]);
    setExtractedICP(null);
    setLeadResults(null);

    for (let i = 0; i < conversationFlow.length; i++) {
      const step = conversationFlow[i];
      
      await new Promise(resolve => setTimeout(resolve, step.delay));
      
      const newMessage: ConversationStep = {
        type: step.type as 'user' | 'sam' | 'system',
        content: step.content,
        timestamp: new Date().toLocaleTimeString(),
        metadata: step.metadata
      };

      setConversation(prev => [...prev, newMessage]);
      setCurrentStep(i + 1);

      // Extract ICP when system identifies it
      if (step.metadata && step.metadata.industry) {
        setExtractedICP(step.metadata);
      }

      // Set final results
      if (step.metadata && step.metadata.totalProfiles) {
        setLeadResults(step.metadata);
      }
    }

    setIsRunning(false);
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'user': return <MessageCircle className="h-4 w-4 text-blue-600" />;
      case 'sam': return <Brain className="h-4 w-4 text-purple-600" />;
      case 'system': return <Target className="h-4 w-4 text-green-600" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStepBg = (type: string) => {
    switch (type) {
      case 'user': return 'bg-blue-50 border-blue-200';
      case 'sam': return 'bg-purple-50 border-purple-200';
      case 'system': return 'bg-green-50 border-green-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-purple-600" />
            SAM AI Conversation → Lead Generation Demo
          </CardTitle>
          <CardDescription>
            See how SAM AI extracts ICP from natural conversation and delivers complete lead data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="grid grid-cols-4 gap-4 flex-1">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">Natural</div>
                <div className="text-sm text-gray-600">Conversation</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">AI</div>
                <div className="text-sm text-gray-600">ICP Extraction</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">N8N</div>
                <div className="text-sm text-gray-600">Automation</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600">1000</div>
                <div className="text-sm text-gray-600">Leads Ready</div>
              </div>
            </div>
            
            <Button 
              onClick={startDemo}
              disabled={isRunning}
              className="ml-6 bg-purple-600 hover:bg-purple-700"
            >
              {isRunning ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Running Demo
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Demo
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Conversation Flow */}
      {conversation.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Conversation Flow
            </CardTitle>
            <CardDescription>
              Real-time demonstration of SAM AI processing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {conversation.map((message, index) => (
                <div key={index} className={`p-3 rounded-lg border ${getStepBg(message.type)}`}>
                  <div className="flex items-start gap-3">
                    {getStepIcon(message.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm capitalize">
                          {message.type === 'sam' ? 'SAM AI' : message.type}
                        </span>
                        <span className="text-xs text-gray-500">{message.timestamp}</span>
                      </div>
                      <div className="text-sm whitespace-pre-line">{message.content}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Extracted ICP */}
      {extractedICP && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              Extracted ICP Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-600">Industry:</span>
                <div className="font-medium">{extractedICP.industry}</div>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Job Titles:</span>
                <div className="font-medium">{extractedICP.jobTitles.join(', ')}</div>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Location:</span>
                <div className="font-medium">{extractedICP.location}</div>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Company Size:</span>
                <div className="font-medium">{extractedICP.companySize}</div>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Stage:</span>
                <div className="font-medium">{extractedICP.companyStage}</div>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Target Count:</span>
                <div className="font-medium">{extractedICP.targetCount}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      {leadResults && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              Lead Generation Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{leadResults.totalProfiles}</div>
                <div className="text-sm text-gray-600">Total Profiles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{leadResults.emailsFound}</div>
                <div className="text-sm text-gray-600">Emails Found</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{leadResults.postsCollected}</div>
                <div className="text-sm text-gray-600">Recent Posts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">${leadResults.cost}</div>
                <div className="text-sm text-gray-600">Total Cost</div>
              </div>
            </div>
            
            <div className="flex justify-center">
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Download className="h-4 w-4 mr-2" />
                Export {leadResults.totalProfiles} Leads to CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Process Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Complete Process Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <MessageCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-medium text-blue-800">1. Conversation</h4>
              <p className="text-sm text-blue-700">Natural language input</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Brain className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-medium text-purple-800">2. AI Extraction</h4>
              <p className="text-sm text-purple-700">ICP automatically identified</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-medium text-green-800">3. N8N Workflow</h4>
              <p className="text-sm text-green-700">Automated search & scraping</p>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Users className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <h4 className="font-medium text-orange-800">4. Data Collection</h4>
              <p className="text-sm text-orange-700">Complete profile data</p>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Download className="h-8 w-8 text-gray-600 mx-auto mb-2" />
              <h4 className="font-medium text-gray-800">5. Delivery</h4>
              <p className="text-sm text-gray-700">CSV export ready</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}