import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Smartphone,
  Monitor,
  Download,
  CheckCircle2,
  Wifi,
  WifiOff,
  Zap,
  Shield,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function Install() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if running on iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // Listen for online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const features = [
    {
      icon: Zap,
      title: 'Instant Access',
      description: 'Launch directly from your home screen without opening a browser',
    },
    {
      icon: WifiOff,
      title: 'Works Offline',
      description: 'View room status and recent bookings even without internet',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'All data is encrypted and stored securely on your device',
    },
    {
      icon: Clock,
      title: 'Real-time Updates',
      description: 'Receive instant notifications for checkout alerts and bookings',
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="font-serif text-3xl font-bold">Install Application</h1>
          <p className="mt-2 text-muted-foreground">
            Install Sai Grand Lodge PMS on your device for faster access
          </p>
        </div>

        {/* Connection Status */}
        <Alert variant={isOnline ? 'default' : 'destructive'}>
          {isOnline ? (
            <Wifi className="h-4 w-4" />
          ) : (
            <WifiOff className="h-4 w-4" />
          )}
          <AlertTitle>
            {isOnline ? 'Connected to Internet' : 'No Internet Connection'}
          </AlertTitle>
          <AlertDescription>
            {isOnline
              ? 'All features are available. Your data will sync automatically.'
              : 'Working in offline mode. Changes will sync when connection is restored.'}
          </AlertDescription>
        </Alert>

        {/* Install Card */}
        <Card className="border-2 border-primary/20">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary">
              <Smartphone className="h-10 w-10 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">Sai Grand Lodge</CardTitle>
            <CardDescription>Property Management System</CardDescription>
            {isInstalled && (
              <Badge className="mx-auto mt-2 bg-success">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Already Installed
              </Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {isInstalled ? (
              <div className="rounded-lg bg-muted/50 p-6 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
                <h3 className="mt-4 font-semibold">Application Installed</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  The application is already installed on your device. You can access it directly from your home screen.
                </p>
              </div>
            ) : isIOS ? (
              <div className="space-y-4">
                <h3 className="font-semibold">Installation Instructions for iOS</h3>
                <ol className="space-y-3 text-sm">
                  <li className="flex items-start gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                      1
                    </span>
                    <span>
                      Tap the <strong>Share</strong> button at the bottom of Safari
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                      2
                    </span>
                    <span>
                      Scroll down and tap <strong>"Add to Home Screen"</strong>
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                      3
                    </span>
                    <span>
                      Tap <strong>"Add"</strong> in the top right corner
                    </span>
                  </li>
                </ol>
              </div>
            ) : deferredPrompt ? (
              <Button onClick={handleInstall} size="lg" className="w-full">
                <Download className="mr-2 h-5 w-5" />
                Install Application
              </Button>
            ) : (
              <div className="space-y-4">
                <h3 className="font-semibold">Installation Instructions</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <Monitor className="mt-0.5 h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Chrome / Edge Desktop</p>
                      <p className="text-muted-foreground">
                        Click the install icon in the address bar or use Menu → Install App
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Smartphone className="mt-0.5 h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Android</p>
                      <p className="text-muted-foreground">
                        Tap Menu (⋮) → "Add to Home Screen" or "Install App"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div>
          <h2 className="mb-4 font-serif text-xl font-semibold">Application Benefits</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardContent className="flex items-start gap-4 p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{feature.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Device Compatibility */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Supported Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-3">
                <Smartphone className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="font-medium">Android</p>
                  <p className="text-sm text-muted-foreground">Chrome, Samsung Internet</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Smartphone className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="font-medium">iOS</p>
                  <p className="text-sm text-muted-foreground">Safari (Add to Home Screen)</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Monitor className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="font-medium">Windows / Mac</p>
                  <p className="text-sm text-muted-foreground">Chrome, Edge, Brave</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
