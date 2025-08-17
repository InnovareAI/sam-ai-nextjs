import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Database, Upload, Download, Search, Filter, TrendingUp, Users, Mail } from 'lucide-react';

export function DataRoom() {
  const prospects = [
    {
      id: 1,
      name: "Alex Thompson",
      company: "TechCorp Inc",
      title: "VP of Sales",
      email: "alex@techcorp.com",
      phone: "+1-555-0123",
      status: "Qualified",
      score: 85,
      lastContact: "2025-01-15"
    },
    {
      id: 2,
      name: "Maria Garcia",
      company: "Innovation Labs",
      title: "Chief Marketing Officer",
      email: "maria@innovatelabs.com",
      phone: "+1-555-0456",
      status: "Contacted",
      score: 72,
      lastContact: "2025-01-14"
    },
    {
      id: 3,
      name: "David Park",
      company: "Growth Solutions",
      title: "Head of Revenue",
      email: "david@growthsol.com",
      phone: "+1-555-0789",
      status: "New",
      score: 90,
      lastContact: "Never"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Qualified': return 'bg-green-500';
      case 'Contacted': return 'bg-blue-500';
      case 'New': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="h-full bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600">
              <Database className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Data Room</h1>
              <p className="text-gray-300 text-lg">Manage your prospect data and enrichment</p>
            </div>
          </div>
        </div>

        {/* Data Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 bg-gray-800 border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-600">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">2,847</p>
                <p className="text-gray-400 text-sm">Total Prospects</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 bg-gray-800 border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-600">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">76</p>
                <p className="text-gray-400 text-sm">Avg. Score</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gray-800 border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-600">
                <Mail className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">89%</p>
                <p className="text-gray-400 text-sm">Email Verified</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gray-800 border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-600">
                <Search className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">156</p>
                <p className="text-gray-400 text-sm">New This Week</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Data Management Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-4 bg-gray-800 border-gray-700 hover:bg-gray-700/50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <Upload className="h-5 w-5 text-blue-400" />
              <h3 className="text-white font-semibold">Import Data</h3>
            </div>
            <p className="text-gray-300 text-sm mb-4">Upload CSV files or connect to data sources</p>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Import Prospects
            </Button>
          </Card>

          <Card className="p-4 bg-gray-800 border-gray-700 hover:bg-gray-700/50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <Search className="h-5 w-5 text-green-400" />
              <h3 className="text-white font-semibold">Find Prospects</h3>
            </div>
            <p className="text-gray-300 text-sm mb-4">Search for new prospects using AI-powered discovery</p>
            <Button className="w-full bg-green-600 hover:bg-green-700">
              Start Search
            </Button>
          </Card>

          <Card className="p-4 bg-gray-800 border-gray-700 hover:bg-gray-700/50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="h-5 w-5 text-purple-400" />
              <h3 className="text-white font-semibold">Enrich Data</h3>
            </div>
            <p className="text-gray-300 text-sm mb-4">Enhance existing prospects with additional data</p>
            <Button className="w-full bg-purple-600 hover:bg-purple-700">
              Enrich All
            </Button>
          </Card>
        </div>

        {/* Prospect Table */}
        <Card className="p-6 bg-gray-800 border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Recent Prospects</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {prospects.map((prospect) => (
              <Card key={prospect.id} className="p-4 bg-gray-700 border-gray-600 hover:bg-gray-600/50 transition-all duration-300">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                  <div className="md:col-span-2">
                    <h4 className="text-white font-semibold">{prospect.name}</h4>
                    <p className="text-gray-300 text-sm">{prospect.title}</p>
                    <p className="text-gray-400 text-xs">{prospect.company}</p>
                  </div>
                  
                  <div>
                    <p className="text-white text-sm">{prospect.email}</p>
                    <p className="text-gray-400 text-xs">{prospect.phone}</p>
                  </div>
                  
                  <div>
                    <Badge className={`${getStatusColor(prospect.status)} text-white`}>
                      {prospect.status}
                    </Badge>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-2 bg-gray-600 rounded-full">
                        <div 
                          className="h-full bg-blue-500 rounded-full" 
                          style={{ width: `${prospect.score}%` }}
                        ></div>
                      </div>
                      <span className="text-white text-sm">{prospect.score}</span>
                    </div>
                    <p className="text-gray-400 text-xs">Lead Score</p>
                  </div>
                  
                  <div>
                    <p className="text-white text-sm">{prospect.lastContact}</p>
                    <p className="text-gray-400 text-xs">Last Contact</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        {/* Data Insights */}
        <Card className="mt-8 p-6 bg-gray-800 border-gray-700">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Database className="h-5 w-5 text-purple-400" />
            Data Quality Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-900/20 border border-green-700/30 rounded-lg">
              <p className="text-green-300 font-semibold">Email Verification</p>
              <p className="text-green-400 text-sm">89% of emails verified and deliverable</p>
            </div>
            <div className="p-4 bg-yellow-900/20 border border-yellow-700/30 rounded-lg">
              <p className="text-yellow-300 font-semibold">Data Completeness</p>
              <p className="text-yellow-400 text-sm">67% profiles have complete information</p>
            </div>
            <div className="p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
              <p className="text-blue-300 font-semibold">Lead Quality</p>
              <p className="text-blue-400 text-sm">76 average lead score across all prospects</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}