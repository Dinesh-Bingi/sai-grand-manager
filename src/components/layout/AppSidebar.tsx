import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BedDouble,
  CalendarCheck,
  FileText,
  Settings,
  LogOut,
  Shield,
  Users,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Building2,
  Download,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/', description: 'Operations overview' },
  { icon: BedDouble, label: 'Room Status', path: '/rooms', description: 'View all rooms' },
  { icon: CalendarCheck, label: 'Reservations', path: '/bookings', description: 'Manage bookings' },
  { icon: Users, label: 'Guest Registry', path: '/guests', description: 'Guest records' },
  { icon: FileText, label: 'Revenue Reports', path: '/reports', description: 'Analytics' },
  { icon: Shield, label: 'Police Verification', path: '/police-export', description: 'Compliance exports' },
  { icon: ClipboardList, label: 'Waiting List', path: '/waiting-list', description: 'Queue management' },
  { icon: Download, label: 'Install App', path: '/install', description: 'Get mobile app' },
  { icon: Settings, label: 'Administration', path: '/settings', description: 'System settings' },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { signOut } = useAuth();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-sidebar transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className={cn(
          'flex items-center gap-3 border-b border-sidebar-border px-4 py-4',
          collapsed && 'justify-center px-2'
        )}>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-gold">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-serif text-lg font-bold text-sidebar-foreground">
                Sai Grand
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-sidebar-foreground/60">
                Property Management
              </span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            const navButton = (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                  collapsed && 'justify-center px-2'
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.path} delayDuration={0}>
                  <TooltipTrigger asChild>{navButton}</TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    <p>{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </TooltipContent>
                </Tooltip>
              );
            }

            return navButton;
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-2 space-y-1">
          {/* Version Info */}
          {!collapsed && (
            <div className="px-3 py-2 text-[10px] text-sidebar-foreground/50">
              <p>Version 1.0.0</p>
              <p>© 2024 Sai Grand Lodge</p>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut()}
            className={cn(
              'w-full justify-start gap-3 text-sidebar-foreground/80 hover:bg-destructive/20 hover:text-destructive',
              collapsed && 'justify-center px-2'
            )}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span>Sign Out</span>}
          </Button>
        </div>

        {/* Collapse Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 h-6 w-6 rounded-full border bg-background shadow-md hover:bg-muted"
        >
          {collapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </Button>
      </div>
    </aside>
  );
}
