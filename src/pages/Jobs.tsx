import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, MapPin, Search, Link as LinkIcon } from 'lucide-react';
import { apiUrl } from "@/lib/api";

const Jobs = () => {
    const { toast } = useToast();
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Application modal state
    const [selectedJob, setSelectedJob] = useState<any | null>(null);
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

    // Form state
    const [applicantName, setApplicantName] = useState('');
    const [applicantEmail, setApplicantEmail] = useState('');
    const [applicantPhone, setApplicantPhone] = useState('');
    const [resumeLink, setResumeLink] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const res = await fetch(apiUrl('api/jobs'));
            const data = await res.json();
            if (data.success) {
                setJobs(data.data);
            } else {
                toast({ title: "Failed to load jobs", description: data.message, variant: "destructive" });
            }
        } catch (error) {
            console.error("Error fetching jobs:", error);
            toast({ title: "Error", description: "Failed to fetch jobs.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleApplyClick = (job: any) => {
        setSelectedJob(job);
        setIsApplyModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsApplyModalOpen(false);
        setSelectedJob(null);
        setApplicantName('');
        setApplicantEmail('');
        setApplicantPhone('');
        setResumeLink('');
    };

    const handleSubmitApplication = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedJob) return;

        setSubmitting(true);
        try {
            const res = await fetch(apiUrl(`api/jobs/${selectedJob._id}/apply`), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    applicantName,
                    applicantEmail,
                    applicantPhone,
                    resumeLink
                })
            });

            const data = await res.json();

            if (data.success) {
                toast({ title: "Application Submitted!", description: "We have received your application." });
                handleCloseModal();
            } else {
                toast({ title: "Submission Failed", description: data.message, variant: "destructive" });
            }
        } catch (error) {
            console.error("Error submitting application:", error);
            toast({ title: "Error", description: "An unexpected error occurred. Please try again.", variant: "destructive" });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50/50">
            <main className="flex-1">
                {/* Header Section */}
                <section className="bg-gradient-to-b from-blue-50 to-white py-16 md:py-24 border-b">
                    <div className="container mx-auto px-4 text-center max-w-3xl">
                        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-6">
                            Join Our Mission
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground mb-8">
                            We are building the future of healthcare accessibility. Join MEDICO and help us make a difference.
                        </p>
                    </div>
                </section>

                {/* Jobs Listing Section */}
                <section className="py-16 md:py-24">
                    <div className="container mx-auto px-4 max-w-5xl">
                        <div className="flex justify-between items-center mb-10">
                            <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                                <Briefcase className="h-6 w-6 text-blue-600" />
                                Open Positions
                            </h2>
                            <Badge variant="outline" className="px-3 py-1 bg-blue-50 text-blue-700 border-blue-200">
                                {jobs.length} {jobs.length === 1 ? 'Job' : 'Jobs'} Available
                            </Badge>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-20">
                                <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full"></div>
                            </div>
                        ) : jobs.length === 0 ? (
                            <Card className="border-dashed shadow-sm">
                                <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                                    <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                        <Search className="h-8 w-8 text-slate-400" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">No open positions currently</h3>
                                    <p className="text-muted-foreground max-w-md">
                                        We're not actively hiring right now, but please check back later for new opportunities.
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-6">
                                {jobs.map((job) => (
                                    <Card key={job._id} className="group border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300">
                                        <CardHeader className="md:flex-row md:items-start justify-between gap-4 pb-4">
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 uppercase tracking-widest text-[10px]">
                                                        {job.type}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <MapPin className="h-3 w-3" /> {job.location}
                                                    </span>
                                                </div>
                                                <CardTitle className="text-xl md:text-2xl group-hover:text-blue-700 transition-colors">
                                                    {job.title}
                                                </CardTitle>
                                            </div>
                                            <Button onClick={() => handleApplyClick(job)} className="w-full md:w-auto mt-4 md:mt-0 shadow-sm" size="lg">
                                                Apply Now
                                            </Button>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-gray-600 whitespace-pre-wrap">{job.description}</p>

                                            {job.requirements && job.requirements.length > 0 && (
                                                <div className="mt-6">
                                                    <h4 className="font-semibold text-sm uppercase tracking-wider text-gray-500 mb-3">Requirements</h4>
                                                    <ul className="grid sm:grid-cols-2 gap-2">
                                                        {job.requirements.map((req: string, idx: number) => (
                                                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                                                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                                                                {req}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </main>

            {/* Application Modal */}
            <Dialog open={isApplyModalOpen} onOpenChange={setIsApplyModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl">{selectedJob?.title}</DialogTitle>
                        <DialogDescription>
                            Submit your application for this position. We'll be in touch!
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmitApplication} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
                            <Input
                                id="name"
                                required
                                value={applicantName}
                                onChange={e => setApplicantName(e.target.value)}
                                placeholder="John Doe"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    value={applicantEmail}
                                    onChange={e => setApplicantEmail(e.target.value)}
                                    placeholder="john@example.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone <span className="text-red-500">*</span></Label>
                                <Input
                                    id="phone"
                                    required
                                    value={applicantPhone}
                                    onChange={e => setApplicantPhone(e.target.value)}
                                    placeholder="+91 9876543210"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="resume" className="flex items-center gap-2">
                                Resume / CV Link <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="resume"
                                    type="url"
                                    required
                                    value={resumeLink}
                                    onChange={e => setResumeLink(e.target.value)}
                                    className="pl-9"
                                    placeholder="https://drive.google.com/file/d/..."
                                />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Please provide a viewable Google Drive link to your resume.
                            </p>
                        </div>

                        <DialogFooter className="pt-4 border-t mt-6">
                            <DialogClose asChild>
                                <Button type="button" variant="outline" onClick={handleCloseModal}>Cancel</Button>
                            </DialogClose>
                            <Button type="submit" disabled={submitting} className="min-w-32">
                                {submitting ? "Submitting..." : "Submit Application"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Jobs;
