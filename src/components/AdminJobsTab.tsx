import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, Plus, Search, MapPin, Trash2, Edit2, Link as LinkIcon, ExternalLink, Calendar, FileText, User } from 'lucide-react';
import { apiUrl } from "@/lib/api";

const AdminJobsTab = () => {
    const { toast } = useToast();

    // Data States
    const [jobs, setJobs] = useState<any[]>([]);
    const [applications, setApplications] = useState<any[]>([]);
    const [loadingJobs, setLoadingJobs] = useState(true);
    const [loadingApps, setLoadingApps] = useState(true);

    // Form States
    const [isJobModalOpen, setIsJobModalOpen] = useState(false);
    const [editingJob, setEditingJob] = useState<any | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        type: 'Full-time',
        requirements: '', // comma separated string for easy input
        isActive: true
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchJobs();
        fetchApplications();
    }, []);

    const fetchJobs = async () => {
        setLoadingJobs(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(apiUrl('api/jobs/admin/all'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setJobs(data.data);
            }
        } catch (err) {
            console.error("Error fetching jobs:", err);
            toast({ title: "Error", description: "Could not fetch jobs", variant: "destructive" });
        } finally {
            setLoadingJobs(false);
        }
    };

    const fetchApplications = async () => {
        setLoadingApps(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(apiUrl('api/jobs/admin/applications'), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setApplications(data.data);
            }
        } catch (err) {
            console.error("Error fetching applications:", err);
            toast({ title: "Error", description: "Could not fetch applications", variant: "destructive" });
        } finally {
            setLoadingApps(false);
        }
    };

    const handleOpenJobModal = (job: any = null) => {
        if (job) {
            setEditingJob(job);
            setFormData({
                title: job.title,
                description: job.description,
                location: job.location,
                type: job.type,
                requirements: job.requirements.join(', '),
                isActive: job.isActive
            });
        } else {
            setEditingJob(null);
            setFormData({
                title: '',
                description: '',
                location: '',
                type: 'Full-time',
                requirements: '',
                isActive: true
            });
        }
        setIsJobModalOpen(true);
    };

    const handleSaveJob = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        const payload = {
            ...formData,
            requirements: formData.requirements.split(',').map(r => r.trim()).filter(r => r !== '')
        };

        try {
            const token = localStorage.getItem('token');
            const url = editingJob
                ? apiUrl(`api/jobs/${editingJob._id}`)
                : apiUrl('api/jobs');

            const res = await fetch(url, {
                method: editingJob ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (data.success) {
                toast({ title: "Success", description: editingJob ? "Job updated" : "Job posted successfully" });
                setIsJobModalOpen(false);
                fetchJobs(); // Refresh jobs list
            } else {
                toast({ title: "Failed", description: data.message, variant: "destructive" });
            }
        } catch (err) {
            console.error("Error saving job:", err);
            toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" });
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleActive = async (job: any) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(apiUrl(`api/jobs/${job._id}`), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ isActive: !job.isActive })
            });
            const data = await res.json();
            if (data.success) {
                setJobs(jobs.map(j => j._id === job._id ? { ...j, isActive: !j.isActive } : j));
                toast({ title: "Status Updated", description: `Job is now ${!job.isActive ? 'Active' : 'Inactive'}` });
            }
        } catch (err) {
            console.error("Error toggling status:", err);
            toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
        }
    };

    const handleDeleteJob = async (id: string) => {
        if (!confirm('Are you sure you want to delete this job? This will also remove all associated applications.')) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(apiUrl(`api/jobs/${id}`), {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setJobs(jobs.filter(j => j._id !== id));
                toast({ title: "Job Deleted", description: "The job has been removed." });
                fetchApplications(); // Refresh apps since some might be deleted
            }
        } catch (err) {
            console.error("Error deleting job:", err);
            toast({ title: "Error", description: "Failed to delete job", variant: "destructive" });
        }
    };

    return (
        <Card className="border-0 shadow-lg rounded-xl sm:rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-teal-50 to-emerald-50 pb-6 border-b">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-teal-100 rounded-lg">
                            <Briefcase className="h-6 w-6 text-teal-600" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl">Careers & Recruitment</CardTitle>
                            <CardDescription>
                                Post new job openings and review submitted applications.
                            </CardDescription>
                        </div>
                    </div>
                    <Button onClick={() => handleOpenJobModal()} className="bg-teal-600 hover:bg-teal-700">
                        <Plus className="h-4 w-4 mr-2" /> Post New Job
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <Tabs defaultValue="jobs" className="w-full">
                    <div className="px-6 pt-4 pb-2 border-b bg-gray-50/50">
                        <TabsList className="bg-white border rounded-lg h-12 p-1">
                            <TabsTrigger value="jobs" className="h-10 px-6 rounded-md data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700">
                                Manage Jobs
                            </TabsTrigger>
                            <TabsTrigger value="applications" className="h-10 px-6 rounded-md data-[state=active]:bg-teal-50 data-[state=active]:text-teal-700 flex gap-2 items-center">
                                View Applications
                                <Badge variant="secondary" className="bg-teal-100 text-teal-700">{applications.length}</Badge>
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Manage Jobs Tab */}
                    <TabsContent value="jobs" className="p-6 m-0 outline-none">
                        {loadingJobs ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin h-8 w-8 border-b-2 border-teal-600 rounded-full"></div>
                            </div>
                        ) : jobs.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground border border-dashed rounded-xl bg-gray-50">
                                <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-40 text-teal-400" />
                                <p className="text-lg font-medium">No jobs posted yet</p>
                                <p className="text-sm">Click "Post New Job" to get started.</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {jobs.map(job => (
                                    <div key={job._id} className="border rounded-xl p-5 hover:border-teal-200 transition-colors bg-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1.5">
                                                <h3 className="font-bold text-lg truncate text-gray-900">{job.title}</h3>
                                                <Badge variant={job.isActive ? "default" : "secondary"} className={job.isActive ? "bg-emerald-500 hover:bg-emerald-600" : ""}>
                                                    {job.isActive ? 'Active' : 'Closed'}
                                                </Badge>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {job.location}</span>
                                                <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> {job.type}</span>
                                                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {new Date(job.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 md:justify-end shrink-0">
                                            <Button variant="outline" size="sm" onClick={() => handleToggleActive(job)}>
                                                {job.isActive ? 'Mark Closed' : 'Mark Active'}
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => handleOpenJobModal(job)} className="text-blue-600 border-blue-200 hover:bg-blue-50">
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => handleDeleteJob(job._id)} className="text-red-600 border-red-200 hover:bg-red-50">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Applications Tab */}
                    <TabsContent value="applications" className="p-6 m-0 outline-none">
                        {loadingApps ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin h-8 w-8 border-b-2 border-teal-600 rounded-full"></div>
                            </div>
                        ) : applications.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground border border-dashed rounded-xl bg-gray-50">
                                <FileText className="h-12 w-12 mx-auto mb-4 opacity-40 text-teal-400" />
                                <p className="text-lg font-medium">No applications found</p>
                                <p className="text-sm">Job applications will appear here once submitted.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                                {applications.map(app => (
                                    <div key={app._id} className="border rounded-xl bg-white shadow-sm overflow-hidden flex flex-col">
                                        <div className="bg-gray-50/80 px-4 py-3 border-b flex justify-between items-start">
                                            <div>
                                                <div className="text-xs font-semibold uppercase tracking-wider text-teal-700 mb-1">Applied For</div>
                                                <div className="font-semibold text-gray-900 line-clamp-1">{app.jobId?.title || 'Deleted Position'}</div>
                                            </div>
                                            <span className="text-xs text-gray-500 whitespace-nowrap">{new Date(app.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="p-4 flex-1">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                                                    <User className="h-5 w-5 text-slate-500" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-bold text-gray-900 truncate">{app.applicantName}</div>
                                                    <div className="text-sm text-gray-500 truncate">{app.applicantEmail}</div>
                                                </div>
                                            </div>

                                            <div className="space-y-2 mb-4">
                                                <div className="text-sm text-gray-700"><span className="text-gray-400">Phone:</span> {app.applicantPhone}</div>
                                            </div>
                                        </div>
                                        <div className="px-4 py-3 bg-gray-50/50 border-t mt-auto">
                                            <Button variant="outline" className="w-full flex gap-2" asChild>
                                                <a href={app.resumeLink} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="h-4 w-4 text-blue-600" /> View Resume
                                                </a>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>

            {/* Job Modal */}
            <Dialog open={isJobModalOpen} onOpenChange={setIsJobModalOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingJob ? 'Edit Job Posting' : 'Create New Job'}</DialogTitle>
                        <DialogDescription>
                            {editingJob ? 'Update the details of the job listing.' : 'Fill out the details to post a new position on the careers page.'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSaveJob} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Job Title <span className="text-red-500">*</span></Label>
                            <Input
                                id="title" required
                                value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g. Senior Backend Engineer"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="location">Location <span className="text-red-500">*</span></Label>
                                <Input
                                    id="location" required
                                    value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })}
                                    placeholder="e.g. Remote, Hyderabad"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="type">Job Type <span className="text-red-500">*</span></Label>
                                <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Full-time">Full-time</SelectItem>
                                        <SelectItem value="Part-time">Part-time</SelectItem>
                                        <SelectItem value="Contract">Contract</SelectItem>
                                        <SelectItem value="Internship">Internship</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Job Description <span className="text-red-500">*</span></Label>
                            <Textarea
                                id="description" required className="min-h-[120px]"
                                value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe the role and responsibilities..."
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="requirements">Requirements (Comma Separated)</Label>
                            <Textarea
                                id="requirements" className="min-h-[80px]"
                                value={formData.requirements} onChange={e => setFormData({ ...formData, requirements: e.target.value })}
                                placeholder="e.g. 5+ years React, Node.js experience, Excellent communication"
                            />
                            <p className="text-xs text-muted-foreground">Separate each requirement with a comma.</p>
                        </div>

                        <div className="flex items-center space-x-2 pt-2">
                            <input
                                type="checkbox"
                                id="isActive"
                                className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                checked={formData.isActive}
                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            />
                            <Label htmlFor="isActive" className="font-normal">
                                Publish immediately (Active)
                            </Label>
                        </div>

                        <DialogFooter className="pt-4 border-t mt-6">
                            <DialogClose asChild>
                                <Button type="button" variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button type="submit" className="bg-teal-600 hover:bg-teal-700" disabled={submitting}>
                                {submitting ? "Saving..." : "Save Job"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </Card>
    );
};

export default AdminJobsTab;
