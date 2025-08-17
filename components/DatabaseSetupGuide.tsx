/**
 * Database Setup Guide Component
 * Provides step-by-step guidance for setting up the SAM AI database
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Database, 
  Copy, 
  CheckCircle, 
  ExternalLink, 
  AlertTriangle,
  FileText,
  Settings,
  Play,
  ArrowRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DatabaseSetupGuideProps {
  onSetupComplete?: () => void;
}

export default function DatabaseSetupGuide({ onSetupComplete }: DatabaseSetupGuideProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [copiedScript, setCopiedScript] = useState<string | null>(null);
  const { toast } = useToast();

  const simplifiedSchema = `-- =============================================
-- SAM AI SIMPLIFIED DATABASE SCHEMA
-- Execute this in Supabase SQL Editor
-- =============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create simplified contacts table (no workspace dependencies)
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    first_name TEXT,
    last_name TEXT,
    title TEXT,
    department TEXT,
    phone TEXT,
    linkedin_url TEXT,
    engagement_score INTEGER DEFAULT 0 CHECK (engagement_score >= 0 AND engagement_score <= 100),
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    scraped_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create simplified campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'email' CHECK (type IN ('email', 'linkedin', 'cold_call', 'sms', 'multi_channel')),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'active', 'paused', 'completed', 'archived')),
    objective TEXT,
    target_audience JSONB DEFAULT '{}',
    campaign_steps JSONB DEFAULT '[]',
    total_steps INTEGER DEFAULT 1,
    channel TEXT DEFAULT 'email',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create simplified messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'delivered', 'read', 'replied', 'failed')),
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    replied_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sample data
INSERT INTO contacts (email, first_name, last_name, title, department, engagement_score, tags, metadata, scraped_data)
VALUES 
  ('john.smith@techcorp.com', 'John', 'Smith', 'VP of Sales', 'Sales', 85, ARRAY['apollo-import', 'hot-lead'], '{"company": "TechCorp", "location": "San Francisco, CA"}', '{"source": "apollo", "organization": {"name": "TechCorp", "industry": "Technology", "num_employees": 500}, "location": {"city": "San Francisco", "country": "United States"}}'),
  ('sarah.johnson@innovate.io', 'Sarah', 'Johnson', 'Director of Marketing', 'Marketing', 72, ARRAY['linkedin', 'qualified'], '{"company": "Innovate.io", "location": "New York, NY"}', '{"source": "linkedin", "organization": {"name": "Innovate.io", "industry": "Software", "num_employees": 150}, "location": {"city": "New York", "country": "United States"}}'),
  ('michael.chen@enterprise.com', 'Michael', 'Chen', 'CTO', 'Technology', 90, ARRAY['apollo-import', 'interested'], '{"company": "Enterprise Solutions", "location": "Austin, TX"}', '{"source": "apollo", "organization": {"name": "Enterprise Solutions", "industry": "Technology", "num_employees": 1200}, "location": {"city": "Austin", "country": "United States"}}'),
  ('emily.davis@startup.co', 'Emily', 'Davis', 'Product Manager', 'Product', 65, ARRAY['linkedin', 'prospect'], '{"company": "StartupCo", "location": "Seattle, WA"}', '{"source": "linkedin", "organization": {"name": "StartupCo", "industry": "Technology", "num_employees": 25}, "location": {"city": "Seattle", "country": "United States"}}'),
  ('robert.wilson@finance.com', 'Robert', 'Wilson', 'CFO', 'Finance', 78, ARRAY['apollo-import', 'qualified'], '{"company": "Finance Corp", "location": "Chicago, IL"}', '{"source": "apollo", "organization": {"name": "Finance Corp", "industry": "Financial Services", "num_employees": 750}, "location": {"city": "Chicago", "country": "United States"}}')
ON CONFLICT (email) DO NOTHING;

INSERT INTO campaigns (name, type, status, objective, target_audience, campaign_steps, total_steps, channel)
VALUES 
  ('Tech Leaders Outreach', 'linkedin', 'active', 'Connect with technology decision makers', '{"titles": ["CTO", "VP"], "industries": ["Technology"]}', '[{"step": 1, "message": "Hi {first_name}!"}]', 3, 'linkedin'),
  ('Sales Director Campaign', 'email', 'active', 'Target sales executives', '{"titles": ["VP of Sales"], "industries": ["Technology"]}', '[{"step": 1, "message": "Subject: Sales improvement for {company}"}]', 2, 'email')
ON CONFLICT DO NOTHING;

-- Add sample messages (using the created campaign and contact IDs)
INSERT INTO messages (campaign_id, contact_id, content, direction, status, sent_at, metadata)
SELECT 
  c.id as campaign_id,
  con.id as contact_id,
  'Hi ' || con.first_name || ', I noticed your work at ' || (con.metadata->>'company') || '...' as content,
  'outbound' as direction,
  'sent' as status,
  NOW() - INTERVAL '1 day' as sent_at,
  '{"type": "initial_outreach"}' as metadata
FROM campaigns c
CROSS JOIN contacts con
WHERE c.name = 'Tech Leaders Outreach' 
AND con.email = 'john.smith@techcorp.com'
LIMIT 1;

-- Verification query
SELECT 
  'contacts' as table_name, COUNT(*) as record_count 
FROM contacts
UNION ALL
SELECT 
  'campaigns' as table_name, COUNT(*) as record_count 
FROM campaigns
UNION ALL
SELECT 
  'messages' as table_name, COUNT(*) as record_count 
FROM messages;`;

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedScript(label);
      setTimeout(() => setCopiedScript(null), 2000);
      toast({
        title: "Copied to clipboard",
        description: `${label} copied successfully`,
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please manually copy the script",
        variant: "destructive"
      });
    }
  };

  const steps = [
    {
      id: 1,
      title: "Access Supabase SQL Editor",
      description: "Open your Supabase project dashboard and navigate to the SQL Editor",
      action: "Go to Supabase",
      icon: <ExternalLink className="w-4 h-4" />
    },
    {
      id: 2,
      title: "Execute Database Schema",
      description: "Copy and run the simplified database schema in the SQL Editor",
      action: "Copy Schema",
      icon: <Copy className="w-4 h-4" />
    },
    {
      id: 3,
      title: "Verify Setup",
      description: "Confirm that tables and sample data were created successfully",
      action: "Test Connection",
      icon: <CheckCircle className="w-4 h-4" />
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-lg" />
            <div className="relative bg-gradient-to-br from-blue-400 to-blue-600 p-3 rounded-full">
              <Database className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Database Setup Guide
          </h1>
        </div>
        <p className="text-gray-400 text-lg">
          Set up your SAM AI database to start using Deal Room and Data Room features
        </p>
        <div className="flex items-center justify-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-400" />
          <span className="text-yellow-300 text-sm">Database setup required to access real data</span>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4 py-6">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className={`flex items-center gap-3 ${currentStep >= step.id ? 'text-blue-400' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= step.id 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-700 text-gray-400'
              }`}>
                {currentStep > step.id ? <CheckCircle className="w-4 h-4" /> : step.id}
              </div>
              <span className="text-sm font-medium hidden sm:block">{step.title}</span>
            </div>
            {index < steps.length - 1 && (
              <ArrowRight className="w-4 h-4 text-gray-600" />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="guide" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="guide">Setup Guide</TabsTrigger>
          <TabsTrigger value="schema">Database Schema</TabsTrigger>
        </TabsList>

        <TabsContent value="guide" className="space-y-6">
          {/* Step 1: Access Supabase */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">1</div>
                Access Supabase SQL Editor
              </CardTitle>
              <CardDescription>
                Navigate to your Supabase project dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-2 text-gray-300 text-sm">
                <li>Go to <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">supabase.com/dashboard</a></li>
                <li>Select your SAM AI project</li>
                <li>Click on "SQL Editor" in the left sidebar</li>
                <li>Click "New Query" to create a new SQL script</li>
              </ol>
              <div className="flex gap-3">
                <Button 
                  onClick={() => setCurrentStep(2)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Supabase Dashboard
                </Button>
                <Button 
                  onClick={() => setCurrentStep(2)}
                  variant="outline"
                  className="border-gray-600 text-gray-300"
                >
                  I'm in the SQL Editor
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Step 2: Execute Schema */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <div className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold">2</div>
                Execute Database Schema
              </CardTitle>
              <CardDescription>
                Copy and run the simplified database schema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">simplified-schema.sql</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(simplifiedSchema, 'Database Schema')}
                    className="text-gray-400 hover:text-white"
                  >
                    {copiedScript === 'Database Schema' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedScript === 'Database Schema' ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <pre className="text-xs text-gray-300 overflow-x-auto max-h-64">
                  {simplifiedSchema.substring(0, 500)}...
                </pre>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-400">Steps to execute:</p>
                <ol className="list-decimal list-inside space-y-1 text-gray-300 text-sm">
                  <li>Copy the complete schema from the "Database Schema" tab</li>
                  <li>Paste it into the Supabase SQL Editor</li>
                  <li>Click "Run" to execute the script</li>
                  <li>Wait for confirmation that tables were created</li>
                </ol>
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={() => copyToClipboard(simplifiedSchema, 'Database Schema')}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Complete Schema
                </Button>
                <Button 
                  onClick={() => setCurrentStep(3)}
                  variant="outline"
                  className="border-gray-600 text-gray-300"
                >
                  I've run the schema
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Step 3: Verify Setup */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white">
                <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">3</div>
                Verify Setup
              </CardTitle>
              <CardDescription>
                Test your database connection and sample data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium text-white">Contacts</span>
                  </div>
                  <Badge variant="secondary" className="bg-blue-900/40 text-blue-300">
                    5 sample records
                  </Badge>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-center gap-2 mb-2">
                    <Settings className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium text-white">Campaigns</span>
                  </div>
                  <Badge variant="secondary" className="bg-purple-900/40 text-purple-300">
                    2 sample campaigns
                  </Badge>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium text-white">Messages</span>
                  </div>
                  <Badge variant="secondary" className="bg-green-900/40 text-green-300">
                    Sample messages
                  </Badge>
                </div>
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={onSetupComplete}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Test Deal Room & Data Room
                </Button>
                <Button 
                  variant="outline"
                  className="border-gray-600 text-gray-300"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Setup Complete
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schema">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Complete Database Schema</CardTitle>
              <CardDescription>
                Copy this complete SQL script and run it in your Supabase SQL Editor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-400">simplified-sam-ai-schema.sql</span>
                  <Button
                    onClick={() => copyToClipboard(simplifiedSchema, 'Complete Schema')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {copiedScript === 'Complete Schema' ? <CheckCircle className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copiedScript === 'Complete Schema' ? 'Copied!' : 'Copy Schema'}
                  </Button>
                </div>
                <pre className="text-xs text-gray-300 overflow-x-auto max-h-96 whitespace-pre-wrap">
                  {simplifiedSchema}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}