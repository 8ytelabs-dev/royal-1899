import { SITE_CONFIG } from '../config/siteConfig';
import { useSiteContent } from '../context/SiteContentContext';
import type { AppRoute } from '../types';
import { DiscordIcon } from './DiscordIcon';

interface FooterProps {
  onNavigate: (route: AppRoute) => void;
}

const DEVRA_STUDIO_URL = 'https://devrastudio.ge';

function renderDisclaimer(text: string) {
  const parts = text.split('DevraStudio');
  if (parts.length === 1) {
    return text;
  }
  return parts.flatMap((part, index) =>
    index === 0
      ? [part]
      : [
          <a
            key={`devra-${index}`}
            href={DEVRA_STUDIO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#f97316] hover:text-[#fb923c] underline-offset-4 hover:underline transition-colors"
          >
            DevraStudio
          </a>,
          part,
        ],
  );
}

export function Footer({ onNavigate }: FooterProps) {
  const { content } = useSiteContent();
  const general = content.copy.general;

  return (
    <footer className="bg-[#180e08] border-t border-[#ece2cc]/10 text-[#ece2cc]">
      <div className="max-w-6xl mx-auto px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-[#ece2cc]/10">
          {/* Brand Logo & Description */}
          <div className="md:col-span-5 space-y-4">
            <a
              href="/"
              aria-label={general.brandName}
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/');
              }}
              className="inline-flex items-center h-12 overflow-hidden"
            >
              <img
                src={SITE_CONFIG.logoUrl}
                alt={general.brandName}
                className="h-24 w-auto object-contain select-none"
              />
            </a>
            <p className="text-sm leading-relaxed text-[#c2b398] max-w-sm">
              {general.footerDescription}
            </p>
          </div>

          {/* Navigation */}
          <div className="md:col-span-4 space-y-4">
            <h3 className="font-display text-sm font-semibold text-[#dcb975]">
              ნავიგაცია
            </h3>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm text-[#c2b398]">
              {[
                { route: '/' as AppRoute, label: 'მთავარი' },
                { route: '/store' as AppRoute, label: 'მაღაზია' },
                { route: '/rules' as AppRoute, label: 'წესების კოდექსი' },
                { route: '/bounties' as AppRoute, label: 'ძებნილთა დაფა' },
                { route: '/map' as AppRoute, label: 'სერვერის რუკა' },
                { route: '/login' as AppRoute, label: 'კაბინეტი' },
                { route: '/guide' as AppRoute, label: 'თამაშის დაწყება' },
              ].map((link) => (
                <li key={link.route}>
                  <a
                    href={link.route}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(link.route);
                    }}
                    className="hover:text-[#ece2cc] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Community & Info */}
          <div className="md:col-span-3 space-y-4">
            <h3 className="font-display text-sm font-semibold text-[#dcb975]">
              საზოგადოება და მხარდაჭერა
            </h3>
            <ul className="space-y-2.5 text-sm text-[#c2b398]">
              <li>
                <a
                  href={general.discordInvite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-[#dcb975] transition-colors"
                >
                  <DiscordIcon className="w-4 h-4 text-[#dcb975]" />
                  <span>{general.discordDisplay}</span>
                </a>
              </li>
              <li>ელ-ფოსტა: {general.supportEmail}</li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Disclaimer */}
        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#c2b398]/80">
          <p>© {new Date().getFullYear()} {general.brandName}. ყველა უფლება დაცულია.</p>
          <p className="max-w-md sm:text-right">
            {renderDisclaimer(general.footerDisclaimer)}
          </p>
        </div>
      </div>
    </footer>
  );
}
