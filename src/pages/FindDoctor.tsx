import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Search, Phone, Mail, Building2, User } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import { apiUrl } from "@/lib/api";

interface Doctor {
    _id: string;
    name: string;
    clinicName?: string;
    specialization?: string;
    address1?: string;
    city?: string;
    district?: string;
    state?: string;
    pincode?: string;
    phone?: string;
    email?: string;
    website?: string;
    category?: string;
}

const FindDoctor = () => {
    const [service, setService] = useState("");
    const [location, setLocation] = useState("");
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!service.trim() && !location.trim()) {
            toast.error("Please enter a service or location to search.");
            return;
        }

        setLoading(true);
        setHasSearched(true);
        setDoctors([]);

        try {
            const queryParams = new URLSearchParams();
            if (service) queryParams.append("service", service);
            if (location) queryParams.append("location", location);

            const response = await fetch(apiUrl(`api/doctors?${queryParams.toString()}`));
            const data = await response.json();

            if (data.success) {
                setDoctors(data.data);
                if (data.data.length === 0) {
                    toast.info("No doctors found matching your criteria.");
                }
            } else {
                toast.error(data.message || "Failed to fetch doctors.");
            }
        } catch (error) {
            console.error("Search error:", error);
            toast.error("An error occurred while searching. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Helmet>
                <title>Find a Doctor | Medico Cost Saver</title>
                <meta name="description" content="Search for doctors, clinics, and medical services in your area." />
            </Helmet>

            {/* Hero / Search Section */}
            <section className="bg-primary/5 py-12 md:py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center space-y-6">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-primary">
                            Find Your Doctor
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Search for specialists, clinics, and hospitals near you.
                        </p>

                        <Card className="border-none shadow-lg mt-8">
                            <CardContent className="p-6">
                                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            placeholder="Service, Doctor, or Clinic (e.g. Dentist)"
                                            value={service}
                                            onChange={(e) => setService(e.target.value)}
                                            className="pl-10 h-12 text-base"
                                        />
                                    </div>
                                    <div className="flex-1 relative">
                                        <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            placeholder="Location (City, District, Pin Code)"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            className="pl-10 h-12 text-base"
                                        />
                                    </div>
                                    <Button type="submit" size="lg" className="h-12 px-8 text-base font-semibold" disabled={loading}>
                                        {loading ? "Searching..." : "Search"}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Results Section */}
            <section className="py-12 bg-background">
                <div className="container mx-auto px-4">
                    {doctors.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {doctors.map((doctor) => (
                                <Card key={doctor._id} className="hover:shadow-md transition-shadow duration-200 border-border/50">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-xl font-bold text-foreground">
                                                    {doctor.name}
                                                </CardTitle>
                                                {doctor.specialization && (
                                                    <p className="text-sm font-medium text-emerald-600 mt-1">
                                                        {doctor.specialization}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="bg-primary/10 p-2 rounded-full">
                                                <User className="h-5 w-5 text-primary" />
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3 text-sm">
                                        {doctor.clinicName && (
                                            <div className="flex items-start gap-2 text-muted-foreground">
                                                <Building2 className="h-4 w-4 mt-0.5 shrink-0" />
                                                <span>{doctor.clinicName}</span>
                                            </div>
                                        )}

                                        <div className="flex items-start gap-2 text-muted-foreground">
                                            <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                                            <span>
                                                {[doctor.address1, doctor.city, doctor.district, doctor.state, doctor.pincode]
                                                    .filter(Boolean)
                                                    .join(", ")}
                                            </span>
                                        </div>

                                        {(doctor.phone || doctor.email) && (
                                            <div className="pt-3 border-t border-border mt-3 space-y-2">
                                                {doctor.phone && (
                                                    <div className="flex items-center gap-2 text-foreground font-medium">
                                                        <Phone className="h-4 w-4 text-primary" />
                                                        <span>{doctor.phone}</span>
                                                    </div>
                                                )}
                                                {doctor.email && (
                                                    <div className="flex items-center gap-2 text-muted-foreground">
                                                        <Mail className="h-4 w-4" />
                                                        <span>{doctor.email}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            {hasSearched ? (
                                <div className="space-y-3">
                                    <p className="text-xl font-medium text-muted-foreground">No matches found</p>
                                    <p className="text-muted-foreground">Try adjusting your filters or search for a broader area.</p>
                                </div>
                            ) : (
                                <div className="space-y-3 opacity-50">
                                    <Search className="h-16 w-16 mx-auto text-muted-foreground/50" />
                                    <p className="text-xl font-medium text-muted-foreground">Enter details above to find a doctor</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default FindDoctor;
