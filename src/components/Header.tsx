import { Shield, RefreshCw, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const Header = () => {
  const { user, role, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/50">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">
              Project <span className="text-primary">SAFER</span>
              <span className="hidden md:inline text-muted-foreground font-normal">
                : Community IoT Flood Warning
              </span>
            </h1>
            <p className="text-xs text-muted-foreground sm:hidden">
              Community IoT Flood Warning
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-sensor-online/10 border border-sensor-online/30">
            <span className="w-2 h-2 rounded-full bg-sensor-online animate-pulse" />
            <span className="text-xs font-medium text-sensor-online">System Online</span>
          </div>
          
          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground truncate max-w-[120px]">
                  {user.email}
                </span>
                <Badge variant={isAdmin ? "destructive" : "secondary"} className="text-xs">
                  {isAdmin ? "Admin" : "Community"}
                </Badge>
              </div>
              <Button variant="outline" size="sm" className="gap-2" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate("/auth")}>
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Login</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
