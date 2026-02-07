import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-10 sm:py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-7 md:gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
              <span className="text-lg sm:text-xl font-bold">Medi Cost Saver</span>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm">
              Making healthcare affordable for every Indian family
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">For Members</h3>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-400">
              <li><Link to="/coming-soon" className="hover:text-white transition-colors">Register</Link></li>
              <li><Link to="/how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
              <li><Link to="/membership-fee" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">For Partners</h3>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-400">
              <li><Link to="/partner/register" className="hover:text-white transition-colors">Become a Partner</Link></li>
              <li><Link to="/partner/login" className="hover:text-white transition-colors">Login</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Support</h3>
            <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-400">
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-6 sm:mt-7 md:mt-8 pt-6 sm:pt-7 md:pt-8 text-center">
          <p className="text-gray-400 text-xs sm:text-sm">
            &copy; 2025 Medicostsaver. All rights reserved.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <span className="text-gray-400 text-xs sm:text-sm">Developed by 
            </span>
            <a
              href="https://koderspark.in"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors text-xs sm:text-sm font-medium"
            >
              
              <div
                className="w-4 h-4 bg-gradient-to-r from-blue-400 to-purple-400 rounded-sm flex items-center justify-center"
                style={{ display: 'none' }}
              >
                <span className="text-white text-xs font-bold">K</span>
              </div>
              Koder Spark Pvt Ltd
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;