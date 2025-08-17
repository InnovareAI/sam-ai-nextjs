import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, BookOpen, Users, TrendingUp, Upload, Play } from 'lucide-react';

export function TrainingRoom() {
  return (
    <div className="h-full bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500 to-teal-600">
              <Target className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Training Room</h1>
              <p className="text-gray-300 text-lg">Train SAM on your business and sales materials</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Upload Sales Materials */}
          <Card className="p-6 bg-gray-800 border-gray-700 hover:bg-gray-700/50 transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600">
                <Upload className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-2">Upload Knowledge Base</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Upload your sales decks, case studies, and product documentation to train SAM
                </p>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Upload Documents
                </Button>
              </div>
            </div>
          </Card>

          {/* Sales Playbooks */}
          <Card className="p-6 bg-gray-800 border-gray-700 hover:bg-gray-700/50 transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-2">Sales Playbooks</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Create and manage your sales playbooks and objection handling guides
                </p>
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  Manage Playbooks
                </Button>
              </div>
            </div>
          </Card>

          {/* ICP Training */}
          <Card className="p-6 bg-gray-800 border-gray-700 hover:bg-gray-700/50 transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-teal-600">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-2">ICP Training</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Define your ideal customer profile and train SAM on your target markets
                </p>
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Define ICP
                </Button>
              </div>
            </div>
          </Card>

          {/* Performance Training */}
          <Card className="p-6 bg-gray-800 border-gray-700 hover:bg-gray-700/50 transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-600">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-2">Performance Analytics</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Analyze successful campaigns to improve SAM's recommendations
                </p>
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  View Analytics
                </Button>
              </div>
            </div>
          </Card>

          {/* AI Agent Training */}
          <Card className="p-6 bg-gray-800 border-gray-700 hover:bg-gray-700/50 transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600">
                <Play className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-2">Agent Training</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Train individual AI agents on specific skills and knowledge areas
                </p>
                <Button className="w-full bg-cyan-600 hover:bg-cyan-700">
                  Train Agents
                </Button>
              </div>
            </div>
          </Card>

          {/* Quick Setup */}
          <Card className="p-6 bg-gray-800 border-gray-700 hover:bg-gray-700/50 transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-600">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-2">Quick Training</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Get started quickly with guided training sessions
                </p>
                <Button className="w-full bg-yellow-600 hover:bg-yellow-700">
                  Start Training
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Training Status */}
        <Card className="mt-8 p-6 bg-gray-800 border-gray-700">
          <h3 className="text-white font-semibold mb-4">Training Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Knowledge Base Completion</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-600 rounded-full">
                  <div className="w-3/4 h-full bg-blue-500 rounded-full"></div>
                </div>
                <span className="text-gray-400 text-sm">75%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">ICP Definition</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-600 rounded-full">
                  <div className="w-1/2 h-full bg-green-500 rounded-full"></div>
                </div>
                <span className="text-gray-400 text-sm">50%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Sales Playbooks</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-600 rounded-full">
                  <div className="w-1/4 h-full bg-orange-500 rounded-full"></div>
                </div>
                <span className="text-gray-400 text-sm">25%</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}