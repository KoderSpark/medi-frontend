import React from 'react';
import {
    LayoutDashboard,
    Building2,
    MessageCircle,
    Users,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Heart
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface AdminSidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    onLogout: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, onTabChange, onLogout }) => {
    const [isCollapsed, setIsCollapsed] = React.useState(false);

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'partner-requests', label: 'Partners', icon: Building2 },
        { id: 'queries', label: 'Queries', icon: MessageCircle },
        { id: 'manage-users', label: 'Users', icon: Users },
    ];

    return (
        <aside
            className={cn(
                "flex flex-col bg-[#0a192f] border-r border-slate-800 transition-all duration-300 ease-in-out h-screen sticky top-0 z-40",
                isCollapsed ? "w-16 sm:w-20" : "w-64"
            )}
        >
            {/* Logo Section */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <Link to="/" className={cn("flex items-center gap-2 transition-opacity", isCollapsed && "opacity-0 sm:opacity-100")}>
                    <Heart className="h-6 w-6 text-white shrink-0" />
                    {!isCollapsed && (
                        <span className="font-bold text-lg text-white truncate">
                            MEDICO
                        </span>
                    )}
                </Link>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="hidden sm:flex h-8 w-8 text-slate-400 hover:text-white hover:bg-white/10"
                >
                    {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onTabChange(item.id)}
                        className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                            activeTab === item.id
                                ? "bg-white/10 text-white font-medium shadow-sm ring-1 ring-white/20"
                                : "text-slate-400 hover:bg-white/5 hover:text-white"
                        )}
                        title={isCollapsed ? item.label : ""}
                    >
                        <item.icon className={cn(
                            "h-5 w-5 shrink-0 transition-colors",
                            activeTab === item.id ? "text-white" : "group-hover:text-white"
                        )} />
                        {!isCollapsed && <span className="text-sm">{item.label}</span>}

                        {/* Active Indicator (Mobile/Collapsed) */}
                        {activeTab === item.id && isCollapsed && (
                            <div className="absolute left-0 w-1 h-6 bg-white rounded-r-full" />
                        )}
                    </button>
                ))}
            </nav>

            {/* Footer / Logout */}
            <div className="p-3 border-t border-slate-800">
                <button
                    onClick={onLogout}
                    className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 group",
                        isCollapsed && "justify-center"
                    )}
                    title={isCollapsed ? "Logout" : ""}
                >
                    <LogOut className="h-5 w-5 shrink-0" />
                    {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
