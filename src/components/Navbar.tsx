import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Map as MapIcon, Menu, User, X } from 'lucide-react';
import { SITE_CONFIG } from '../config/siteConfig';
import { useSiteContent } from '../context/SiteContentContext';
import type { AppRoute } from '../types';
import { DiscordIcon } from './DiscordIcon';

interface NavbarProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
}

const NAV_ITEMS: Array<{ route: AppRoute; label: string }> = [
  { route: '/', label: 'მთავარი' },
  { route: '/store', label: 'მაღაზია' },
  { route: '/rules', label: 'წესები' },
  { route: '/bounties', label: 'ძებნილები' },
];

export function Navbar({ currentRoute, onNavigate }: NavbarProps) {
  const { content } = useSiteContent();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 36);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isTransparentHeroBar = currentRoute === '/' && !isScrolled && !mobileMenuOpen;

  const handleLinkClick = (route: AppRoute) => {
    setMobileMenuOpen(false);
    onNavigate(route);
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-colors duration-300 ${
        isTransparentHeroBar
          ? 'bg-transparent border-b border-transparent'
          : 'bg-[#22150d]/92 backdrop-blur-md border-b border-[#ece2cc]/12'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 md:h-20 flex items-center justify-between gap-6">
        {/* Zone 1: Official ROYAL 1899 WebP Logo */}
        <a
          href="/"
          aria-label={SITE_CONFIG.brandName}
          onClick={(e) => {
            e.preventDefault();
            handleLinkClick('/');
          }}
          className="inline-flex items-center h-12 md:h-14 overflow-hidden shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#dcb975] rounded-sm"
        >
          <img
            src={SITE_CONFIG.logoUrl}
            alt={SITE_CONFIG.brandName}
            className="h-24 md:h-28 w-auto object-contain select-none"
          />
        </a>

        {/* Zone 2: Clean Single-Line Typography Navigation Links */}
        <nav
          aria-label="მთავარი ნავიგაცია"
          className="hidden lg:flex items-center gap-6 text-sm font-medium"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = currentRoute === item.route;
            return (
              <a
                key={item.route}
                href={item.route}
                aria-current={isActive ? 'page' : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick(item.route);
                }}
                className={`relative py-1 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#dcb975] rounded-sm ${
                  isActive
                    ? 'text-[#dcb975]'
                    : 'text-[#ece2cc]/85 hover:text-[#ece2cc]'
                }`}
              >
                {item.label}
                {isActive && (
                  <motion.span
                    layoutId="nav-active-underline"
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute left-0 right-0 -bottom-0.5 h-[1.5px] bg-[#dcb975]"
                  />
                )}
              </a>
            );
          })}
        </nav>

        {/* Zone 3: Cabinet + Map Right Next to Discord + Mobile Menu Trigger */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="/cabinet"
            aria-current={currentRoute === '/cabinet' ? 'page' : undefined}
            onClick={(e) => {
              e.preventDefault();
              handleLinkClick('/cabinet');
            }}
            className={`hidden lg:inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#dcb975] ${
              currentRoute === '/cabinet'
                ? 'text-[#dcb975] bg-[#2c1c12]'
                : 'text-[#ece2cc]/85 hover:text-[#dcb975]'
            }`}
          >
            <User className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>კაბინეტი</span>
          </a>

          <a
            href="/map"
            aria-current={currentRoute === '/map' ? 'page' : undefined}
            onClick={(e) => {
              e.preventDefault();
              handleLinkClick('/map');
            }}
            className={`hidden lg:inline-flex items-center justify-center gap-2 px-3.5 py-2 text-sm font-medium rounded-md whitespace-nowrap shrink-0 transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#dcb975] ${
              currentRoute === '/map'
                ? 'bg-[#2c1c12] border border-[#dcb975] text-[#dcb975]'
                : 'bg-[#22150d]/70 border border-[#ece2cc]/25 text-[#ece2cc] hover:border-[#dcb975] hover:text-[#dcb975]'
            }`}
          >
            <MapIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>რუკა</span>
          </a>

          <a
            href={content.copy.general.discordInvite}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold bg-[#dcb975] text-[#22150d] hover:bg-[#e7c98b] active:scale-[0.98] transition-all duration-150 rounded-md whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ece2cc]"
          >
            <DiscordIcon className="w-4 h-4 shrink-0" />
            <span>დისქორდი</span>
          </a>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'მენიუს დახურვა' : 'მენიუს გახსნა'}
            className="lg:hidden inline-flex items-center justify-center w-11 h-11 text-[#ece2cc] hover:text-[#dcb975] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#dcb975] rounded-md"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" aria-hidden="true" />
            ) : (
              <Menu className="w-6 h-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile & Tablet Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            aria-label="მობილური ნავიგაცია"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden bg-[#22150d] border-b border-[#ece2cc]/15 px-6 py-5 max-h-[82vh] overflow-y-auto royal-scroll"
          >
            <div className="flex flex-col gap-1">
              {[...NAV_ITEMS, { route: '/cabinet' as AppRoute, label: 'მოთამაშის კაბინეტი' }].map(
                (item) => {
                  const isActive = currentRoute === item.route;
                  return (
                    <a
                      key={item.route}
                      href={item.route}
                      aria-current={isActive ? 'page' : undefined}
                      onClick={(e) => {
                        e.preventDefault();
                        handleLinkClick(item.route);
                      }}
                      className={`py-3 text-base font-medium border-b border-[#ece2cc]/8 transition-colors ${
                        isActive ? 'text-[#dcb975]' : 'text-[#ece2cc]'
                      }`}
                    >
                      {item.label}
                    </a>
                  );
                },
              )}

              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <a
                  href="/map"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLinkClick('/map');
                  }}
                  className={`inline-flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium border rounded-md transition-colors ${
                    currentRoute === '/map'
                      ? 'bg-[#2c1c12] border-[#dcb975] text-[#dcb975]'
                      : 'bg-[#2c1c12] border-[#ece2cc]/20 text-[#ece2cc]'
                  }`}
                >
                  <MapIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>რუკა</span>
                </a>

                <a
                  href={content.copy.general.discordInvite}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold bg-[#dcb975] text-[#22150d] hover:bg-[#e7c98b] transition-colors rounded-md"
                >
                  <DiscordIcon className="w-4 h-4 shrink-0" />
                  <span>დისქორდი</span>
                </a>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
