import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import ParticleBackground from "@/components/ParticleBackground";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const DashboardLayout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
    } finally {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <ParticleBackground />

      {/* Enhanced background gradient orbs */}
      <div
        className="fixed top-[-20%] left-[10%] w-[800px] h-[800px] rounded-full pointer-events-none opacity-40"
        style={{
          background: "radial-gradient(circle, hsl(192 100% 50% / 0.08) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />
      <div
        className="fixed bottom-[-30%] right-[5%] w-[900px] h-[900px] rounded-full pointer-events-none opacity-30"
        style={{
          background: "radial-gradient(circle, hsl(265 89% 62% / 0.1) 0%, transparent 70%)",
          filter: "blur(100px)",
        }}
      />
      <div
        className="fixed top-[40%] right-[30%] w-[600px] h-[600px] rounded-full pointer-events-none opacity-20"
        style={{
          background: "radial-gradient(circle, hsl(217 91% 60% / 0.06) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Mesh gradient overlay */}
      <div className="fixed inset-0 mesh-gradient pointer-events-none opacity-60" />

      <Sidebar onLogout={handleLogout} />

      <main className="ml-20 lg:ml-64 p-6 lg:p-8 relative z-10 transition-all duration-300">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;

