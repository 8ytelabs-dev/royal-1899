import { useEffect, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { ProductDetailModal } from './components/ProductDetailModal';
import { SiteContentProvider } from './context/SiteContentContext';
import { AdminPage } from './pages/AdminPage';
import { BountiesPage } from './pages/BountiesPage';
import { CabinetPage } from './pages/CabinetPage';
import { GuidePage } from './pages/GuidePage';
import { HomePage } from './pages/HomePage';
import { MapPage } from './pages/MapPage';
import { RulesPage } from './pages/RulesPage';
import { StorePage } from './pages/StorePage';
import type { AppRoute, MapRealm, StoreProduct } from './types';

function parseRouteFromPathname(pathname: string): AppRoute {
  if (pathname === '/store' || pathname.startsWith('/store/')) {
    return '/store';
  }
  if (pathname === '/rules' || pathname.startsWith('/rules/')) {
    return '/rules';
  }
  if (pathname === '/map' || pathname.startsWith('/map/')) {
    return '/map';
  }
  if (pathname === '/guide' || pathname.startsWith('/guide/')) {
    return '/guide';
  }
  if (pathname === '/bounties' || pathname.startsWith('/bounties/')) {
    return '/bounties';
  }
  if (pathname === '/cabinet' || pathname.startsWith('/cabinet/')) {
    return '/cabinet';
  }
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return '/admin';
  }
  return '/';
}

export default function App() {
  const [route, setRoute] = useState<AppRoute>(() =>
    parseRouteFromPathname(window.location.pathname),
  );
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);

  useEffect(() => {
    const handlePopState = () => {
      setRoute(parseRouteFromPathname(window.location.pathname));
      window.scrollTo({ top: 0, behavior: 'auto' });
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedProduct(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navigate = (nextRoute: AppRoute) => {
    if (nextRoute !== route) {
      window.history.pushState({}, '', nextRoute);
      setRoute(nextRoute);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openMapLocation = (locationId: string, realm: MapRealm) => {
    const mapParam = realm === 'cuba' ? 'map=cuba&' : '';
    window.history.pushState({}, '', `/map?${mapParam}id=${locationId}`);
    setRoute('/map');
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  return (
    <SiteContentProvider>
      <MotionConfig reducedMotion="user">
        <div className="min-h-screen flex flex-col bg-[#22150d] text-[#ece2cc]">
          <Navbar currentRoute={route} onNavigate={navigate} />

          <main className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={route}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              >
                {route === '/' && (
                  <HomePage
                    onNavigate={navigate}
                    onSelectProduct={setSelectedProduct}
                  />
                )}
                {route === '/store' && (
                  <StorePage onSelectProduct={setSelectedProduct} />
                )}
                {route === '/rules' && <RulesPage />}
                {route === '/map' && <MapPage />}
                {route === '/guide' && <GuidePage onNavigate={navigate} />}
                {route === '/bounties' && (
                  <BountiesPage onOpenMapLocation={openMapLocation} />
                )}
                {route === '/cabinet' && (
                  <CabinetPage onOpenMapLocation={openMapLocation} />
                )}
                {route === '/admin' && <AdminPage onNavigate={navigate} />}
              </motion.div>
            </AnimatePresence>
          </main>

          {route !== '/map' && route !== '/admin' && (
            <Footer onNavigate={navigate} />
          )}

          {/* Modals */}
          <ProductDetailModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        </div>
      </MotionConfig>
    </SiteContentProvider>
  );
}
