import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiUrl } from "@/lib/api";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from "@/components/ui/loading";
import { Helmet } from "react-helmet-async";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = React.useState('admin@local.test');
  const [password, setPassword] = React.useState('admin123');
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(apiUrl('api/auth/admin/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const body = await res.json();
      if (!res.ok) {
        toast({
          title: "Login Failed",
          description: body?.message || 'Please check your credentials.',
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      const token = body.token;
      if (!token) {
        toast({
          title: "Login Error",
          description: 'Authentication failed. Please try again.',
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      localStorage.setItem('token', token);
      toast({
        title: "Login Successful",
        description: "Welcome back, Admin!",
      });
      navigate('/admin');
    } catch (err) {
      console.error(err);
      toast({
        title: "Connection Error",
        description: "Unable to connect to the server. Please check your internet connection.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Login | MEDI COST SAVER</title>
      </Helmet>
      <Navbar />
      <div className="min-h-[calc(100-72px)] flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/30 p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* SVG Illustration - Hidden on mobile, visible on LG screens */}
          <div className="hidden lg:block animate-in fade-in slide-in-from-left-8 duration-700">
            <img
              src="/src/assets/Mobile login-cuate.svg"
              alt="Admin Login Illustration"
              className="w-full h-auto max-w-lg mx-auto drop-shadow-2xl"
            />
          </div>

          <Card className="w-full max-w-md mx-auto border-0 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-right-8 duration-700">
            <div className="h-2 bg-primary w-full" />
            <CardHeader className="text-center pt-8">
              <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Admin Portal
              </CardTitle>
              <CardDescription className="text-sm sm:text-base mt-2">
                Secure access to platform management
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11 border-slate-200 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" id="password-label" className="text-sm font-medium">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 border-slate-200 focus:ring-primary/20"
                  />
                </div>
                {error && (
                  <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
                    <AlertDescription className="text-sm">{error}</AlertDescription>
                  </Alert>
                )}
                <Button
                  type="submit"
                  className="w-full h-11 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <LoadingSpinner size="sm" />
                      <span>Authenticating...</span>
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;
