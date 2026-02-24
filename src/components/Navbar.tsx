import { Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuOpen && !(event.target as Element).closest('.mobile-menu') && !(event.target as Element).closest('.hamburger-btn')) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  return (
    <>
      <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-[100]">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          {/* Mobile: Hamburger Menu */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="hamburger-btn p-2"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          {/* Logo - Centered on mobile, left on desktop */}
          <div className="flex items-center">
            <img
              src="https://res.cloudinary.com/dje6kfwo1/image/upload/c_crop,w_1000,h_220/v1763642881/ChatGPT_Image_Nov_20_2025_06_01_51_PM_r2xd1x.png"
              alt="Medi Cost Saver logo"
              className="h-10 md:h-12 object-contain"
            />
          </div>

          {/* Desktop: Centered menu */}
          <div className="hidden md:flex gap-6 items-center flex-1 justify-center">
            <Link to="/" className="text-sm font-medium hover:text-primary">Home</Link>
            <Link to="/find-doctor" className="text-sm font-medium hover:text-primary">Find Doctor</Link>
            <Link to="/about" className="text-sm font-medium hover:text-primary">About Us</Link>
            <Link to="/how-it-works" className="text-sm font-medium hover:text-primary">How It Works</Link>
            {/* HIDDEN: Membership Fee link - member feature hidden
            <Link to="/membership-fee" className="text-sm font-medium hover:text-primary">Membership Fee</Link>
            */}
            <Link to="/faq" className="text-sm font-medium hover:text-primary">FAQ</Link>
            <Link to="/contact" className="text-sm font-medium hover:text-primary">Contact Us</Link>
          </div>

          {/* Desktop & Mobile: Login/Register buttons - Doctor/Partner only */}
          <div className="flex gap-2 md:gap-4 relative mr-4 md:mr-0">
            {/* Login Button - direct to partner/doctor login */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/partner/login')}
            >
              Login
            </Button>

            {/* HIDDEN: Member login options (commented out, not deleted)
            Login as Member → /login
            Login as Partner → /partner/login
            */}

            {/* Register / Get Started Button - direct to partner/doctor register */}
            <Button
              size="sm"
              onClick={() => navigate('/partner/register')}
            >
              <span className="hidden md:inline">Join as Doctor</span>
              <span className="md:hidden text-xs">Register</span>
            </Button>

            {/* HIDDEN: Member register options (commented out, not deleted)
            Register as Member → /coming-soon
            Register as Partner → /partner/register
            */}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`mobile-menu fixed inset-0 z-40 md:hidden transition-all duration-300 ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Menu Panel */}
        <div
          className={`absolute left-0 top-0 h-full w-[70%] bg-card border-r border-border shadow-xl transform transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
        >
          <div className="p-6">
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center">
                <img
                  src="https://res.cloudinary.com/dje6kfwo1/image/upload/c_crop,w_1000,h_220/v1763642881/ChatGPT_Image_Nov_20_2025_06_01_51_PM_r2xd1x.png"
                  alt="Medi Cost Saver logo"
                  className="h-8 object-contain"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Mobile Menu Items */}
            <div className="space-y-4">
              <Link
                to="/"
                className="block py-3 px-4 text-base font-medium hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/find-doctor"
                className="block py-3 px-4 text-base font-medium hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Find Doctor
              </Link>
              <Link
                to="/about"
                className="block py-3 px-4 text-base font-medium hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                About Us
              </Link>
              <Link
                to="/how-it-works"
                className="block py-3 px-4 text-base font-medium hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </Link>
              <Link
                to="/membership-fee"
                className="block py-3 px-4 text-base font-medium hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Membership Fee
              </Link>
              <Link
                to="/faq"
                className="block py-3 px-4 text-base font-medium hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                FAQ
              </Link>
              <Link
                to="/contact"
                className="block py-3 px-4 text-base font-medium hover:bg-accent hover:text-accent-foreground rounded-lg transition-colors duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
