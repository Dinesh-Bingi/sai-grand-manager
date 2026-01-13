import { ReactNode, useState, useEffect } from 'react';
import { AppSidebar } from './AppSidebar';
import { WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

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
      
      {/* Offline Banner */}
      {!isOnline && (
        <div className="fixed top-0 left-60 right-0 z-50 flex items-center justify-center gap-2 bg-warning/10 px-4 py-2 text-sm text-warning border-b border-warning/20">
          <WifiOff className="h-4 w-4" />
          <span className="text-xs font-medium">
            Offline — Changes will sync when connected
          </span>
        </div>
      )}
      
      <main className={cn(
        'min-h-screen transition-all duration-300 ml-16 md:ml-60',
        !isOnline && 'pt-10'
      )}>
        <div className="px-6 py-6 md:px-8 md:py-8 max-w-[1600px]">
          {children}
        </div>
      </main>
    </div>
  );
}