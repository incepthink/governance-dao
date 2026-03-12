import { Link, useLocation } from "react-router-dom";
import { Vote, Menu, X, User, LayoutDashboard, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState } from "react";

export function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { to: "/", label: "Explore", icon: Compass },
    { to: "/owner", label: "Owner", icon: LayoutDashboard },
    { to: "/profile", label: "Profile", icon: User },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Vote className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-mono text-lg font-bold text-foreground">
            HashVote
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link key={link.to} to={link.to}>
              <Button
                variant="ghost"
                size="sm"
                className={`font-mono text-sm ${
                  isActive(link.to)
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Button>
            </Link>
          ))}
        </div>

        {/* Wallet + Mobile Toggle */}
        <div className="flex items-center gap-2">
          <ConnectButton.Custom>
            {({ account, chain, openAccountModal, openConnectModal, mounted }) => {
              const connected = mounted && account && chain;
              return (
                <div {...(!mounted && { 'aria-hidden': true, style: { opacity: 0, pointerEvents: 'none', userSelect: 'none' } })}>
                  {connected ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="font-mono text-sm"
                      onClick={openAccountModal}
                    >
                      {account.displayName}
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      className="font-mono text-sm"
                      onClick={openConnectModal}
                    >
                      Connect Wallet
                    </Button>
                  )}
                </div>
              );
            }}
          </ConnectButton.Custom>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t border-border bg-background p-4 md:hidden">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
            >
              <div
                className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                  isActive(link.to) ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <link.icon className="h-4 w-4" />
                <span className="font-mono text-sm">{link.label}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
