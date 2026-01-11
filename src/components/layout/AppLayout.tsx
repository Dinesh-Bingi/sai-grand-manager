import { ReactNode, useState, useEffect } from 'react';
import { AppSidebar } from './AppSidebar';
import { Badge } from '@/components/ui/badge';
import { WifiOff, Wifi } from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="pl-16 transition-all duration-300 md:pl-64">
        {/* Connection Status Banner */}
        {!isOnline && (
          <div className="bg-warning/10 border-b border-warning/30 px-4 py-2 flex items-center justify-center gap-2">
            <WifiOff className="h-4 w-4 text-warning" />
            <span className="text-sm font-medium text-warning">
              Offline Mode — Changes will sync when connection is restored
            </span>
          </div>
        )}
        
        <div className="container mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
