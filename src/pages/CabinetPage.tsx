import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Check,
  Clock,
  FileText,
  Home,
  LogOut,
  MapPin,
  ReceiptText,
  ShieldCheck,
  User,
} from 'lucide-react';
import { DiscordIcon } from '../components/DiscordIcon';
import { MediaImage } from '../components/MediaImage';
import { useSiteContent } from '../context/SiteContentContext';
import { DEMO_PLAYER_CABINET } from '../data/serverPortal';
import { formatUsdReward } from '../lib/portalLogic';
import type { MapRealm } from '../types';

interface CabinetPageProps {
  onOpenMapLocation: (locationId: string, realm: MapRealm) => void;
}

type CabinetTab = 'overview' | 'properties' | 'applications' | 'ledger';

const CABINET_TABS: Array<{ id: CabinetTab; label: string }> = [
  { id: 'overview', label: 'მიმოხილვა' },
  { id: 'properties', label: 'ჩემი ქონება' },
  { id: 'applications', label: 'განაცხადები' },
  { id: 'ledger', label: 'ისტორია და ჯარიმები' },
];

export function CabinetPage({ onOpenMapLocation }: CabinetPageProps) {
  const { content } = useSiteContent();
  const cabinetCopy = content.copy.cabinet;
  const [signedInDemo, setSignedInDemo] = useState(false);
  const [activeTab, setActiveTab] = useState<CabinetTab>('overview');
  const [authNotice, setAuthNotice] = useState(false);

  const profile = DEMO_PLAYER_CABINET;

  const handleDiscordAuthClick = () => {
    // Frontend-only placeholder hook: replace with window.location.href = '/api/auth/discord' when backend is added
    setAuthNotice(true);
  };

  if (!signedInDemo) {
    return (
      <div className="pt-28 md:pt-36 pb-24">
        <section className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 lg:grid-cols-12 items-stretch bg-[#2c1c12] border border-[#dcb975]/25 rounded-xl overflow-hidden shadow-2xl"
          >
            {/* Left Editorial Welcome */}
            <div className="lg:col-span-7 p-8 md:p-12 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <p className="text-xs font-medium tracking-wider text-[#dcb975]">
                  {cabinetCopy.eyebrow}
                </p>
                <h1 className="font-display text-3xl md:text-4xl font-semibold text-[#ece2cc] leading-tight">
                  {cabinetCopy.heading}
                </h1>
                <p className="text-sm md:text-base leading-relaxed text-[#c2b398]">
                  {cabinetCopy.subtitle}
                </p>

                <ul className="space-y-3 pt-3 text-sm text-[#ece2cc]/90 border-t border-[#ece2cc]/10">
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#dcb975] shrink-0 mt-0.5" aria-hidden="true" />
                    <span>პერსონაჟის ფინანსები, სათამაშო საათები და აქტიური ცხენი</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#dcb975] shrink-0 mt-0.5" aria-hidden="true" />
                    <span>ნაყიდი რანჩოებისა და სახლების მართვა პირდაპირ რუკაზე გადასვლით</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-[#dcb975] shrink-0 mt-0.5" aria-hidden="true" />
                    <span>Whitelist-ისა და ლიცენზიების სტატუსი + ჯარიმების ისტორია</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3 pt-4 border-t border-[#ece2cc]/10">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleDiscordAuthClick}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2.5 px-6 py-3 text-sm font-semibold bg-[#dcb975] text-[#22150d] hover:bg-[#e7c98b] active:scale-[0.98] transition-all rounded-md whitespace-nowrap cursor-pointer"
                  >
                    <DiscordIcon className="w-4 h-4 shrink-0" />
                    <span>შესვლა Discord-ით</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthNotice(false);
                      setSignedInDemo(true);
                    }}
                    data-testid="cabinet-demo-enter"
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium bg-[#22150d] border border-[#dcb975]/45 text-[#ece2cc] hover:border-[#dcb975] hover:text-[#dcb975] transition-colors rounded-md whitespace-nowrap cursor-pointer"
                  >
                    <User className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>დემო კაბინეტის ნახვა</span>
                  </button>
                </div>

                {authNotice && (
                  <p className="text-xs leading-relaxed text-[#dcb975] bg-[#22150d] border border-[#dcb975]/30 rounded-md px-4 py-3">
                    Discord OAuth ავტორიზაცია გააქტიურდება თქვენი ბექენდის მიბმისთანავე
                    (მაგ. <code className="font-mono">/api/auth/discord</code>). მანამდე
                    შეგიძლიათ დაათვალიეროთ სრული ინტერფეისი „დემო კაბინეტის ნახვა“ ღილაკით.
                  </p>
                )}
              </div>
            </div>

            {/* Right Visual Passport Preview */}
            <div className="lg:col-span-5 bg-[#1b1009] p-8 md:p-10 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-[#ece2cc]/10 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-mono text-[#c2b398]">
                  <span>CITIZEN PASSPORT</span>
                  <span className="text-[#dcb975]">1899</span>
                </div>

                <div className="aspect-[4/3] rounded-lg overflow-hidden border border-[#dcb975]/30 bg-[#180e08]">
                  <MediaImage
                    src="/src/assets/images/gallery_saloon_night_1795134515448.jpg"
                    alt="ROYAL 1899 პერსონაჟის კაბინეტის პრევიუ"
                    fallbackTitle="ROYAL 1899 კაბინეტი"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="space-y-2 text-xs text-[#c2b398] border-t border-[#ece2cc]/10 pt-4">
                <p className="text-[#ece2cc] font-medium">უსაფრთხო Discord OAuth2</p>
                <p className="leading-relaxed">
                  კაბინეტი იყენებს მხოლოდ Discord-ის იდენტიფიკატორს პერსონაჟის
                  მონაცემების RedM ბაზასთან სინქრონიზაციისთვის.
                </p>
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    );
  }

  return (
    <div className="pt-28 md:pt-36 pb-24" data-testid="cabinet-dashboard">
      <div className="max-w-6xl mx-auto px-6 space-y-8">
        {/* Character Passport Header Card */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="bg-[#2c1c12] border border-[#dcb975]/30 rounded-xl p-6 md:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-20 h-24 rounded-lg overflow-hidden border border-[#dcb975]/45 bg-[#180e08] shrink-0">
              <MediaImage
                src={profile.portraitUrl}
                alt={profile.characterName}
                fallbackTitle={profile.characterName}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#dcb975]">
                <span className="font-mono">{profile.citizenId}</span>
                <span aria-hidden="true" className="text-[#c2b398]">·</span>
                <span>{profile.honorLabel}</span>
                <span aria-hidden="true" className="text-[#c2b398]">·</span>
                <span className="text-[#c2b398]">Discord: @{profile.discordTag}</span>
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-semibold text-[#ece2cc]">
                {profile.characterName}
              </h1>
              <p className="text-sm text-[#c2b398]">
                {profile.occupation} · {profile.homeRegion}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 lg:justify-end">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-[#c2b398]">ნაღდი ფული</p>
                <p className="font-mono text-xl font-semibold text-[#ece2cc] tabular-nums">
                  {formatUsdReward(profile.cashUsd)}
                </p>
              </div>
              <div className="h-8 w-px bg-[#ece2cc]/12" aria-hidden="true" />
              <div>
                <p className="text-xs text-[#c2b398]">ბანკი</p>
                <p className="font-mono text-xl font-semibold text-[#dcb975] tabular-nums">
                  {formatUsdReward(profile.bankUsd)}
                </p>
              </div>
              <div className="h-8 w-px bg-[#ece2cc]/12" aria-hidden="true" />
              <div>
                <p className="text-xs text-[#c2b398]">სათამაშო დრო</p>
                <p className="font-mono text-xl font-semibold text-[#ece2cc] tabular-nums">
                  {profile.playtimeHours} სთ
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSignedInDemo(false)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium bg-[#22150d] border border-[#ece2cc]/15 hover:border-[#dcb975] text-[#c2b398] hover:text-[#ece2cc] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              <span>გამოსვლა</span>
            </button>
          </div>
        </motion.section>

        {/* Cabinet Section Tabs */}
        <div
          role="tablist"
          aria-label="კაბინეტის განყოფილებები"
          className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#180e08] border border-[#ece2cc]/10 rounded-lg w-fit"
        >
          {CABINET_TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-[#dcb975] text-[#22150d]'
                    : 'text-[#c2b398] hover:text-[#ece2cc]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-[#2c1c12] border border-[#ece2cc]/12 rounded-xl p-6 md:p-7 space-y-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-xl font-semibold text-[#ece2cc]">
                  პერსონაჟის მონაცემები
                </h2>
                <span className="text-xs font-mono text-[#dcb975]">
                  დემო პროფილი
                </span>
              </div>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#ece2cc]/10 text-sm">
                <div className="bg-[#22150d] rounded-lg p-4 space-y-1">
                  <dt className="text-xs text-[#c2b398]">აქტიური ცხენი</dt>
                  <dd className="font-medium text-[#ece2cc]">{profile.activeHorse}</dd>
                </div>
                <div className="bg-[#22150d] rounded-lg p-4 space-y-1">
                  <dt className="text-xs text-[#c2b398]">მუდმივი რეგიონი</dt>
                  <dd className="font-medium text-[#ece2cc]">{profile.homeRegion}</dd>
                </div>
                <div className="bg-[#22150d] rounded-lg p-4 space-y-1">
                  <dt className="text-xs text-[#c2b398]">საკუთრებები რუკაზე</dt>
                  <dd className="font-mono font-medium text-[#dcb975] tabular-nums">
                    {profile.properties.length} აქტიური ლოკაცია
                  </dd>
                </div>
                <div className="bg-[#22150d] rounded-lg p-4 space-y-1">
                  <dt className="text-xs text-[#c2b398]">Discord ID</dt>
                  <dd className="font-mono text-xs text-[#ece2cc]/90">
                    {profile.discordId}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="lg:col-span-5 bg-[#2c1c12] border border-[#ece2cc]/12 rounded-xl p-6 md:p-7 flex flex-col justify-between gap-5">
              <div className="space-y-3">
                <p className="inline-flex items-center gap-2 text-xs text-[#dcb975]">
                  <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                  <span>სწრაფი მოქმედებები</span>
                </p>
                <h2 className="font-display text-xl font-semibold text-[#ece2cc]">
                  ქონების მართვა და მხარდაჭერა
                </h2>
                <p className="text-sm leading-relaxed text-[#c2b398]">
                  თქვენი რანჩოს გადასახადების გახანგრძლივება, გასაღების გადაცემა
                  ან ახალი ლოკაციის დამატება ხდება Discord ტიკეტით.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[#ece2cc]/10">
                <button
                  type="button"
                  onClick={() => setActiveTab('properties')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold bg-[#dcb975] text-[#22150d] hover:bg-[#e7c98b] rounded-md cursor-pointer"
                >
                  <Home className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>ჩემი ქონება</span>
                </button>
                <a
                  href={content.copy.general.discordInvite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium bg-[#22150d] border border-[#ece2cc]/20 text-[#ece2cc] hover:border-[#dcb975] rounded-md"
                >
                  <DiscordIcon className="w-3.5 h-3.5" />
                  <span>Discord ტიკეტი</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* TAB: MY PROPERTIES (Deep-linked to /map) */}
        {activeTab === 'properties' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="cabinet-properties">
            {profile.properties.map((prop) => {
              const pct = Math.round((prop.storageUsedKg / prop.storageCapacityKg) * 100);
              return (
                <article
                  key={prop.id}
                  className="bg-[#2c1c12] border border-[#ece2cc]/12 rounded-xl overflow-hidden flex flex-col justify-between"
                >
                  <div className="aspect-[16/9] bg-[#180e08]">
                    <MediaImage
                      src={prop.imageUrl}
                      alt={prop.name}
                      fallbackTitle={prop.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <p className="text-xs text-[#dcb975]">
                        {prop.regionLabel} · {prop.typeLabel}
                      </p>
                      <h3 className="font-display text-xl font-semibold text-[#ece2cc] mt-1">
                        {prop.name}
                      </h3>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs text-[#c2b398] font-mono tabular-nums">
                        <span>საწყობის შევსება</span>
                        <span>
                          {prop.storageUsedKg} / {prop.storageCapacityKg} კგ
                        </span>
                      </div>
                      <div className="h-1.5 bg-[#180e08] rounded-full overflow-hidden">
                        <div
                          style={{ width: `${pct}%` }}
                          className="h-full bg-[#dcb975] rounded-full"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#ece2cc]/10 flex items-center justify-between gap-3">
                      <span className="text-xs text-[#c2b398]">
                        გადახდილია: <strong className="text-[#ece2cc]">{prop.paidUntil}</strong>
                      </span>

                      <button
                        type="button"
                        onClick={() => onOpenMapLocation(prop.mapLocationId, prop.mapRealm)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#dcb975] text-[#22150d] hover:bg-[#e7c98b] rounded-md whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>რუკაზე ნახვა</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* TAB: APPLICATIONS */}
        {activeTab === 'applications' && (
          <div className="space-y-4">
            {profile.applications.map((app) => (
              <div
                key={app.id}
                className="bg-[#2c1c12] border border-[#ece2cc]/12 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-[#c2b398]">
                    <FileText className="w-3.5 h-3.5 text-[#dcb975]" aria-hidden="true" />
                    <span>გაგზავნილია: {app.submittedAt}</span>
                  </div>
                  <h3 className="font-display text-lg font-semibold text-[#ece2cc]">
                    {app.title}
                  </h3>
                  <p className="text-sm text-[#c2b398]">{app.reviewerNote}</p>
                </div>

                <div className="inline-flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap shrink-0">
                  {app.status === 'approved' ? (
                    <span className="inline-flex items-center gap-1.5 text-[#dcb975]">
                      <Check className="w-4 h-4" aria-hidden="true" />
                      <span>{app.statusLabel}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[#ece2cc]/85">
                      <Clock className="w-4 h-4 text-[#dcb975]" aria-hidden="true" />
                      <span>{app.statusLabel}</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB: LEDGER & FINES */}
        {activeTab === 'ledger' && (
          <div className="bg-[#2c1c12] border border-[#ece2cc]/12 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#ece2cc]/10 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-[#ece2cc] inline-flex items-center gap-2">
                <ReceiptText className="w-4 h-4 text-[#dcb975]" aria-hidden="true" />
                <span>ფინანსური და საჯარიმო ჩანაწერები</span>
              </h2>
            </div>

            <div className="overflow-x-auto royal-scroll">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[#ece2cc]/10 text-xs text-[#c2b398] bg-[#22150d]/60">
                    <th className="py-3.5 px-6 font-medium">თარიღი</th>
                    <th className="py-3.5 px-6 font-medium">ტიპი</th>
                    <th className="py-3.5 px-6 font-medium">აღწერა</th>
                    <th className="py-3.5 px-6 font-medium text-right">თანხა</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ece2cc]/8">
                  {profile.ledger.map((row) => (
                    <tr key={row.id} className="hover:bg-[#22150d]/40 transition-colors">
                      <td className="py-3.5 px-6 font-mono text-xs text-[#c2b398] whitespace-nowrap">
                        {row.dateLabel}
                      </td>
                      <td className="py-3.5 px-6 text-xs text-[#dcb975] whitespace-nowrap">
                        {row.typeLabel}
                      </td>
                      <td className="py-3.5 px-6 text-[#ece2cc]/90">{row.description}</td>
                      <td
                        className={`py-3.5 px-6 font-mono font-semibold text-right tabular-nums whitespace-nowrap ${
                          row.isPositive ? 'text-[#dcb975]' : 'text-[#e3967d]'
                        }`}
                      >
                        {row.amountLabel}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
