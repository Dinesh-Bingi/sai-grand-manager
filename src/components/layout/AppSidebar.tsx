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
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: BedDouble, label: 'Room Status', path: '/rooms' },
  { icon: CalendarCheck, label: 'Reservations', path: '/bookings' },
  { icon: Users, label: 'Guest Registry', path: '/guests' },
  { icon: FileText, label: 'Revenue Reports', path: '/reports' },
  { icon: Shield, label: 'Police Verification', path: '/police-export' },
  { icon: ClipboardList, label: 'Waiting List', path: '/waiting-list' },
];

const bottomNavItems = [
  { icon: Download, label: 'Install App', path: '/install' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { signOut } = useAuth();

  const renderNavItem = (item: typeof navItems[0]) => {
    const isActive = location.pathname === item.path;
    const Icon = item.icon;

    const navButton = (
      <Link
        key={item.path}
        to={item.path}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all',
          isActive
            ? 'bg-sidebar-accent text-sidebar-primary font-medium'
            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
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
            {item.label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return navButton;
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-sidebar transition-all duration-300',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className={cn(
          'flex items-center gap-3 border-b border-sidebar-border px-4 py-5',
          collapsed && 'justify-center px-2'
        )}>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary/20">
            <Building2 className="h-5 w-5 text-sidebar-primary" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-serif text-lg font-medium text-sidebar-foreground">
                Sai Grand Lodge
              </span>
              <span className="text-[10px] text-sidebar-foreground/50">
                Surendrapuri, Yadagirigutta
              </span>
            </div>
          )}
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
          {navItems.map(renderNavItem)}
        </nav>

        {/* Bottom Navigation & Footer */}
        <div className="border-t border-sidebar-border p-2 space-y-1">
          {bottomNavItems.map(renderNavItem)}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut()}
            className={cn(
              'w-full justify-start gap-3 text-sidebar-foreground/70 hover:bg-destructive/20 hover:text-destructive',
              collapsed && 'justify-center px-2'
            )}
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span>Sign Out</span>}
          </Button>

          {/* Version Info */}
          {!collapsed && (
            <div className="px-3 py-3 text-[10px] text-sidebar-foreground/40">
              Version 1.0 © 2024 Sai Grand Lodge
            </div>
          )}
        </div>

        {/* Collapse Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 h-6 w-6 rounded-full border border-border bg-background shadow-sm hover:bg-muted"
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