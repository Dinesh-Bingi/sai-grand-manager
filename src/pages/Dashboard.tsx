import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Sai Grand Lodge</h1>
            <p className="text-sm text-muted-foreground">Operations Dashboard · Live Status</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm font-medium text-foreground bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-2">Welcome back!</h2>
          <p className="text-muted-foreground">Here's what's happening at Sai Grand Lodge today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-lg p-6 shadow-luxury">
            <p className="text-sm text-muted-foreground mb-1">Total Rooms</p>
            <p className="text-3xl font-bold text-foreground">24</p>
          </div>
          <div className="bg-card rounded-lg p-6 shadow-luxury">
            <p className="text-sm text-muted-foreground mb-1">Occupancy</p>
            <p className="text-3xl font-bold text-foreground">75%</p>
          </div>
          <div className="bg-card rounded-lg p-6 shadow-luxury">
            <p className="text-sm text-muted-foreground mb-1">Arrivals Today</p>
            <p className="text-3xl font-bold text-foreground">5</p>
          </div>
          <div className="bg-card rounded-lg p-6 shadow-luxury">
            <p className="text-sm text-muted-foreground mb-1">Revenue Today</p>
            <p className="text-3xl font-bold text-foreground">₹12,500</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card rounded-lg p-6 shadow-luxury">
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-4">
            <button className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors">
              + New Booking
            </button>
            <button className="px-6 py-3 bg-secondary text-secondary-foreground font-medium rounded-lg hover:bg-secondary/80 transition-colors">
              View Rooms
            </button>
            <button className="px-6 py-3 bg-secondary text-secondary-foreground font-medium rounded-lg hover:bg-secondary/80 transition-colors">
              Check-outs Today
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
