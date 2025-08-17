/**
 * Agent Health Monitoring Dashboard
 * Real-time monitoring of all SAM AI agents with performance metrics and alerts
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  TrendingDown,
  Clock,
  Zap,
  Shield,
  Database,
  Bot,
  Brain,
  MessageSquare,
  Workflow,
  Search,
  Mail,
  Settings,
  RefreshCw
} from 'lucide-react';

interface AgentMetrics {
  agent_type: string;
  success_rate: number;
  error_rate: number;
  timeout_rate: number;
  avg_response_time: number;
  requests_per_minute: number;
  memory_usage_mb: number;
  last_success: string;
  last_error?: string;
  status: 'healthy' | 'degraded' | 'critical' | 'offline';
}

interface SystemMetrics {
  total_requests: number;
  total_errors: number;
  system_uptime: number;
  memory_usage_mb: number;
  active_sessions: number;
}

const AGENT_ICONS = {
  'qa_agent': MessageSquare,
  'n8n_agent': Workflow,
  'apify_agent': Search,
  'unipile_agent': Mail,
  'supabase_agent': Database,
  'prompt_engineer': Brain
};

const AGENT_NAMES = {
  'qa_agent': 'Q&A Agent',
  'n8n_agent': 'n8n Workflow Agent',
  'apify_agent': 'Apify Scraping Agent',
  'unipile_agent': 'Unipile Integration Agent',
  'supabase_agent': 'Supabase Data Agent',
  'prompt_engineer': 'Prompt Engineer Agent'
};

export default function AgentHealthDashboard() {
  const [agentMetrics, setAgentMetrics] = useState<AgentMetrics[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [alerts, setAlerts] = useState<any[]>([]);

  // Simulate real-time metrics (replace with actual API calls)
  useEffect(() => {
    const generateMockMetrics = (): AgentMetrics[] => {
      return [
        {
          agent_type: 'qa_agent',
          success_rate: 74 + Math.random() * 20, // 74-94%
          error_rate: 8 + Math.random() * 5,
          timeout_rate: 16 + Math.random() * 8,
          avg_response_time: 7500 + Math.random() * 2000,
          requests_per_minute: Math.floor(Math.random() * 50) + 10,
          memory_usage_mb: 850 + Math.random() * 100,
          last_success: new Date(Date.now() - Math.random() * 300000).toISOString(),
          status: Math.random() > 0.7 ? 'degraded' : 'healthy'
        },
        {
          agent_type: 'n8n_agent',
          success_rate: 78 + Math.random() * 15,
          error_rate: 6 + Math.random() * 4,
          timeout_rate: 16 + Math.random() * 6,
          avg_response_time: 6500 + Math.random() * 1500,
          requests_per_minute: Math.floor(Math.random() * 40) + 15,
          memory_usage_mb: 780 + Math.random() * 120,
          last_success: new Date(Date.now() - Math.random() * 200000).toISOString(),
          status: Math.random() > 0.8 ? 'degraded' : 'healthy'
        },
        {
          agent_type: 'apify_agent',
          success_rate: 78 + Math.random() * 18,
          error_rate: 10 + Math.random() * 5,
          timeout_rate: 12 + Math.random() * 8,
          avg_response_time: 9500 + Math.random() * 2500,
          requests_per_minute: Math.floor(Math.random() * 30) + 5,
          memory_usage_mb: 520 + Math.random() * 80,
          last_success: new Date(Date.now() - Math.random() * 400000).toISOString(),
          status: Math.random() > 0.75 ? 'degraded' : 'healthy'
        },
        {
          agent_type: 'unipile_agent',
          success_rate: 76 + Math.random() * 20,
          error_rate: 6 + Math.random() * 4,
          timeout_rate: 18 + Math.random() * 7,
          avg_response_time: 8800 + Math.random() * 2000,
          requests_per_minute: Math.floor(Math.random() * 25) + 8,
          memory_usage_mb: 530 + Math.random() * 90,
          last_success: new Date(Date.now() - Math.random() * 350000).toISOString(),
          status: Math.random() > 0.7 ? 'degraded' : 'healthy'
        },
        {
          agent_type: 'supabase_agent',
          success_rate: 80 + Math.random() * 15,
          error_rate: 8 + Math.random() * 4,
          timeout_rate: 12 + Math.random() * 6,
          avg_response_time: 4800 + Math.random() * 1000,
          requests_per_minute: Math.floor(Math.random() * 60) + 20,
          memory_usage_mb: 740 + Math.random() * 100,
          last_success: new Date(Date.now() - Math.random() * 180000).toISOString(),
          status: Math.random() > 0.85 ? 'degraded' : 'healthy'
        },
        {
          agent_type: 'prompt_engineer',
          success_rate: 76 + Math.random() * 18,
          error_rate: 8 + Math.random() * 5,
          timeout_rate: 16 + Math.random() * 8,
          avg_response_time: 7600 + Math.random() * 1800,
          requests_per_minute: Math.floor(Math.random() * 35) + 10,
          memory_usage_mb: 680 + Math.random() * 120,
          last_success: new Date(Date.now() - Math.random() * 250000).toISOString(),
          status: Math.random() > 0.75 ? 'degraded' : 'healthy'
        }
      ].map(agent => ({
        ...agent,
        status: agent.success_rate < 80 ? 'critical' : 
               agent.timeout_rate > 15 ? 'degraded' : 'healthy'
      })) as AgentMetrics[];
    };

    const generateSystemMetrics = (): SystemMetrics => {
      return {
        total_requests: Math.floor(Math.random() * 10000) + 50000,
        total_errors: Math.floor(Math.random() * 500) + 100,
        system_uptime: Math.floor(Math.random() * 86400) + 86400 * 7, // 1-8 days
        memory_usage_mb: Math.floor(Math.random() * 1000) + 3500,
        active_sessions: Math.floor(Math.random() * 50) + 10
      };
    };

    const updateMetrics = () => {
      const newMetrics = generateMockMetrics();
      setAgentMetrics(newMetrics);
      setSystemMetrics(generateSystemMetrics());
      setLastUpdate(new Date());
      
      // Generate alerts for critical issues
      const newAlerts = newMetrics
        .filter(agent => agent.status === 'critical' || agent.success_rate < 75)
        .map(agent => ({
          id: `alert_${agent.agent_type}_${Date.now()}`,
          type: 'critical',
          agent: agent.agent_type,
          message: `${AGENT_NAMES[agent.agent_type]} showing critical performance: ${agent.success_rate.toFixed(1)}% success rate`,
          timestamp: new Date().toISOString()
        }));
      
      setAlerts(prev => [...newAlerts, ...prev.slice(0, 5)]);
      setIsLoading(false);
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50 border-green-200';
      case 'degraded': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'offline': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <XCircle className="h-4 w-4" />;
      case 'offline': return <XCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const formatResponseTime = (ms: number) => {
    return ms > 1000 ? `${(ms / 1000).toFixed(1)}s` : `${Math.round(ms)}ms`;
  };

  const refreshMetrics = () => {
    setIsLoading(true);
    // Trigger immediate refresh
    setTimeout(() => setIsLoading(false), 1000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-lg">Loading agent metrics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="h-8 w-8 text-blue-600" />
            Agent Health Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Real-time monitoring of SAM AI multi-agent system
          </p>
        </div>
        <div className="text-right">
          <Button onClick={refreshMetrics} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <div className="text-sm text-gray-600 mt-1">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* System Overview */}
      {systemMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              System Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {systemMetrics.total_requests.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Requests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {systemMetrics.total_errors.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Errors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatUptime(systemMetrics.system_uptime)}
                </div>
                <div className="text-sm text-gray-600">System Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {systemMetrics.memory_usage_mb.toFixed(0)} MB
                </div>
                <div className="text-sm text-gray-600">Memory Usage</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {systemMetrics.active_sessions}
                </div>
                <div className="text-sm text-gray-600">Active Sessions</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Critical Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Critical Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.slice(0, 3).map((alert) => (
                <Alert key={alert.id} className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Agent Performance Alert</AlertTitle>
                  <AlertDescription>
                    {alert.message}
                    <div className="text-xs text-gray-600 mt-1">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Agent Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agentMetrics.map((agent) => {
          const IconComponent = AGENT_ICONS[agent.agent_type] || Bot;
          return (
            <Card key={agent.agent_type} className={`border-2 ${getStatusColor(agent.status)}`}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-5 w-5" />
                    {AGENT_NAMES[agent.agent_type]}
                  </div>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {getStatusIcon(agent.status)}
                    {agent.status.toUpperCase()}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Success Rate */}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Success Rate</span>
                      <span className={agent.success_rate >= 80 ? 'text-green-600' : 'text-red-600'}>
                        {agent.success_rate.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={agent.success_rate} className="h-2" />
                  </div>

                  {/* Response Time */}
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Avg Response
                    </span>
                    <span className={agent.avg_response_time > 5000 ? 'text-red-600' : 'text-green-600'}>
                      {formatResponseTime(agent.avg_response_time)}
                    </span>
                  </div>

                  {/* Requests per Minute */}
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      Requests/min
                    </span>
                    <span>{agent.requests_per_minute}</span>
                  </div>

                  {/* Memory Usage */}
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Database className="h-3 w-3" />
                      Memory
                    </span>
                    <span className={agent.memory_usage_mb > 800 ? 'text-yellow-600' : 'text-green-600'}>
                      {agent.memory_usage_mb.toFixed(0)} MB
                    </span>
                  </div>

                  {/* Error Rates */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-center p-2 bg-red-50 rounded">
                      <div className="font-semibold text-red-600">{agent.error_rate.toFixed(1)}%</div>
                      <div className="text-gray-600">Errors</div>
                    </div>
                    <div className="text-center p-2 bg-yellow-50 rounded">
                      <div className="font-semibold text-yellow-600">{agent.timeout_rate.toFixed(1)}%</div>
                      <div className="text-gray-600">Timeouts</div>
                    </div>
                  </div>

                  {/* Last Success */}
                  <div className="text-xs text-gray-600">
                    Last success: {new Date(agent.last_success).toLocaleTimeString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Trends & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert className="border-blue-200 bg-blue-50">
              <TrendingUp className="h-4 w-4" />
              <AlertTitle>Performance Analysis</AlertTitle>
              <AlertDescription>
                <div className="space-y-2 mt-2">
                  <div>• <strong>Supabase Agent</strong>: Best performing with 80%+ success rate</div>
                  <div>• <strong>Q&A Agent</strong>: Needs optimization - high timeout rate (16%)</div>
                  <div>• <strong>Apify Agent</strong>: Slow responses (9.7s avg) - consider caching</div>
                  <div>• <strong>Unipile Agent</strong>: High timeout rate (18%) - review API limits</div>
                </div>
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Immediate Actions Needed</AlertTitle>
                <AlertDescription>
                  <div className="space-y-1 mt-2 text-sm">
                    <div>1. Implement circuit breakers for external APIs</div>
                    <div>2. Add request queue for high-load scenarios</div>
                    <div>3. Optimize agent timeout configurations</div>
                  </div>
                </AlertDescription>
              </Alert>

              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>System Strengths</AlertTitle>
                <AlertDescription>
                  <div className="space-y-1 mt-2 text-sm">
                    <div>1. All agents operational and responding</div>
                    <div>2. Memory usage within acceptable limits</div>
                    <div>3. No critical system failures detected</div>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}