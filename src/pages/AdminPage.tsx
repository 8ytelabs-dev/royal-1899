import { useEffect, useState, type FormEvent } from 'react';
import {
  ArrowUpRight,
  BookOpen,
  FileText,
  LogOut,
  MapPin,
  ShoppingBag,
  SlidersHorizontal,
  Users,
} from 'lucide-react';
import { AdminAccountsPanel } from '../components/admin/AdminAccountsPanel';
import { AdminMapPanel } from '../components/admin/AdminMapPanel';
import { AdminRulesPanel } from '../components/admin/AdminRulesPanel';
import { AdminStorePanel } from '../components/admin/AdminStorePanel';
import { AdminTextsPanel } from '../components/admin/AdminTextsPanel';
import { useSiteContent } from '../context/SiteContentContext';
import {
  fetchCurrentUser,
  loginWithPassword,
  logoutUser,
  type AuthUser,
} from '../services/cmsApi';
import type { AppRoute } from '../types';

interface AdminPageProps {
  onNavigate: (route: AppRoute) => void;
}

type AdminTab = 'texts' | 'store' | 'rules' | 'map' | 'accounts';

export function AdminPage({ onNavigate }: AdminPageProps) {
  const { content } = useSiteContent();
  const [activeTab, setActiveTab] = useState<AdminTab>('texts');
  const [adminUser, setAdminUser] = useState<AuthUser | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchCurrentUser().then((user) => {
      if (!cancelled) {
        setAdminUser(user);
        setAuthChecking(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoggingIn(true);
    setAuthError('');
    try {
      const user = await loginWithPassword(email, password);
      if (user.role !== 'admin') {
        await logoutUser();
        setAuthError('ამ ანგარიშს ადმინისტრატორის უფლება არ აქვს.');
        return;
      }
      setAdminUser(user);
      setPassword('');
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'შესვლა ვერ მოხერხდა.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setAdminUser(null);
      setActiveTab('texts');
      setAuthError('');
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'გამოსვლა ვერ მოხერხდა.');
    }
  };

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
    {
      id: 'accounts',
      label: 'ანგარიშები',
      count: '',
      icon: Users,
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

  if (authChecking) {
    return (
      <div className="min-h-screen pt-28 text-center text-sm text-[#c2b398]">
        ავტორიზაცია მოწმდება…
      </div>
    );
  }

  if (!adminUser || adminUser.role !== 'admin') {
    return (
      <div className="min-h-screen pt-28 md:pt-36 pb-24 px-6 bg-[#180e08]">
        <section className="max-w-md mx-auto bg-[#22150d] border border-[#dcb975]/25 rounded-xl p-7 md:p-9 space-y-6">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-[#dcb975]">
              ROYAL 1899 · CMS
            </p>
            <h1 className="font-display text-2xl font-semibold text-[#ece2cc]">
              ადმინ პანელში შესვლა
            </h1>
            <p className="text-sm leading-relaxed text-[#c2b398]">
              შესვლა შეუძლია მხოლოდ ადმინისტრატორის ანგარიშს.
            </p>
          </div>

          {adminUser ? (
            <div className="space-y-4">
              <p role="alert" className="text-sm text-red-300">
                {authError || 'ამ ანგარიშს ადმინისტრატორის უფლება არ აქვს.'}
              </p>
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="px-4 py-2.5 text-sm font-medium border border-[#ece2cc]/20 text-[#ece2cc] hover:border-[#dcb975] rounded-md transition-colors cursor-pointer"
              >
                სხვა ანგარიშით შესვლა
              </button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="admin-login-email" className="block text-xs font-medium text-[#dcb975] mb-1.5">
                  ელფოსტა
                </label>
                <input
                  id="admin-login-email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#140c07] border border-[#ece2cc]/14 focus:border-[#dcb975] rounded-md text-[#ece2cc] focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="admin-login-password" className="block text-xs font-medium text-[#dcb975] mb-1.5">
                  პაროლი
                </label>
                <input
                  id="admin-login-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#140c07] border border-[#ece2cc]/14 focus:border-[#dcb975] rounded-md text-[#ece2cc] focus:outline-none"
                />
              </div>
              {authError && (
                <p role="alert" className="text-sm text-red-300">
                  {authError}
                </p>
              )}
              <button
                type="submit"
                disabled={loggingIn}
                className="w-full px-5 py-2.5 text-sm font-semibold bg-[#dcb975] text-[#22150d] hover:bg-[#e7c98b] rounded-md transition-colors disabled:opacity-60 cursor-pointer"
              >
                {loggingIn ? 'მიმდინარეობს შესვლა…' : 'შესვლა'}
              </button>
            </form>
          )}
        </section>
      </div>
    );
  }

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

        <div className="mt-auto border-t border-[#ece2cc]/10 p-4">
          <p className="mb-3 truncate text-xs text-[#c2b398]">{adminUser.email}</p>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="inline-flex w-full items-center gap-2 px-3 py-2 text-sm text-[#c2b398] hover:text-[#dcb975] hover:bg-[#1e120b] rounded-md transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            გამოსვლა
          </button>
        </div>
      </aside>

      {/* Expansive Full-Bleed Right Workspace */}
      <div className="flex-1 min-w-0 flex flex-col bg-[#1a1009]">
        {authError && (
          <p role="alert" className="px-4 pt-4 text-sm text-red-300 sm:px-6 lg:px-8">
            {authError}
          </p>
        )}
        <section
          aria-label={activeNav.label}
          className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-5 lg:py-6 min-w-0"
        >
          {activeTab === 'texts' && <AdminTextsPanel />}
          {activeTab === 'store' && <AdminStorePanel />}
          {activeTab === 'rules' && <AdminRulesPanel />}
          {activeTab === 'map' && <AdminMapPanel />}
          {activeTab === 'accounts' && <AdminAccountsPanel />}
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
