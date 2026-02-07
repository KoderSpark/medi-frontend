
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Heart, Users, Building2, CreditCard, TrendingUp, Calendar, Stethoscope, Pill, Microscope, CheckCircle, XCircle, Search, History, UserCheck, BarChart3, ChevronLeft, ChevronRight, User as UserIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { apiUrl } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import PartnerProfile from "../components/partners/PartnerProfile";
import PartnerSidebar from "../components/PartnerSidebar";

import ActivityLogCard from "../components/ActivityLogCard";

const PartnerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [partner, setPartner] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState("recent-visits");
  // ... existing states
  const [logs, setLogs] = React.useState([]); // New Logs state

  React.useEffect(() => {
    // ... existing auth logic
  }, [navigate]);



  // New function to load logs
  const loadPartnerLogs = async () => {
    const token = localStorage.getItem('partnerToken');
    if (!token) return;
    try {
      const response = await fetch(apiUrl('api/activity/partner'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        setLogs(await response.json());
      }
    } catch (error) {
      console.error("Failed to load logs", error);
    }
  };

  React.useEffect(() => {
    if (partner) {
      loadPartnerStats();
      loadPartnerVisits();
      loadPartnerLogs(); // Fetch logs
    }
  }, [partner]);

  // existing handlers...

  // In Render, Dashboard Tab:
  /*
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">...Stats Cards...</div>
            <Card>...Recent Visits...</Card>
        </div>
        <div>
            <ActivityLogCard logs={logs} title="Your Recent Activity" />
        </div>
    </div>
  */
  const [membershipId, setMembershipId] = React.useState('');
  const [verificationResult, setVerificationResult] = React.useState<any>(null);
  const [verifying, setVerifying] = React.useState(false);
  const [recordingVisit, setRecordingVisit] = React.useState(false);
  const [stats, setStats] = React.useState({
    membersServed: 0,
    monthlyVisits: 0,
    totalRevenue: 0,
    averageDiscount: '12.5%'
  });

  // Recent visits data with pagination
  const [recentVisits, setRecentVisits] = React.useState<any[]>([]);
  const [visitsPagination, setVisitsPagination] = React.useState({
    currentPage: 1,
    totalPages: 1,
    totalVisits: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 10
  });
  const [loadingVisits, setLoadingVisits] = React.useState(false);

  React.useEffect(() => {
    const token = localStorage.getItem('partnerToken');
    if (!token) {
      navigate('/partner/login');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      setPartner({
        id: payload.id,
        email: payload.email,
        type: payload.type,
        name: 'Partner'
      });
    } catch (e) {
      localStorage.removeItem('partnerToken');
      navigate('/partner/login');
      return;
    }

    setLoading(false);
  }, [navigate]);

  const loadPartnerStats = async () => {
    const token = localStorage.getItem('partnerToken');
    if (!token) return;

    try {
      const response = await fetch(apiUrl('api/partners/partner-stats'), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to load partner stats:', error);
    }
  };

  const loadPartnerVisits = async (page = 1) => {
    const token = localStorage.getItem('partnerToken');
    if (!token) return;

    setLoadingVisits(true);
    try {
      const response = await fetch(apiUrl(`api/partners/partner-visits?page=${page}&limit=10`), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setRecentVisits(data.visits);
        setVisitsPagination(data.pagination);
      }
    } catch (error) {
      console.error('Failed to load partner visits:', error);
    } finally {
      setLoadingVisits(false);
    }
  };

  React.useEffect(() => {
    if (partner) {
      loadPartnerStats();
      loadPartnerVisits();
    }
  }, [partner]);

  const handleLogout = () => {
    localStorage.removeItem('partnerToken');
    navigate('/partner/login');
  };

  const handleVerifyMembership = async () => {
    if (!membershipId.trim()) return;

    setVerifying(true);
    setVerificationResult(null);

    try {
      const token = localStorage.getItem('partnerToken');
      const response = await fetch(apiUrl('api/partners/verify'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ membershipId: membershipId.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setVerificationResult({ success: true, member: data.member });
      } else {
        setVerificationResult({ success: false, message: data.message || 'Verification failed' });
      }
    } catch (error) {
      setVerificationResult({ success: false, message: 'Network error. Please try again.' });
    } finally {
      setVerifying(false);
    }
  };

  const handleRecordVisit = async () => {
    if (!verificationResult?.success || !partner?.id) return;

    setRecordingVisit(true);
    try {
      const discountPercent = parseFloat(verificationResult.member.discount.replace('%', '')) || 0;
      const token = localStorage.getItem('partnerToken');

      const response = await fetch(apiUrl('api/partners/visit'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          membershipId: membershipId,
          partnerId: partner.id,
          service: 'Membership Verification',
          discountApplied: discountPercent,
          savedAmount: 0
        }),
      });

      if (response.ok) {
        // Refresh both stats and visits
        loadPartnerStats();
        loadPartnerVisits();
        setMembershipId('');
        setVerificationResult(null);
        toast({
          title: "Visit Recorded",
          description: "The member visit has been recorded successfully.",
        });
      } else {
        toast({
          title: "Recording Failed",
          description: "Failed to record visit. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      alert('Network error. Please try again.');
    } finally {
      setRecordingVisit(false);
    }
  };

  const getPartnerColor = (type: string) => {
    switch (type) {
      case 'doctor': return 'from-blue-50 to-cyan-50';
      case 'diagnostic': return 'from-purple-50 to-violet-50';
      case 'pharmacy': return 'from-green-50 to-emerald-50';
      default: return 'from-slate-50 to-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!partner) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <PartnerSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        partnerType={partner.type}
      />

      {/* Main Content */}
      <div className="flex-1 min-w-0 overflow-auto h-screen">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Tabs value={activeTab} className="space-y-6">

            {/* Dashboard / Visits View */}
            <TabsContent value="recent-visits" className="m-0 space-y-6 animate-in fade-in-50 slide-in-from-bottom-2">

              {/* Stats Header */}
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
                <p className="text-slate-500">Overview of your clinic performance and visits.</p>
              </div>

              {/* Stats Grid */}
              <div className="lg:col-span-3 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Stats Cards + Recent Visits */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <Card className="border-0 shadow-sm hover:shadow-md transition-all">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-slate-500">Members Served</p>
                              <p className="text-2xl font-bold text-slate-900 mt-1">{stats.membersServed.toLocaleString()}</p>
                              <p className="text-xs text-green-600 font-medium mt-1">Total patients</p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                              <Users className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-0 shadow-sm hover:shadow-md transition-all">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-slate-500">Revenue</p>
                              <p className="text-2xl font-bold text-slate-900 mt-1">₹{stats.totalRevenue.toLocaleString()}</p>
                              <p className="text-xs text-green-600 font-medium mt-1">Total earnings</p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center">
                              <CreditCard className="h-5 w-5 text-green-600" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-0 shadow-sm hover:shadow-md transition-all">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-slate-500">Avg. Discount</p>
                              <p className="text-2xl font-bold text-slate-900 mt-1">{stats.averageDiscount}</p>
                              <p className="text-xs text-green-600 font-medium mt-1">Average offered</p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center">
                              <TrendingUp className="h-5 w-5 text-purple-600" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-0 shadow-sm hover:shadow-md transition-all">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-slate-500">This Month</p>
                              <p className="text-2xl font-bold text-slate-900 mt-1">{stats.monthlyVisits}</p>
                              <p className="text-xs text-slate-500 font-medium mt-1">total visits</p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center">
                              <Calendar className="h-5 w-5 text-orange-600" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Recent Visits Table */}
                    <Card className="border-0 shadow-sm rounded-xl">
                      <CardHeader className="bg-white border-b border-slate-100">
                        <h3 className="text-lg font-semibold text-slate-900">Recent Visits</h3>
                        <CardDescription>History of member visits and discounts</CardDescription>
                      </CardHeader>
                      <CardContent className="p-0">
                        {loadingVisits ? (
                          <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          </div>
                        ) : (
                          <div className="divide-y divide-slate-100">
                            {recentVisits.length === 0 ? (
                              <div className="text-center py-12">
                                <History className="h-12 w-12 text-slate-200 mx-auto mb-3" />
                                <h3 className="text-base font-medium text-slate-900">No visits recorded yet</h3>
                                <p className="text-slate-500 text-sm mt-1">Visits will appear here once you record them.</p>
                                <Button
                                  variant="outline"
                                  className="mt-4"
                                  onClick={() => setActiveTab('verify-membership')}
                                >
                                  Verify Member
                                </Button>
                              </div>
                            ) : (
                              recentVisits.slice(0, 5).map((visit) => ( // Show only top 5 here
                                <div key={visit.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <UserCheck className="h-5 w-5 text-primary" />
                                      </div>
                                      <div>
                                        <p className="font-medium text-slate-900">{visit.memberName}</p>
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                          <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-xs">{visit.membershipId}</span>
                                          <span>•</span>
                                          <span>{visit.service}</span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="flex items-center justify-end gap-2">
                                        <Badge variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-100">
                                          {visit.discount} OFF
                                        </Badge>
                                      </div>
                                      <p className="text-xs text-slate-400 mt-1">
                                        {visit.date} {visit.time}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}

                        {/* Pagination - Simplified for dashboard view, maybe add 'View All' link instead */}
                        {recentVisits.length > 5 && (
                          <div className="p-3 text-center border-t border-slate-50">
                            <Button variant="ghost" size="sm" className="text-primary" onClick={() => setActiveTab('recent-visits')}>View All Visits</Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right Column: Activity Logs */}
                  <div>
                    <ActivityLogCard logs={logs} title="Your Recent Activity" />
                  </div>
                </div>
              </div>

              {/* Recent Visits Table */}
              <Card className="border-0 shadow-sm rounded-xl">
                <CardHeader className="bg-white border-b border-slate-100">
                  <h3 className="text-lg font-semibold text-slate-900">Recent Visits</h3>
                  <CardDescription>History of member visits and discounts</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {loadingVisits ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {recentVisits.length === 0 ? (
                        <div className="text-center py-12">
                          <History className="h-12 w-12 text-slate-200 mx-auto mb-3" />
                          <h3 className="text-base font-medium text-slate-900">No visits recorded yet</h3>
                          <p className="text-slate-500 text-sm mt-1">Visits will appear here once you record them.</p>
                          <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => setActiveTab('verify-membership')}
                          >
                            Verify Member
                          </Button>
                        </div>
                      ) : (
                        recentVisits.map((visit) => (
                          <div key={visit.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                  <UserCheck className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                  <p className="font-medium text-slate-900">{visit.memberName}</p>
                                  <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-xs">{visit.membershipId}</span>
                                    <span>•</span>
                                    <span>{visit.service}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Badge variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-100">
                                    {visit.discount} OFF
                                  </Badge>
                                </div>
                                <p className="text-xs text-slate-400 mt-1">
                                  {visit.date} {visit.time}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Pagination */}
                  {visitsPagination.totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-slate-100">
                      <div className="text-sm text-slate-500">
                        Page {visitsPagination.currentPage} of {visitsPagination.totalPages}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => loadPartnerVisits(visitsPagination.currentPage - 1)}
                          disabled={!visitsPagination.hasPrevPage || loadingVisits}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => loadPartnerVisits(visitsPagination.currentPage + 1)}
                          disabled={!visitsPagination.hasNextPage || loadingVisits}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Verify Membership Tab */}
            <TabsContent value="verify-membership" className="m-0 animate-in fade-in-50 slide-in-from-bottom-2">
              <div className="max-w-2xl mx-auto py-8">
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">Verify Membership</h1>
                  <p className="text-slate-500 mt-1">Check member eligibility and record services.</p>
                </div>

                <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                  <CardHeader className={`bg-gradient-to-r ${getPartnerColor(partner.type)} pb-6`}>
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-white/30 backdrop-blur rounded-xl">
                        <Search className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-8 px-6 pb-6">
                    <div className="space-y-6">

                      {/* Search Box */}
                      <div className="space-y-2">
                        <Label htmlFor="membershipId" className="sr-only">Membership ID</Label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                          <Input
                            id="membershipId"
                            placeholder="Enter Membership ID (e.g., MED001)"
                            value={membershipId}
                            onChange={(e) => setMembershipId(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleVerifyMembership()}
                            className="pl-10 h-12 text-lg rounded-xl transition-all border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          />
                        </div>
                      </div>

                      <Button
                        onClick={handleVerifyMembership}
                        disabled={verifying || !membershipId.trim()}
                        size="lg"
                        className="w-full h-12 text-base rounded-xl font-medium shadow-lg shadow-primary/20"
                      >
                        {verifying ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white mr-2"></div>
                            Verifying...
                          </>
                        ) : (
                          'Verify Member'
                        )}
                      </Button>

                      {/* Results Section - Reusing previous Alert logic but styled simpler */}
                      {verificationResult && (
                        <div className={`rounded-xl p-6 border-2 transition-all ${verificationResult.success ? 'bg-green-50/50 border-green-100' : 'bg-red-50/50 border-red-100'}`}>
                          <div className="flex items-start gap-4">
                            <div className={`p-2 rounded-full shrink-0 ${verificationResult.success ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                              {verificationResult.success ? <CheckCircle className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
                            </div>
                            <div className="space-y-4 flex-1">
                              {verificationResult.success ? (
                                <>
                                  <div>
                                    <h4 className="text-lg font-bold text-slate-900">{verificationResult.member.name}</h4>
                                    <p className="text-slate-500 font-mono text-sm">{verificationResult.member.membershipId}</p>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white p-3 rounded-lg border border-green-100">
                                      <p className="text-xs text-slate-400 uppercase font-semibold">Discount</p>
                                      <p className="text-xl font-bold text-green-600">{verificationResult.member.discount}</p>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg border border-slate-100">
                                      <p className="text-xs text-slate-400 uppercase font-semibold">Valid Until</p>
                                      <p className="text-sm font-medium text-slate-900 mt-1">
                                        {new Date(verificationResult.member.validUntil).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>

                                  <Button
                                    onClick={handleRecordVisit}
                                    disabled={recordingVisit}
                                    className="w-full bg-green-600 hover:bg-green-700 h-11"
                                  >
                                    {recordingVisit ? 'Recording...' : 'Record Visit & Apply Discount'}
                                  </Button>
                                </>
                              ) : (
                                <div>
                                  <h4 className="font-semibold text-red-900">Verification Failed</h4>
                                  <p className="text-red-600 text-sm mt-1">{verificationResult.message}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile" className="m-0 animate-in fade-in-50 slide-in-from-bottom-2">
              <div className="max-w-4xl mx-auto py-6">
                <div className="mb-6">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Profile</h1>
                  <p className="text-slate-500">Manage your clinic details and contact information.</p>
                </div>
                <PartnerProfile />
              </div>
            </TabsContent>

          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default PartnerDashboard;
