
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiUrl } from "@/lib/api";
import { Loader2, Save, User, Building, Phone, Globe, MapPin, CheckCircle2, AlertCircle, Pencil, X, FileText, Upload, Image as ImageIcon, Eye, Download } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const PartnerProfile = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false); // New state for edit mode
    const [completion, setCompletion] = useState(0);
    const [formData, setFormData] = useState<any>({
        // Basic
        type: '',
        source: '',
        mobile1: '',
        mobile2: '',
        mobile3: '',
        mobile4: '',
        phone: '',
        residentialPhone: '',
        fax: '',
        website: '',
        contactEmail: '',

        // Clinic
        clinicName: '', // or name
        address: '',
        district: '',
        city: '',
        state: '',
        pincode: '',

        // Responsible
        responsible: {
            name: '',
            dob: '',
            designation: '',
        },

        specialization: '',

        // Docs
        certificateFile: '',
        clinicPhotos: [] as string[],
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setFormData((prev: any) => ({ ...prev, [field]: base64String }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const newPhotos: string[] = [...formData.clinicPhotos];
            Array.from(files).forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    newPhotos.push(reader.result as string);
                    // Update state only after last one? Or just force update. 
                    // Simple implementation:
                    setFormData((prev: any) => ({ ...prev, clinicPhotos: [...prev.clinicPhotos, reader.result as string] }));
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removePhoto = (index: number) => {
        setFormData((prev: any) => ({
            ...prev,
            clinicPhotos: prev.clinicPhotos.filter((_: any, i: number) => i !== index)
        }));
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    useEffect(() => {
        calculateCompletion();
    }, [formData]);

    const calculateCompletion = () => {
        // Define fields that count towards completion
        const fieldsToCheck = [
            formData.type,
            formData.responsible?.name,
            formData.specialization,
            formData.responsible?.designation,
            formData.clinicName,
            formData.address,
            formData.city,
            formData.district,
            formData.state,
            formData.pincode,
            formData.mobile1,
            formData.contactEmail
        ];

        // Additional optional but encouraged fields can be weighted or added here
        // For now, simple count of filled important fields
        const totalFields = fieldsToCheck.length;
        const filledFields = fieldsToCheck.filter(field => field && field.trim() !== '').length;

        const percentage = Math.round((filledFields / totalFields) * 100);
        setCompletion(percentage);
    };

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('partnerToken');
            const response = await fetch(apiUrl('api/partners/profile'), {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                // Flatten or structure data as needed for the form
                setFormData({
                    ...data,
                    // Ensure nested objects exist
                    responsible: data.responsible || { name: '', dob: '', designation: '' },
                    clinicName: data.clinicName || data.name, // Use name as clinicName if clinicName defaults
                    mobile1: data.mobile1 || data.contactPhone || '', // Fallback
                    clinicPhotos: data.clinicPhotos || [],
                    certificateFile: data.certificateFile || '',
                });
            } else {
                toast({
                    title: "Error",
                    description: "Failed to load profile",
                    variant: "destructive"
                });
            }
        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Network error",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        if (id.includes('.')) {
            const [parent, child] = id.split('.');
            setFormData((prev: any) => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData((prev: any) => ({ ...prev, [id]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const token = localStorage.getItem('partnerToken');

            const payload = {
                ...formData,
                contactPhone: formData.mobile1, // Ensure sync
                name: formData.clinicName, // Ensure clinic name sync
            };

            const response = await fetch(apiUrl('api/partners/profile'), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Profile updated successfully",
                    className: "bg-green-50 border-green-200 text-green-800"
                });
                fetchProfile(); // Refresh
                setIsEditing(false); // Exit edit mode on save
            } else {
                const err = await response.json();
                toast({
                    title: "Error",
                    description: err.message || "Failed to update profile",
                    variant: "destructive"
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Network error",
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    };

    const toggleEdit = () => {
        if (isEditing) {
            // Cancel edit - reload original data
            fetchProfile();
        }
        setIsEditing(!isEditing);
    };

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>;
    }

    return (
        <div className="space-y-6">
            {/* Completion Indicator */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-blue-900">Profile Completion</h3>
                            {completion === 100 ? (
                                <Badge variant="default" className="bg-green-600 hover:bg-green-700">Complete</Badge>
                            ) : (
                                <Badge variant="secondary" className="bg-white/50 text-blue-700">In Progress</Badge>
                            )}
                        </div>
                        <span className="font-bold text-blue-700">{completion}%</span>
                    </div>
                    <Progress value={completion} className="h-2 bg-blue-200" indicatorClassName="bg-blue-600" />
                </CardContent>
            </Card>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Header Actions */}
                <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm sticky top-0 z-10">
                    <div>
                        <h2 className="text-lg font-semibold">Profile Details</h2>
                        <p className="text-sm text-slate-500">
                            {isEditing ? "Make changes below and click save." : "View your profile information."}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {!isEditing ? (
                            <Button type="button" onClick={toggleEdit} variant="outline" className="border-primary text-primary hover:bg-primary/5">
                                <Pencil className="mr-2 h-4 w-4" /> Edit Profile
                            </Button>
                        ) : (
                            <>
                                <Button type="button" onClick={toggleEdit} variant="ghost" disabled={saving}>
                                    <X className="mr-2 h-4 w-4" /> Cancel
                                </Button>
                                <Button type="submit" disabled={saving}>
                                    {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Basic Information */}
                <Card>
                    <CardHeader className="pb-4 border-b">
                        <div className="flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" />
                            <CardTitle>Basic Information</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="type">Category</Label>
                            <Input id="type" value={formData.type} onChange={handleChange} placeholder="e.g. Doctor, Clinic" disabled={!isEditing} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="source">Source (Read Only)</Label>
                            <Input id="source" value={formData.source} disabled className="bg-muted" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="responsible.name">Doctor / Responsible Name *</Label>
                            <Input id="responsible.name" value={formData.responsible.name} onChange={handleChange} required disabled={!isEditing} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="specialization">Specialisation</Label>
                            <Input id="specialization" value={formData.specialization} onChange={handleChange} disabled={!isEditing} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="responsible.dob">D.O.B.</Label>
                            <Input id="responsible.dob" type="date" value={formData.responsible.dob} onChange={handleChange} disabled={!isEditing} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="responsible.designation">Designation</Label>
                            <Input id="responsible.designation" value={formData.responsible.designation} onChange={handleChange} disabled={!isEditing} />
                        </div>
                    </CardContent>
                </Card>

                {/* Clinic / Institute Details */}
                <Card>
                    <CardHeader className="pb-4 border-b">
                        <div className="flex items-center gap-2">
                            <Building className="h-5 w-5 text-primary" />
                            <CardTitle>Clinic / Institute Details</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 grid md:grid-cols-2 gap-4">
                        <div className="col-span-2 space-y-2">
                            <Label htmlFor="clinicName">Clinic / Institute Name</Label>
                            <Input id="clinicName" value={formData.clinicName} onChange={handleChange} disabled={!isEditing} />
                        </div>
                        <div className="col-span-2 space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <Input id="address" value={formData.address} onChange={handleChange} placeholder="Full Address" disabled={!isEditing} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input id="city" value={formData.city} onChange={handleChange} disabled={!isEditing} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="district">District</Label>
                            <Input id="district" value={formData.district} onChange={handleChange} disabled={!isEditing} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="state">State</Label>
                            <Input id="state" value={formData.state} onChange={handleChange} disabled={!isEditing} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="pincode">Pin Code</Label>
                            <Input id="pincode" value={formData.pincode} onChange={handleChange} disabled={!isEditing} />
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Information */}
                <Card>
                    <CardHeader className="pb-4 border-b">
                        <div className="flex items-center gap-2">
                            <Phone className="h-5 w-5 text-primary" />
                            <CardTitle>Contact Information</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="mobile1">Mobile-1 (Primary) *</Label>
                            <Input id="mobile1" value={formData.mobile1} onChange={handleChange} required disabled={!isEditing} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="mobile2">Mobile-2</Label>
                            <Input id="mobile2" value={formData.mobile2} onChange={handleChange} disabled={!isEditing} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="mobile3">Mobile-3</Label>
                            <Input id="mobile3" value={formData.mobile3} onChange={handleChange} disabled={!isEditing} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="mobile4">Mobile-4</Label>
                            <Input id="mobile4" value={formData.mobile4} onChange={handleChange} disabled={!isEditing} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone No.</Label>
                            <Input id="phone" value={formData.phone} onChange={handleChange} disabled={!isEditing} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="residentialPhone">Resi. No.</Label>
                            <Input id="residentialPhone" value={formData.residentialPhone} onChange={handleChange} disabled={!isEditing} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="fax">Fax No.</Label>
                            <Input id="fax" value={formData.fax} onChange={handleChange} disabled={!isEditing} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="contactEmail">E-Mail ID</Label>
                            <Input id="contactEmail" type="email" value={formData.contactEmail} onChange={handleChange} disabled={!isEditing} />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <Label htmlFor="website">Web Site</Label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input id="website" className="pl-9" value={formData.website} onChange={handleChange} placeholder="https://" disabled={!isEditing} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
};

export default PartnerProfile;
