import { Button } from "./ui/button";
import { Bell, User, Menu, Shield, Globe, Home } from "lucide-react";
import { Badge } from "./ui/badge";
// Company logo asset served from `public/logo.png`
const rectifyFullLogo = "/logo.png";
const rectifyIconLogo = "/logo.png";

interface HeaderProps {
  onNavigateHome?: () => void;
  showNavigation?: boolean;
}

export function Header({ onNavigateHome, showNavigation = true }: HeaderProps) {
  return (
    <header className="border-b bg-rectify-surface border-rectify-border shadow-sm">
      <div className="flex h-16 items-center justify-between px-3 sm:px-4 lg:px-6">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Desktop - Full Logo */}
            <div className="hidden md:block cursor-pointer" onClick={onNavigateHome}>
              <img 
                src={rectifyIconLogo} 
                alt="RECtify - UAE's First Digital REC Platform" 
                className="h-12 w-auto"
              />
            </div>
            
            {/* Mobile - Icon Only */}
            <div className="md:hidden cursor-pointer" onClick={onNavigateHome}>
              <img 
                src={rectifyIconLogo} 
                alt="RECtify" 
                className="h-10 w-15"
              />
            </div>
            
            <div className="md:hidden sm:block">
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5">UAE</Badge>
            </div>
          </div>
          
          {showNavigation && (
            <nav className="hidden lg:flex items-center space-x-6 ml-8">
              <button onClick={onNavigateHome} className="text-muted-foreground hover:text-rectify-green transition-colors flex items-center space-x-2">
                <Home className="h-4 w-4" />
                <span>Home</span>
              </button>
              <a href="#" className="text-foreground hover:text-rectify-green transition-colors">Dashboard</a>
              <a href="#" className="text-muted-foreground hover:text-rectify-green transition-colors">Trade I-RECs</a>
              <a href="#" className="text-muted-foreground hover:text-rectify-green transition-colors">EI Reports</a>
              <a href="#" className="text-muted-foreground hover:text-rectify-green transition-colors">Compliance</a>
            </nav>
          )}
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">UAE</Badge>
              <Badge variant="outline" className="text-xs flex items-center space-x-1">
                <Shield className="h-3 w-3" />
                <span className="hidden lg:inline">I-REC Certified</span>
                <span className="lg:hidden">I-REC</span>
              </Badge>
            </div>
            <div className="hidden lg:flex items-center space-x-2 text-sm text-muted-foreground">
              <Globe className="h-4 w-4" />
              <span>AED | USD</span>
            </div>
          </div>
          
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <User className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 lg:hidden">
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}