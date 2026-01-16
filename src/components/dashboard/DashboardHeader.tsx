import { format } from 'date-fns';
import lodgeImage from '@/assets/lodge-building.webp';

interface DashboardHeaderProps {
  lodgeName?: string;
  location?: string;
}

export function DashboardHeader({ 
  lodgeName = "Sai Grand Lodge",
  location = "Surendrapuri, Yadagirigutta"
}: DashboardHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-xl h-56 md:h-64">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={lodgeImage} 
          alt="Sai Grand Lodge Building"
          className="h-full w-full object-cover"
        />
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-sidebar/95 via-sidebar/80 to-sidebar/40" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex h-full flex-col justify-center px-8 py-8">
        <p className="text-xs font-semibold tracking-[0.2em] text-sidebar-foreground/60 uppercase">
          Welcome to
        </p>
        <h1 className="mt-2 text-3xl font-bold text-sidebar-foreground md:text-4xl">
          {lodgeName}
        </h1>
        <p className="mt-3 text-lg font-semibold text-sidebar-foreground/90">
          Operations Dashboard
        </p>
        <p className="mt-1 text-sm text-sidebar-foreground/60">
          {format(new Date(), 'EEEE, MMMM d, yyyy')} • Live Status
        </p>
      </div>

      {/* Decorative dots */}
      <div className="absolute bottom-4 right-8 flex gap-1.5">
        {[...Array(5)].map((_, i) => (
          <span 
            key={i} 
            className={`h-2 w-2 rounded-full ${i === 2 ? 'bg-sidebar-foreground/60' : 'bg-sidebar-foreground/20'}`}
          />
        ))}
      </div>
    </div>
  );
}