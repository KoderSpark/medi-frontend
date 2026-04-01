import ClaimListingStep from "@/components/ClaimListingStep";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";

const ClaimBusiness = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col min-h-screen">
            <div className="flex-grow bg-gradient-to-br from-blue-50 via-white to-indigo-50">
                <ClaimListingStep 
                    role="doctor" 
                    onContinueNew={() => navigate('/partner/register')} 
                    onClaimSuccess={(token) => {
                        localStorage.setItem("partnerToken", token);
                        window.location.href = '/partner/dashboard';
                    }} 
                    onBack={() => navigate('/')} 
                />
            </div>
        </div>
    );
};

export default ClaimBusiness;
