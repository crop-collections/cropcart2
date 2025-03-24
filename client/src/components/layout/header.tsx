import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Menu, Search, X, ShoppingCart, User } from 'lucide-react';
import LoginModal from '@/components/auth/login-modal';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const openLoginModal = () => {
    setLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setLoginModalOpen(false);
  };

  const handleLogout = () => {
    logout();
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Dashboard link based on user role
  const getDashboardLink = () => {
    if (!user) return '/dashboard';
    
    switch(user.role) {
      case 'farmer':
        return '/dashboard/products';
      case 'delivery':
        return '/dashboard/deliveries';
      default:
        return '/dashboard';
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex flex-wrap items-center justify-between">
        <div className="flex items-center">
          <Link href="/">
            <div className="text-primary font-bold text-2xl md:text-3xl cursor-pointer">
              <span className="text-primary">Crop</span>
              <span className="text-secondary">Cart</span>
            </div>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6 items-center">
          <Link href="/">
            <div className={`text-neutral-800 hover:text-primary transition cursor-pointer ${location === '/' ? 'text-primary font-medium' : ''}`}>
              Home
            </div>
          </Link>
          <Link href="/browse">
            <div className={`text-neutral-800 hover:text-primary transition cursor-pointer ${location === '/browse' ? 'text-primary font-medium' : ''}`}>
              Browse
            </div>
          </Link>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search products..."
              className="pl-9 w-[200px] lg:w-[250px]"
            />
          </div>
          
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <Link href="/checkout">
                <div className="text-muted-foreground hover:text-foreground cursor-pointer">
                  <ShoppingCart className="h-5 w-5" />
                </div>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profileImage} alt={user?.name} />
                      <AvatarFallback>{user?.name ? getInitials(user.name) : 'U'}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link href={getDashboardLink()}>
                    <DropdownMenuItem className="cursor-pointer">
                      Dashboard
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Button onClick={openLoginModal} className="bg-primary hover:bg-primary/90">
              Login
            </Button>
          )}
        </nav>
        
        {/* Mobile menu button */}
        <div className="md:hidden flex items-center space-x-4">
          {isAuthenticated && (
            <Link href="/checkout">
              <div className="text-muted-foreground hover:text-foreground cursor-pointer">
                <ShoppingCart className="h-5 w-5" />
              </div>
            </Link>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white px-4 py-4 shadow-inner">
          <div className="flex flex-col space-y-4">
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder="Search products..."
                className="pl-9 w-full"
              />
            </div>
            
            <Link href="/">
              <div 
                className={`py-2 cursor-pointer ${location === '/' ? 'text-primary font-medium' : 'text-neutral-800'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </div>
            </Link>
            <Link href="/browse">
              <div 
                className={`py-2 cursor-pointer ${location === '/browse' ? 'text-primary font-medium' : 'text-neutral-800'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Browse
              </div>
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link href={getDashboardLink()}>
                  <div 
                    className="py-2 text-neutral-800 cursor-pointer"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </div>
                </Link>
                <Button 
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  variant="outline"
                  className="justify-start px-2"
                >
                  Log out
                </Button>
              </>
            ) : (
              <Button
                onClick={() => {
                  openLoginModal();
                  setMobileMenuOpen(false);
                }}
                className="bg-primary hover:bg-primary/90 w-full"
              >
                Login
              </Button>
            )}
          </div>
        </div>
      )}
      
      {/* Login Modal */}
      <LoginModal isOpen={loginModalOpen} onClose={closeLoginModal} />
    </header>
  );
}
