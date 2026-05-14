import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaShoppingCart, FaBars, FaTimes } from 'react-icons/fa';
import useAuthStore from '../store/authStore';
import { useCart } from '../context/CartContext';
import NotificationCenter from './NotificationCenter';

const Navbar = () => {
  const { cart } = useCart();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBrandClick = () => {
    navigate('/');
    window.scrollTo(0, 0); // Scroll to top when navigating home
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const handleNavigate = (path) => {
    navigate(path);
    window.scrollTo(0, 0);
    setMobileMenuOpen(false);
  };

  // Check if user is an artist or admin
  const isArtist = user?.role === 'artist';
  const isAdmin = user?.role === 'admin';
  const canAccessCollaboration = isArtist || isAdmin;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navButtonClass = 'shrink-0 bg-transparent border-none text-white/90 text-sm font-medium whitespace-nowrap px-3 py-2 transition duration-300 hover:text-white';

  return (
    <nav className={`sticky top-0 left-0 z-50 w-full transition-all duration-500 ease-out ${scrolled ? 'bg-slate-900/85 backdrop-blur-xl shadow-[0_15px_30px_-20px_rgba(0,0,0,0.75)] border-b border-white/10' : 'bg-slate-200/20 backdrop-blur-lg border-b border-slate-300/20 shadow-sm'}`}>
      <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center gap-4">
          <div className="text-xl sm:text-2xl font-semibold tracking-[0.08em] text-white/95 cursor-pointer" onClick={handleBrandClick}>
            Resonance
          </div>
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center rounded-full border border-white/10 bg-white/0 p-2 text-white/90 transition hover:bg-white/10"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <FaTimes className="h-5 w-5" /> : <FaBars className="h-5 w-5" />}
          </button>
        </div>

        <div className="hidden md:flex flex-nowrap gap-2 items-center min-w-0 overflow-x-auto">
          <button
            onClick={() => handleNavigate('/about')}
            className={navButtonClass}
          >
            About
          </button>
          <button
            onClick={() => handleNavigate('/booking')}
            className={navButtonClass}
          >
            Book Now
          </button>
          <button
            onClick={() => handleNavigate('/products')}
            className={navButtonClass}
          >
            Purchase
          </button>
          <button
            onClick={() => handleNavigate('/users/rentals')}
            className={navButtonClass}
          >
            Rentals
          </button>
          {isAuthenticated && canAccessCollaboration && (
            <button
              onClick={() => handleNavigate('/collaboration')}
              className={navButtonClass}
            >
              Collaboration Hub
            </button>
          )}
          {isAuthenticated && isAdmin && (
            <button
              onClick={() => handleNavigate('/admin')}
              className={navButtonClass}
            >
              Admin Dashboard
            </button>
          )}
          {!isAuthenticated ? (
            <>
              <button
                onClick={() => handleNavigate('/login')}
                className={navButtonClass}
              >
                Login
              </button>
              <button
                onClick={() => handleNavigate('/signup')}
                className={navButtonClass}
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleNavigate('/profile')}
                className={navButtonClass}
              >
                {user?.name || 'Profile'}
              </button>
              <button
                onClick={handleLogout}
                className={navButtonClass}
              >
                Logout
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <NotificationCenter />
          </div>
          <Link to="/cart" className="relative text-white/95">
            <FaShoppingCart className="text-xl" />
            {cart.itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cart.itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden absolute inset-x-0 top-full z-40 bg-slate-900/95 backdrop-blur-xl border-t border-slate-300/10 shadow-xl">
          <div className="flex flex-col gap-2 px-4 py-4">
            <button
              onClick={() => handleNavigate('/about')}
              className="text-left text-white/90 text-base font-medium px-3 py-3 transition duration-300 hover:text-white"
            >
              About
            </button>
            <button
              onClick={() => handleNavigate('/booking')}
              className="text-left text-white/90 text-base font-medium px-3 py-3 transition duration-300 hover:text-white"
            >
              Book Now
            </button>
            <button
              onClick={() => handleNavigate('/products')}
              className="text-left text-white/90 text-base font-medium px-3 py-3 transition duration-300 hover:text-white"
            >
              Purchase
            </button>
            <button
              onClick={() => handleNavigate('/users/rentals')}
              className="text-left text-white/90 text-base font-medium px-3 py-3 transition duration-300 hover:text-white"
            >
              Rentals
            </button>
            {isAuthenticated && canAccessCollaboration && (
              <button
                onClick={() => handleNavigate('/collaboration')}
                className="text-left text-white/90 text-base font-medium px-3 py-3 transition duration-300 hover:text-white"
              >
                Collaboration Hub
              </button>
            )}
            {isAuthenticated && isAdmin && (
              <button
                onClick={() => handleNavigate('/admin')}
                className="text-left text-white/90 text-base font-medium px-3 py-3 transition duration-300 hover:text-white"
              >
                Admin Dashboard
              </button>
            )}
            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => handleNavigate('/login')}
                  className="text-left text-white/90 text-base font-medium px-3 py-3 transition duration-300 hover:text-white"
                >
                  Login
                </button>
                <button
                  onClick={() => handleNavigate('/signup')}
                  className="text-left text-white/90 text-base font-medium px-3 py-3 transition duration-300 hover:text-white"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleNavigate('/profile')}
                  className="text-left text-white/90 text-base font-medium px-3 py-3 transition duration-300 hover:text-white"
                >
                  {user?.name || 'Profile'}
                </button>
                <button
                  onClick={handleLogout}
                  className="text-left text-white/90 text-base font-medium px-3 py-3 transition duration-300 hover:text-white"
                >
                  Logout
                </button>
              </>
            )}
            <div className="pt-3 border-t border-white/10">
              <NotificationCenter />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
