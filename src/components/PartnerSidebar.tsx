
import React from 'react';
import {
    LayoutDashboard,
    UserCheck,
    History,
    User,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Heart,
    Stethoscope,
    Microscope,
    Pill,
    Building2
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface PartnerSidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    onLogout: () => void;
    partnerType?: string;
}

const PartnerSidebar: React.FC<PartnerSidebarProps> = ({ activeTab, onTabChange, onLogout, partnerType }) => {
    const [isCollapsed, setIsCollapsed] = React.useState(false);

    const menuItems = [
        { id: 'recent-visits', label: 'Dashboard', icon: LayoutDashboard }, // Using Visits as main dashboard view for now
        { id: 'verify-membership', label: 'Verify Membership', icon: UserCheck },
        { id: 'profile', label: 'My Profile', icon: User },
    ];

    const getPartnerIcon = (type?: string) => {
        switch (type) {
            case 'doctor': return <Stethoscope className="h-4 w-4" />;
            case 'diagnostic': return <Microscope className="h-4 w-4" />;
            case 'pharmacy': return <Pill className="h-4 w-4" />;
            default: return <Building2 className="h-4 w-4" />;
        }
    };

    return (
        <aside
            className={cn(
                "flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ease-in-out h-screen sticky top-0 z-40 shadow-sm",
                isCollapsed ? "w-16 sm:w-20" : "w-64"
            )}
        >
            {/* Logo Section */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-primary/5">
                <Link to="/" className={cn("flex items-center gap-2 transition-opacity", isCollapsed && "opacity-0 sm:opacity-100")}>
                    <Heart className="h-6 w-6 text-primary shrink-0" />
                    {!isCollapsed && (
                        <span className="font-bold text-lg text-primary truncate">
                            MEDICO
                        </span>
                    )}
                </Link>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="hidden sm:flex h-8 w-8 text-slate-400 hover:text-primary hover:bg-primary/10"
                >
                    {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
            </div>

            {/* Partner Info (Collapsed hidden) */}
            {!isCollapsed && (
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                            {getPartnerIcon(partnerType)}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium text-slate-900 truncate">Partner Portal</p>
                            <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-white capitalize">
                                {partnerType || 'Partner'}
                            </Badge>
                        </div>
                    </div>
                </div>
            )}

            {/* Nav Items */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onTabChange(item.id)}
                        className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                            activeTab === item.id
                                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                        )}
                        title={isCollapsed ? item.label : ""}
                    >
                        <item.icon className={cn(
                            "h-5 w-5 shrink-0 transition-colors",
                            activeTab === item.id ? "text-primary-foreground" : "text-slate-500 group-hover:text-slate-900"
                        )} />
                        {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}

                        {/* Active Indicator (Mobile/Collapsed) */}
                        {activeTab === item.id && isCollapsed && (
                            <div className="absolute left-0 w-1 h-6 bg-primary rounded-r-full" />
                        )}
                    </button>
                ))}
            </nav>

            {/* Footer / Logout */}
            <div className="p-3 border-t border-slate-100">
                <button
                    onClick={onLogout}
                    className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 group",
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

export default PartnerSidebar;
