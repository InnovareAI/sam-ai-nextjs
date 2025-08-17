import React, { useState } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Crown, 
  Search, 
  Users, 
  Settings,
  ChevronDown,
  Check
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

export function WorkspaceSwitcher() {
  const { 
    currentWorkspace, 
    allWorkspaces, 
    isSuperAdmin, 
    switchWorkspace 
  } = useWorkspace();
  const [searchTerm, setSearchTerm] = useState('');

  if (!isSuperAdmin) {
    return null;
  }

  const filteredWorkspaces = allWorkspaces.filter(workspace =>
    workspace.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workspace.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="border-b border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-yellow-400" />
          <span className="text-white font-semibold">Super Admin</span>
          <Badge variant="secondary" className="bg-yellow-900 text-yellow-100">
            All Access
          </Badge>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <Building2 className="h-4 w-4" />
          <span>Current Workspace:</span>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full justify-between bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
            >
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span className="truncate">
                  {currentWorkspace?.name || 'Select Workspace'}
                </span>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="w-80 bg-gray-800 border-gray-600"
            align="start"
          >
            <DropdownMenuLabel className="text-gray-300">
              Switch Workspace
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-600" />
            
            <div className="p-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search workspaces..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>
            
            <div className="max-h-64 overflow-y-auto">
              {filteredWorkspaces.map((workspace) => (
                <DropdownMenuItem
                  key={workspace.id}
                  onClick={() => switchWorkspace(workspace.slug)}
                  className="cursor-pointer hover:bg-gray-700 text-gray-200"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="font-medium">{workspace.name}</div>
                        <div className="text-xs text-gray-400">
                          /{workspace.slug}
                        </div>
                      </div>
                    </div>
                    {currentWorkspace?.id === workspace.id && (
                      <Check className="h-4 w-4 text-green-400" />
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
            
            {filteredWorkspaces.length === 0 && (
              <div className="p-4 text-center text-gray-400 text-sm">
                No workspaces found
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {currentWorkspace && (
          <Card className="p-3 bg-gray-800 border-gray-600">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium text-sm">
                  {currentWorkspace.name}
                </div>
                <div className="text-gray-400 text-xs">
                  Workspace ID: {currentWorkspace.id.slice(0, 8)}...
                </div>
                <div className="text-gray-400 text-xs">
                  URL: /workspace/{currentWorkspace.slug}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-gray-400" />
                <Settings className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}