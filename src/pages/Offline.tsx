import { WifiOff, RefreshCw, Cloud, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Offline() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-lg border-2">
        <CardContent className="pt-12 pb-10 px-8 text-center">
          {/* Icon */}
          <div className="mx-auto w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
            <WifiOff className="h-10 w-10 text-muted-foreground" />
          </div>

          {/* Title */}
          <h1 className="font-serif text-2xl font-bold text-foreground mb-2">
            No Internet Connection
          </h1>
          
          {/* Description */}
          <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
            Unable to connect to the server. Please check your internet connection and try again.
          </p>

          {/* Features that still work */}
          <div className="bg-muted/50 rounded-xl p-5 mb-8">
            <h3 className="font-semibold text-sm mb-4 text-foreground">
              Available in Offline Mode
            </h3>
            <div className="grid gap-3 text-left">
              <div className="flex items-center gap-3 text-sm">
                <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-success" />
                </div>
                <span className="text-muted-foreground">View cached guest records</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="h-8 w-8 rounded-lg bg-info/10 flex items-center justify-center">
                  <Cloud className="h-4 w-4 text-info" />
                </div>
                <span className="text-muted-foreground">Auto-sync when connection restores</span>
              </div>
            </div>
          </div>

          {/* Retry Button */}
          <Button 
            onClick={handleRetry} 
            size="lg" 
            className="w-full gap-2 font-semibold"
          >
            <RefreshCw className="h-4 w-4" />
            Retry Connection
          </Button>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t">
            <p className="text-xs text-muted-foreground">
              <span className="font-serif font-semibold">Sai Grand Lodge</span>
              <br />
              Property Management System
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
