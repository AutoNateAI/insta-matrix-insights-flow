
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Link, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Calendar,
  ChevronRight,
  Instagram,
  LogOut, 
  Menu,
  Search,
  Upload
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title }) => {
  const { logout, user } = useAuth();
  const { hasData } = useData();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { 
      label: 'Dashboard', 
      path: '/dashboard', 
      icon: <BarChart3 className="h-5 w-5" /> 
    },
    { 
      label: 'Timing Analysis', 
      path: '/timing', 
      icon: <Calendar className="h-5 w-5" />,
      disabled: !hasData
    },
    { 
      label: 'Content Analysis', 
      path: '/content', 
      icon: <Search className="h-5 w-5" />,
      disabled: !hasData
    },
    { 
      label: 'Engagement', 
      path: '/engagement', 
      icon: <BarChart3 className="h-5 w-5" />,
      disabled: !hasData
    },
    { 
      label: 'Hashtags', 
      path: '/hashtags', 
      icon: <Search className="h-5 w-5" />,
      disabled: !hasData
    },
    { 
      label: 'Network', 
      path: '/network', 
      icon: <BarChart3 className="h-5 w-5" />,
      disabled: !hasData
    },
    { 
      label: 'Upload Data', 
      path: '/upload', 
      icon: <Upload className="h-5 w-5" /> 
    }
  ];

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="md:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <div className="flex items-center gap-2 pb-4 pt-2">
              <Instagram className="h-6 w-6 text-instagram-primary" />
              <span className="text-lg font-semibold">Instagram Analytics</span>
            </div>
            <nav className="grid gap-2 py-4">
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:text-foreground",
                    item.disabled && "pointer-events-none opacity-50"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <Instagram className="h-6 w-6 text-instagram-primary hidden md:block" />
          <span className="text-lg font-semibold hidden md:block">Instagram Analytics</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {user?.username}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            aria-label="Logout"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar - Desktop only */}
        <aside className="hidden w-64 shrink-0 border-r bg-card md:block">
          <nav className="grid gap-2 p-4">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:text-foreground hover:bg-accent/50",
                  item.disabled && "pointer-events-none opacity-50"
                )}
              >
                {item.icon}
                <span>{item.label}</span>
                {!item.disabled && <ChevronRight className="ml-auto h-4 w-4" />}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1">
          <div className="container mx-auto p-4 md:p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">{title}</h1>
              <div className="h-1 w-20 bg-instagram-primary rounded-full"></div>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
