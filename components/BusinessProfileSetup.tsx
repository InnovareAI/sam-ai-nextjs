/**
 * Business Profile Setup Component
 * Comprehensive onboarding flow for business context and ICP definition
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Building2,
  Target,
  Users,
  MessageSquare,
  CheckCircle,
  Plus,
  X,
  ArrowRight,
  ArrowLeft,
  Lightbulb
} from 'lucide-react';
import { 
  BusinessProfile, 
  ICP, 
  KnowledgeBase, 
  OnboardingStage,
  businessProfileService
} from '@/services/BusinessProfileService';
import { authService } from '@/services/authService';

interface BusinessProfileSetupProps {
  onComplete?: () => void;
  existingProfile?: BusinessProfile | null;
}

export default function BusinessProfileSetup({ onComplete, existingProfile }: BusinessProfileSetupProps) {
  const [currentStage, setCurrentStage] = useState<OnboardingStage>('introduction');
  const [profile, setProfile] = useState<Partial<BusinessProfile>>({
    company_name: '',
    company_description: '',
    website_url: '',
    industry: '',
    company_size: '',
    target_audience: '',
    value_propositions: [],
    competitors: [],
    sales_challenges: [],
    current_sales_process: '',
    ideal_customer_profile: {
      primary_criteria: {
        industry: [],
        company_size: '',
        revenue_range: '',
        roles: []
      },
      secondary_criteria: {
        tech_stack: [],
        growth_stage: '',
        locations: []
      },
      disqualifiers: [],
      ideal_use_cases: []
    },
    knowledge_base: {
      documents_analyzed: [],
      key_insights: [],
      messaging_frameworks: [],
      success_stories: [],
      user_preferences: {
        communication_style: 'professional',
        preferred_industries: [],
        meeting_preferences: 'flexible'
      }
    }
  });
  const [loading, setSaving] = useState(false);
  const [newItem, setNewItem] = useState('');

  // Load existing profile if available
  useEffect(() => {
    if (existingProfile) {
      setProfile(existingProfile);
      setCurrentStage(existingProfile.onboarding_stage);
    }
  }, [existingProfile]);

  const stages: OnboardingStage[] = ['introduction', 'discovery', 'icp_definition', 'knowledge_building', 'completed'];
  const currentStageIndex = stages.indexOf(currentStage);
  const progressPercentage = ((currentStageIndex + 1) / stages.length) * 100;

  const saveProfile = async () => {
    setSaving(true);
    try {
      const user = authService.getCurrentUser();
      if (!user) throw new Error('User not authenticated');

      if (existingProfile) {
        await businessProfileService.updateBusinessProfile(user.id, profile);
      } else {
        await businessProfileService.createBusinessProfile(user.id, profile);
      }

      await businessProfileService.updateOnboardingStage(user.id, currentStage);
      
      console.log('Profile saved successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const nextStage = async () => {
    const nextStageIndex = currentStageIndex + 1;
    if (nextStageIndex < stages.length) {
      const nextStage = stages[nextStageIndex];
      setCurrentStage(nextStage);
      await saveProfile();
      
      if (nextStage === 'completed' && onComplete) {
        onComplete();
      }
    }
  };

  const prevStage = () => {
    const prevStageIndex = currentStageIndex - 1;
    if (prevStageIndex >= 0) {
      setCurrentStage(stages[prevStageIndex]);
    }
  };

  const addToArray = (field: string, value: string) => {
    if (!value.trim()) return;
    
    setProfile(prev => ({
      ...prev,
      [field]: [...(prev[field as keyof BusinessProfile] as string[] || []), value.trim()]
    }));
    setNewItem('');
  };

  const removeFromArray = (field: string, index: number) => {
    setProfile(prev => ({
      ...prev,
      [field]: (prev[field as keyof BusinessProfile] as string[]).filter((_, i) => i !== index)
    }));
  };

  const updateICP = (section: keyof ICP, field: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      ideal_customer_profile: {
        ...prev.ideal_customer_profile!,
        [section]: {
          ...prev.ideal_customer_profile![section],
          [field]: value
        }
      }
    }));
  };

  const addToICPArray = (section: keyof ICP, field: string, value: string) => {
    if (!value.trim()) return;
    
    const currentArray = (profile.ideal_customer_profile![section] as any)[field] || [];
    updateICP(section, field, [...currentArray, value.trim()]);
    setNewItem('');
  };

  const removeFromICPArray = (section: keyof ICP, field: string, index: number) => {
    const currentArray = (profile.ideal_customer_profile![section] as any)[field] || [];
    updateICP(section, field, currentArray.filter((_: any, i: number) => i !== index));
  };

  const renderIntroduction = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Building2 className="h-16 w-16 mx-auto text-purple-400 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Welcome to SAM AI Business Setup</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Let's get SAM AI familiar with your business so it can provide personalized sales assistance. 
          This setup will take about 10 minutes and will significantly improve your experience.
        </p>
      </div>
      
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Basic Company Information</CardTitle>
          <CardDescription className="text-gray-400">
            Start with the basics about your company
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="company_name" className="text-gray-300">Company Name *</Label>
            <Input
              id="company_name"
              value={profile.company_name}
              onChange={(e) => setProfile(prev => ({ ...prev, company_name: e.target.value }))}
              placeholder="Enter your company name"
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          
          <div>
            <Label htmlFor="company_description" className="text-gray-300">Company Description</Label>
            <Textarea
              id="company_description"
              value={profile.company_description}
              onChange={(e) => setProfile(prev => ({ ...prev, company_description: e.target.value }))}
              placeholder="Brief description of what your company does"
              className="bg-gray-700 border-gray-600 text-white"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="website_url" className="text-gray-300">Website URL</Label>
              <Input
                id="website_url"
                value={profile.website_url}
                onChange={(e) => setProfile(prev => ({ ...prev, website_url: e.target.value }))}
                placeholder="https://yourcompany.com"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            
            <div>
              <Label htmlFor="industry" className="text-gray-300">Industry *</Label>
              <Select value={profile.industry} onValueChange={(value) => setProfile(prev => ({ ...prev, industry: value }))}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="saas">SaaS</SelectItem>
                  <SelectItem value="fintech">FinTech</SelectItem>
                  <SelectItem value="ecommerce">E-commerce</SelectItem>
                  <SelectItem value="healthcare">Healthcare</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="consulting">Consulting</SelectItem>
                  <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="company_size" className="text-gray-300">Company Size</Label>
            <Select value={profile.company_size} onValueChange={(value) => setProfile(prev => ({ ...prev, company_size: value }))}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Select company size" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="1-10">1-10 employees</SelectItem>
                <SelectItem value="11-50">11-50 employees</SelectItem>
                <SelectItem value="51-200">51-200 employees</SelectItem>
                <SelectItem value="201-1000">201-1000 employees</SelectItem>
                <SelectItem value="1000+">1000+ employees</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDiscovery = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Target className="h-16 w-16 mx-auto text-blue-400 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Sales Discovery</h2>
        <p className="text-gray-400">Tell us about your sales process and challenges</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Target Audience & Sales Process</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="target_audience" className="text-gray-300">Primary Target Audience</Label>
              <Input
                id="target_audience"
                value={profile.target_audience}
                onChange={(e) => setProfile(prev => ({ ...prev, target_audience: e.target.value }))}
                placeholder="e.g., CTOs, Marketing Directors, Small Business Owners"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            
            <div>
              <Label htmlFor="current_sales_process" className="text-gray-300">Current Sales Process</Label>
              <Textarea
                id="current_sales_process"
                value={profile.current_sales_process}
                onChange={(e) => setProfile(prev => ({ ...prev, current_sales_process: e.target.value }))}
                placeholder="Describe your current sales process, tools, and methodology"
                className="bg-gray-700 border-gray-600 text-white"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Value Propositions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  placeholder="Add a value proposition"
                  className="bg-gray-700 border-gray-600 text-white"
                  onKeyPress={(e) => e.key === 'Enter' && addToArray('value_propositions', newItem)}
                />
                <Button
                  onClick={() => addToArray('value_propositions', newItem)}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {profile.value_propositions?.map((prop, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {prop}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeFromArray('value_propositions', index)}
                    />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Sales Challenges</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  placeholder="Add a sales challenge"
                  className="bg-gray-700 border-gray-600 text-white"
                  onKeyPress={(e) => e.key === 'Enter' && addToArray('sales_challenges', newItem)}
                />
                <Button
                  onClick={() => addToArray('sales_challenges', newItem)}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {profile.sales_challenges?.map((challenge, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    {challenge}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeFromArray('sales_challenges', index)}
                    />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderICPDefinition = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Users className="h-16 w-16 mx-auto text-green-400 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Ideal Customer Profile</h2>
        <p className="text-gray-400">Define your ideal customers to improve targeting</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Primary Criteria</CardTitle>
            <CardDescription className="text-gray-400">Essential characteristics of your ideal customers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-gray-300">Target Industries</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  placeholder="e.g., SaaS, FinTech"
                  className="bg-gray-700 border-gray-600 text-white"
                  onKeyPress={(e) => e.key === 'Enter' && addToICPArray('primary_criteria', 'industry', newItem)}
                />
                <Button
                  onClick={() => addToICPArray('primary_criteria', 'industry', newItem)}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.ideal_customer_profile?.primary_criteria.industry.map((industry, index) => (
                  <Badge key={index} variant="default" className="flex items-center gap-1">
                    {industry}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeFromICPArray('primary_criteria', 'industry', index)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-gray-300">Company Size</Label>
              <Select 
                value={profile.ideal_customer_profile?.primary_criteria.company_size} 
                onValueChange={(value) => updateICP('primary_criteria', 'company_size', value)}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select ideal company size" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="1-50">1-50 employees</SelectItem>
                  <SelectItem value="51-200">51-200 employees</SelectItem>
                  <SelectItem value="201-1000">201-1000 employees</SelectItem>
                  <SelectItem value="1000+">1000+ employees</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-gray-300">Revenue Range</Label>
              <Select 
                value={profile.ideal_customer_profile?.primary_criteria.revenue_range} 
                onValueChange={(value) => updateICP('primary_criteria', 'revenue_range', value)}
              >
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select revenue range" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="<$1M">Less than $1M</SelectItem>
                  <SelectItem value="$1M-$10M">$1M - $10M</SelectItem>
                  <SelectItem value="$10M-$50M">$10M - $50M</SelectItem>
                  <SelectItem value="$50M+">$50M+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-gray-300">Target Roles</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  placeholder="e.g., CTO, VP Sales"
                  className="bg-gray-700 border-gray-600 text-white"
                  onKeyPress={(e) => e.key === 'Enter' && addToICPArray('primary_criteria', 'roles', newItem)}
                />
                <Button
                  onClick={() => addToICPArray('primary_criteria', 'roles', newItem)}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.ideal_customer_profile?.primary_criteria.roles.map((role, index) => (
                  <Badge key={index} variant="default" className="flex items-center gap-1">
                    {role}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeFromICPArray('primary_criteria', 'roles', index)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Secondary Criteria</CardTitle>
              <CardDescription className="text-gray-400">Nice-to-have characteristics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-gray-300">Tech Stack</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder="e.g., AWS, React, Salesforce"
                    className="bg-gray-700 border-gray-600 text-white"
                    onKeyPress={(e) => e.key === 'Enter' && addToICPArray('secondary_criteria', 'tech_stack', newItem)}
                  />
                  <Button
                    onClick={() => addToICPArray('secondary_criteria', 'tech_stack', newItem)}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.ideal_customer_profile?.secondary_criteria.tech_stack.map((tech, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tech}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeFromICPArray('secondary_criteria', 'tech_stack', index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-gray-300">Growth Stage</Label>
                <Select 
                  value={profile.ideal_customer_profile?.secondary_criteria.growth_stage} 
                  onValueChange={(value) => updateICP('secondary_criteria', 'growth_stage', value)}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Select growth stage" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="startup">Startup</SelectItem>
                    <SelectItem value="series-a">Series A</SelectItem>
                    <SelectItem value="series-b">Series B</SelectItem>
                    <SelectItem value="series-c+">Series C+</SelectItem>
                    <SelectItem value="established">Established</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-gray-300">Locations</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder="e.g., North America, Europe"
                    className="bg-gray-700 border-gray-600 text-white"
                    onKeyPress={(e) => e.key === 'Enter' && addToICPArray('secondary_criteria', 'locations', newItem)}
                  />
                  <Button
                    onClick={() => addToICPArray('secondary_criteria', 'locations', newItem)}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.ideal_customer_profile?.secondary_criteria.locations.map((location, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {location}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeFromICPArray('secondary_criteria', 'locations', index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Disqualifiers</CardTitle>
              <CardDescription className="text-gray-400">Companies to avoid</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  placeholder="e.g., Government, Non-profit"
                  className="bg-gray-700 border-gray-600 text-white"
                  onKeyPress={(e) => e.key === 'Enter' && addToICPArray('disqualifiers', '', newItem)}
                />
                <Button
                  onClick={() => addToICPArray('disqualifiers', '', newItem)}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.ideal_customer_profile?.disqualifiers.map((disqualifier, index) => (
                  <Badge key={index} variant="destructive" className="flex items-center gap-1">
                    {disqualifier}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeFromICPArray('disqualifiers', '', index)}
                    />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderKnowledgeBuilding = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Lightbulb className="h-16 w-16 mx-auto text-yellow-400 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Knowledge Building</h2>
        <p className="text-gray-400">Final touches to optimize SAM AI for your business</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Competitors</CardTitle>
            <CardDescription className="text-gray-400">Who do you compete against?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="Add a competitor"
                className="bg-gray-700 border-gray-600 text-white"
                onKeyPress={(e) => e.key === 'Enter' && addToArray('competitors', newItem)}
              />
              <Button
                onClick={() => addToArray('competitors', newItem)}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {profile.competitors?.map((competitor, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  {competitor}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeFromArray('competitors', index)}
                  />
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Use Cases</CardTitle>
            <CardDescription className="text-gray-400">Ideal scenarios for your solution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="Add an ideal use case"
                className="bg-gray-700 border-gray-600 text-white"
                onKeyPress={(e) => e.key === 'Enter' && addToICPArray('ideal_use_cases', '', newItem)}
              />
              <Button
                onClick={() => addToICPArray('ideal_use_cases', '', newItem)}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {profile.ideal_customer_profile?.ideal_use_cases.map((useCase, index) => (
                <Badge key={index} variant="default" className="flex items-center gap-1">
                  {useCase}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeFromICPArray('ideal_use_cases', '', index)}
                  />
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-white">Communication Preferences</CardTitle>
            <CardDescription className="text-gray-400">How should SAM AI communicate?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Communication Style</Label>
                <Select 
                  value={profile.knowledge_base?.user_preferences.communication_style} 
                  onValueChange={(value) => setProfile(prev => ({
                    ...prev,
                    knowledge_base: {
                      ...prev.knowledge_base!,
                      user_preferences: {
                        ...prev.knowledge_base!.user_preferences,
                        communication_style: value
                      }
                    }
                  }))}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Select communication style" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="direct">Direct</SelectItem>
                    <SelectItem value="consultative">Consultative</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-gray-300">Meeting Preferences</Label>
                <Select 
                  value={profile.knowledge_base?.user_preferences.meeting_preferences} 
                  onValueChange={(value) => setProfile(prev => ({
                    ...prev,
                    knowledge_base: {
                      ...prev.knowledge_base!,
                      user_preferences: {
                        ...prev.knowledge_base!.user_preferences,
                        meeting_preferences: value
                      }
                    }
                  }))}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Select meeting preferences" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="flexible">Flexible</SelectItem>
                    <SelectItem value="morning_preferred">Morning Preferred</SelectItem>
                    <SelectItem value="afternoon_preferred">Afternoon Preferred</SelectItem>
                    <SelectItem value="short_meetings">Short Meetings (15-30min)</SelectItem>
                    <SelectItem value="long_meetings">Longer Meetings (45-60min)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderCompleted = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="h-16 w-16 mx-auto text-green-400 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Setup Complete!</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Great! SAM AI now has comprehensive knowledge about your business. 
          You can start using the platform with personalized assistance.
        </p>
      </div>
      
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Profile Summary</CardTitle>
          <CardDescription className="text-gray-400">Review your business profile</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300">Company</Label>
              <p className="text-white">{profile.company_name}</p>
            </div>
            <div>
              <Label className="text-gray-300">Industry</Label>
              <p className="text-white capitalize">{profile.industry}</p>
            </div>
            <div>
              <Label className="text-gray-300">Target Audience</Label>
              <p className="text-white">{profile.target_audience}</p>
            </div>
            <div>
              <Label className="text-gray-300">Company Size</Label>
              <p className="text-white">{profile.company_size}</p>
            </div>
          </div>
          
          <Separator className="bg-gray-700" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-purple-400">{profile.value_propositions?.length || 0}</p>
              <p className="text-gray-400">Value Propositions</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-400">{profile.ideal_customer_profile?.primary_criteria.industry.length || 0}</p>
              <p className="text-gray-400">Target Industries</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">{profile.competitors?.length || 0}</p>
              <p className="text-gray-400">Competitors</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const canProceed = () => {
    switch (currentStage) {
      case 'introduction':
        return profile.company_name && profile.industry;
      case 'discovery':
        return profile.target_audience && (profile.value_propositions?.length || 0) > 0;
      case 'icp_definition':
        return (
          (profile.ideal_customer_profile?.primary_criteria.industry.length || 0) > 0 &&
          profile.ideal_customer_profile?.primary_criteria.company_size
        );
      case 'knowledge_building':
        return true; // Optional stage
      default:
        return true;
    }
  };

  const renderStageContent = () => {
    switch (currentStage) {
      case 'introduction':
        return renderIntroduction();
      case 'discovery':
        return renderDiscovery();
      case 'icp_definition':
        return renderICPDefinition();
      case 'knowledge_building':
        return renderKnowledgeBuilding();
      case 'completed':
        return renderCompleted();
      default:
        return renderIntroduction();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Business Profile Setup
            </h1>
            <Badge variant="outline" className="text-purple-400 border-purple-400">
              {currentStageIndex + 1} of {stages.length}
            </Badge>
          </div>
          
          <Progress 
            value={progressPercentage} 
            className="h-2 bg-gray-800"
          />
          
          <div className="flex justify-between mt-2 text-sm text-gray-400">
            <span>Introduction</span>
            <span>Discovery</span>
            <span>ICP Definition</span>
            <span>Knowledge Building</span>
            <span>Complete</span>
          </div>
        </div>

        {/* Stage Content */}
        {renderStageContent()}

        {/* Navigation */}
        {currentStage !== 'completed' && (
          <div className="flex justify-between mt-8">
            <Button
              onClick={prevStage}
              disabled={currentStageIndex === 0}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <Button
              onClick={nextStage}
              disabled={!canProceed() || loading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading ? 'Saving...' : (
                <>
                  {currentStage === 'knowledge_building' ? 'Complete Setup' : 'Continue'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        )}

        {currentStage === 'completed' && onComplete && (
          <div className="flex justify-center mt-8">
            <Button
              onClick={onComplete}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Start Using SAM AI
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}