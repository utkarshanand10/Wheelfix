import { Button } from "./ui/button";
import logoImage from "../assets/logo.jpg"; // Import the Wheelyfix logo
import { useAuth } from "../hooks/useAuth";
import { useUserRole } from "../hooks/useUserRole";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, User, Menu, X, Phone, MapPin, Download } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

const Header = () => {
  const { user, signOut } = useAuth();
  const { isAdmin } = useUserRole();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAuthAction = () => {
    if (user) {
      signOut();
    } else {
      navigate("/login");
    }
  };

  const navigationItems = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Blog", href: "/blogs" },
  ];

  const MobileMenu = () => (
    <div className="lg:hidden">
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="text-gray-700">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-white">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <Link to="/" className="flex items-center space-x-2" onClick={() => setIsMobileMenuOpen(false)}>
                <img src={logoImage} alt="Wheelyfix Automotive" className="h-8 w-8" />
                <span className="text-xl font-bold text-gray-900">WHEELYFIX</span>
              </Link>
              <Button variant="ghost" size="sm" onClick={() => setIsMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <nav className="flex-1">
              <div className="space-y-4">
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="block text-lg font-medium text-gray-900 hover:text-accent transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                {user && (
                  <Link
                    to="/dashboard"
                    className="block text-lg font-medium text-gray-900 hover:text-accent transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                )}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="block text-lg font-medium text-gray-900 hover:text-accent transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Admin
                  </Link>
                )}
              </div>
            </nav>

            <div className="border-t pt-6">
              {user ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>{user.email}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => {
                      signOut();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Log Out
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="default" 
                  className="w-full bg-accent hover:bg-accent/90" 
                  onClick={() => {
                    handleAuthAction();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  LOG IN
                </Button>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-gray-100 text-gray-700 py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-accent" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-accent" />
                <span>Find Nearest Service Center</span>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-gray-700 hover:text-accent">
                <Download className="h-4 w-4 mr-2" />
                Download App
              </Button>
              <span>Track Service</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className={`container mx-auto px-4 py-3 transition-all duration-300 ${
        isScrolled ? 'py-2' : 'py-4'
      }`}>
        <div className="flex items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center space-x-3 group"
          >
            <img 
              src={logoImage} 
              alt="Wheelyfix Automotive" 
              className={`transition-all duration-300 ${
                isScrolled ? 'h-10 w-10' : 'h-12 w-12'
              }`}
            />
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent group-hover:to-primary-600 transition-all duration-300">
                WHEELYFIX
              </span>
              <div className="text-xs text-gray-600 font-medium">Automotive Excellence</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <Link key={item.name} to={item.href}>
                <Button 
                  variant="ghost" 
                  className="text-gray-700 hover:text-primary-600 font-medium relative group px-4"
                >
                  {item.name}
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </Button>
              </Link>
            ))}
            {user && (
              <Link to="/dashboard">
                <Button 
                  variant="ghost" 
                  className="text-gray-700 hover:text-primary-600 font-medium relative group px-4"
                >
                  Dashboard
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </Button>
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin">
                <Button 
                  variant="ghost" 
                  className="text-gray-700 hover:text-primary-600 font-medium relative group px-4"
                >
                  Admin
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </Button>
              </Link>
            )}
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-colors duration-200 font-medium"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary-600" />
                      </div>
                      <span className="max-w-[150px] truncate">{user.email}</span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-2">
                  <DropdownMenuItem asChild className="rounded-lg hover:bg-primary-50 cursor-pointer py-2">
                    <Link to="/profile" className="flex items-center w-full">
                      <User className="h-4 w-4 mr-2 text-primary-600" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem 
                      onSelect={() => navigate("/admin")}
                      className="rounded-lg hover:bg-primary-50 cursor-pointer py-2"
                    >
                      <span className="flex items-center">
                        <svg className="h-4 w-4 mr-2 text-primary-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Admin Panel
                      </span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    onClick={() => { signOut(); navigate('/login'); }}
                    className="rounded-lg hover:bg-red-50 cursor-pointer py-2 mt-1 text-red-600 hover:text-red-700"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                variant="default" 
                size="sm" 
                className="bg-accent hover:bg-accent/90 text-white font-medium px-6"
                onClick={handleAuthAction}
              >
                LOG IN
              </Button>
            )}
          </nav>

          {/* Mobile menu */}
          <MobileMenu />
        </div>
      </div>
    </header>
  );
};

export default Header;

