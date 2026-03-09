import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, CheckCircle, XCircle, Clock, FileText, User as UserIcon, Phone, Mail } from "lucide-react";
import { apiUrl } from "@/lib/api";

const AdminClaimsTab = () => {
    const { toast } = useToast();
    const [claims, setClaims] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchClaims = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(apiUrl('api/claims/admin/pending'), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (data.success) {
                setClaims(data.data || []);
            } else {
                toast({ title: "Failed to load claims", description: data.message, variant: "destructive" });
            }
        } catch (err) {
            console.error("Error fetching claims:", err);
            toast({ title: "Error", description: "Could not fetch pending claims", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClaims();
    }, []);

    const handleAction = async (claimId: string, action: 'approve' | 'reject') => {
        setActionLoading(claimId);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(apiUrl(`api/claims/admin/${claimId}/action`), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ action })
            });

            const data = await res.json();
            if (data.success) {
                toast({
                    title: `Claim ${action === 'approve' ? 'Approved' : 'Rejected'}`,
                    description: action === 'approve' ? "Partner account created and credentials emailed." : "Claim has been rejected."
                });
                // Remove from local list
                setClaims(prev => prev.filter(c => c._id !== claimId));
            } else {
                toast({ title: "Action Failed", description: data.message, variant: "destructive" });
            }
        } catch (err) {
            console.error("Error updating claim:", err);
            toast({ title: "Error", description: `Could not ${action} the claim.`, variant: "destructive" });
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <Card className="border-0 shadow-lg rounded-xl sm:rounded-2xl">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <ShieldCheck className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl">Pending Clinic Claims</CardTitle>
                        <CardDescription>
                            Review manual requests from providers trying to claim listed clinics.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                {claims.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground bg-gray-50 border border-dashed rounded-xl">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-40 text-blue-400" />
                        <p className="text-lg font-medium">No pending claims</p>
                        <p className="text-sm">You are all caught up!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {claims.map((claim) => (
                            <Card key={claim._id} className="border border-blue-100 hover:shadow-md transition-shadow">
                                <CardHeader className="pb-3 border-b bg-gray-50/50">
                                    <div className="flex justify-between items-start">
                                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 uppercase text-[10px] tracking-wider font-semibold">
                                            Pending Review
                                        </Badge>
                                        <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {new Date(claim.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="pt-2">
                                        <h3 className="font-bold text-lg text-gray-900 leading-tight">
                                            {claim.doctorId?.name || "Unknown Doctor"}
                                        </h3>
                                        {claim.doctorId?.clinicName && (
                                            <p className="text-sm text-blue-700 font-medium">
                                                {claim.doctorId.clinicName}
                                            </p>
                                        )}
                                        <div className="mt-1 text-xs text-gray-500 line-clamp-1">
                                            ID: {claim.doctorId?._id}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="py-4 space-y-3">
                                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Claimant Details</div>
                                    <div className="space-y-2">
                                        <div className="flex items-start gap-2">
                                            <UserIcon className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                                            <span className="text-sm font-medium text-gray-800">{claim.requestedBy.name}</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Mail className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                                            <span className="text-sm text-gray-600 break-all">{claim.requestedBy.email}</span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Phone className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                                            <span className="text-sm text-gray-600">{claim.requestedBy.phone}</span>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-0 border-t bg-gray-50/50 flex flex-col gap-2 p-4">
                                    <Button
                                        className="w-full bg-green-600 hover:bg-green-700"
                                        onClick={() => handleAction(claim._id, 'approve')}
                                        disabled={actionLoading === claim._id}
                                    >
                                        {actionLoading === claim._id ? "Processing..." : <><CheckCircle className="h-4 w-4 mr-2" /> Approve & Send Credentials</>}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                        onClick={() => handleAction(claim._id, 'reject')}
                                        disabled={actionLoading === claim._id}
                                    >
                                        <XCircle className="h-4 w-4 mr-2" /> Reject Claim
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default AdminClaimsTab;
