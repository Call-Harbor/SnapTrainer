import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Activity, LayoutDashboard, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import DonationButton from '@/components/DonationButton';
import SnapTrainerIcon from '@/components/SnapTrainerIcon';

const navItems = [
  { path: '/app', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/create', icon: Plus, label: 'New AIFace' },
  { path: '/mission-control', icon: Activity, label: 'Mission Control' },
];

export default function AppLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <SnapTrainerIcon className="h-9 w-9 transition-transform duration-200 group-hover:scale-105" />
            <span className="hidden sm:inline-flex items-baseline text-lg font-semibold tracking-tight">
              <span className="text-primary">Snap</span>
              <span className="text-foreground">Trainer</span>
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            <DonationButton size="sm" className="hidden md:inline-flex" />
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}