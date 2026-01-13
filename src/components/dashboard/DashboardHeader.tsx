import { format } from 'date-fns';

interface DashboardHeaderProps {
  lodgeName?: string;
  location?: string;
}

export function DashboardHeader({ 
  lodgeName = "Sai Grand Lodge",
  location = "Surendrapuri, Yadagirigutta"
}: DashboardHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-sidebar to-sidebar/90 px-8 py-10">
      {/* Decorative pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>
      
      <div className="relative z-10">
        <p className="text-sm font-medium tracking-widest text-sidebar-foreground/60 uppercase">
          Welcome to
        </p>
        <h1 className="mt-2 font-serif text-4xl font-medium text-sidebar-foreground md:text-5xl">
          {lodgeName}
        </h1>
        <p className="mt-4 text-lg font-serif text-sidebar-foreground/80">
          Operations Dashboard
        </p>
        <p className="mt-2 text-sm text-sidebar-foreground/60">
          {format(new Date(), 'EEEE, MMMM d, yyyy')} • Live Status
        </p>
      </div>
    </div>
  );
}