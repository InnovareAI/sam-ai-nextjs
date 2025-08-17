import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Bot, Users, Target, TrendingUp, MessageSquare, Zap, ChevronRight, Play } from 'lucide-react';

interface LandingPageProps {
  onLogin: () => void;
  onSignup: () => void;
}

export function LandingPage({ onLogin, onSignup }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">SAM</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <a href="#" className="text-gray-300 hover:text-white transition-colors">Home</a>
          <a href="#" className="text-gray-300 hover:text-white transition-colors">Features</a>
          <a href="#" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
          <a href="#" className="text-gray-300 hover:text-white transition-colors">Customers</a>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={onLogin}
            className="text-gray-300 hover:text-white hover:bg-gray-800"
          >
            Login ↗
          </Button>
          <Button 
            onClick={onSignup}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Get started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                Learn & work
                <br />
                <span className="text-blue-400">together</span>
              </h1>
              <p className="text-xl text-gray-300 mt-6 leading-relaxed">
                SAM is built for sales automation and can learn to fit into your unique workflow.
              </p>
            </div>

            <Button 
              onClick={onSignup}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
            >
              Start with SAM
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Right Content - Interactive Demo */}
          <div className="relative">
            <Card className="bg-gray-800/50 border-gray-700 p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm">Hello! I'm SAM, your AI sales assistant.</p>
                    <p className="text-gray-400 text-xs mt-1">How can I help you today?</p>
                  </div>
                </div>
                
                <div className="bg-blue-600 text-white p-3 rounded-lg ml-11 text-sm">
                  I need help setting up automated outreach for my SaaS product
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center animate-pulse">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm">
                      Perfect! I can help you create a complete outreach strategy. Let me analyze your target market and create personalized campaigns...
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Floating indicators */}
            <div className="absolute -top-4 -right-4">
              <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                AI Active
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left - Feature Content */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <Target className="h-6 w-6 text-blue-400" />
              <h2 className="text-3xl font-bold text-white">
                SAM learns your sales process &<br />
                picks up proven strategies
              </h2>
            </div>

            <Card className="bg-gray-800/30 border-gray-700 p-6 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-2">Add knowledge</h3>
                  <p className="text-gray-400 text-sm">
                    Would you like SAM to remember this successful outreach pattern?
                  </p>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="text-green-400 text-sm">✓ The response rate increased by 40%</div>
                <div className="text-green-400 text-sm">✓ Best performing subject line identified</div>
                <div className="text-green-400 text-sm">✓ Optimal follow-up timing discovered</div>
                <div className="text-green-400 text-sm">✓ Target persona preferences mapped</div>
              </div>
            </Card>
          </div>

          {/* Right - Code/Demo Section */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Automate on the go</h3>
              <p className="text-gray-400">
                Set up campaigns using natural language instructions with SAM on any device.
              </p>
            </div>

            {/* Mobile mockup */}
            <Card className="bg-gray-800 border-gray-700 p-6 max-w-sm">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">9:41</span>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-2 bg-white rounded-sm"></div>
                    <div className="flex gap-1">
                      <div className="w-1 h-3 bg-white rounded"></div>
                      <div className="w-1 h-3 bg-white rounded"></div>
                      <div className="w-1 h-2 bg-gray-500 rounded"></div>
                    </div>
                    <div className="w-6 h-3 border border-white rounded-sm">
                      <div className="w-4 h-1 bg-green-500 rounded mt-0.5 ml-0.5"></div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-blue-600 text-white p-2 rounded text-xs">
                    Hey there! I'm SAM and I'm a software engineer.
                  </div>
                  <div className="text-gray-400 text-xs">
                    Enter a coding task below to get started
                  </div>
                  <div className="bg-gray-700 text-gray-300 p-2 rounded text-xs">
                    Set up email outreach for...
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Bottom CTA Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center space-y-6">
          <h3 className="text-2xl font-bold text-white">Collaborate</h3>
          <h2 className="text-4xl font-bold text-white">
            Use SAM's agents, tools<br />
            and automation
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Take over and run campaigns, edit strategies, or use the dashboard for SAM at any time.
          </p>

          <Card className="bg-gray-800/50 border-gray-700 p-8 max-w-2xl mx-auto backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-semibold">SAM's Workspace</h4>
                <div className="flex items-center gap-1 mt-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-400 text-sm">Active</span>
                </div>
              </div>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Play className="h-4 w-4 mr-2" />
                Launch
              </Button>
            </div>
            
            <div className="grid grid-cols-4 gap-4 mt-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <span className="text-gray-300 text-sm">AI Agents</span>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <span className="text-gray-300 text-sm">Training</span>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <span className="text-gray-300 text-sm">Prospects</span>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <span className="text-gray-300 text-sm">Analytics</span>
              </div>
            </div>
          </Card>

          <Button 
            onClick={onSignup}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg mt-8"
          >
            Get started with SAM
          </Button>
        </div>
      </div>
    </div>
  );
}