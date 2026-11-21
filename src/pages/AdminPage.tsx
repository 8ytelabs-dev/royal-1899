import { useState } from 'react';
import {
  ArrowUpRight,
  BookOpen,
  FileText,
  MapPin,
  ShoppingBag,
  SlidersHorizontal,
} from 'lucide-react';
import { AdminMapPanel } from '../components/admin/AdminMapPanel';
import { AdminRulesPanel } from '../components/admin/AdminRulesPanel';
import { AdminStorePanel } from '../components/admin/AdminStorePanel';
import { AdminTextsPanel } from '../components/admin/AdminTextsPanel';
import { useSiteContent } from '../context/SiteContentContext';
import type { AppRoute } from '../types';

interface AdminPageProps {
  onNavigate: (route: AppRoute) => void;
}

type AdminTab = 'texts' | 'store' | 'rules' | 'map';

export function AdminPage({ onNavigate }: AdminPageProps) {
  const { content } = useSiteContent();
  const [activeTab, setActiveTab] = useState<AdminTab>('texts');

  const navItems: Array<{
    id: AdminTab;
    label: string;
    count: string;
    icon: typeof FileText;
  }> = [
    {
      id: 'texts',
      label: 'ტექსტები & გვერდები',
      count: '4',
      icon: FileText,
    },
    {
      id: 'store',
      label: 'მაღაზიის პროდუქტები',
      count: `${content.products.length}`,
      icon: ShoppingBag,
    },
    {
      id: 'rules',
      label: 'წესების კოდექსი',
      count: `${content.rules.length}`,
      icon: BookOpen,
    },
    {
      id: 'map',
      label: 'ინტერაქტიული რუკა',
      count: `${content.mapLocations.length}`,
      icon: MapPin,
    },
  ];

  const activeNav = navItems.find((item) => item.id === activeTab) ?? navItems[0];

  const quickLinks: Array<{ route: AppRoute; label: string }> = [
    { route: '/', label: 'მთავარი' },
    { route: '/store', label: 'მაღაზია' },
    { route: '/rules', label: 'წესები' },
    { route: '/map', label: 'რუკა' },
    { route: '/guide', label: 'დაწყება' },
    { route: '/bounties', label: 'ძებნილები' },
  ];

  return (
    <div className="pt-16 md:pt-20 min-h-screen w-full bg-[#180e08] flex flex-col lg:flex-row">
      {/* Docked Full-Height Left Sidebar Rail (Flush Left Edge) */}
      <aside className="w-full lg:w-[272px] xl:w-[292px] shrink-0 bg-[#130b06] border-b lg:border-b-0 lg:border-r border-[#ece2cc]/10 lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] flex flex-col overflow-y-auto royal-scroll">
        {/* Workspace Brand Header */}
        <div className="hidden lg:block px-5 py-5 border-b border-[#ece2cc]/10">
          <p className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-[#dcb975]">
            <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>ROYAL 1899 · CMS</span>
          </p>
          <h1 className="mt-1 font-display text-lg font-semibold text-[#ece2cc]">
            მართვის პანელი
          </h1>
          <p className="mt-0.5 text-xs text-[#c2b398]/85 leading-relaxed">
            ცვლილებები მყისიერად აისახება საიტზე
          </p>
        </div>

        {/* Primary Admin Section Navigation */}
        <div className="p-3 lg:px-3.5 lg:py-4">
          <p className="hidden lg:block px-2.5 pb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-[#c2b398]/65">
            განყოფილებები
          </p>
          <nav
            aria-label="ადმინ პანელის განყოფილებები"
            role="tablist"
            className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible pb-0.5 lg:pb-0 royal-scroll"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveTab(item.id)}
                  className={`group shrink-0 lg:shrink lg:w-full px-3.5 py-2.5 lg:py-3 rounded-lg text-left flex items-center justify-between gap-3 transition-colors cursor-pointer border ${
                    active
                      ? 'bg-[#25170e] border-[#dcb975]/40 text-[#dcb975]'
                      : 'bg-transparent border-transparent text-[#ece2cc]/82 hover:bg-[#1e120b] hover:text-[#ece2cc]'
                  }`}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        active
                          ? 'text-[#dcb975]'
                          : 'text-[#c2b398] group-hover:text-[#dcb975]/80'
                      }`}
                      aria-hidden="true"
                    />
                    <span className="text-sm font-medium whitespace-nowrap lg:truncate">
                      {item.label}
                    </span>
                  </span>
                  <span
                    className={`font-mono text-xs tabular-nums shrink-0 ${
                      active ? 'text-[#dcb975]' : 'text-[#c2b398]/70'
                    }`}
                  >
                    {item.count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Public Page Links (Desktop Sidebar) */}
        <div className="hidden lg:block px-5 py-4 border-t border-[#ece2cc]/10 space-y-2.5">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#c2b398]/65">
            საიტის გვერდები
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {quickLinks.map((link) => (
              <a
                key={link.route}
                href={link.route}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(link.route);
                }}
                className="inline-flex items-center justify-between gap-1 px-2.5 py-2 text-xs text-[#c2b398] hover:text-[#dcb975] bg-[#1a1009] border border-[#ece2cc]/8 hover:border-[#dcb975]/35 rounded-md transition-colors"
              >
                <span className="truncate">{link.label}</span>
                <ArrowUpRight className="w-3 h-3 shrink-0 opacity-70" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </aside>

      {/* Expansive Full-Bleed Right Workspace */}
      <div className="flex-1 min-w-0 flex flex-col bg-[#1a1009]">
        <section
          aria-label={activeNav.label}
          className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-5 lg:py-6 min-w-0"
        >
          {activeTab === 'texts' && <AdminTextsPanel />}
          {activeTab === 'store' && <AdminStorePanel />}
          {activeTab === 'rules' && <AdminRulesPanel />}
          {activeTab === 'map' && <AdminMapPanel />}
        </section>

        {/* Mobile/Tablet Quick Site Links */}
        <div className="lg:hidden border-t border-[#ece2cc]/10 bg-[#130b06] px-4 sm:px-6 py-4">
          <div className="flex flex-wrap items-center gap-2">
            {quickLinks.map((link) => (
              <a
                key={link.route}
                href={link.route}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(link.route);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#c2b398] hover:text-[#dcb975] bg-[#1e120b] border border-[#ece2cc]/10 rounded-md"
              >
                <span>{link.label}</span>
                <ArrowUpRight className="w-3 h-3 opacity-70" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
