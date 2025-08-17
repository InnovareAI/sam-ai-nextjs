import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  MessageSquare,
  Users,
  Mail,
  Settings,
  FileText,
  Target,
  Bot,
  Inbox,
  LayoutDashboard,
  GraduationCap,
  Star,
  Gift,
  MousePointer,
  Video,
  Folder,
  Search,
  Calendar,
  LogOut,
  User,
  Handshake,
  Database,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SAMBranding } from '@/components/branding/SAMBranding';
import ReplyModal from '@/components/ReplyModal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Main Navigation Items
const mainNavItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Campaigns", url: "/campaigns", icon: Target },
  { title: "Search", url: "/search", icon: Search },
  { title: "Contacts", url: "/contacts", icon: Users },
  { title: "Inbox", url: "/inbox", icon: Inbox },
  { title: "Reply", url: "/reply", icon: MessageSquare },
  { title: "Templates", url: "/templates", icon: FileText },
];

// Settings Navigation - Streamlined
const settingsItems = [
  { title: "Profile", url: "/profile", icon: Users },
  { title: "Settings", url: "/settings", icon: Settings },
];

// Agent Mode Navigation - Main Navigation
const agentNavItems = [
  { title: "AI Agents", url: "/", icon: Bot },
  { title: "Sam Training Room", url: "/training", icon: GraduationCap },
  { title: "Deal Room", url: "/deals", icon: Handshake },
  { title: "Data Room", url: "/data", icon: Database },
];

const agentDocumentItems = [
  { title: "ICP", url: "/agent/icp", icon: Target },
  { title: "Value Proposition", url: "/agent/value-prop", icon: Star },
  { title: "Offers", url: "/agent/offer", icon: Gift },
  { title: "Messaging", url: "/agent/messaging", icon: MessageSquare },
  { title: "CTAs", url: "/agent/cta", icon: MousePointer },
  { title: "Meetings", url: "/agent/meeting", icon: Calendar },
  { title: "Documents", url: "/agent/documents", icon: Folder },
];

export function UserSidebar({ 
  isConversational = false 
}: { 
  isConversational?: boolean;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const [showReplyModal, setShowReplyModal] = useState(false);
  
  // Always in agent mode - no workspace switching
  const isAgentMode = true;

  // Get user profile for display
  const getUserProfile = () => {
    const userProfile = localStorage.getItem('user_auth_profile');
    if (userProfile) {
      try {
        return JSON.parse(userProfile);
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const userProfile = getUserProfile();

  const handleLogout = () => {
    localStorage.clear();
    console.log("SUCCESS:", 'Logged out successfully');
    navigate('/');
    window.location.reload();
  };

  // Simple navigation item component with no complex interactions
  const NavItem = ({ item, isActive }: { item: any; isActive: boolean }) => {
    // Special handling for reply to open modal
    if (item.title === "Reply") {
      return (
        <button
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 w-full",
            isAgentMode
              ? "text-gray-300 font-normal hover:bg-gray-800 hover:text-white ml-1"
              : "text-gray-600 font-normal hover:bg-gray-50 hover:text-blue-600 ml-1"
          )}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowReplyModal(true);
          }}
        >
          <item.icon className={cn("h-4 w-4 flex-shrink-0", isAgentMode ? "text-gray-300" : "")} />
          <span className="truncate">{item.title}</span>
        </button>
      );
    }
    
    return (
      <NavLink
        to={item.url}
        className={() => cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 w-full",
          isActive
            ? (isAgentMode 
               ? "bg-gradient-to-r from-purple-900/50 to-blue-900/50 text-white font-medium border-l-3 border-purple-400 ml-1"
               : "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 font-medium border-l-3 border-blue-400 ml-1")
            : (isAgentMode
               ? "text-gray-300 font-normal hover:bg-gray-800 hover:text-white ml-1"
               : "text-gray-600 font-normal hover:bg-gray-50 hover:text-blue-600 ml-1")
        )}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <item.icon className={cn("h-4 w-4 flex-shrink-0", isActive ? (isAgentMode ? "text-white" : "text-blue-500") : (isAgentMode ? "text-gray-300" : ""))} />
        <span className="truncate">{item.title}</span>
      </NavLink>
    );
  };

  return (
    <aside className={cn(
      "w-64 border-r sticky top-0 h-screen flex-shrink-0 overflow-hidden",
      isAgentMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
    )}>
      <div className="h-full flex flex-col">
        {/* SAM Branding Header */}
        <div className={cn(
          "p-4 border-b",
          isAgentMode ? "border-gray-700" : "border-gray-200"
        )}>
          <SAMBranding variant="default" showTagline={true} className="mb-4" />
          <div className="flex flex-col gap-3">
            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start px-3 py-2 h-auto"
                >
                  <div className="flex items-center gap-2">
                    <div className="rounded-md bg-primary/10 p-1.5">
                      <User className={cn("h-4 w-4", isAgentMode ? "text-white" : "text-primary")} />
                    </div>
                    <div className="text-left">
                      <div className={cn("text-sm font-medium", isAgentMode ? "text-white" : "")}>
                        {userProfile?.full_name || userProfile?.email?.split('@')[0] || 'User'}
                      </div>
                      <div className={cn("text-xs capitalize", isAgentMode ? "text-gray-300" : "text-muted-foreground")}>
                        {userProfile?.subscription_tier || 'free'} plan
                      </div>
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                <DropdownMenuLabel>Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem
                  onClick={() => navigate('/profile')}
                  className="cursor-pointer"
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                
                <DropdownMenuItem
                  onClick={() => navigate('/settings')}
                  className="cursor-pointer"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-red-600"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          <div className="p-4 flex-1">
            {/* Agent Mode Navigation */}
            <nav className="space-y-1 mb-6">
              {agentNavItems.map((item) => (
                <NavItem
                  key={item.title}
                  item={item}
                  isActive={currentPath === item.url}
                />
              ))}
            </nav>
          </div>

          {/* Settings Section - Fixed to Bottom */}
          <div className="p-4 pt-0">
            <div className="border-t border-gray-700 pt-4">
              <h3 className="text-xs px-3 py-2 mb-2 uppercase tracking-wider text-gray-300 font-normal">
                Settings
              </h3>
              <nav className="space-y-1">
                {settingsItems.map((item) => (
                  <NavItem
                    key={item.title}
                    item={item}
                    isActive={currentPath === item.url}
                  />
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>
      
      {/* Reply Modal */}
      <ReplyModal 
        isOpen={showReplyModal} 
        onClose={() => setShowReplyModal(false)} 
      />
    </aside>
  );
}