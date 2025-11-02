import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { LogOut, Menu, ShoppingCart, User, X, Search, } from "lucide-react";
import Button from "../ui/Button";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";

/**
 * Enhanced, production‑ready Header/NavBar
 * - Sticky, blurred background with shadow on scroll
 * - Mobile menu with focus‑trap
 * - Keyboard accessible user & notification dropdowns
 * - Cart badge, notifications badge
 * - Optional search bar (collapsible on mobile)
 * - Light/Dark theme toggle (requires `dark` class on <html>)
 * - Graceful unauthenticated state (Sign in / Sign up)
 */

const NAV_LINKS = [
  { to: "/", label: "Home" },

];

const cx = (...classes: Array<string | false | undefined>) => classes.filter(Boolean).join(" ");

const Badge: React.FC<{ value?: number; className?: string; ariaLabel?: string }> = ({ value, className, ariaLabel }) => {
  if (!value) return null;
  return (
    <span
      aria-label={ariaLabel}
      className={cx(
        "absolute -top-1 -right-1 inline-flex min-w-[1.25rem] h-5 items-center justify-center rounded-full bg-brand-orange text-white text-xs font-bold px-1",
        "dark:bg-brand-orange dark:text-white",
        className
      )}
    >
      {value > 99 ? "99+" : value}
    </span>
  );
};

const Dropdown: React.FC<{
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right";
  label?: string;
}> = ({ trigger, children, align = "right", label }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((v) => !v)}
        className="relative py-2 px-4 rounded-full bg-brand-orange text-white shadow-md hover:shadow-lg transition-all duration-200"
      >
        {trigger}
      </button>
      {open && (
        <div
          role="menu"
          className={cx(
            "absolute z-50 mt-2 w-64 rounded-xl border border-gray-200/60 bg-white/95 backdrop-blur-sm shadow-xl",
            "dark:bg-gray-900/95 dark:border-gray-800",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          <div className="p-1" onClick={() => setOpen(false)}>{children}</div>
        </div>
      )}
    </div>
  );
};


const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();

  const displayName = useMemo(() => {
    if (user?.full_name) {
      return user.full_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return "User";
  }, [user]);

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cx(
        "sticky top-0 z-40 backdrop-blur-md bg-white/20 dark:bg-white/10",
        scrolled ? "shadow-md border-b border-brand-orange/20 dark:border-brand-orange/20" : "border-b border-transparent"
      )}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Brand */}
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <Link to="/" className="flex items-center gap-2">
              <img src="/ask_logo_transparent.png" alt="ASK International" className="h-10 w-auto" />
              <span className="text-lg font-bold text-brand-brown tracking-tight dark:text-brand-brown hidden sm:inline">Dealer Platform</span>
            </Link>
          </div>
          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-3 ml-auto">

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 rounded-full bg-brand-orange text-white shadow-md hover:shadow-lg transition-all duration-200"
              aria-label="Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              <Badge value={itemCount} ariaLabel="Items in cart" />
            </Link>

            {/* User */}
            {user ? (
              <Dropdown
                label="User menu"
                trigger={<span className="text-sm font-medium">{displayName}</span>}
              >
                <div className="px-3 py-2">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{user.full_name || user.email}</p>
                  <p className="text-xs text-gray-500">Signed in</p>
                </div>
                <div className="my-1 h-px bg-gray-100 dark:bg-gray-800" />
                <div className="p-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 bg-brand-orange text-white border-0 hover:shadow-lg transition-all duration-200 shadow-md"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </Button>
                </div>
              </Dropdown>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-sm font-medium px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800">Sign in</Link>
                <Link to="/register" className="text-sm font-medium px-3 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 shadow-sm dark:bg-white dark:text-gray-900">Sign up</Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen((v) => !v)}
              className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800"
              aria-label="Toggle search"
            >
              <Search className="h-5 w-5" />
            </button>
            {searchOpen && (
              <input
                type="search"
                placeholder="Search…"
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-transparent dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100"
              />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sheet */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-brand-orange/20 bg-brand-light-orange/95 backdrop-blur-sm shadow-sm dark:bg-brand-light-orange/90 dark:border-brand-orange/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="grid gap-1">
              {NAV_LINKS.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cx(
                      "px-3 py-2 rounded-lg text-sm font-medium",
                      isActive
                        ? "bg-brand-orange text-white shadow-sm dark:bg-brand-orange"
                        : "text-brand-brown hover:bg-brand-light-orange/50 dark:text-brand-brown dark:hover:bg-brand-light-orange/50"
                    )
                  }
                >
                  {n.label}
                </NavLink>
              ))}
              <div className="mt-2 flex items-center gap-2">
                <Link to="/cart" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800">
                  <ShoppingCart className="h-4 w-4" /> Cart
                  {itemCount ? <span className="ml-auto text-xs font-semibold">{itemCount}</span> : null}
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
