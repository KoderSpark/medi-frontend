import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, MapPin, Building2, Phone, Mail, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { apiUrl } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

interface ClaimListingStepProps {
    role: "doctor" | "dentist";
    onContinueNew: () => void;
    onClaimSuccess: (token: string) => void;
    onBack: () => void;
}

const ClaimListingStep = ({ role, onContinueNew, onClaimSuccess, onBack }: ClaimListingStepProps) => {
    const { toast } = useToast();

    const [step, setStep] = useState<"initial" | "search" | "claim_options" | "otp_verify" | "manual_claim">("initial");

    // Search state
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    // Selected doctor
    const [selectedDoctor, setSelectedDoctor] = useState<any>(null);

    // OTP state
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [maskedEmail, setMaskedEmail] = useState("");

    // Manual claim state
    const [manualName, setManualName] = useState("");
    const [manualEmail, setManualEmail] = useState("");
    const [manualPhone, setManualPhone] = useState("");
    const [isSubmittingManual, setIsSubmittingManual] = useState(false);
    const [manualSuccessDialog, setManualSuccessDialog] = useState(false);

    // 1. Initial Step: "Is your clinic listed?"
    if (step === "initial") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-4 px-3 flex items-center justify-center">
                <Card className="max-w-2xl w-full shadow-2xl border-0 rounded-2xl">
                    <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-2xl pb-6 pt-6 px-6">
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" onClick={onBack} className="text-white hover:bg-white/20 rounded-full p-2 h-10 w-10">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <div>
                                <CardTitle className="text-2xl font-bold">Fast-Track Registration</CardTitle>
                                <CardDescription className="text-blue-100 text-sm mt-1">
                                    Speed up your registration by claiming your existing directory listing.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 text-center space-y-8">
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Building2 className="h-10 w-10 text-blue-600" />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-2xl font-semibold text-gray-900">Is your clinic already listed in our directory?</h3>
                            <p className="text-gray-600 text-base max-w-md mx-auto">
                                If your clinic is already visible to patients on MEDI COST SAVER, you can claim it instantly to activate your Provider Dashboard.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                            <Button
                                onClick={() => setStep("search")}
                                className="bg-blue-600 hover:bg-blue-700 text-white py-6 px-8 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all h-auto"
                            >
                                Yes, find my clinic
                            </Button>
                            <Button
                                variant="outline"
                                onClick={onContinueNew}
                                className="py-6 px-8 text-lg rounded-xl border-2 hover:bg-gray-50 transition-all h-auto"
                            >
                                No, create new account
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        setHasSearched(true);
        try {
            const res = await fetch(apiUrl(`api/doctors?service=${encodeURIComponent(searchQuery)}`));
            const data = await res.json();
            if (data.success) {
                setSearchResults(data.data || []);
            } else {
                setSearchResults([]);
            }
        } catch (err) {
            console.error(err);
            toast({ title: "Search failed", description: "Unable to find clinics at the moment.", variant: "destructive" });
        } finally {
            setIsSearching(false);
        }
    };

    // 2. Search Step
    if (step === "search") {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-4 px-3 flex items-start justify-center pt-10">
                <Card className="max-w-3xl w-full shadow-xl border-0 rounded-2xl">
                    <CardHeader className="border-b px-6 py-4 flex flex-row items-center gap-3">
                        <Button variant="ghost" onClick={() => setStep("initial")} className="h-8 w-8 p-0 rounded-full">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <CardTitle className="text-xl">Find Your Clinic</CardTitle>
                            <CardDescription>Search by your name, clinic name, or specialization</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="flex gap-3 mb-6">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <Input
                                    placeholder="e.g. Dr. Sharma, City Clinic, Dentist..."
                                    className="pl-10 py-6 text-lg rounded-xl bg-gray-50 focus:bg-white transition-colors"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </div>
                            <Button
                                onClick={handleSearch}
                                disabled={isSearching || !searchQuery.trim()}
                                className="py-6 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                {isSearching ? "Searching..." : "Search"}
                            </Button>
                        </div>

                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                            {hasSearched && searchResults.length === 0 && !isSearching && (
                                <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                    <p className="text-gray-600 mb-4">We couldn't find a matching clinic.</p>
                                    <Button onClick={onContinueNew} variant="outline">Create a new account instead</Button>
                                </div>
                            )}

                            {searchResults.map((doc) => (
                                <div key={doc._id} className="p-4 sm:p-5 border rounded-xl hover:border-blue-300 hover:shadow-md transition-all bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div className="space-y-2 flex-1">
                                        <h4 className="font-bold text-lg text-gray-900">{doc.name}</h4>
                                        {doc.clinicName && <p className="text-blue-700 text-sm font-medium flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" /> {doc.clinicName}</p>}
                                        <div className="text-sm text-gray-600 flex flex-wrap gap-x-4 gap-y-1">
                                            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {doc.city}, {doc.state}</span>
                                            <span className="flex items-center gap-1">Category: {doc.category || doc.specialization}</span>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => {
                                            setSelectedDoctor(doc);
                                            setStep("claim_options");
                                        }}
                                        disabled={doc.isClaimed}
                                        className="shrink-0 rounded-lg whitespace-nowrap"
                                        variant={doc.isClaimed ? "secondary" : "default"}
                                    >
                                        {doc.isClaimed ? "Already Claimed" : "Claim This Profile"}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // 3. Claim Options Step
    if (step === "claim_options" && selectedDoctor) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-4 px-3 flex items-center justify-center">
                <Card className="max-w-2xl w-full shadow-2xl border-0 rounded-2xl overflow-hidden">
                    <CardHeader className="bg-blue-50 border-b px-6 py-5 flex flex-row items-center gap-3">
                        <Button variant="ghost" onClick={() => setStep("search")} className="h-8 w-8 p-0 rounded-full bg-white hover:bg-gray-100 shadow-sm">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <CardTitle className="text-xl text-blue-900">Claim Profile: {selectedDoctor.name}</CardTitle>
                            <CardDescription>How would you like to verify ownership?</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 md:p-8 space-y-6">
                        <div className="grid gap-6">
                            <div
                                className="border-2 border-blue-100 rounded-xl p-6 hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer transition-all group"
                                onClick={async () => {
                                    // Request OTP
                                    setIsSendingOtp(true);
                                    try {
                                        const res = await fetch(apiUrl('api/claims/otp'), {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ doctorId: selectedDoctor._id })
                                        });
                                        const data = await res.json();
                                        if (data.success) {
                                            setMaskedEmail(data.maskedEmail);
                                            setStep("otp_verify");
                                            toast({ title: "OTP Sent", description: "Please check your email for the verification code." });
                                        } else {
                                            toast({ title: "Failed", description: data.message, variant: "destructive" });
                                        }
                                    } catch (err) {
                                        toast({ title: "Error", description: "Failed to send OTP", variant: "destructive" });
                                    } finally {
                                        setIsSendingOtp(false);
                                    }
                                }}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="bg-blue-100 p-3 rounded-full text-blue-600 group-hover:scale-110 transition-transform">
                                        <Mail className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-gray-900 mb-1">Verify via Email OTP</h4>
                                        <p className="text-gray-600 text-sm">
                                            We will send a 6-digit one-time password to the registered email address for this clinic.
                                        </p>
                                        {isSendingOtp && <span className="text-blue-600 text-sm font-medium mt-2 inline-block">Sending...</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="relative flex items-center py-2">
                                <div className="flex-grow border-t border-gray-200"></div>
                                <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-medium">OR</span>
                                <div className="flex-grow border-t border-gray-200"></div>
                            </div>

                            <div
                                className="border-2 border-gray-200 rounded-xl p-6 hover:border-gray-300 hover:bg-gray-50 cursor-pointer transition-all group"
                                onClick={() => setStep("manual_claim")}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="bg-gray-200 p-3 rounded-full text-gray-600 group-hover:scale-110 transition-transform">
                                        <Phone className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-gray-900 mb-1">My phone/email has changed</h4>
                                        <p className="text-gray-600 text-sm">
                                            Submit a manual claim request. Our team will review your details and contact you to grant access.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // 4. OTP Verification Step
    if (step === "otp_verify") {
        const handleVerify = async () => {
            if (!otp || !newPassword) {
                toast({ title: "Validation Error", description: "Please enter OTP and a new password", variant: "destructive" });
                return;
            }
            if (newPassword.length < 6) {
                toast({ title: "Validation Error", description: "Password must be at least 6 characters", variant: "destructive" });
                return;
            }

            setIsVerifying(true);
            try {
                const res = await fetch(apiUrl('api/claims/verify'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ doctorId: selectedDoctor._id, otp, password: newPassword })
                });
                const data = await res.json();
                if (data.success) {
                    toast({ title: "Success!", description: "Clinic claimed successfully! Welcome to your dashboard." });
                    onClaimSuccess(data.token);
                } else {
                    toast({ title: "Verification Failed", description: data.message, variant: "destructive" });
                }
            } catch (err) {
                toast({ title: "Error", description: "An error occurred during verification.", variant: "destructive" });
            } finally {
                setIsVerifying(false);
            }
        };

        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-4 px-3 flex items-center justify-center">
                <Card className="max-w-md w-full shadow-2xl border-0 rounded-2xl">
                    <CardHeader className="text-center pb-2">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="h-8 w-8 text-blue-600" />
                        </div>
                        <CardTitle className="text-2xl font-bold">Verify Ownership</CardTitle>
                        <CardDescription className="text-base mt-2">
                            An OTP has been sent to <strong>{maskedEmail}</strong>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-5">
                        <div className="space-y-2">
                            <Label className="font-semibold text-gray-700">Enter 6-digit OTP</Label>
                            <Input
                                type="text"
                                placeholder="123456"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="text-center text-2xl tracking-[0.5em] py-6 font-mono rounded-xl focus:ring-blue-500"
                                maxLength={6}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-semibold text-gray-700">Set New Dashboard Password</Label>
                            <Input
                                type="password"
                                placeholder="Minimum 6 characters"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="py-5 rounded-xl border-gray-300 focus:ring-blue-500"
                            />
                        </div>
                        <Button
                            className="w-full py-6 text-lg rounded-xl bg-blue-600 hover:bg-blue-700 text-white mt-4 shadow-lg"
                            onClick={handleVerify}
                            disabled={isVerifying}
                        >
                            {isVerifying ? "Verifying..." : "Verify & Claim Clinic"}
                        </Button>
                        <div className="text-center mt-4">
                            <button onClick={() => setStep("claim_options")} className="text-sm text-gray-500 hover:text-blue-600 underline">
                                Use another method instead
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // 5. Manual Claim Step
    if (step === "manual_claim") {
        const submitManualClaim = async () => {
            if (!manualName || !manualEmail || !manualPhone) {
                toast({ title: "Missing Fields", description: "Please fill in all your details.", variant: "destructive" });
                return;
            }

            setIsSubmittingManual(true);
            try {
                const res = await fetch(apiUrl('api/claims/manual'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        doctorId: selectedDoctor._id,
                        name: manualName,
                        email: manualEmail,
                        phone: manualPhone
                    })
                });
                const data = await res.json();
                if (data.success) {
                    setManualSuccessDialog(true);
                } else {
                    toast({ title: "Submission Failed", description: data.message, variant: "destructive" });
                }
            } catch (err) {
                toast({ title: "Error", description: "An error occurred while submitting.", variant: "destructive" });
            } finally {
                setIsSubmittingManual(false);
            }
        };

        return (
            <>
                <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-4 px-3 flex items-center justify-center">
                    <Card className="max-w-xl w-full shadow-2xl border-0 rounded-2xl">
                        <CardHeader className="bg-gray-50 border-b px-6 py-5 flex flex-row items-center gap-3">
                            <Button variant="ghost" onClick={() => setStep("claim_options")} className="h-8 w-8 p-0 rounded-full bg-white shadow-sm hover:bg-gray-100">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <div>
                                <CardTitle className="text-xl">Manual Claim Request</CardTitle>
                                <CardDescription>Provide your current contact details for verification.</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 md:p-8 space-y-5">
                            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-xl text-sm mb-2">
                                Our team will manually verify your request against public records or by calling your registered clinic number before granting access.
                            </div>
                            <div className="space-y-2">
                                <Label className="font-semibold text-gray-700">Your Full Name</Label>
                                <Input value={manualName} onChange={(e) => setManualName(e.target.value)} className="py-5 rounded-xl bg-gray-50 focus:bg-white transition-colors" placeholder="Dr. First Last" />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-semibold text-gray-700">Current Contact Email</Label>
                                <Input type="email" value={manualEmail} onChange={(e) => setManualEmail(e.target.value)} className="py-5 rounded-xl bg-gray-50 focus:bg-white transition-colors" placeholder="doctor@clinic.com" />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-semibold text-gray-700">Current Phone Number</Label>
                                <Input value={manualPhone} onChange={(e) => setManualPhone(e.target.value)} className="py-5 rounded-xl bg-gray-50 focus:bg-white transition-colors" placeholder="+91 XXXXXXXXXX" />
                            </div>
                            <Button
                                className="w-full py-6 text-lg rounded-xl bg-gray-900 hover:bg-black text-white mt-6 shadow-lg"
                                onClick={submitManualClaim}
                                disabled={isSubmittingManual}
                            >
                                {isSubmittingManual ? "Submitting..." : "Submit Claim Request"}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <Dialog open={manualSuccessDialog} onOpenChange={(open) => {
                    if (!open) { setManualSuccessDialog(false); window.location.href = '/'; }
                }}>
                    <DialogContent className="rounded-2xl max-w-sm text-center p-6">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <DialogTitle className="text-xl">Request Submitted</DialogTitle>
                        <DialogDescription className="mt-2 text-base text-gray-600">
                            Your manual claim request has been sent to our admin team. They will review it and contact you on the provided email/phone within 24-48 hours.
                        </DialogDescription>
                        <Button className="w-full mt-6 bg-green-600 hover:bg-green-700 rounded-xl" onClick={() => window.location.href = '/'}>
                            Return to Home
                        </Button>
                    </DialogContent>
                </Dialog>
            </>
        );
    }

    return null;
};

export default ClaimListingStep;
