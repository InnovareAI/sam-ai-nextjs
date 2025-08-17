import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, DollarSign, Calendar, TrendingUp, Target, MessageSquare, Phone } from 'lucide-react';

export function DealRoom() {
  const deals = [
    {
      id: 1,
      company: "TechCorp Solutions",
      contact: "Sarah Johnson",
      value: "$45,000",
      stage: "Proposal",
      probability: 75,
      nextAction: "Follow up on proposal",
      dueDate: "2025-01-20"
    },
    {
      id: 2,
      company: "Innovation Labs",
      contact: "Michael Chen",
      value: "$28,000",
      stage: "Demo Scheduled",
      probability: 60,
      nextAction: "Product demo call",
      dueDate: "2025-01-18"
    },
    {
      id: 3,
      company: "Growth Partners",
      contact: "Emma Wilson",
      value: "$67,000",
      stage: "Negotiation",
      probability: 85,
      nextAction: "Contract review",
      dueDate: "2025-01-22"
    }
  ];

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Proposal': return 'bg-blue-500';
      case 'Demo Scheduled': return 'bg-yellow-500';
      case 'Negotiation': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="h-full bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600">
              <Users className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Deal Room</h1>
              <p className="text-gray-300 text-lg">Manage your sales pipeline and opportunities</p>
            </div>
          </div>
        </div>

        {/* Deal Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 bg-gray-800 border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-600">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">$140K</p>
                <p className="text-gray-400 text-sm">Total Pipeline</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-gray-800 border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-600">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">73%</p>
                <p className="text-gray-400 text-sm">Avg. Probability</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gray-800 border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-600">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">3</p>
                <p className="text-gray-400 text-sm">Active Deals</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gray-800 border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-600">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">2</p>
                <p className="text-gray-400 text-sm">Due This Week</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Active Deals */}
        <Card className="p-6 bg-gray-800 border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Active Deals</h3>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Add New Deal
            </Button>
          </div>

          <div className="space-y-4">
            {deals.map((deal) => (
              <Card key={deal.id} className="p-4 bg-gray-700 border-gray-600 hover:bg-gray-600/50 transition-all duration-300">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                  <div className="md:col-span-2">
                    <h4 className="text-white font-semibold">{deal.company}</h4>
                    <p className="text-gray-300 text-sm">{deal.contact}</p>
                  </div>
                  
                  <div>
                    <p className="text-white font-semibold">{deal.value}</p>
                    <p className="text-gray-400 text-sm">Deal Value</p>
                  </div>
                  
                  <div>
                    <Badge className={`${getStageColor(deal.stage)} text-white`}>
                      {deal.stage}
                    </Badge>
                    <p className="text-gray-400 text-sm mt-1">{deal.probability}% probability</p>
                  </div>
                  
                  <div>
                    <p className="text-white text-sm">{deal.nextAction}</p>
                    <p className="text-gray-400 text-xs">Due: {deal.dueDate}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:text-white">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:text-white">
                      <Phone className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        {/* SAM Deal Insights */}
        <Card className="mt-8 p-6 bg-gray-800 border-gray-700">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-400" />
            SAM's Deal Insights
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
              <p className="text-blue-300 text-sm">
                <strong>Growth Partners</strong> deal is progressing well. Consider scheduling contract finalization call before Friday.
              </p>
            </div>
            <div className="p-3 bg-yellow-900/20 border border-yellow-700/30 rounded-lg">
              <p className="text-yellow-300 text-sm">
                <strong>TechCorp Solutions</strong> hasn't responded to proposal. Recommend follow-up with value-focused messaging.
              </p>
            </div>
            <div className="p-3 bg-green-900/20 border border-green-700/30 rounded-lg">
              <p className="text-green-300 text-sm">
                <strong>Innovation Labs</strong> demo is tomorrow. Prepare custom ROI calculation based on their company size.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}