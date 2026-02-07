import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Users, Building2, CreditCard, MessageCircle, Calendar, FileText, CheckCircle, XCircle, Eye, Download, Filter, Search, Upload, LayoutGrid, List } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import React from 'react';
import { apiUrl } from "@/lib/api";
import { Input } from "@/components/ui/input";
import AdminSidebar from "@/components/AdminSidebar";
import { LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import AdminDoctorsDirectory from "@/components/AdminDoctorsDirectory";

const Admin = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Map route to tab ID
  const getTabFromPath = () => {
    const path = location.pathname;
    if (path.includes('/admin/dashboard')) return "dashboard";
    if (path.includes('/admin/queries')) return "queries";
    if (path.includes('/admin/users')) return "manage-users";
    if (path.includes('/admin/partners')) return "manage-partners";
    return "dashboard"; // fallback
  };

  const [activeTab, setActiveTab] = React.useState(getTabFromPath());

  // Update tab when URL changes (for browser back/forward)
  React.useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [location.pathname]);

  // Handle redirect from /admin to /admin/dashboard
  React.useEffect(() => {
    if (location.pathname === '/admin' || location.pathname === '/admin/') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [location.pathname, navigate]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Map internal tab ID back to route
    if (value === 'dashboard') navigate('/admin/dashboard');
    else if (value === 'manage-partners') navigate('/admin/partners');
    else if (value === 'queries') navigate('/admin/queries');
    else if (value === 'manage-users') navigate('/admin/users');
  };
  const [stats, setStats] = React.useState([
    { label: "Total Members", value: "Loading...", change: "", icon: Users, color: "text-blue-600" },
    { label: "Active Partners", value: "Loading...", change: "", icon: Building2, color: "text-green-600" },
    { label: "Pending Queries", value: "Loading...", change: "", icon: MessageCircle, color: "text-orange-600" },
  ]);

  const [recentMembers, setRecentMembers] = React.useState([
    { name: "Loading...", plan: "", date: "", status: "" }
  ]);

  const [recentPartners, setRecentPartners] = React.useState([
    { name: "Loading...", type: "", members: 0, status: "" }
  ]);

  const [applications, setApplications] = React.useState<any[]>([]);
  const [queries, setQueries] = React.useState<any[]>([]);
  const [queryStats, setQueryStats] = React.useState({
    totalQueries: 0,
    pendingQueries: 0,
    resolvedToday: 0
  });
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(() => {
    try {
      const t = localStorage.getItem('token');
      if (!t) return false;
      const payload = JSON.parse(atob(t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      return !!payload?.isAdmin;
    } catch (e) {
      return false;
    }
  });
  const [selectedApp, setSelectedApp] = React.useState<any | null>(null);
  const [appDialogOpen, setAppDialogOpen] = React.useState(false);
  const [viewerImage, setViewerImage] = React.useState<string | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = React.useState(false);
  const [selectedQuery, setSelectedQuery] = React.useState<any>(null);
  const [searchTerm, setSearchTerm] = React.useState("");

  // Pagination and data for all users/partners
  const [allUsers, setAllUsers] = React.useState<any[]>([]);
  const [allPartners, setAllPartners] = React.useState<any[]>([]);
  const [usersPagination, setUsersPagination] = React.useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    hasNextPage: false,
    hasPrevPage: false
  });



  // Strict separation for admin-added pending partners
  const [isAdminView, setIsAdminView] = React.useState(false);
  const [partnersPagination, setPartnersPagination] = React.useState({
    currentPage: 1,
    totalPages: 1,
    totalPartners: 0,
    hasNextPage: false,
    hasPrevPage: false,
    loading: false
  });
  const [usersSearch, setUsersSearch] = React.useState("");
  const [partnersSearch, setPartnersSearch] = React.useState("");
  const [partnersSource, setPartnersSource] = React.useState<'all' | 'admin' | 'self'>('all');

  // Delete confirmation dialogs
  const [deletePartnerDialog, setDeletePartnerDialog] = React.useState(false);
  const [deleteUserDialog, setDeleteUserDialog] = React.useState(false);
  const [partnerToDelete, setPartnerToDelete] = React.useState<any>(null);
  const [userToDelete, setUserToDelete] = React.useState<any>(null);

  // Bulk Upload State
  const [bulkDialogOpen, setBulkDialogOpen] = React.useState(false);
  const [bulkFile, setBulkFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadResult, setUploadResult] = React.useState<any>(null);

  const handleBulkUpload = async () => {
    if (!bulkFile) return;

    setIsUploading(true);
    setUploadResult(null);

    const formData = new FormData();
    formData.append('file', bulkFile);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(apiUrl('api/partners/bulk-users'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        setUploadResult({ success: true, ...data });
        loadAllUsers(); // Refresh user list
        loadStats(); // Update stats
      } else {
        setUploadResult({ success: false, message: data.message || 'Upload failed' });
      }
    } catch (err) {
      console.error('Bulk upload error:', err);
      setUploadResult({ success: false, message: 'Network error or server unavailable' });
    } finally {
      setIsUploading(false);
    }
  };

  // Bulk Partner Upload State
  const [bulkPartnerDialogOpen, setBulkPartnerDialogOpen] = React.useState(false);
  const [bulkPartnerFile, setBulkPartnerFile] = React.useState<File | null>(null);
  const [isPartnerUploading, setIsPartnerUploading] = React.useState(false);
  const [partnerUploadResult, setPartnerUploadResult] = React.useState<any>(null);
  const [usersViewMode, setUsersViewMode] = React.useState<'list' | 'grid'>('list');
  const [queriesViewMode, setQueriesViewMode] = React.useState<'list' | 'grid'>('list');

  // Doctor Bulk Upload State
  const [doctorViewMode, setDoctorViewMode] = React.useState<'upload' | 'directory'>('upload');
  const [doctorBulkFile, setDoctorBulkFile] = React.useState<File | null>(null);
  const [isDoctorUploading, setIsDoctorUploading] = React.useState(false);
  const [doctorUploadResult, setDoctorUploadResult] = React.useState<any>(null);

  const handleBulkDoctorUpload = async () => {
    if (!doctorBulkFile) return;

    setIsDoctorUploading(true);
    setDoctorUploadResult(null);

    const formData = new FormData();
    formData.append('file', doctorBulkFile);

    try {
      const response = await fetch(apiUrl('api/doctors/upload'), {
        method: 'POST',
        // Note: Content-Type header is not set manually for FormData, browser does it with boundary
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setDoctorUploadResult({ success: true, message: data.message, count: data.count });
        setDoctorBulkFile(null);
      } else {
        setDoctorUploadResult({ success: false, message: data.message || "Upload failed" });
      }
    } catch (error) {
      console.error("Upload error:", error);
      setDoctorUploadResult({ success: false, message: "Network error or server issue." });
    } finally {
      setIsDoctorUploading(false);
    }
  };

  const [partnersViewMode, setPartnersViewMode] = React.useState<'list' | 'grid'>('list');





  const handleBulkPartnerUpload = async () => {
    if (!bulkPartnerFile) return;

    setIsPartnerUploading(true);
    setPartnerUploadResult(null);

    const formData = new FormData();
    formData.append('file', bulkPartnerFile);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(apiUrl('api/partners/bulk-partners'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        setPartnerUploadResult({ success: true, ...data });
        loadAllPartners(); // Refresh partner list
        loadStats(); // Update stats
      } else {
        setPartnerUploadResult({ success: false, message: data.message || 'Upload failed' });
      }
    } catch (err) {
      console.error('Bulk partner upload error:', err);
      setPartnerUploadResult({ success: false, message: 'Network error or server unavailable' });
    } finally {
      setIsPartnerUploading(false);
    }
  };

  const BACKEND_ORIGIN = (import.meta.env.VITE_API_BASE_URL as string) || `${window.location.protocol}//${window.location.hostname}:5000`;
  const assetUrl = (p?: string) => {
    if (!p) return '';
    // If it's already a data URL (base64), return as-is
    if (p.startsWith('data:')) return p;
    if (p.startsWith('http://') || p.startsWith('https://')) return p;
    // Ensure the path starts with uploads/ for proper static serving
    const path = p.startsWith('uploads/') ? p : (p.startsWith('/') ? p.slice(1) : p);
    return `${BACKEND_ORIGIN}/${path}`;
  };

  // Data loading functions (same as before)
  {/* loadApplications removed */ }

  const handleStatClick = (label: string) => {
    if (label === "Active Partners") {
      handleTabChange("manage-partners");
    } else if (label === "Total Members") {
      handleTabChange("manage-users");
    } else if (label === "Pending Queries") {
      handleTabChange("queries");
    }
  };

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(apiUrl('api/partners/stats'), { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return;
      const data = await res.json();
      setStats([
        { label: "Total Members", value: data.totalUsers.toString(), change: "", icon: Users, color: "text-blue-600" },
        { label: "Active Partners", value: data.approvedPartners.toString(), change: "", icon: Building2, color: "text-green-600" },
        { label: "Pending (Self)", value: data.pendingSelf.toString(), change: "", icon: FileText, color: "text-indigo-600" },
        { label: "Pending (Admin)", value: data.pendingAdmin.toString(), change: "", icon: FileText, color: "text-blue-600" },
        { label: "Pending Queries", value: queryStats.pendingQueries.toString(), change: "", icon: MessageCircle, color: "text-orange-600" },
      ]);
    } catch (err) {
      console.error(err);
    }
  };

  const loadRecentMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(apiUrl('api/partners/recent-members'), { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return;
      const data = await res.json();
      setRecentMembers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadRecentPartners = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(apiUrl('api/partners/recent-partners'), { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return;
      const data = await res.json();
      setRecentPartners(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadQueries = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(apiUrl('api/contact/queries?limit=50'), { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return;
      const data = await res.json();
      setQueries(data.queries);
    } catch (err) {
      console.error(err);
    }
  };

  const loadQueryStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(apiUrl('api/contact/stats'), { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return;
      const data = await res.json();
      setQueryStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadAllUsers = async (page: number = 1, search: string = "") => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({ page: page.toString(), limit: '10' });
      if (search) params.append('search', search);
      const res = await fetch(apiUrl(`api/partners/all-users?${params}`), { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return;
      const data = await res.json();
      setAllUsers(data.users);
      setUsersPagination(data.pagination);
    } catch (err) {
      console.error('Load all users error:', err);
    }
  };

  const loadAllPartners = async (page: number = 1, search: string = "", source: string = partnersSource) => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({ page: page.toString(), limit: '10' });
      if (search) params.append('search', search);
      if (source && source !== 'all') params.append('source', source);
      const res = await fetch(apiUrl(`api/partners/all-partners?${params}`), { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return;
      const data = await res.json();
      setAllPartners(data.partners);
      setPartnersPagination(data.pagination);
    } catch (err) {
      console.error('Load all partners error:', err);
    }
  };

  React.useEffect(() => {
    loadStats();
    loadRecentMembers();
    loadRecentPartners();
    loadQueries();
    loadQueryStats();
    loadAllUsers();
    loadAllPartners();
  }, []);

  // Action functions (same as before)
  // approve function removed
  // reject function removed

  const updateQueryStatus = async (id: string, status: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(apiUrl(`api/contact/queries/${id}/status`), {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        loadQueries();
        loadQueryStats();
        loadStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteQuery = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(apiUrl(`api/contact/queries/${id}`), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        loadQueries();
        loadQueryStats();
        loadStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deletePartner = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(apiUrl(`api/partners/partners/${id}`), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        loadAllPartners();
        loadStats();
        setDeletePartnerDialog(false);
        setPartnerToDelete(null);
      }
    } catch (err) {
      console.error('Delete partner error:', err);
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(apiUrl(`api/partners/users/${id}`), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        loadAllUsers();
        loadStats();
        setDeleteUserDialog(false);
        setUserToDelete(null);
      }
    } catch (err) {
      console.error('Delete user error:', err);
    }
  };

  const openAppDialog = (app: any) => { setSelectedApp(app); setAppDialogOpen(true); };
  const closeAppDialog = () => { setSelectedApp(null); setAppDialogOpen(false); };
  const openViewer = (src: string) => setViewerImage(src);
  const closeViewer = () => setViewerImage(null);
  const viewQuery = (query: any) => {
    setSelectedQuery(query);
    setViewDialogOpen(true);
  };

  // Filter applications based on search
  const filteredApplications = applications.filter(app =>
    app.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.state?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.district?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter queries based on search
  const filteredQueries = queries.filter(query =>
    query.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    query.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    query.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    query.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-lg sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 py-3 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 transition-transform hover:scale-105">
            <Heart className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              MEDI COST SAVER
            </span>
          </Link>
          <div className="flex gap-2 sm:gap-3 items-center">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs">
              Admin
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { localStorage.removeItem('token'); navigate('/'); }}
              className="hover:bg-red-50 hover:text-red-600 transition-colors text-xs sm:text-sm"
            >
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="flex">
        <AdminSidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onLogout={() => { localStorage.removeItem('token'); navigate('/'); }}
        />

        <main className="flex-1 min-w-0 overflow-hidden">
          <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4 sm:space-y-6">
              <TabsContent value="dashboard" className="animate-in fade-in-50 space-y-6 sm:space-y-8">
                {/* Header */}
                <div className="mb-6 sm:mb-8 text-center sm:text-left">
                  <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-2 bg-primary/10 rounded-full mb-2 sm:mb-3">
                    <LayoutDashboard className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                    <span className="text-xs sm:text-sm font-medium text-primary">Admin Dashboard</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Platform Management
                  </h1>
                  <p className="text-muted-foreground text-sm sm:text-base max-w-2xl">
                    Manage partner applications, user queries, and monitor platform performance
                  </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                  {stats.map((stat, idx) => (
                    <Card
                      key={idx}
                      className="border-0 shadow-sm rounded-xl sm:rounded-2xl hover:shadow-md transition-all duration-200 cursor-pointer"
                      onClick={() => handleStatClick(stat.label)}
                    >
                      <CardContent className="p-3 sm:p-4 lg:p-6">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="text-xs sm:text-sm text-muted-foreground mb-1 truncate">{stat.label}</div>
                            <div className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 truncate">{stat.value}</div>
                            <div className="text-xs text-accent">{stat.change}</div>
                          </div>
                          <div className={`p-2 bg-primary/10 rounded-lg flex-shrink-0 ml-2 ${stat.color}`}>
                            <stat.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Optional: Add recent activity here if dashboard feels empty */}
              </TabsContent>

              {/* Main Tabs List - Visible only on Partners section */}
              {(activeTab === 'partner-requests' || activeTab === 'manage-partners' || activeTab === 'manage-doctors') && (
                <TabsList className="hidden lg:grid w-full grid-cols-5 p-1 bg-muted/50 rounded-lg sm:rounded-xl h-auto gap-1">
                  <TabsTrigger
                    value="partner-requests"
                    className="flex items-center gap-1 sm:gap-2 py-2 sm:py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md sm:rounded-lg transition-all text-xs sm:text-sm"
                  >
                    <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="truncate">Active Requests</span>
                    {applications.length > 0 && (
                      <Badge variant="destructive" className="h-4 w-4 sm:h-5 sm:w-5 p-0 flex items-center justify-center text-xs">
                        {applications.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger
                    value="queries"
                    className="flex items-center gap-1 sm:gap-2 py-2 sm:py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md sm:rounded-lg transition-all text-xs sm:text-sm"
                  >
                    <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="truncate">User Queries</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="manage-partners"
                    className="flex items-center gap-1 sm:gap-2 py-2 sm:py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md sm:rounded-lg transition-all text-xs sm:text-sm"
                  >
                    <Building2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="truncate">All Partners</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="manage-users"
                    className="flex items-center gap-1 sm:gap-2 py-2 sm:py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md sm:rounded-lg transition-all text-xs sm:text-sm"
                  >
                    <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="truncate">Platform Users</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="manage-doctors"
                    className="flex items-center gap-1 sm:gap-2 py-2 sm:py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md sm:rounded-lg transition-all text-xs sm:text-sm"
                  >
                    <Upload className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="truncate">Manage Doctors</span>
                  </TabsTrigger>
                </TabsList>
              )}

              {/* Partner Requests Tab */}
              {/* Partner Requests Tab Removed */}

              {/* Queries Tab */}
              <TabsContent value="queries" className="animate-in fade-in-50">
                <Card className="border-0 shadow-lg rounded-xl sm:rounded-2xl">
                  <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 pb-3 sm:pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-1 sm:p-2 bg-orange-100 rounded-lg">
                          <MessageCircle className="h-4 w-4 sm:h-6 sm:w-6 text-orange-600" />
                        </div>
                        <div>
                          <CardTitle className="text-xl sm:text-2xl">User Queries</CardTitle>
                          <CardDescription className="text-sm sm:text-base">
                            Manage and respond to user support requests
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-4">
                        <div className="text-xs sm:text-sm text-muted-foreground hidden xs:block">
                          <span className="font-semibold text-orange-600">{queryStats.pendingQueries}</span> pending
                        </div>
                        <div className="flex items-center bg-muted/30 p-1 rounded-lg border border-muted-foreground/10">
                          <Button
                            variant={queriesViewMode === 'list' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setQueriesViewMode('list')}
                            className={cn("h-8 w-8 p-0", queriesViewMode === 'list' && "bg-white shadow-sm")}
                          >
                            <List className={cn("h-4 w-4", queriesViewMode === 'list' ? "text-slate-900" : "text-muted-foreground")} />
                          </Button>
                          <Button
                            variant={queriesViewMode === 'grid' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setQueriesViewMode('grid')}
                            className={cn("h-8 w-8 p-0", queriesViewMode === 'grid' && "bg-white shadow-sm")}
                          >
                            <LayoutGrid className={cn("h-4 w-4", queriesViewMode === 'grid' ? "text-slate-900" : "text-muted-foreground")} />
                          </Button>
                        </div>
                        <div className="relative w-32 xs:w-40 sm:w-64">
                          <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search queries..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-7 sm:pl-10 rounded-lg sm:rounded-xl border-muted-foreground/20 text-sm h-10"
                          />
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 sm:pt-6">
                    {filteredQueries.length === 0 ? (
                      <div className="text-center py-8 sm:py-12 text-muted-foreground">
                        <MessageCircle className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 opacity-40" />
                        <p className="text-base sm:text-lg font-medium mb-1 sm:mb-2">
                          {queries.length === 0 ? "No queries found" : "No queries match your search"}
                        </p>
                      </div>
                    ) : queriesViewMode === 'list' ? (
                      <div className="space-y-3 sm:space-y-4">
                        {filteredQueries.map((query) => (
                          <Card key={query._id} className="border-muted-foreground/20 hover:shadow-md transition-all duration-200">
                            <CardContent className="p-3 sm:p-4 lg:p-6">
                              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3 sm:gap-4">
                                <div className="flex-1 space-y-2 sm:space-y-3 min-w-0">
                                  <div className="flex flex-col xs:flex-row xs:items-center gap-1 sm:gap-2">
                                    <h3 className="font-semibold text-base sm:text-lg truncate">{query.subject}</h3>
                                    <Badge variant={query.status === 'pending' ? 'destructive' : query.status === 'resolved' ? 'default' : 'secondary'} className="text-xs w-fit">
                                      {query.status}
                                    </Badge>
                                  </div>

                                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                                    {query.message}
                                  </p>

                                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-1 sm:gap-2 text-xs sm:text-sm">
                                    <div className="flex items-center gap-1 sm:gap-2 truncate">
                                      <span className="text-muted-foreground">From:</span>
                                      <span className="truncate">{query.name} ({query.email})</span>
                                    </div>
                                    <div className="flex items-center gap-1 sm:gap-2 truncate">
                                      <span className="text-muted-foreground">User Type:</span>
                                      <span>{query.userType}</span>
                                    </div>
                                    <div className="flex items-center gap-1 sm:gap-2 truncate xs:col-span-2">
                                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                                      <span>{new Date(query.createdAt).toLocaleDateString()}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex flex-row sm:flex-col gap-1 sm:gap-2 w-full sm:w-auto">
                                  <Button variant="outline" size="sm" onClick={() => viewQuery(query)} className="flex items-center gap-1 sm:gap-2 flex-1 sm:flex-none text-xs">
                                    <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                                    <span className="hidden sm:inline">View</span>
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updateQueryStatus(query._id, 'resolved')}
                                    className="flex items-center gap-1 sm:gap-2 flex-1 sm:flex-none text-xs text-green-600 hover:text-green-700"
                                  >
                                    <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                                    <span className="hidden sm:inline">Resolve</span>
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {filteredQueries.map((query) => (
                          <Card key={query._id} className="border-muted-foreground/20 hover:shadow-md transition-all duration-200 flex flex-col">
                            <CardContent className="p-4 sm:p-5 flex-1 flex flex-col">
                              <div className="flex justify-between items-start mb-3">
                                <Badge variant={query.status === 'pending' ? 'destructive' : query.status === 'resolved' ? 'default' : 'secondary'} className="text-[10px] h-5 px-1.5 uppercase tracking-wider">
                                  {query.status}
                                </Badge>
                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(query.createdAt).toLocaleDateString()}
                                </div>
                              </div>

                              <h3 className="font-bold text-sm sm:text-base line-clamp-1 mb-2 group-hover:text-blue-600 transition-colors uppercase">{query.subject}</h3>

                              <p className="text-xs text-muted-foreground line-clamp-3 mb-4 flex-1 italic bg-muted/50 p-2 rounded border-l-2 border-orange-200">
                                "{query.message}"
                              </p>

                              <div className="space-y-2 pt-3 border-t">
                                <div className="flex items-center gap-2">
                                  <div className="h-7 w-7 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-[10px] font-bold">
                                    {query.name?.charAt(0)}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-semibold truncate leading-none mb-0.5">{query.name}</p>
                                    <p className="text-[10px] text-muted-foreground truncate">{query.email}</p>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between text-[10px]">
                                  <span className="text-muted-foreground uppercase font-medium">Platform Role</span>
                                  <Badge variant="outline" className="h-4 text-[9px] px-1 bg-muted/50">{query.userType}</Badge>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 mt-4">
                                <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => viewQuery(query)}>
                                  <Eye className="h-3.5 w-3.5 mr-1" /> View
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => updateQueryStatus(query._id, 'resolved')}
                                  className="text-xs h-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                >
                                  <CheckCircle className="h-3.5 w-3.5 mr-1" /> Resolve
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Manage Partners Tab */}
              <TabsContent value="manage-partners" className="animate-in fade-in-50">
                <Card className="border-0 shadow-lg rounded-xl sm:rounded-2xl">
                  <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 pb-3 sm:pb-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1 sm:p-2 bg-green-100 rounded-lg">
                        <Building2 className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl sm:text-2xl">Active Partners</CardTitle>
                        <CardDescription className="text-sm sm:text-base">
                          View all active healthcare partners ({partnersPagination.totalPartners} total)
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 mt-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search partners by name, clinic name, email, or facility type..."
                          value={partnersSearch}
                          onChange={(e) => {
                            setPartnersSearch(e.target.value);
                            loadAllPartners(1, e.target.value);
                          }}
                          className="pl-10 h-10"
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        <div className="flex bg-muted/50 p-1 rounded-lg border border-muted-foreground/10">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setPartnersSource('all'); loadAllPartners(1, partnersSearch, 'all'); }}
                            className={cn(
                              "h-8 text-xs px-3 transition-all duration-200",
                              partnersSource === 'all'
                                ? "bg-white shadow-sm font-bold text-slate-900"
                                : "text-muted-foreground hover:text-slate-900"
                            )}
                          >
                            All
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setPartnersSource('self'); loadAllPartners(1, partnersSearch, 'self'); }}
                            className={cn(
                              "h-8 text-xs px-3 transition-all duration-200",
                              partnersSource === 'self'
                                ? "bg-white shadow-sm font-bold text-slate-900"
                                : "text-muted-foreground hover:text-slate-900"
                            )}
                          >
                            Self Applied
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setPartnersSource('admin'); loadAllPartners(1, partnersSearch, 'admin'); }}
                            className={cn(
                              "h-8 text-xs px-3 transition-all duration-200",
                              partnersSource === 'admin'
                                ? "bg-white shadow-sm font-bold text-slate-900"
                                : "text-muted-foreground hover:text-slate-900"
                            )}
                          >
                            Admin Added
                          </Button>
                        </div>
                        <div className="flex items-center bg-muted/30 p-1 rounded-lg border border-muted-foreground/10">
                          <Button
                            variant={partnersViewMode === 'list' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setPartnersViewMode('list')}
                            className={cn("h-8 w-8 p-0", partnersViewMode === 'list' && "bg-white shadow-sm")}
                          >
                            <List className={cn("h-4 w-4", partnersViewMode === 'list' ? "text-slate-900" : "text-muted-foreground")} />
                          </Button>
                          <Button
                            variant={partnersViewMode === 'grid' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setPartnersViewMode('grid')}
                            className={cn("h-8 w-8 p-0", partnersViewMode === 'grid' && "bg-white shadow-sm")}
                          >
                            <LayoutGrid className={cn("h-4 w-4", partnersViewMode === 'grid' ? "text-slate-900" : "text-muted-foreground")} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 sm:pt-6">
                    {partnersPagination.loading ? (
                      <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : allPartners.length === 0 ? (
                      <div className="text-center py-8 sm:py-12 text-muted-foreground">
                        <Building2 className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 opacity-40" />
                        <p className="text-base sm:text-lg font-medium mb-1 sm:mb-2">No partners found</p>
                        <p className="text-xs sm:text-sm">Try adjusting your search criteria</p>
                      </div>
                    ) : partnersViewMode === 'list' ? (
                      <div className="space-y-3 sm:space-y-4">
                        {allPartners.map((partner, idx) => (
                          <Card key={partner._id || idx} className="border-muted-foreground/20 hover:shadow-md transition-all duration-200">
                            <CardContent className="p-3 sm:p-4 lg:p-6">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                                <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
                                  <div className="flex items-center gap-2 sm:gap-3">
                                    <h3 className="font-semibold text-base sm:text-lg truncate">{partner.name || partner.clinicName || 'Unknown Name'}</h3>
                                    <Badge variant="outline" className="capitalize bg-green-50 text-green-700 border-green-200 text-xs">
                                      {partner.type || partner.facilityType || 'Partner'}
                                    </Badge>
                                  </div>
                                  <div className="text-xs sm:text-sm text-muted-foreground">
                                    {partner.email || partner.contactEmail || 'No Email'} • {partner.contactPhone || partner.phone || 'No Phone'}
                                  </div>
                                  <div className="text-xs sm:text-sm text-muted-foreground">
                                    {partner.address || 'No Address'} • {partner.membersServed || 0} members served
                                  </div>
                                  <div className="text-xs sm:text-sm text-muted-foreground">
                                    Joined {new Date(partner.createdAt).toLocaleDateString()}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    className="text-xs sm:text-sm"
                                    onClick={() => {
                                      setPartnerToDelete(partner);
                                      setDeletePartnerDialog(true);
                                    }}
                                  >
                                    <XCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                    Remove
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        {allPartners.map((partner, idx) => (
                          <Card key={partner._id || idx} className="border-muted-foreground/20 hover:shadow-md transition-all duration-200 flex flex-col">
                            <CardContent className="p-4 sm:p-5 flex-1 flex flex-col">
                              <div className="flex justify-between items-start mb-3">
                                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                                  <Building2 className="h-6 w-6" />
                                </div>
                                <Badge variant="outline" className="capitalize bg-green-50 text-green-700 border-green-200 text-[10px] h-5">
                                  {partner.type || partner.facilityType || 'Partner'}
                                </Badge>
                              </div>

                              <h4 className="font-bold text-sm sm:text-base line-clamp-1 mb-1">{partner.name || partner.clinicName || 'Unknown Name'}</h4>
                              <p className="text-[11px] text-muted-foreground truncate mb-3">{partner.email || partner.contactEmail}</p>

                              <div className="space-y-2 flex-1 mb-4">
                                <div className="space-y-1">
                                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold opacity-70">Location</div>
                                  <div className="text-xs text-gray-700 line-clamp-1">{partner.address || 'No Address provided'}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                                  <div className="space-y-0.5">
                                    <div className="text-[9px] text-muted-foreground uppercase">Impact</div>
                                    <div className="text-xs font-bold text-blue-600">{partner.membersServed || 0} Served</div>
                                  </div>
                                  <div className="space-y-0.5">
                                    <div className="text-[9px] text-muted-foreground uppercase">Joined</div>
                                    <div className="text-xs font-medium">{new Date(partner.createdAt).toLocaleDateString()}</div>
                                  </div>
                                </div>
                              </div>

                              <div className="mt-auto pt-3 border-t">
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="w-full text-xs h-8"
                                  onClick={() => {
                                    setPartnerToDelete(partner);
                                    setDeletePartnerDialog(true);
                                  }}
                                >
                                  <XCircle className="h-3.5 w-3.5 mr-1.5" /> Remove Partner
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}

                    {/* Pagination */}
                    {partnersPagination.totalPages > 1 && (
                      <div className="flex items-center justify-between mt-6">
                        <div className="text-sm text-muted-foreground">
                          Showing {((partnersPagination.currentPage - 1) * 10) + 1} to {Math.min(partnersPagination.currentPage * 10, partnersPagination.totalPartners)} of {partnersPagination.totalPartners} partners
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadAllPartners(partnersPagination.currentPage - 1, partnersSearch, partnersSource)}
                            disabled={!partnersPagination.hasPrevPage}
                          >
                            Previous
                          </Button>
                          <span className="text-sm text-muted-foreground px-2">
                            Page {partnersPagination.currentPage} of {partnersPagination.totalPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadAllPartners(partnersPagination.currentPage + 1, partnersSearch, partnersSource)}
                            disabled={!partnersPagination.hasNextPage}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Manage Users Tab */}
              <TabsContent value="manage-users" className="animate-in fade-in-50">
                <Card className="border-0 shadow-lg rounded-xl sm:rounded-2xl">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 pb-3 sm:pb-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1 sm:p-2 bg-purple-100 rounded-lg">
                        <Users className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl sm:text-2xl">All Users</CardTitle>
                        <CardDescription className="text-sm sm:text-base">
                          View and manage all platform users ({usersPagination.totalUsers} total)
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 mt-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search users by name, email, or membership ID..."
                          value={usersSearch}
                          onChange={(e) => {
                            setUsersSearch(e.target.value);
                            loadAllUsers(1, e.target.value);
                          }}
                          className="pl-10 h-10"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center bg-muted/30 p-1 rounded-lg border border-muted-foreground/10 mr-1">
                          <Button
                            variant={usersViewMode === 'list' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setUsersViewMode('list')}
                            className={cn("h-8 w-8 p-0", usersViewMode === 'list' && "bg-white shadow-sm")}
                          >
                            <List className={cn("h-4 w-4", usersViewMode === 'list' ? "text-slate-900" : "text-muted-foreground")} />
                          </Button>
                          <Button
                            variant={usersViewMode === 'grid' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setUsersViewMode('grid')}
                            className={cn("h-8 w-8 p-0", usersViewMode === 'grid' && "bg-white shadow-sm")}
                          >
                            <LayoutGrid className={cn("h-4 w-4", usersViewMode === 'grid' ? "text-slate-900" : "text-muted-foreground")} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 sm:pt-6">
                    {usersViewMode === 'list' ? (
                      <div className="space-y-3 sm:space-y-4">
                        {allUsers.map((user, idx) => (
                          <Card key={user._id || idx} className="border-muted-foreground/20 hover:shadow-md transition-all duration-200">
                            <CardContent className="p-3 sm:p-4 lg:p-6">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                                <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
                                  <div className="flex items-center gap-2 sm:gap-3">
                                    <h3 className="font-semibold text-base sm:text-lg truncate">{user.name}</h3>
                                    <Badge variant="outline" className="capitalize bg-purple-50 text-purple-700 border-purple-200 text-xs">
                                      {user.plan}
                                    </Badge>
                                  </div>
                                  <div className="text-xs sm:text-sm text-muted-foreground">
                                    {user.email} • {user.membershipId}
                                  </div>
                                  <div className="text-xs sm:text-sm text-muted-foreground">
                                    Joined {new Date(user.createdAt).toLocaleDateString()} • Valid until {new Date(user.validUntil).toLocaleDateString()}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <Badge variant="secondary" className="text-xs">Active</Badge>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    className="text-xs sm:text-sm"
                                    onClick={() => {
                                      setUserToDelete(user);
                                      setDeleteUserDialog(true);
                                    }}
                                  >
                                    <XCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                    Remove
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                        {allUsers.map((user, idx) => (
                          <Card key={user._id || idx} className="border-muted-foreground/20 hover:shadow-md transition-all duration-200 flex flex-col">
                            <CardContent className="p-4 sm:p-5 flex-1 flex flex-col">
                              <div className="flex justify-between items-start mb-3">
                                <div className="min-w-0">
                                  <h3 className="font-bold text-base sm:text-lg truncate leading-tight mb-1">{user.name}</h3>
                                  <Badge variant="outline" className="capitalize bg-purple-50 text-purple-700 border-purple-200 text-[10px] h-5">
                                    {user.plan}
                                  </Badge>
                                </div>
                                <Badge variant="secondary" className="text-[10px] h-5 shrink-0 px-1.5">Active</Badge>
                              </div>

                              <div className="space-y-2.5 flex-1">
                                <div className="space-y-0.5">
                                  <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold opacity-70">Contact & ID</div>
                                  <div className="text-sm truncate text-gray-700">{user.email}</div>
                                  <div className="text-sm font-medium text-purple-600">{user.membershipId}</div>
                                </div>

                                <div className="space-y-0.5 border-t pt-2">
                                  <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold opacity-70">Dates</div>
                                  <div className="text-xs text-gray-600 flex justify-between">
                                    <span>Joined:</span>
                                    <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                                  </div>
                                  <div className="text-xs text-gray-600 flex justify-between">
                                    <span>Expires:</span>
                                    <span>{new Date(user.validUntil).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="mt-4 pt-3 border-t">
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="w-full text-xs h-9"
                                  onClick={() => {
                                    setUserToDelete(user);
                                    setDeleteUserDialog(true);
                                  }}
                                >
                                  <XCircle className="h-3.5 w-3.5 mr-1.5" />
                                  Remove User
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}

                    {/* Pagination */}
                    {usersPagination.totalPages > 1 && (
                      <div className="flex items-center justify-between mt-6">
                        <div className="text-sm text-muted-foreground">
                          Showing {((usersPagination.currentPage - 1) * 10) + 1} to {Math.min(usersPagination.currentPage * 10, usersPagination.totalUsers)} of {usersPagination.totalUsers} users
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadAllUsers(usersPagination.currentPage - 1, usersSearch)}
                            disabled={!usersPagination.hasPrevPage}
                          >
                            Previous
                          </Button>
                          <span className="text-sm text-muted-foreground px-2">
                            Page {usersPagination.currentPage} of {usersPagination.totalPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadAllUsers(usersPagination.currentPage + 1, usersSearch)}
                            disabled={!usersPagination.hasNextPage}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Manage Doctors Tab */}
              <TabsContent value="manage-doctors" className="animate-in fade-in-50 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold tracking-tight">Manage Doctors</h2>
                  <div className="flex bg-muted p-1 rounded-lg">
                    <Button
                      variant={doctorViewMode === 'upload' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setDoctorViewMode('upload')}
                      className="text-sm"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Bulk Upload
                    </Button>
                    <Button
                      variant={doctorViewMode === 'directory' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setDoctorViewMode('directory')}
                      className="text-sm"
                    >
                      <List className="h-4 w-4 mr-2" />
                      Directory
                    </Button>
                  </div>
                </div>

                {doctorViewMode === 'upload' ? (
                  <Card className="border-0 shadow-lg rounded-xl sm:rounded-2xl">
                    <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 pb-3 sm:pb-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-1 sm:p-2 bg-cyan-100 rounded-lg">
                          <Upload className="h-4 w-4 sm:h-6 sm:w-6 text-cyan-600" />
                        </div>
                        <div>
                          <CardTitle className="text-xl sm:text-2xl">Bulk Upload Doctors</CardTitle>
                          <CardDescription className="text-sm sm:text-base">
                            Upload doctor data via Excel file. Allowed columns: Category, Source, Doctor's Name, etc.
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 sm:pt-6">
                      <div className="flex flex-col gap-4 max-w-xl">
                        <div className="flex flex-col gap-2">
                          <Label htmlFor="bulk-file">Select Excel File</Label>
                          <Input
                            id="bulk-file"
                            type="file"
                            accept=".xlsx, .xls"
                            onChange={(e) => setDoctorBulkFile(e.target.files ? e.target.files[0] : null)}
                          />
                        </div>

                        <Button
                          onClick={handleBulkDoctorUpload}
                          disabled={!doctorBulkFile || isDoctorUploading}
                          className="w-fit"
                        >
                          {isDoctorUploading ? "Uploading..." : "Upload Doctors"}
                        </Button>

                        {doctorUploadResult && (
                          <div className={`p-4 rounded-md ${doctorUploadResult.success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                            <div className="font-bold flex items-center gap-2">
                              {doctorUploadResult.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                              {doctorUploadResult.success ? "Upload Successful" : "Upload Failed"}
                            </div>
                            <p className="text-sm mt-1">{doctorUploadResult.message}</p>
                            {doctorUploadResult.count > 0 && <p className="text-xs mt-1">Processed {doctorUploadResult.count} records.</p>}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <AdminDoctorsDirectory />
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Application Detail Dialog */}
          <Dialog open={appDialogOpen} onOpenChange={setAppDialogOpen}>
            <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-hidden mx-2 sm:mx-4">
              <DialogHeader>
                <DialogTitle className="text-xl sm:text-2xl">Application Details</DialogTitle>
                <DialogDescription className="text-sm sm:text-base">Review all details before making a decision</DialogDescription>
              </DialogHeader>
              {selectedApp && (
                <div className="max-h-[60vh] overflow-y-auto pr-1 sm:pr-2 space-y-6 sm:space-y-8 mt-2">
                  {/* Personal Details Section */}
                  <section className="space-y-4 sm:space-y-6">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-1.5 h-6 sm:w-2 sm:h-8 bg-blue-600 rounded-full"></div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Personal Details</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-1">
                        <h4 className="font-semibold text-xs sm:text-sm text-muted-foreground">Full Name</h4>
                        <div className="text-sm sm:text-base">{selectedApp.responsible?.name || 'Not specified'}</div>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-semibold text-xs sm:text-sm text-muted-foreground">Age</h4>
                        <div className="text-sm sm:text-base">{selectedApp.responsible?.age || 'Not specified'}</div>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-semibold text-xs sm:text-sm text-muted-foreground">Sex</h4>
                        <div className="text-sm sm:text-base">{selectedApp.responsible?.sex || 'Not specified'}</div>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-semibold text-xs sm:text-sm text-muted-foreground">Date of Birth</h4>
                        <div className="text-sm sm:text-base">{selectedApp.responsible?.dob || 'Not specified'}</div>
                      </div>
                    </div>
                  </section>

                  {/* Business Details Section */}
                  <section className="space-y-4 sm:space-y-6">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-1.5 h-6 sm:w-2 sm:h-8 bg-green-600 rounded-full"></div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Business Details</h3>
                    </div>
                    <div className="space-y-4 sm:space-y-6">
                      <div className="space-y-1">
                        <h4 className="font-semibold text-xs sm:text-sm text-muted-foreground">
                          {selectedApp.type === 'doctor' ? 'Clinic Name' : 'Center/Business Name'}
                        </h4>
                        <div className="text-sm sm:text-base">{selectedApp.name || 'Not specified'}</div>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-semibold text-xs sm:text-sm text-muted-foreground">Address</h4>
                        <div className="text-sm sm:text-base">{selectedApp.address || 'Not specified'}</div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        <div className="space-y-1">
                          <h4 className="font-semibold text-xs sm:text-sm text-muted-foreground">State</h4>
                          <div className="text-sm sm:text-base">{selectedApp.state || 'Not specified'}</div>
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-semibold text-xs sm:text-sm text-muted-foreground">District</h4>
                          <div className="text-sm sm:text-base">{selectedApp.district || 'Not specified'}</div>
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-semibold text-xs sm:text-sm text-muted-foreground">Pincode</h4>
                          <div className="text-sm sm:text-base">{selectedApp.pincode || 'Not specified'}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-1">
                          <h4 className="font-semibold text-xs sm:text-sm text-muted-foreground">Available Timings</h4>
                          <div className="text-sm sm:text-base">
                            {selectedApp.timeFrom && selectedApp.timeTo ? `${selectedApp.timeFrom} - ${selectedApp.timeTo}` : 'Not specified'}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-semibold text-xs sm:text-sm text-muted-foreground">Available Days</h4>
                          <div className="text-sm sm:text-base">
                            {selectedApp.dayFrom && selectedApp.dayTo ? `${selectedApp.dayFrom} - ${selectedApp.dayTo}` : 'Not specified'}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-semibold text-xs sm:text-sm text-muted-foreground">Website</h4>
                        <div className="text-sm sm:text-base">
                          {selectedApp.website ? (
                            <a href={selectedApp.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                              {selectedApp.website}
                            </a>
                          ) : 'Not specified'}
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Contact & Login Information Section */}
                  <section className="space-y-4 sm:space-y-6">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-1.5 h-6 sm:w-2 sm:h-8 bg-purple-600 rounded-full"></div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Contact & Login Information</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-1">
                        <h4 className="font-semibold text-xs sm:text-sm text-muted-foreground">Contact Email</h4>
                        <div className="text-sm sm:text-base break-all">{selectedApp.contactEmail || 'Not specified'}</div>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-semibold text-xs sm:text-sm text-muted-foreground">Contact Phone</h4>
                        <div className="text-sm sm:text-base">{selectedApp.contactPhone || 'Not specified'}</div>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-semibold text-xs sm:text-sm text-muted-foreground">Login Email</h4>
                        <div className="text-sm sm:text-base break-all">{selectedApp.email || 'Not specified'}</div>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-semibold text-xs sm:text-sm text-muted-foreground">Partner Type</h4>
                        <div className="text-sm sm:text-base capitalize">{selectedApp.type || 'Not specified'}</div>
                      </div>
                    </div>
                  </section>

                  {/* Registration Details Section */}
                  <section className="space-y-4 sm:space-y-6">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-1.5 h-6 sm:w-2 sm:h-8 bg-orange-600 rounded-full"></div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Registration Details</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="space-y-1">
                        <h4 className="font-semibold text-xs sm:text-sm text-muted-foreground">Council Name</h4>
                        <div className="text-sm sm:text-base">{selectedApp.council?.name || 'Not specified'}</div>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-semibold text-xs sm:text-sm text-muted-foreground">Council Number</h4>
                        <div className="text-sm sm:text-base">{selectedApp.council?.number || 'Not specified'}</div>
                      </div>
                      {(selectedApp.type === 'doctor' || selectedApp.type === 'dentist') && (
                        <div className="space-y-1 sm:col-span-2">
                          <h4 className="font-semibold text-xs sm:text-sm text-muted-foreground">Specialization</h4>
                          <div className="text-sm sm:text-base">{selectedApp.specialization || 'Not specified'}</div>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Document Uploads Section */}
                  <section className="space-y-4 sm:space-y-6">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-1.5 h-6 sm:w-2 sm:h-8 bg-red-600 rounded-full"></div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Document Uploads</h3>
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <h4 className="font-semibold mb-1 sm:mb-2 text-xs sm:text-sm text-muted-foreground">Certificate</h4>
                        {selectedApp.certificateFile ? (
                          selectedApp.certificateFile.includes('application/pdf') || selectedApp.certificateFile.toLowerCase().endsWith('.pdf') ? (
                            <a
                              href={assetUrl(selectedApp.certificateFile)}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 sm:gap-2 px-3 py-1 sm:px-4 sm:py-2 border rounded-lg hover:bg-blue-50 transition-colors text-xs sm:text-sm"
                            >
                              <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                              View Certificate (PDF)
                            </a>
                          ) : (
                            <img
                              src={assetUrl(selectedApp.certificateFile)}
                              alt="certificate"
                              className="h-24 w-32 sm:h-32 sm:w-48 object-cover rounded-lg cursor-pointer border hover:shadow-md transition-all"
                              onClick={() => openViewer(assetUrl(selectedApp.certificateFile))}
                              onError={(e) => {
                                e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDMTMuMSAyIDE0IDIuOSAxNCA0VjE2QzE0IDE3LjEgMTMuMSAxOCA5LjUgMTJDOS41IDE4IDkgMTcuMSAxOSA5QzkgOC45IDkuMSAxOCA5LjUgMTJDOS41IDE4IDEwIDE3LjEgMTAgMTZWMTRDMTAgMi45IDEwLjkgMiAxMiAyWk0xMiA3QzEyLjU1IDcgMTMgNy40NSAxMyA4UzEyLjU1IDkgMTIgOVMxMSA4LjU1IDExIDhTMTIuNDUgNyAxMiA3Wk0xMiAxNWMtMS42NiAwLTMtMS4zNC0zLTNTMTAuMzQgMTMgMTIgMTNTMTQuMzQgMTYgMTYgMTZTMzMuNjYgMTUgMTIgMTVaIiBmaWxsPSIjOWNhM2FmIi8+Cjwvc3ZnPgo=';
                                e.currentTarget.alt = 'Image not available';
                              }}
                            />
                          )
                        ) : (
                          <div className="text-xs sm:text-sm text-muted-foreground">No certificate uploaded</div>
                        )}
                      </div>

                      {(selectedApp.type === 'doctor' || selectedApp.type === 'dentist') && selectedApp.clinicPhotos && selectedApp.clinicPhotos.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-1 sm:mb-2 text-xs sm:text-sm text-muted-foreground">Clinic Photos ({selectedApp.clinicPhotos.length})</h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
                            {selectedApp.clinicPhotos.map((photo: string, index: number) => (
                              <img
                                key={index}
                                src={assetUrl(photo)}
                                alt={`clinic-${index + 1}`}
                                className="h-16 sm:h-20 w-full object-cover rounded-lg cursor-pointer border hover:shadow-md transition-all"
                                onClick={() => openViewer(assetUrl(photo))}
                                onError={(e) => {
                                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDMTMuMSAyIDE0IDIuOSAxNCA0VjE2QzE0IDE3LjEgMTMuMSAxOCA5LjUgMTJDOS41IDE4IDkgMTcuMSAxOSA5QzkgOC45IDkuMSAxOCA5LjUgMTJDOS41IDE4IDEwIDE3LjEgMTAgMTZWMTRDMTAgMi45IDEwLjkgMiAxMiAyWk0xMiA3QzEyLjU1IDcgMTMgNy40NSAxMyA4UzEyLjU1IDkgMTIgOVMxMSA4LjU1IDExIDhTMTIuNDUgNyAxMiA3Wk0xMiAxNWMtMS42NiAwLTMtMS4zNC0zLTNTMTAuMzQgMTMgMTIgMTNTMTQuMzQgMTYgMTYgMTZTMzMuNjYgMTUgMTIgMTVaIiBmaWxsPSIjOWNhM2FmIi8+Cjwvc3ZnPgo=';
                                  e.currentTarget.alt = 'Image not available';
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Discount Information Section */}
                  <section className="space-y-4 sm:space-y-6">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-1.5 h-6 sm:w-2 sm:h-8 bg-green-600 rounded-full"></div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Discount Information</h3>
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                      <div className="space-y-1">
                        <h4 className="font-semibold text-xs sm:text-sm text-muted-foreground">Discount Amount</h4>
                        <div className="text-sm sm:text-base">{selectedApp.discountAmount || 'Not specified'}</div>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-semibold text-xs sm:text-sm text-muted-foreground">Services/Procedures for Discount</h4>
                        <div className="text-sm sm:text-base">
                          {selectedApp.discountItems && selectedApp.discountItems.length > 0
                            ? selectedApp.discountItems.join(', ')
                            : 'Not specified'}
                        </div>
                      </div>
                    </div>
                  </section>

                  <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-3 sm:pt-4">
                    <Button variant="outline" onClick={closeAppDialog} className="text-sm w-full sm:w-auto">Close</Button>

                  </DialogFooter>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Image Viewer Dialog */}
          <Dialog open={!!viewerImage} onOpenChange={(v) => { if (!v) setViewerImage(null); }}>
            <DialogContent className="max-w-4xl w-full mx-2 sm:mx-4">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">Document Preview</DialogTitle>
                <DialogDescription className="text-sm sm:text-base">Enlarged view of the selected document</DialogDescription>
              </DialogHeader>
              <div className="flex justify-center items-center min-h-[50vh] sm:min-h-[60vh]">
                {viewerImage && (
                  <img
                    src={viewerImage}
                    alt="preview"
                    className="max-h-[50vh] sm:max-h-[60vh] max-w-full object-contain rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDMTMuMSAyIDE0IDIuOSAxNCA0VjE2QzE0IDE3LjEgMTMuMSAxOCA5LjUgMTJDOS41IDE4IDkgMTcuMSAxOSA5QzkgOC45IDkuMSAxOCA5LjUgMTJDOS41IDE4IDEwIDE3LjEgMTAgMTZWMTRDMTAgMi45IDEwLjkgMiAxMiAyWk0xMiA3QzEyLjU1IDcgMTMgNy40NSAxMyA4UzEyLjU1IDkgMTIgOVMxMSA4LjU1IDExIDhTMTIuNDUgNyAxMiA3Wk0xMiAxNWMtMS42NiAwLTMtMS4zNC0zLTNTMTAuMzQgMTMgMTIgMTNTMTQuMzQgMTYgMTYgMTZTMzMuNjYgMTUgMTIgMTVaIiBmaWxsPSIjOWNhM2FmIi8+Cjwvc3ZnPgo=';
                      e.currentTarget.alt = 'Image not available';
                    }}
                  />
                )}
              </div>
              <DialogFooter>
                <Button onClick={() => setViewerImage(null)} className="w-full sm:w-auto text-sm">Close Preview</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Query View Dialog */}
          <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
            <DialogContent className="max-w-2xl w-full mx-2 sm:mx-4">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">Query Details</DialogTitle>
                <DialogDescription className="text-sm sm:text-base">Full details of the user query</DialogDescription>
              </DialogHeader>
              {selectedQuery && (
                <div className="space-y-3 sm:space-y-4 mt-2">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-xs sm:text-sm text-muted-foreground">Subject</h3>
                    <div className="text-sm sm:text-base">{selectedQuery.subject}</div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-xs sm:text-sm text-muted-foreground">Message</h3>
                    <div className="text-sm sm:text-base whitespace-pre-line bg-muted/30 p-2 sm:p-3 rounded-lg">
                      {selectedQuery.message}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-xs sm:text-sm text-muted-foreground">User Details</h3>
                    <div className="text-sm sm:text-base">
                      {selectedQuery.name} • {selectedQuery.email} • {selectedQuery.phone}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-xs sm:text-sm text-muted-foreground">Status</h3>
                    <Badge variant={selectedQuery.status === 'pending' ? 'destructive' : selectedQuery.status === 'resolved' ? 'default' : 'secondary'} className="text-xs">
                      {selectedQuery.status}
                    </Badge>
                  </div>
                  <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-3 sm:pt-4">
                    <Button variant="outline" onClick={() => { setViewDialogOpen(false); setSelectedQuery(null); }} className="text-sm w-full sm:w-auto">
                      Close
                    </Button>
                    <Button
                      onClick={() => { updateQueryStatus(selectedQuery._id, 'resolved'); setViewDialogOpen(false); setSelectedQuery(null); }}
                      className="bg-green-600 hover:bg-green-700 text-sm w-full sm:w-auto"
                    >
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Mark as Resolved
                    </Button>
                  </DialogFooter>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Delete Partner Confirmation Dialog */}
          <Dialog open={deletePartnerDialog} onOpenChange={setDeletePartnerDialog}>
            <DialogContent className="max-w-md mx-2 sm:mx-4">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl text-red-600">Delete Partner</DialogTitle>
                <DialogDescription className="text-sm sm:text-base">
                  Are you sure you want to delete this partner? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              {partnerToDelete && (
                <div className="py-4">
                  <div className="space-y-2">
                    <div className="font-semibold">{partnerToDelete.name || partnerToDelete.clinicName}</div>
                    <div className="text-sm text-muted-foreground">{partnerToDelete.email || partnerToDelete.contactEmail}</div>
                    <div className="text-sm text-muted-foreground">{partnerToDelete.facilityType || partnerToDelete.type}</div>
                  </div>
                </div>
              )}
              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={() => { setDeletePartnerDialog(false); setPartnerToDelete(null); }} className="text-sm w-full sm:w-auto">
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => partnerToDelete && deletePartner(partnerToDelete._id)}
                  className="text-sm w-full sm:w-auto"
                >
                  <XCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Delete Partner
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete User Confirmation Dialog */}
          <Dialog open={deleteUserDialog} onOpenChange={setDeleteUserDialog}>
            <DialogContent className="max-w-md mx-2 sm:mx-4">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl text-red-600">Delete User</DialogTitle>
                <DialogDescription className="text-sm sm:text-base">
                  Are you sure you want to delete this user? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              {userToDelete && (
                <div className="py-4">
                  <div className="space-y-2">
                    <div className="font-semibold">{userToDelete.name}</div>
                    <div className="text-sm text-muted-foreground">{userToDelete.email}</div>
                    <div className="text-sm text-muted-foreground">Membership: {userToDelete.membershipId}</div>
                  </div>
                </div>
              )}
              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={() => { setDeleteUserDialog(false); setUserToDelete(null); }} className="text-sm w-full sm:w-auto">
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => userToDelete && deleteUser(userToDelete._id)}
                  className="text-sm w-full sm:w-auto"
                >
                  <XCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Delete User
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Bulk Upload Dialog */}
          <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
            <DialogContent className="max-w-xl mx-2 sm:mx-4">
              <DialogHeader>
                <DialogTitle className="text-xl sm:text-2xl">Bulk User Upload</DialogTitle>
                <DialogDescription className="text-sm sm:text-base">
                  Upload an Excel file (.xlsx) containing user details.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    id="bulk-file-upload"
                    className="hidden"
                    onChange={(e) => setBulkFile(e.target.files?.[0] || null)}
                  />
                  <label htmlFor="bulk-file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                    <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                    <span className="text-sm font-medium">
                      {bulkFile ? bulkFile.name : "Click to select Excel file"}
                    </span>
                    <span className="text-xs text-muted-foreground">Supported format: .xlsx</span>
                  </label>
                </div>

                {bulkFile && (
                  <div className="bg-blue-50 text-blue-700 p-3 rounded-md text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Ready to upload: {bulkFile.name}
                  </div>
                )}

                {uploadResult && (
                  <div className={`p-4 rounded-lg text-sm ${uploadResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    <div className="font-semibold mb-1">
                      {uploadResult.success ? 'Upload Successful!' : 'Upload Failed'}
                    </div>
                    {uploadResult.success ? (
                      <div>
                        <p>{uploadResult.message}</p>
                        <ul className="mt-2 list-disc list-inside space-y-1">
                          <li>Total Processed: {uploadResult.summary.total}</li>
                          <li>Success: {uploadResult.summary.success}</li>
                          <li>Failed: {uploadResult.summary.failure}</li>
                        </ul>
                        {uploadResult.errors && uploadResult.errors.length > 0 && (
                          <div className="mt-3">
                            <div className="font-semibold text-xs uppercase tracking-wide opacity-70 mb-1">Errors:</div>
                            <ul className="space-y-1 max-h-32 overflow-y-auto text-xs bg-white/50 p-2 rounded">
                              {uploadResult.errors.map((err: any, i: number) => (
                                <li key={i}>Row: {JSON.stringify(err.row)} - {err.error}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p>{uploadResult.message}</p>
                    )}
                  </div>
                )}
              </div>

              <DialogFooter className="flex gap-2">
                <Button variant="outline" onClick={() => setBulkDialogOpen(false)}>Close</Button>
                <Button
                  onClick={handleBulkUpload}
                  disabled={!bulkFile || isUploading}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isUploading ? "Uploading..." : "Upload Users"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Bulk Partner Upload Dialog */}
          <Dialog open={bulkPartnerDialogOpen} onOpenChange={setBulkPartnerDialogOpen}>
            <DialogContent className="max-w-xl mx-2 sm:mx-4">
              <DialogHeader>
                <DialogTitle className="text-xl sm:text-2xl">Bulk Partner/Doctor Upload</DialogTitle>
                <DialogDescription className="text-sm sm:text-base">
                  Upload an Excel file (.xlsx) containing partner details.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    id="bulk-partner-file-upload"
                    className="hidden"
                    onChange={(e) => setBulkPartnerFile(e.target.files?.[0] || null)}
                  />
                  <label htmlFor="bulk-partner-file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                    <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                    <span className="text-sm font-medium">
                      {bulkPartnerFile ? bulkPartnerFile.name : "Click to select Excel file"}
                    </span>
                    <span className="text-xs text-muted-foreground">Supported format: .xlsx</span>
                  </label>
                </div>

                {bulkPartnerFile && (
                  <div className="bg-blue-50 text-blue-700 p-3 rounded-md text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Ready to upload: {bulkPartnerFile.name}
                  </div>
                )}

                {partnerUploadResult && (
                  <div className={`p-4 rounded-lg text-sm ${partnerUploadResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    <div className="font-semibold mb-1">
                      {partnerUploadResult.success ? 'Upload Successful!' : 'Upload Failed'}
                    </div>
                    {partnerUploadResult.success ? (
                      <div>
                        <p>{partnerUploadResult.message}</p>
                        <ul className="mt-2 list-disc list-inside space-y-1">
                          <li>Total Processed: {partnerUploadResult.summary.total}</li>
                          <li>Success: {partnerUploadResult.summary.success}</li>
                          <li>Failed: {partnerUploadResult.summary.failure}</li>
                        </ul>
                        {partnerUploadResult.errors && partnerUploadResult.errors.length > 0 && (
                          <div className="mt-3">
                            <div className="font-semibold text-xs uppercase tracking-wide opacity-70 mb-1">Errors:</div>
                            <ul className="space-y-1 max-h-32 overflow-y-auto text-xs bg-white/50 p-2 rounded">
                              {partnerUploadResult.errors.map((err: any, i: number) => (
                                <li key={i}>Row: {JSON.stringify(err.row)} - {err.error}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p>{partnerUploadResult.message}</p>
                    )}
                  </div>
                )}
              </div>

              <DialogFooter className="flex gap-2">
                <Button variant="outline" onClick={() => setBulkPartnerDialogOpen(false)}>Close</Button>
                <Button
                  onClick={handleBulkPartnerUpload}
                  disabled={!bulkPartnerFile || isPartnerUploading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isPartnerUploading ? "Uploading..." : "Upload Partners"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div >
    </div >
  );
};

export default Admin;
