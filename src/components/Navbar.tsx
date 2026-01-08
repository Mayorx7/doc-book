"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "./Button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { ModeToggle } from "./mode-toggle";
import { createClient } from "@/lib/supabase/client";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();
  const [authStatus, setAuthStatus] = useState<"loading" | "unauth" | "auth">("loading");
  const [role, setRole] = useState<"patient" | "doctor" | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadAuth() {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;

        if (!data.user) {
          if (!isMounted) return;
          setAuthStatus("unauth");
          setRole(null);
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        const resolvedRole =
          (profile?.role as "patient" | "doctor" | undefined) ||
          (data.user.user_metadata?.role as "patient" | "doctor" | undefined) ||
          null;

        if (!isMounted) return;
        setAuthStatus("auth");
        setRole(resolvedRole);
      } catch {
        if (!isMounted) return;
        setAuthStatus("unauth");
        setRole(null);
      }
    }

    loadAuth();
    const { data } = supabase.auth.onAuthStateChange(() => {
      loadAuth();
    });

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, [supabase]);

  const isLinkActive = (href: string) => {
    const [hrefPath, hrefQuery] = href.split("?");
    if (hrefPath !== pathname) return false;
    if (!hrefQuery) return true;

    const target = new URLSearchParams(hrefQuery);
    for (const [k, v] of target.entries()) {
      if (searchParams.get(k) !== v) return false;
    }
    return true;
  };

  const navLinks: Array<{ name: string; href: string; action?: "logout" }> =
    authStatus === "auth"
      ? role === "doctor"
        ? [
            { name: "Dashboard", href: "/doctor" },
            { name: "Schedule", href: "/doctor?tab=schedule" },
            { name: "Appointments", href: "/doctor?tab=appointments" },
            { name: "Profile", href: "/doctor?tab=profile" },
            { name: "Logout", href: "#logout", action: "logout" },
          ]
        : role === "patient"
          ? [
              { name: "Dashboard", href: "/patient" },
              { name: "Appointments", href: "/patient?tab=appointments" },
              { name: "Doctors", href: "/patient?tab=doctors" },
              { name: "Profile", href: "/patient?tab=profile" },
              { name: "Logout", href: "#logout", action: "logout" },
            ]
          : [{ name: "Logout", href: "#logout", action: "logout" }]
      : [
          { name: "Home", href: "/" },
          { name: "Find a Doctor", href: "/doctors" },
          { name: "About Us", href: "/about" },
        ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMobileMenuOpen(false);
    router.push("/auth");
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent",
        isScrolled
          ? "bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-sm border-slate-200/50 dark:border-slate-700/50 py-3"
          : "bg-transparent py-5"
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
             <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/30 transition-transform group-hover:scale-105">
              D
            </div>
            <span className={cn(
              "text-xl font-bold tracking-tight transition-colors",
              isScrolled ? "text-slate-900 dark:text-slate-50" : "text-slate-900 dark:text-slate-50" 
            )}>
              DocBook<span className="text-indigo-600 dark:text-indigo-400">.</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {authStatus !== "loading" &&
              navLinks.map((link) => (
                link.action === "logout" ? (
                  <Button
                    key={link.name}
                    variant="ghost"
                    className="text-slate-600 hover:text-red-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-red-400 dark:hover:bg-slate-800"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                ) : (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-indigo-600 dark:hover:text-indigo-400",
                      isLinkActive(link.href)
                        ? "text-indigo-600 dark:text-indigo-400 font-semibold"
                        : "text-slate-600 dark:text-slate-300"
                    )}
                  >
                    {link.name}
                  </Link>
                )
              ))}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            <ModeToggle />
            {authStatus === "unauth" && (
              <>
                <Link href="/auth?mode=login">
                  <Button variant="ghost" className="text-slate-600 hover:text-indigo-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:text-indigo-400 dark:hover:bg-slate-800">
                    Log in
                  </Button>
                </Link>
                <Link href="/auth?mode=register">
                  <Button className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-md shadow-indigo-500/20 border-0">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="md:hidden flex items-center gap-2">
            <ModeToggle />
            <button
              className="p-2 text-slate-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-b border-slate-100 dark:border-slate-700 shadow-xl p-4 flex flex-col gap-4 animate-in slide-in-from-top-2">
          {authStatus !== "loading" &&
            navLinks.map((link) =>
              link.action === "logout" ? (
                <Button
                  key={link.name}
                  variant="ghost"
                  className="w-full justify-start text-red-600"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              ) : (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-base font-medium text-slate-700 dark:text-slate-300 py-2 hover:text-indigo-600 dark:hover:text-indigo-400"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              )
            )}
          <div className="h-px bg-slate-100 dark:bg-slate-700 my-2" />
          {authStatus === "unauth" && (
            <>
              <Link href="/auth?mode=login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">Log in</Button>
              </Link>
              <Link href="/auth?mode=register" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
