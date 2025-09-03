import { Button } from "./ui/button";
import { Bell, User, Menu, Shield, Globe, Home, LogIn } from "lucide-react";
import { Badge } from "./ui/badge";
// Use public URL for static assets
const rectifyFullLogo = "/logo.png";
const rectifyIconLogo = "/logo.png";

interface HeaderProps {
	onNavigateHome?: () => void;
	showNavigation?: boolean;
	onOpenLogin?: () => void;
	onOpenProfile?: () => void;
}

export function Header({ onNavigateHome, showNavigation = true, onOpenLogin, onOpenProfile }: HeaderProps) {
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
						

					</div>
					
					{showNavigation && (
						<nav className="hidden lg:flex items-center space-x-6 ml-8">
							<button onClick={onNavigateHome} className="text-muted-foreground hover:text-rectify-green transition-colors flex items-center space-x-2">
								<Home className="h-4 w-4" />
								<span>Home</span>
							</button>
							<a href="#" className="text-foreground hover:text-rectify-green transition-colors">Dashboard</a>
						</nav>
					)}
				</div>
				
				<div className="flex items-center space-x-2 sm:space-x-3">
					<div className="hidden md:flex items-center space-x-3 lg:space-x-4">
						<div className="hidden lg:flex items-center space-x-2 text-sm text-muted-foreground">
							<Globe className="h-4 w-4" />
							<span>AED | USD</span>
						</div>
					</div>
					
					<Button variant="ghost" size="sm" className="h-8 w-8 p-0" type="button" aria-label="Notifications">
						<Bell className="h-4 w-4" />
					</Button>
					<Button variant="ghost" size="sm" className="h-8 w-8 p-0" type="button" aria-label="Profile" onClick={() => onOpenProfile?.()}>
						<User className="h-4 w-4" />
					</Button>
					<Button variant="ghost" size="sm" className="h-8 w-8 p-0" type="button" aria-label="Login" onClick={() => onOpenLogin?.()}>
						<LogIn className="h-4 w-4" />
					</Button>
					<Button variant="ghost" size="sm" className="h-8 w-8 p-0 lg:hidden" type="button" aria-label="Menu">
						<Menu className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</header>
	);
}