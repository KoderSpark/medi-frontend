import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import heroImage from "../assets/hero-healthcare.jpg";
import {
  ArrowRight,
  CheckCircle,
  Shield,
  Users,
  Star,
  BadgePercent,
  Clock,
  Stethoscope,
  Pill,
  ClipboardCheck,
  Crown
} from "lucide-react";
import { useState } from "react";
import { Helmet } from "react-helmet-async";

const Index = () => {
  const [familyMembers, setFamilyMembers] = useState(1);

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const features = [
    {
      icon: <BadgePercent className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />,
      title: "Save Up to 25%",
      description: "Significant discounts on medical bills, pharmacy purchases, and diagnostic tests"
    },
    {
      icon: <Shield className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />,
      title: "Verified Network",
      description: "Trusted doctors, pharmacies, and diagnostic centers with proper credentials"
    },
    {
      icon: <Users className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />,
      title: "Family Coverage",
      description: "Extend benefits to your entire family with special discounts"
    },
    {
      icon: <Clock className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />,
      title: "Instant Activation",
      description: "Get your digital membership card immediately after registration"
    }
  ];

  const plans = [
    {
      name: "Individual Plan",
      price: 365,
      duration: "per year",
      popular: false,
      features: [
        "Single member coverage",
        "Up to 25% savings",
        "Free dental consultation (unlimited visits throughout the year)",
        "All partner facilities",
        "Digital membership card",
        "24/7 support"
      ]
    },
    {
      name: "Family Plan",
      price: 365,
      duration: "per year + add-ons",
      popular: true,
      features: [
        "All individual plan benefits",
        "10% discount on total"
      ]
    }
  ];

  const calculateFamilyPrice = (members) => {
    const basePrice = 365;
    const total = basePrice * members;
    const discount = members > 1 ? total * 0.10 : 0;
    return total - discount;
  };

  return (
    <>
      <Helmet>
        <title>MEDI COST SAVER - Affordable Healthcare Discount Cards | Free Dental Consultation | Save Up to 25%</title>
        <meta name="description" content="Get up to 25% discount on healthcare services with MEDI COST SAVER. Join India's largest healthcare discount network with 1000+ verified partners and unlimited free dental consultations. ₹365/year for family coverage." />
        <meta name="keywords" content="healthcare discount card India, medical savings, hospital discount, pharmacy discount, doctor consultation discount, free dental consultation, unlimited dental care, healthcare membership India, medical insurance alternative" />
        <meta property="og:title" content="MEDI COST SAVER - Affordable Healthcare for Every Indian Family | Free Dental Consultation" />
        <meta property="og:description" content="Save up to 25% on medical bills, pharmacy purchases, and diagnostic tests. Get unlimited free dental consultations throughout the year. Join 1000+ verified healthcare partners nationwide." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://medicostsaver.com/og-image.jpg" />
        <link rel="canonical" href="https://medicostsaver.com/" />
      </Helmet>
      <div className="min-h-screen bg-white">
        {/* Full Height Banner */}
        <section className="min-h-screen relative flex items-center justify-center"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"></div>
          <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl sm:text-4xl md:text-5xl lg:text-6xl font-black sm:font-bold mt-4 mb-4 md:mb-6 leading-tight"
            >
              <span className="block md:inline">Affordable Healthcare</span>
              <span className="block text-blue-300 md:inline md:ml-2">For Every Indian Family</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 md:mb-8 text-blue-100 max-w-2xl mx-auto leading-relaxed"
            >
              MCS Discount Cards - Saving you up to 25% on medical expenses through our trusted network of healthcare providers
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch"
            >
              {/* Button 1 */}
              <Link to="/how-it-works" className="w-full sm:flex-1">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="
                    w-full h-full
                    min-w-[240px]
                    bg-white text-blue-900
                    px-3 sm:px-4 md:px-5
                    py-2 sm:py-2.5 md:py-3
                    rounded-xl font-semibold text-sm md:text-base
                    hover:bg-gray-100 transition-colors
                    flex items-center justify-center gap-2
                    text-center
                  "
                >
                  Know How This Works
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>

              {/* HIDDEN: Become a Member button (member feature)
              <Link to="/coming-soon" className="w-full sm:flex-1">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="
                    w-full h-full
                    min-w-[240px]
                    bg-blue-600 text-white
                    px-3 sm:px-4 md:px-5
                    py-2 sm:py-2.5 md:py-3
                    rounded-xl font-semibold text-sm md:text-base
                    hover:bg-blue-700 transition-colors
                    flex items-center justify-center gap-2
                    border-2 border-blue-600
                    text-center
                  "
                >
                  Become a Member
                  <Users className="w-4 h-4" />
                </motion.button>
              </Link>
              */}

              {/* Button 3 */}
              <Link to="/partner/register" className="w-full sm:flex-1">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="
      w-full h-full
      min-w-[240px]
      border-2 border-white text-white
      px-3 sm:px-4 md:px-5
      py-2 sm:py-2.5 md:py-3
      rounded-xl font-semibold text-sm md:text-base
      hover:bg-white hover:text-blue-900 transition-colors
      flex items-center justify-center gap-2 md:gap-3
      text-center
    "
                >
                  <div className="flex flex-col leading-tight">
                    <span>Doctors & Dentists</span>
                    <span>Join as Providers/Partners</span>
                  </div>

                  <Stethoscope className="w-4 h-4" />
                </motion.button>
              </Link>
            </motion.div>


            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-8 md:mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 max-w-2xl mx-auto pb-8 md:pb-0"
            >
              <div className="text-center">
                <div className="text-xl sm:text-2xl md:text-2xl font-bold">25%</div>
                <div className="text-blue-200 text-xs sm:text-sm md:text-sm">Max Savings</div>
              </div>
              {/* HIDDEN: Yearly cost stat (member-specific)
            <div className="text-center">
              <div className="text-xl sm:text-2xl md:text-2xl font-bold">₹365</div>
              <div className="text-blue-200 text-xs sm:text-sm md:text-sm">Yearly Cost</div>
            </div>
            */}
              <div className="text-center">
                <div className="text-xl sm:text-2xl md:text-2xl font-bold">1000+</div>
                <div className="text-blue-200 text-xs sm:text-sm md:text-sm">Partners</div>
              </div>
              {/* HIDDEN: Members count stat
            <div className="text-center">
              <div className="text-xl sm:text-2xl md:text-2xl font-bold">50K+</div>
              <div className="text-blue-200 text-xs sm:text-sm md:text-sm">Members</div>
            </div>
            */}
              <div className="text-center">
                <div className="text-xl sm:text-2xl md:text-2xl font-bold">50K+</div>
                <div className="text-blue-200 text-xs sm:text-sm md:text-sm">Happy Families</div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Why Choose MCS Section */}
        <section className="py-12 sm:py-14 md:py-16 bg-white px-4">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10 sm:mb-12"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                Why Choose MCS Discount Cards?
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                Experience healthcare savings like never before with our comprehensive benefits
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-gradient-to-br from-white to-blue-50 p-4 sm:p-5 md:p-6 rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-300"
                >
                  <div className="w-12 h-12 sm:w-13 sm:h-13 md:w-14 md:h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-3 md:mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Free Dental Consultation Highlight */}
        <section className="py-12 sm:py-14 md:py-16 bg-gradient-to-r from-green-50 to-emerald-50 px-4">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8 sm:mb-10"
            >
              <div className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-full font-bold text-sm mb-4">
                <Crown className="w-4 h-4" />
                EXCLUSIVE BENEFIT
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-800 mb-3 sm:mb-4">
                🎁 FREE Dental Consultation For Life
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-green-700 max-w-3xl mx-auto leading-relaxed">
                Get <span className="font-bold text-green-800 text-xl">unlimited free dental consultations</span> throughout the year at our partner dental clinics.
                No limits, no hidden costs - just quality dental care when you need it.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 sm:p-8 md:p-10 shadow-xl border-2 border-green-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Stethoscope className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Expert Dentists</h3>
                  <p className="text-gray-600 text-sm sm:text-base">Consult with qualified dental professionals across our network</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Unlimited Visits</h3>
                  <p className="text-gray-600 text-sm sm:text-base">No limit on consultation visits throughout your membership year</p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Verified Quality</h3>
                  <p className="text-gray-600 text-sm sm:text-base">All partner dentists are verified and maintain high standards</p>
                </div>
              </div>

              <div className="mt-8 text-center">
                {/* HIDDEN: Get FREE Dental Care button (member signup link)
              <Link to="/coming-soon">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-green-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base hover:bg-green-700 transition-colors inline-flex items-center gap-2"
                >
                  Get FREE Dental Care Today
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.button>
              </Link>
              */}
                <Link to="/find-doctor">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-green-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base hover:bg-green-700 transition-colors inline-flex items-center gap-2"
                  >
                    Find a Partner Dentist
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* HIDDEN: Available Plans Section — membership pricing (member feature)
      <section className="py-12 sm:py-14 md:py-16 bg-gray-50 px-4">
        ... Individual Plan + Family Plan cards ...
      </section>
      */}

        {/* Additional Sections */}
        <section className="py-12 sm:py-14 md:py-16 bg-white px-4">
          <div className="container mx-auto max-w-6xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-5 md:mb-6">
                Ready to Start Your Healthcare Savings Journey?
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-7 md:mb-8 max-w-2xl mx-auto">
                Join thousands of satisfied members who are already saving on their medical expenses
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                {/* HIDDEN: Get Started Now button (leads to member signup /coming-soon)
              <Link to="/coming-soon" className="w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-blue-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg hover:bg-blue-700 transition-colors"
                >
                  Get Started Now
                </motion.button>
              </Link>
              */}
                <Link to="/partner/register" className="w-full sm:w-auto">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-blue-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg hover:bg-blue-700 transition-colors"
                  >
                    Join as Doctor / Partner
                  </motion.button>
                </Link>
                <Link to="/contact" className="w-full sm:w-auto">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full border-2 border-gray-300 text-gray-700 px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg hover:border-blue-600 hover:text-blue-600 transition-colors"
                  >
                    Contact Support
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Index;
