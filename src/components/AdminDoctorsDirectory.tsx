import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Loader2, ChevronLeft, ChevronRight, Stethoscope, MapPin, Building2, Users } from "lucide-react";
import { apiUrl } from "@/lib/api";

interface Doctor {
    _id: string;
    name: string;
    clinicName: string;
    specialization: string;
    category: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
    email: string;
    source: string;
}

interface Analytics {
    specialization: { _id: string; count: number }[];
    city: { _id: string; count: number }[];
    state: { _id: string; count: number }[];
    category: { _id: string; count: number }[];
}

const AdminDoctorsDirectory = () => {
    const [data, setData] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [analytics, setAnalytics] = useState<Analytics>({
        specialization: [],
        city: [],
        state: [],
        category: []
    });

    // Filters state
    const [filters, setFilters] = useState({
        name: "",
        specialization: "",
        city: "",
        category: "",
        clinic: ""
    });

    // Debounced fetch
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchDoctors();
        }, 500);
        return () => clearTimeout(timer);
    }, [filters, page]);

    const fetchDoctors = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: "20",
                ...filters
            });

            // Remove empty filters
            Array.from(queryParams.keys()).forEach(key => {
                if (!queryParams.get(key)) queryParams.delete(key);
            });

            const res = await fetch(apiUrl(`api/doctors/admin?${queryParams.toString()}`));
            const result = await res.json();

            if (result.success) {
                setData(result.data);
                setTotal(result.total);
                setPages(result.pages);
                setAnalytics(result.analytics);
            }
        } catch (error) {
            console.error("Failed to fetch doctors:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setPage(1); // Reset to page 1 on filter change
    };

    return (
        <div className="space-y-6">
            {/* Analytics Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Uploaded</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{total}</div>
                        <p className="text-xs text-muted-foreground">Doctors from Admin Upload</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Top Specialization</CardTitle>
                        <Stethoscope className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.specialization[0]?._id || "-"}</div>
                        <p className="text-xs text-muted-foreground">
                            {analytics.specialization[0]?.count || 0} doctors
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Top City</CardTitle>
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.city[0]?._id || "-"}</div>
                        <p className="text-xs text-muted-foreground">
                            {analytics.city[0]?.count || 0} doctors
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Top Category</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{analytics.category[0]?._id || "-"}</div>
                        <p className="text-xs text-muted-foreground">
                            {analytics.category[0]?.count || 0} doctors
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Filter Directory
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Doctor Name</label>
                            <Input
                                placeholder="Search name..."
                                name="name"
                                value={filters.name}
                                onChange={handleFilterChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Specialization</label>
                            <Input
                                placeholder="Cardiologist..."
                                name="specialization"
                                value={filters.specialization}
                                onChange={handleFilterChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">City</label>
                            <Input
                                placeholder="Mumbai..."
                                name="city"
                                value={filters.city}
                                onChange={handleFilterChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Clinic</label>
                            <Input
                                placeholder="Clinic name..."
                                name="clinic"
                                value={filters.clinic}
                                onChange={handleFilterChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Category</label>
                            <Input
                                placeholder="General..."
                                name="category"
                                value={filters.category}
                                onChange={handleFilterChange}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Results Table */}
            <Card>
                <CardContent className="p-0">
                    <div className="relative w-full overflow-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Doctor Name</TableHead>
                                    <TableHead>Specialization</TableHead>
                                    <TableHead>Clinic</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Contact</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Loader2 className="h-6 w-6 animate-spin" />
                                                Loading...
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                            No doctors found matching filters.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data.map((doc) => (
                                        <TableRow key={doc._id}>
                                            <TableCell className="font-medium">{doc.name}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{doc.specialization || doc.category}</Badge>
                                            </TableCell>
                                            <TableCell>{doc.clinicName}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span>{doc.city}, {doc.state}</span>
                                                    <span className="text-xs text-muted-foreground">{doc.pincode}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col text-sm">
                                                    <span>{doc.phone}</span>
                                                    <span className="text-xs text-muted-foreground">{doc.email}</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between px-4 py-4 border-t">
                        <div className="text-sm text-muted-foreground">
                            Page {page} of {pages} ({total} records)
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1 || loading}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.min(pages, p + 1))}
                                disabled={page === pages || loading}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminDoctorsDirectory;
