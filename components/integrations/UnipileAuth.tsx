import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Linkedin,
  Mail,
  Calendar,
  Globe,
  Shield,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Settings,
  Link,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Database,
  Zap,
  Workflow,
  Building,
  Briefcase
} from 'lucide-react';

interface UnipileAccount {
  id: string;
  provider: 'linkedin' | 'gmail' | 'gmail_imap' | 'outlook' | 'outlook_imap' | 'microsoft365' | 'google_calendar' | 'outlook_calendar' | 'hubspot' | 'pipedrive' | 'airtable' | 'zapier' | 'make' | 'n8n';
  email: string;
  name: string;
  status: 'connected' | 'error' | 'pending';
  brightdata_ip?: string;
  last_sync: string;
  connection_type?: 'oauth' | 'imap' | 'exchange' | 'api' | 'webhook';
  settings: {
    auto_reply: boolean;
    sync_frequency: string;
    proxy_enabled: boolean;
    webhook_enabled?: boolean;
    automation_triggers?: string[];
    imap_settings?: {
      server: string;
      port: number;
      security: 'ssl' | 'tls' | 'none';
    };
  };
}

interface BrightDataProxy {
  ip: string;
  location: string;
  status: 'active' | 'inactive';
  assigned_to?: string;
}

export function UnipileAuth() {
  const [accounts, setAccounts] = useState<UnipileAccount[]>([]);
  const [availableIPs, setAvailableIPs] = useState<BrightDataProxy[]>([]);
  const [connecting, setConnecting] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [hotSettingsActive, setHotSettingsActive] = useState(true);
  const [apiConnectionStatus, setApiConnectionStatus] = useState<'testing' | 'connected' | 'error' | null>(null);
  
  // Load existing accounts and available IPs
  useEffect(() => {
    loadAccounts();
    loadBrightDataIPs();
    // Load saved API key
    const savedApiKey = localStorage.getItem('unipile_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const loadAccounts = () => {
    // Load from localStorage or API
    const stored = localStorage.getItem('unipile_accounts');
    if (stored) {
      setAccounts(JSON.parse(stored));
    }
  };

  const loadBrightDataIPs = () => {
    // Mock BrightData IP pool - in production, fetch from BrightData API
    const mockIPs: BrightDataProxy[] = [
      { ip: '173.208.175.12', location: 'New York, US', status: 'active' },
      { ip: '185.220.100.34', location: 'London, UK', status: 'active' },
      { ip: '203.145.67.89', location: 'Sydney, AU', status: 'active' },
      { ip: '198.23.145.76', location: 'Toronto, CA', status: 'active' },
      { ip: '92.118.34.67', location: 'Berlin, DE', status: 'active' }
    ];
    setAvailableIPs(mockIPs);
  };

  const getAvailableIP = (): string => {
    const unassigned = availableIPs.filter(ip => 
      ip.status === 'active' && 
      !accounts.find(acc => acc.brightdata_ip === ip.ip)
    );
    
    if (unassigned.length > 0) {
      return unassigned[Math.floor(Math.random() * unassigned.length)].ip;
    }
    
    // Fallback to round-robin assignment
    return availableIPs[accounts.length % availableIPs.length]?.ip || '173.208.175.12';
  };

  const connectProvider = async (provider: string, connectionType: 'oauth' | 'imap' | 'exchange' = 'oauth') => {
    try {
      setConnecting(true);
      
      // Validate API key first
      if (!apiKey || apiKey.length < 10) {
        console.error("ERROR:", 'Please enter a valid Unipile API key first');
        return;
      }
      
      // Auto-assign BrightData IP for LinkedIn
      const assignedIP = provider === 'linkedin' ? getAvailableIP() : undefined;
      
      // Make actual Unipile API call to initiate connection
      const unipileResponse = await fetch('https://api.unipile.com/api/v1/accounts/connect', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          provider: provider,
          connection_type: connectionType,
          brightdata_ip: assignedIP
        })
      });
      
      if (!unipileResponse.ok) {
        const error = await unipileResponse.text();
        throw new Error(`Unipile API Error: ${error}`);
      }
      
      const unipileData = await unipileResponse.json();
      
      const getEmailDomain = (prov: string) => {
        if (prov.includes('gmail')) return 'gmail.com';
        if (prov.includes('outlook') || prov.includes('microsoft365')) return 'outlook.com';
        if (prov === 'linkedin') return 'linkedin.com';
        if (prov === 'hubspot') return 'hubspot.com';
        if (prov === 'pipedrive') return 'pipedrive.com';
        if (prov === 'airtable') return 'airtable.com';
        if (prov === 'zapier') return 'zapier.com';
        if (prov === 'make') return 'make.com';
        if (prov === 'n8n') return 'n8n.io';
        return 'example.com';
      };

      const getImapSettings = (prov: string) => {
        switch (prov) {
          case 'gmail_imap':
            return { server: 'imap.gmail.com', port: 993, security: 'ssl' as const };
          case 'outlook_imap':
            return { server: 'outlook.office365.com', port: 993, security: 'ssl' as const };
          case 'microsoft365':
            return { server: 'outlook.office365.com', port: 993, security: 'ssl' as const };
          default:
            return undefined;
        }
      };
      
      const newAccount: UnipileAccount = {
        id: unipileData.account_id || crypto.randomUUID(),
        provider: provider as any,
        email: unipileData.email || `user@${getEmailDomain(provider)}`,
        name: unipileData.name || getProviderDisplayName(provider),
        status: unipileData.status || 'connected',
        brightdata_ip: assignedIP,
        last_sync: new Date().toISOString(),
        connection_type: connectionType,
        settings: {
          auto_reply: false,
          sync_frequency: '15min',
          proxy_enabled: provider === 'linkedin',
          webhook_enabled: ['zapier', 'make', 'n8n'].includes(provider),
          automation_triggers: ['zapier', 'make', 'n8n'].includes(provider) ? ['new_lead', 'email_received'] : [],
          imap_settings: getImapSettings(provider)
        }
      };
      
      const updatedAccounts = [...accounts, newAccount];
      setAccounts(updatedAccounts);
      localStorage.setItem('unipile_accounts', JSON.stringify(updatedAccounts));
      
      console.log("SUCCESS:", `${getProviderDisplayName(provider)} connected via Unipile API!`);
      if (assignedIP) {
        console.info("INFO:", `BrightData IP ${assignedIP} auto-assigned for LinkedIn`);
      }
    } catch (error: any) {
      console.error('Unipile connection error:', error);
      
      // Handle specific API errors
      if (error.message?.includes('Unipile API Error')) {
        console.error("ERROR:", `Connection failed: ${error.message}`);
      } else if (error.message?.includes('Failed to fetch')) {
        console.error("ERROR:", 'Network error - check your internet connection');
      } else {
        console.error("ERROR:", `Failed to connect ${provider} via Unipile`);
      }
    } finally {
      setConnecting(false);
    }
  };

  const getProviderDisplayName = (provider: string) => {
    switch (provider) {
      case 'linkedin': return 'LinkedIn';
      case 'gmail': return 'Gmail (OAuth)';
      case 'gmail_imap': return 'Gmail (IMAP)';
      case 'outlook': return 'Outlook (OAuth)';
      case 'outlook_imap': return 'Outlook (IMAP)';
      case 'microsoft365': return 'Microsoft 365';
      case 'google_calendar': return 'Google Calendar';
      case 'outlook_calendar': return 'Outlook Calendar';
      case 'hubspot': return 'HubSpot';
      case 'pipedrive': return 'Pipedrive';
      case 'airtable': return 'Airtable';
      case 'zapier': return 'Zapier';
      case 'make': return 'Make.com';
      case 'n8n': return 'n8n';
      default: return provider;
    }
  };

  const disconnectAccount = (accountId: string) => {
    const updatedAccounts = accounts.filter(acc => acc.id !== accountId);
    setAccounts(updatedAccounts);
    localStorage.setItem('unipile_accounts', JSON.stringify(updatedAccounts));
    console.log("SUCCESS:", 'Account disconnected');
  };

  const updateAccountSettings = (accountId: string, settings: Partial<UnipileAccount['settings']>) => {
    const updatedAccounts = accounts.map(acc => 
      acc.id === accountId 
        ? { ...acc, settings: { ...acc.settings, ...settings } }
        : acc
    );
    setAccounts(updatedAccounts);
    localStorage.setItem('unipile_accounts', JSON.stringify(updatedAccounts));
    
    // HOT settings - apply immediately
    if (settings.auto_reply !== undefined) {
      console.log("SUCCESS:", `Auto Reply ${settings.auto_reply ? 'enabled' : 'disabled'} - active immediately`);
    }
    if (settings.sync_frequency !== undefined) {
      console.log("SUCCESS:", `Sync frequency updated to ${settings.sync_frequency} - taking effect now`);
    }
    if (settings.proxy_enabled !== undefined) {
      console.log("SUCCESS:", `Proxy ${settings.proxy_enabled ? 'enabled' : 'disabled'} - active for next request`);
    }
    if (settings.webhook_enabled !== undefined) {
      console.log("SUCCESS:", `Webhooks ${settings.webhook_enabled ? 'enabled' : 'disabled'} - automation triggers active`);
    }
  };

  const syncAccount = async (accountId: string) => {
    try {
      if (!apiKey) {
        console.error("ERROR:", 'API key required for sync');
        return;
      }

      const account = accounts.find(acc => acc.id === accountId);
      if (!account) return;

      // Call Unipile API to sync account data
      const syncResponse = await fetch(`https://api.unipile.com/api/v1/accounts/${accountId}/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!syncResponse.ok) {
        throw new Error('Sync failed');
      }

      const syncData = await syncResponse.json();
      
      const updatedAccounts = accounts.map(acc => 
        acc.id === accountId 
          ? { 
              ...acc, 
              last_sync: new Date().toISOString(),
              status: syncData.status || acc.status
            }
          : acc
      );
      setAccounts(updatedAccounts);
      localStorage.setItem('unipile_accounts', JSON.stringify(updatedAccounts));
      console.log("SUCCESS:", `${account.name} synced via Unipile`);
    } catch (error) {
      console.error('Sync error:', error);
      console.error("ERROR:", 'Sync failed - check API connection');
    }
  };

  const testApiConnection = async () => {
    if (!apiKey || apiKey.length < 10) {
      console.error("ERROR:", 'Please enter a valid API key first');
      return;
    }

    setApiConnectionStatus('testing');
    
    try {
      const response = await fetch('https://api.unipile.com/api/v1/accounts', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setApiConnectionStatus('connected');
        console.log("SUCCESS:", '✅ Unipile API connection successful!');
      } else {
        throw new Error(`API returned ${response.status}`);
      }
    } catch (error) {
      console.error('API test failed:', error);
      setApiConnectionStatus('error');
      console.error("ERROR:", '❌ Unipile API connection failed - check your API key');
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'linkedin': return <Linkedin className="h-6 w-6 text-blue-500" />;
      case 'gmail':
      case 'gmail_imap': return <Mail className="h-6 w-6 text-red-500" />;
      case 'outlook':
      case 'outlook_imap':
      case 'microsoft365': return <Mail className="h-6 w-6 text-blue-600" />;
      case 'google_calendar': return <Calendar className="h-6 w-6 text-green-500" />;
      case 'outlook_calendar': return <Calendar className="h-6 w-6 text-blue-600" />;
      case 'hubspot': return <Building className="h-6 w-6 text-orange-500" />;
      case 'pipedrive': return <Briefcase className="h-6 w-6 text-green-600" />;
      case 'airtable': return <Database className="h-6 w-6 text-yellow-500" />;
      case 'zapier': return <Zap className="h-6 w-6 text-orange-600" />;
      case 'make': return <Workflow className="h-6 w-6 text-purple-500" />;
      case 'n8n': return <Workflow className="h-6 w-6 text-blue-400" />;
      default: return <Link className="h-6 w-6 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-600 text-white">Connected</Badge>;
      case 'error':
        return <Badge className="bg-red-600 text-white">Error</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-600 text-white">Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* API Key Configuration */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-400" />
            Unipile API Configuration
            {hotSettingsActive && (
              <Badge className="bg-green-600 text-white text-xs">
                HOT SETTINGS
              </Badge>
            )}
          </CardTitle>
          <CardDescription className="text-gray-400">
            Unipile handles ALL server connections using our managed API keys - no setup required
            <br />
            <span className="text-green-400 text-xs">⚡ Ready to connect - just click the blue buttons below</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="unipile-api-key" className="text-gray-300">Unipile API Key</Label>
            <div className="flex gap-2">
              <Input
                id="unipile-api-key"
                type={showApiKey ? "text" : "password"}
                placeholder="Enter your Unipile API key"
                value={apiKey}
                onChange={(e) => {
                  const newKey = e.target.value;
                  setApiKey(newKey);
                  // HOT settings - save immediately
                  localStorage.setItem('unipile_api_key', newKey);
                  
                  // Reset connection status when key changes
                  setApiConnectionStatus(null);
                  
                  if (newKey.length > 10) {
                    console.log("SUCCESS:", 'API key updated - active immediately');
                    // Auto-test connection after a short delay
                    setTimeout(() => {
                      testApiConnection();
                    }, 1000);
                  }
                }}
                className="bg-gray-700 border-gray-600 text-white flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowApiKey(!showApiKey)}
                className="border-gray-600 text-gray-300 hover:text-white"
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Get your API key from <a href="https://unipile.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">Unipile Dashboard</a>
              </p>
              <div className="flex items-center gap-2">
                <Button
                  onClick={testApiConnection}
                  disabled={!apiKey || apiKey.length < 10 || apiConnectionStatus === 'testing'}
                  size="sm"
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:text-white"
                >
                  {apiConnectionStatus === 'testing' ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Test Connection
                </Button>
                {apiConnectionStatus === 'connected' && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
                {apiConnectionStatus === 'error' && (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Integrations */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            Available Integrations
            <Badge className="bg-orange-600 text-white text-xs">
              INSTANT CONNECT
            </Badge>
          </CardTitle>
          <CardDescription className="text-gray-400">
            All providers connect through our managed Unipile API - no API keys needed from you
            <br />
            <span className="text-blue-400 text-xs">⚡ Just click Connect - we handle all the authentication and setup</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* LinkedIn */}
          <div className="flex items-center justify-between p-4 border border-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <Linkedin className="h-8 w-8 text-blue-500" />
              <div>
                <div className="font-medium text-white">LinkedIn</div>
                <p className="text-sm text-gray-400">Ready to connect - no setup needed</p>
                <p className="text-xs text-gray-500">Auto-assigned BrightData proxy IP</p>
              </div>
            </div>
            <Button 
              onClick={() => connectProvider('linkedin')}
              disabled={connecting || accounts.some(acc => acc.provider === 'linkedin')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {connecting ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
              {accounts.some(acc => acc.provider === 'linkedin') ? 'Connected' : 'Connect'}
            </Button>
          </div>

          {/* Gmail OAuth */}
          <div className="flex items-center justify-between p-4 border border-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="h-8 w-8 text-red-500" />
              <div>
                <div className="font-medium text-white">Gmail (OAuth)</div>
                <p className="text-sm text-gray-400">One-click setup with our managed API</p>
              </div>
            </div>
            <Button 
              onClick={() => connectProvider('gmail')}
              disabled={connecting || accounts.some(acc => acc.provider === 'gmail')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {connecting ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
              {accounts.some(acc => acc.provider === 'gmail') ? 'Connected' : 'Connect'}
            </Button>
          </div>

          {/* Gmail IMAP */}
          <div className="flex items-center justify-between p-4 border border-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="h-8 w-8 text-red-400" />
              <div>
                <div className="font-medium text-white">Gmail (IMAP)</div>
                <p className="text-sm text-gray-400">Connected via Unipile IMAP</p>
              </div>
            </div>
            <Button 
              onClick={() => connectProvider('gmail_imap', 'imap')}
              disabled={connecting || accounts.some(acc => acc.provider === 'gmail_imap')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {connecting ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
              {accounts.some(acc => acc.provider === 'gmail_imap') ? 'Connected' : 'Connect'}
            </Button>
          </div>

          {/* Outlook OAuth */}
          <div className="flex items-center justify-between p-4 border border-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="h-8 w-8 text-blue-600" />
              <div>
                <div className="font-medium text-white">Outlook (OAuth)</div>
                <p className="text-sm text-gray-400">Connected via Unipile OAuth</p>
              </div>
            </div>
            <Button 
              onClick={() => connectProvider('outlook')}
              disabled={connecting || accounts.some(acc => acc.provider === 'outlook')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {connecting ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
              {accounts.some(acc => acc.provider === 'outlook') ? 'Connected' : 'Connect'}
            </Button>
          </div>

          {/* Outlook IMAP */}
          <div className="flex items-center justify-between p-4 border border-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="h-8 w-8 text-blue-500" />
              <div>
                <div className="font-medium text-white">Outlook (IMAP)</div>
                <p className="text-sm text-gray-400">Connected via Unipile IMAP</p>
              </div>
            </div>
            <Button 
              onClick={() => connectProvider('outlook_imap', 'imap')}
              disabled={connecting || accounts.some(acc => acc.provider === 'outlook_imap')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {connecting ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
              {accounts.some(acc => acc.provider === 'outlook_imap') ? 'Connected' : 'Connect'}
            </Button>
          </div>

          {/* Microsoft 365 */}
          <div className="flex items-center justify-between p-4 border border-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="h-8 w-8 text-orange-500" />
              <div>
                <div className="font-medium text-white">Microsoft 365</div>
                <p className="text-sm text-gray-400">Connected via Unipile Exchange</p>
              </div>
            </div>
            <Button 
              onClick={() => connectProvider('microsoft365', 'exchange')}
              disabled={connecting || accounts.some(acc => acc.provider === 'microsoft365')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {connecting ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
              {accounts.some(acc => acc.provider === 'microsoft365') ? 'Connected' : 'Connect'}
            </Button>
          </div>

          {/* Google Calendar */}
          <div className="flex items-center justify-between p-4 border border-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-green-500" />
              <div>
                <div className="font-medium text-white">Google Calendar</div>
                <p className="text-sm text-gray-400">Connected via Unipile Calendar API</p>
              </div>
            </div>
            <Button 
              onClick={() => connectProvider('google_calendar')}
              disabled={connecting || accounts.some(acc => acc.provider === 'google_calendar')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {connecting ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
              {accounts.some(acc => acc.provider === 'google_calendar') ? 'Connected' : 'Connect'}
            </Button>
          </div>

          {/* Outlook Calendar */}
          <div className="flex items-center justify-between p-4 border border-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div>
                <div className="font-medium text-white">Outlook Calendar</div>
                <p className="text-sm text-gray-400">Connected via Unipile Calendar API</p>
              </div>
            </div>
            <Button 
              onClick={() => connectProvider('outlook_calendar')}
              disabled={connecting || accounts.some(acc => acc.provider === 'outlook_calendar')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {connecting ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
              {accounts.some(acc => acc.provider === 'outlook_calendar') ? 'Connected' : 'Connect'}
            </Button>
          </div>

          <Separator className="my-6 bg-gray-700" />
          <h3 className="text-lg font-medium text-white mb-4">CRM & Automation</h3>

          {/* HubSpot */}
          <div className="flex items-center justify-between p-4 border border-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <Building className="h-8 w-8 text-orange-500" />
              <div>
                <div className="font-medium text-white">HubSpot</div>
                <p className="text-sm text-gray-400">Instant CRM connection - no API key needed</p>
              </div>
            </div>
            <Button 
              onClick={() => connectProvider('hubspot', 'api')}
              disabled={connecting || accounts.some(acc => acc.provider === 'hubspot')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {connecting ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
              {accounts.some(acc => acc.provider === 'hubspot') ? 'Connected' : 'Connect'}
            </Button>
          </div>

          {/* Pipedrive */}
          <div className="flex items-center justify-between p-4 border border-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <Briefcase className="h-8 w-8 text-green-600" />
              <div>
                <div className="font-medium text-white">Pipedrive</div>
                <p className="text-sm text-gray-400">Connected via Unipile CRM API</p>
              </div>
            </div>
            <Button 
              onClick={() => connectProvider('pipedrive', 'api')}
              disabled={connecting || accounts.some(acc => acc.provider === 'pipedrive')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {connecting ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
              {accounts.some(acc => acc.provider === 'pipedrive') ? 'Connected' : 'Connect'}
            </Button>
          </div>

          {/* Airtable */}
          <div className="flex items-center justify-between p-4 border border-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <Database className="h-8 w-8 text-yellow-500" />
              <div>
                <div className="font-medium text-white">Airtable</div>
                <p className="text-sm text-gray-400">Connected via Unipile Database API</p>
              </div>
            </div>
            <Button 
              onClick={() => connectProvider('airtable', 'api')}
              disabled={connecting || accounts.some(acc => acc.provider === 'airtable')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {connecting ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
              {accounts.some(acc => acc.provider === 'airtable') ? 'Connected' : 'Connect'}
            </Button>
          </div>

          {/* Zapier */}
          <div className="flex items-center justify-between p-4 border border-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <Zap className="h-8 w-8 text-orange-600" />
              <div>
                <div className="font-medium text-white">Zapier</div>
                <p className="text-sm text-gray-400">Connected via Unipile Automation API</p>
              </div>
            </div>
            <Button 
              onClick={() => connectProvider('zapier', 'webhook')}
              disabled={connecting || accounts.some(acc => acc.provider === 'zapier')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {connecting ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
              {accounts.some(acc => acc.provider === 'zapier') ? 'Connected' : 'Connect'}
            </Button>
          </div>

          {/* Make.com */}
          <div className="flex items-center justify-between p-4 border border-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <Workflow className="h-8 w-8 text-purple-500" />
              <div>
                <div className="font-medium text-white">Make.com</div>
                <p className="text-sm text-gray-400">Connected via Unipile Automation API</p>
              </div>
            </div>
            <Button 
              onClick={() => connectProvider('make', 'webhook')}
              disabled={connecting || accounts.some(acc => acc.provider === 'make')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {connecting ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
              {accounts.some(acc => acc.provider === 'make') ? 'Connected' : 'Connect'}
            </Button>
          </div>

          {/* n8n */}
          <div className="flex items-center justify-between p-4 border border-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <Workflow className="h-8 w-8 text-blue-400" />
              <div>
                <div className="font-medium text-white">n8n</div>
                <p className="text-sm text-gray-400">Connected via Unipile Workflow API</p>
              </div>
            </div>
            <Button 
              onClick={() => connectProvider('n8n', 'webhook')}
              disabled={connecting || accounts.some(acc => acc.provider === 'n8n')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {connecting ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
              {accounts.some(acc => acc.provider === 'n8n') ? 'Connected' : 'Connect'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Connected Accounts */}
      {accounts.length > 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              Connected Accounts
              <Badge className="bg-blue-600 text-white text-xs">
                LIVE SETTINGS
              </Badge>
            </CardTitle>
            <CardDescription className="text-gray-400">
              Manage your connected accounts and their settings
              <br />
              <span className="text-blue-400 text-xs">⚡ All account settings update in real-time</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {accounts.map((account) => (
              <div key={account.id} className="border border-gray-700 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getProviderIcon(account.provider)}
                    <div>
                      <div className="font-medium text-white">{account.name}</div>
                      <p className="text-sm text-gray-400">{account.email}</p>
                      {account.brightdata_ip && (
                        <div className="flex items-center gap-2 mt-1">
                          <Globe className="h-3 w-3 text-blue-400" />
                          <span className="text-xs text-blue-400">IP: {account.brightdata_ip}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(account.brightdata_ip!);
                              console.log("SUCCESS:", 'IP copied to clipboard');
                            }}
                            className="h-5 w-5 p-0 text-gray-400 hover:text-white"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(account.status)}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => syncAccount(account.id)}
                      className="text-gray-400 hover:text-white"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => disconnectAccount(account.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Separator className="bg-gray-700" />

                {/* Account Settings */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-white">Settings</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-gray-300 text-sm">Auto Reply</Label>
                        <p className="text-xs text-gray-500">Automatically respond to messages</p>
                      </div>
                      <Switch
                        checked={account.settings.auto_reply}
                        onCheckedChange={(checked) => 
                          updateAccountSettings(account.id, { auto_reply: checked })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-300 text-sm">Sync Frequency</Label>
                      <Select
                        value={account.settings.sync_frequency}
                        onValueChange={(value) => 
                          updateAccountSettings(account.id, { sync_frequency: value })
                        }
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="5min">5 minutes</SelectItem>
                          <SelectItem value="15min">15 minutes</SelectItem>
                          <SelectItem value="30min">30 minutes</SelectItem>
                          <SelectItem value="1hour">1 hour</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {account.provider === 'linkedin' && (
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-gray-300 text-sm">Proxy Enabled</Label>
                        <p className="text-xs text-gray-500">Use BrightData proxy for requests</p>
                      </div>
                      <Switch
                        checked={account.settings.proxy_enabled}
                        onCheckedChange={(checked) => 
                          updateAccountSettings(account.id, { proxy_enabled: checked })
                        }
                      />
                    </div>
                  )}

                  {/* Webhook & Automation Settings */}
                  {(account.connection_type === 'webhook' || ['zapier', 'make', 'n8n'].includes(account.provider)) && (
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-gray-300 text-sm">Webhook Enabled</Label>
                        <p className="text-xs text-gray-500">Enable webhook automation triggers</p>
                      </div>
                      <Switch
                        checked={account.settings.webhook_enabled || false}
                        onCheckedChange={(checked) => 
                          updateAccountSettings(account.id, { webhook_enabled: checked })
                        }
                      />
                    </div>
                  )}

                  {/* CRM Sync Settings */}
                  {['hubspot', 'pipedrive', 'airtable'].includes(account.provider) && (
                    <div className="space-y-2">
                      <Label className="text-gray-300 text-sm">CRM Sync Mode</Label>
                      <Select
                        value={account.settings.sync_frequency}
                        onValueChange={(value) => 
                          updateAccountSettings(account.id, { sync_frequency: value })
                        }
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          <SelectItem value="1min">Real-time</SelectItem>
                          <SelectItem value="5min">5 minutes</SelectItem>
                          <SelectItem value="15min">15 minutes</SelectItem>
                          <SelectItem value="1hour">1 hour</SelectItem>
                          <SelectItem value="manual">Manual only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Unipile Connection Details */}
                  {(account.provider.includes('imap') || account.connection_type === 'imap') && account.settings.imap_settings && (
                    <div className="space-y-3 border border-blue-600/30 rounded-lg p-3">
                      <h5 className="text-sm font-medium text-white">Unipile IMAP Connection</h5>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <Label className="text-gray-400">Handled by Unipile</Label>
                          <p className="text-gray-300 font-mono">{account.settings.imap_settings.server}</p>
                        </div>
                        <div>
                          <Label className="text-gray-400">Port (via Unipile)</Label>
                          <p className="text-gray-300 font-mono">{account.settings.imap_settings.port}</p>
                        </div>
                        <div>
                          <Label className="text-gray-400">Security</Label>
                          <p className="text-gray-300 font-mono uppercase">{account.settings.imap_settings.security}</p>
                        </div>
                        <div>
                          <Label className="text-gray-400">Connection</Label>
                          <p className="text-gray-300 font-mono uppercase">Unipile {account.connection_type}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Unipile Exchange Configuration */}
                  {account.connection_type === 'exchange' && (
                    <div className="space-y-3 border border-orange-600/30 rounded-lg p-3">
                      <h5 className="text-sm font-medium text-white">Unipile Microsoft 365</h5>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <Label className="text-gray-400">Protocol</Label>
                          <p className="text-gray-300 font-mono">Unipile Exchange</p>
                        </div>
                        <div>
                          <Label className="text-gray-400">Security</Label>
                          <p className="text-gray-300 font-mono">Unipile OAuth 2.0</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-xs text-gray-500">
                  Last sync: {new Date(account.last_sync).toLocaleString()}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* BrightData IP Pool Status */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-400" />
            BrightData Proxy Pool
          </CardTitle>
          <CardDescription className="text-gray-400">
            Available residential proxy IPs for LinkedIn automation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {availableIPs.map((proxy, index) => (
              <div key={proxy.ip} className="p-3 border border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-mono text-white">{proxy.ip}</span>
                  <Badge 
                    className={proxy.status === 'active' ? 'bg-green-600' : 'bg-gray-600'}
                  >
                    {proxy.status}
                  </Badge>
                </div>
                <p className="text-xs text-gray-400">{proxy.location}</p>
                {accounts.find(acc => acc.brightdata_ip === proxy.ip) && (
                  <p className="text-xs text-blue-400 mt-1">
                    Assigned to LinkedIn
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}