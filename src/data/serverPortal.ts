import type {
  GalleryShot,
  GuideFaqItem,
  GuideStep,
  KeybindCategory,
  KeybindItem,
  PlayerCabinetProfile,
  ServerStatusSnapshot,
  WantedStatus,
  WantedSuspect,
} from '../types';

/* ===================== #2 LIVE SERVER STATUS ===================== */
export const INITIAL_SERVER_STATUS: ServerStatusSnapshot = {
  online: true,
  playersOnline: 84,
  maxPlayers: 128,
  queueCount: 3,
  inGameTime: '1899 · ოქტომბერი · 19:40',
  nextRestart: '06:00 (თბილისის დრო)',
  redmLaunchUrl: 'redm://connect/play.royal1899.ge',
};

/* ===================== HOW TO PLAY & KEYBINDS ===================== */
export const GUIDE_STEPS: GuideStep[] = [
  {
    stepNumber: '01',
    title: 'დააინსტალირეთ Red Dead Redemption 2',
    summary: 'საჭიროა ლიცენზირებული PC ვერსია (Steam, Epic Games ან Rockstar Launcher).',
    details:
      'RedM კლიენტი მუშაობს მხოლოდ ორიგინალ ლიცენზირებულ თამაშზე. დარწმუნდით, რომ თამაში ერთხელ მაინც გაქვთ ჩართული და Rockstar Launcher აქტიურია.',
  },
  {
    stepNumber: '02',
    title: 'გადმოწერეთ RedM კლიენტი',
    summary: 'ოფიციალური Cfx.re კლიენტი როლფლეი სერვერებზე შესასვლელად.',
    details:
      'გადმოწერეთ RedM.exe, გაუშვით და მიუთითეთ თქვენი RDR 2-ის საქაღალდე. პირველ ჩართვაზე კლიენტი ავტომატურად ჩამოტვირთავს საჭირო განახლებებს.',
    actionLabel: 'RedM-ის ოფიციალური საიტი',
    actionHref: 'https://redm.net',
    actionType: 'external',
  },
  {
    stepNumber: '03',
    title: 'შემოუერთდით Discord-ს და გაეცანით წესებს',
    summary: 'ვერიფიკაცია და როლფლეის წესების გაცნობა აუცილებელია სერვერზე თამაშისთვის.',
    details:
      'გაწევრიანდით ROYAL 1899-ის Discord სერვერზე, გაიარეთ სწრაფი ვერიფიკაცია და გადახედეთ კოდექსს — ეს დაგეხმარებათ პირველივე დღიდან ხარისხიან RP-ში ჩართვაში.',
    actionLabel: 'წესების კოდექსი',
    actionType: 'route',
    actionRoute: '/rules',
  },
  {
    stepNumber: '04',
    title: 'დაუკავშირდით ROYAL 1899-ს',
    summary: 'გახსენით RedM კლიენტი და შემოუერთდით სერვერს ერთი კლიკით.',
    details:
      'მოძებნეთ სერვერი ROYAL 1899 RedM-ის სიაში ან გამოიყენეთ პირდაპირი შესვლის ღილაკი. შექმენით პერსონაჟი და აირჩიეთ საწყისი რეგიონი.',
    actionLabel: 'RedM-ით შესვლა',
    actionHref: 'redm://connect/play.royal1899.ge',
    actionType: 'external',
  },
];

export const KEYBIND_CATEGORIES: Array<{ id: KeybindCategory; label: string }> = [
  { id: 'all', label: 'ყველა' },
  { id: 'communication', label: 'კომუნიკაცია' },
  { id: 'inventory', label: 'ინვენტარი' },
  { id: 'horse', label: 'ცხენი და ტრანსპორტი' },
  { id: 'roleplay', label: 'როლფლეი' },
];

export const SERVER_KEYBINDS: KeybindItem[] = [
  {
    id: 'kb-voice',
    keys: ['N'],
    action: 'ხმოვანი ჩატი (Push-to-Talk)',
    description: 'დააჭირეთ და დაიჭირეთ ახლოს მყოფ მოთამაშეებთან სასაუბროდ.',
    category: 'communication',
    categoryLabel: 'კომუნიკაცია',
  },
  {
    id: 'kb-voice-range',
    keys: ['Z'],
    action: 'ხმის დისტანციის შეცვლა',
    description: 'გადართვა ჩურჩულს, ჩვეულებრივ საუბარსა და ყვირილს შორის.',
    category: 'communication',
    categoryLabel: 'კომუნიკაცია',
  },
  {
    id: 'kb-chat',
    keys: ['T'],
    action: 'ტექსტური ჩატი / RP ბრძანებები',
    description: 'გამოიყენება /me, /do და სხვა ეპოქალური მოქმედებების აღსაწერად.',
    category: 'communication',
    categoryLabel: 'კომუნიკაცია',
  },
  {
    id: 'kb-inventory',
    keys: ['I'],
    action: 'ჩანთისა და ინვენტარის გახსნა',
    description: 'პირადი ნივთები, საკვები, იარაღი და რანჩოს საწყობთან გადატანა.',
    category: 'inventory',
    categoryLabel: 'ინვენტარი',
  },
  {
    id: 'kb-quickslots',
    keys: ['1', '2', '3', '4'],
    action: 'სწრაფი სლოტები',
    description: 'იარაღის, ფარნის, ბინოკლის ან სასმელის სწრაფი ამოღება.',
    category: 'inventory',
    categoryLabel: 'ინვენტარი',
  },
  {
    id: 'kb-horse-whistle',
    keys: ['H'],
    action: 'ცხენის მოხმობა (სტვენა)',
    description: 'თქვენი აქტიური ცხენის გამოძახება უახლოესი გზიდან.',
    category: 'horse',
    categoryLabel: 'ცხენი და ტრანსპორტი',
  },
  {
    id: 'kb-saddlebag',
    keys: ['B'],
    action: 'ცხენის ხურჯინის გახსნა',
    description: 'ცხენის ახლოს დგომისას გახსენით ხურჯინი ტვირთის შესანახად.',
    category: 'horse',
    categoryLabel: 'ცხენი და ტრანსპორტი',
  },
  {
    id: 'kb-handsup',
    keys: ['X'],
    action: 'ხელების აწევა / ჩაბარება',
    description: 'გამოიყენება დაკავების ან ძარცვის RP სცენების დროს.',
    category: 'roleplay',
    categoryLabel: 'როლფლეი',
  },
  {
    id: 'kb-emotes',
    keys: ['U'],
    action: 'ანიმაციების და ჟესტების მენიუ',
    description: 'დაჯდომა, დაყრდნობა, სიგარის მოწევა, სალუნის და სამუშაო ანიმაციები.',
    category: 'roleplay',
    categoryLabel: 'როლფლეი',
  },
  {
    id: 'kb-radial',
    keys: ['Alt'],
    action: 'ინტერაქციის (Target) მენიუ',
    description: 'სახლის კარებთან, თავლებთან, ვაჭრებთან და ობიექტებთან ურთიერთქმედება.',
    category: 'roleplay',
    categoryLabel: 'როლფლეი',
  },
];

export const GUIDE_FAQS: GuideFaqItem[] = [
  {
    id: 'faq-mic',
    question: 'აუცილებელია მიკროფონი სერვერზე სათამაშოდ?',
    answer:
      'დიახ. ROYAL 1899 სერიოზული ხმოვანი როლფლეის სერვერია — გამართული მიკროფონი აუცილებელია, რათა ყველა სცენა იყოს ცოცხალი და ბუნებრივი.',
  },
  {
    id: 'faq-mexico-cuba',
    question: 'როგორ გადავიდე მექსიკაში ან კუბაზე (Guarma)?',
    answer:
      'მექსიკაში (Nuevo Paraíso) გადასვლა შესაძლებელია San Luis-ის ხიდითა და სასაზღვრო გადასასვლელებით El Presidio-სთან. კუბაზე მოსახვედრად Saint Denis-ის პორტიდან გადის გემი.',
  },
  {
    id: 'faq-ranch',
    question: 'როგორ შევიძინო თავისუფალი სახლი ან რანჩო?',
    answer:
      'გახსენით ჩვენი „რუკა“ გვერდი, აირჩიეთ სასურველი თავისუფალი ლოკაცია, დააკოპირეთ მისი კოორდინატები და დააჭირეთ „შეძენა Discord-ში“ ტიკეტის გასახსნელად.',
  },
  {
    id: 'faq-fps',
    question: 'რა სისტემური მოთხოვნებია კომფორტული თამაშისთვის?',
    answer:
      'თუ ჩვეულებრივი Red Dead Redemption 2 გამართულად გიმუშავებთ, RedM-იც სტაბილურად იმუშავებს. სასურველია SSD დისკი და მინიმუმ 16 GB ოპერატიული მეხსიერება.',
  },
];

/* ===================== #6 WANTED BOUNTY BOARD & RP GALLERY ===================== */
export const WANTED_STATUS_FILTERS: Array<{ id: WantedStatus; label: string }> = [
  { id: 'all', label: 'ყველა საქმე' },
  { id: 'active', label: 'აქტიური ძებნილები' },
  { id: 'captured', label: 'დაკავებულები' },
];

export const WANTED_SUSPECTS: WantedSuspect[] = [
  {
    id: 'bounty-silas-reed',
    name: 'Silas "Blackhat" Reed',
    alias: 'შავი ქუდი',
    rewardUsd: 1250,
    status: 'active',
    dangerLevel: 'განსაკუთრებით საშიში',
    lastSeenRegion: 'New Hanover · Valentine',
    linkedMapId: 'valentine-town',
    linkedMapRealm: 'mainland',
    charges: [
      'ფედერალური მატარებლის ძარცვა',
      'შეიარაღებული წინააღმდეგობა შერიფის მიმართ',
      'ცხენების ქურდობა Heartlands-ში',
    ],
    dossier:
      'ყოფილი კავალერიის მზვერავი, რომელიც კარგად იცნობს New Hanover-ის ხეობებს. ხშირად გადაადგილდება ღამით და სარგებლობს ორმაგი რევოლვერით. მიახლოება რეკომენდებულია მხოლოდ შეიარაღებული ჯგუფით.',
    issuedBy: 'Valentine-ის შერიფის ოფისი',
    portraitUrl: '/src/assets/images/wanted_outlaw_vance_1795134515137.jpg',
    portraitAlt: 'Silas Reed — 1899 წლის სეპია ფოტო ძებნილთა პოსტერისთვის',
  },
  {
    id: 'bounty-elena-morales',
    name: 'Elena "La Sombra" Morales',
    alias: 'სასაზღვრო აჩრდილი',
    rewardUsd: 950,
    status: 'active',
    dangerLevel: 'მაღალი რისკი',
    lastSeenRegion: 'მექსიკა · Nuevo Paraíso',
    linkedMapId: 'chuparosa-town',
    linkedMapRealm: 'mainland',
    charges: [
      'სასაზღვრო ბანკის ინკასაციის გატაცება',
      'იარაღის კონტრაბანდა San Luis-ის გადაღმა',
      'El Presidio-ს საპატიმროდან გაქცევა',
    ],
    dossier:
      'ცნობილია სისწრაფითა და ადგილობრივი კანიონების იდეალური ცოდნით. ბოლოს შენიშნეს Chuparosa-ს მიდამოებში მექსიკის რკინიგზის ხაზთან.',
    issuedBy: 'სასაზღვრო მარშალთა სამმართველო',
    portraitUrl: '/src/assets/images/wanted_bandit_elena_1795134515141.jpg',
    portraitAlt: 'Elena Morales — 1899 წლის სეპია პორტრეტი ძებნილთა დაფაზე',
  },
  {
    id: 'bounty-mateo-salazar',
    name: 'Capt. Mateo Salazar',
    alias: 'კარიბის მელია',
    rewardUsd: 1100,
    status: 'active',
    dangerLevel: 'განსაკუთრებით საშიში',
    lastSeenRegion: 'კუბა · Aguasdulces',
    linkedMapId: 'aguasdulces-port',
    linkedMapRealm: 'cuba',
    charges: [
      'საბაჟო გემის გატაცება Saint Denis-ში',
      'კუბური რომისა და ოქროს არალეგალური გადაზიდვა',
      'Cinco Torres-ის გარნიზონზე თავდასხმა',
    ],
    dossier:
      'კუბის ყურეებისა და რიფების საუკეთესო მცოდნე კაპიტანი. იყენებს ღამის ნისლს Aguasdulces-ისა და Lemoyne-ის სანაპიროებს შორის ტვირთის გადასატანად.',
    issuedBy: 'Saint Denis-ის საზღვაო დეპარტამენტი',
    portraitUrl: '/src/assets/images/wanted_smuggler_mateo_1795134515391.jpg',
    portraitAlt: 'Mateo Salazar — 1899 წლის სეპია პორტრეტი ძებნილთა დაფაზე',
  },
  {
    id: 'bounty-caleb-graves',
    name: 'Caleb "Ironhand" Graves',
    alias: 'რკინის ხელი',
    rewardUsd: 650,
    status: 'captured',
    dangerLevel: 'დაკავებულია',
    lastSeenRegion: 'West Elizabeth · Blackwater',
    linkedMapId: 'blackwater-town',
    linkedMapRealm: 'mainland',
    charges: [
      'Blackwater-ის დილიჟანსის ძარცვა',
      'ყალბი საბანკო თამასუქების დამზადება',
    ],
    dossier:
      'დაკავებულია Blackwater-ის მარშალების მიერ 12 ოქტომბერს. გადაყვანილია ცენტრალურ საპატიმროში სასამართლო პროცესის მოლოდინში.',
    issuedBy: 'West Elizabeth-ის სასამართლო',
    portraitUrl: '/src/assets/images/wanted_bandit_colton_1795135059061.jpg',
    portraitAlt: 'Caleb Graves — დაკავებული ძებნილის არქივის ფოტო',
  },
];

export const RP_GALLERY_SHOTS: GalleryShot[] = [
  {
    id: 'shot-canyon-posse',
    title: 'დაისის პატრული კანიონის მდინარეზე',
    caption: 'მარშალების რაზმი New Austin-ის საზღვრისკენ გადაადგილებისას.',
    photographer: 'Giorgi_RP',
    location: 'New Austin · Rio Bravo',
    dateLabel: 'ოქტომბერი, 1899',
    imageUrl: '/src/assets/images/gallery_canyon_posse_1795134516437.jpg',
    imageAlt: 'ოთხი მხედარი მზის ჩასვლისას კანიონის მდინარეზე გადასვლისას',
  },
  {
    id: 'shot-saloon-poker',
    title: 'ღამის პოკერი Valentine-ის სალუნში',
    caption: 'დიდი ფსონები, ვისკი და საიდუმლო გარიგებები ნავთის ფარნების შუქზე.',
    photographer: 'Luka_1899',
    location: 'New Hanover · Valentine',
    dateLabel: 'ოქტომბერი, 1899',
    imageUrl: '/src/assets/images/gallery_saloon_night_1795134515448.jpg',
    imageAlt: 'სალუნში პოკერის მოთამაშეები 1899 წლის ატმოსფეროში',
  },
  {
    id: 'shot-mexico-hacienda',
    title: 'ოქროს საათი Chuparosa-ს ჰასიენდაზე',
    caption: 'მექსიკის საზღვრის გახსნის პირველი დღე და ცხენების ქარავანი.',
    photographer: 'Nino_West',
    location: 'მექსიკა · Nuevo Paraíso',
    dateLabel: 'ოქტომბერი, 1899',
    imageUrl: '/src/assets/images/map_mexico_hacienda_1795133436761.jpg',
    imageAlt: 'მექსიკური ჰასიენდა მზის ჩასვლისას',
  },
  {
    id: 'shot-cuba-bay',
    title: 'დაბინდება კუბის სანაპიროზე',
    caption: 'Aguasdulces-ის პლანტაციის ვილა და კარიბის ზღვის ყურე.',
    photographer: 'Dato_Captain',
    location: 'კუბა · Aguasdulces',
    dateLabel: 'ოქტომბერი, 1899',
    imageUrl: '/src/assets/images/map_cuba_villa_1795133436283.jpg',
    imageAlt: 'კუბის კოლონიური ვილა პალმებისა და ყურის ფონზე',
  },
  {
    id: 'shot-train-bridge',
    title: '№315 ორთქლმავალი კანიონის ხიდზე',
    caption: 'Cornwall-ის საღამოს რეისი დაბინდების ნისლში.',
    photographer: 'Sandro_Doc',
    location: 'New Hanover · Grizzlies',
    dateLabel: 'სექტემბერი, 1899',
    imageUrl: '/src/assets/images/gazette_train_heist_1795134514831.jpg',
    imageAlt: 'ძველი ორთქლმავალი ხის ხიდზე',
  },
  {
    id: 'shot-frontier-ranch',
    title: 'დილა Big Valley-ს რანჩოზე',
    caption: 'ფერმერების ყოველდღიური საქმიანობა მთის მდელოზე.',
    photographer: 'Tornike_V',
    location: 'West Elizabeth · Big Valley',
    dateLabel: 'სექტემბერი, 1899',
    imageUrl: '/src/assets/images/map_ranch_estate_1795132408491.jpg',
    imageAlt: 'ფრონტიერის რანჩო მთების ხედით',
  },
];

/* ===================== #7 PLAYER CABINET (DEMO / BACKEND-READY) ===================== */
export const DEMO_PLAYER_CABINET: PlayerCabinetProfile = {
  discordTag: 'arthur_vance',
  discordId: '391847205182947328',
  characterName: 'Arthur Vance',
  citizenId: 'R1899-0418',
  occupation: 'რანჩოს მფლობელი · ვაჭარი',
  honorLabel: 'მაღალი რეპუტაცია',
  playtimeHours: 142,
  cashUsd: 1840,
  bankUsd: 12450,
  activeHorse: 'Missouri Fox Trotter · „ქარიშხალი“',
  homeRegion: 'West Elizabeth · Blackwater',
  portraitUrl: '/src/assets/images/cabinet_rancher_arthur_1795135057094.jpg',
  properties: [
    {
      id: 'prop-1',
      mapLocationId: 'blackwater-ranch',
      mapRealm: 'mainland',
      name: 'Blackwater Ranch',
      regionLabel: 'West Elizabeth',
      typeLabel: 'რანჩო · კერძო თავლა',
      storageUsedKg: 215,
      storageCapacityKg: 400,
      paidUntil: '15 ნოემბერი, 2026',
      imageUrl: '/src/assets/images/map_ranch_estate_1795132408491.jpg',
    },
    {
      id: 'prop-2',
      mapLocationId: 'chuparosa-hacienda',
      mapRealm: 'mainland',
      name: 'Chuparosa Hacienda Ranch',
      regionLabel: 'მექსიკა · Nuevo Paraíso',
      typeLabel: 'ჰასიენდა · სავაჭრო ბაზა',
      storageUsedKg: 140,
      storageCapacityKg: 450,
      paidUntil: '28 ნოემბერი, 2026',
      imageUrl: '/src/assets/images/map_mexico_hacienda_1795133436761.jpg',
    },
  ],
  applications: [
    {
      id: 'app-1',
      title: 'Whitelist — ძირითადი წვდომა',
      submittedAt: '02 სექტემბერი, 2026',
      status: 'approved',
      statusLabel: 'დამტკიცებულია',
      reviewerNote: 'პერსონაჟის ისტორია და წესების ცოდნა სრულად დადასტურებულია.',
    },
    {
      id: 'app-2',
      title: 'სავაჭრო ლიცენზია — მექსიკის საზღვარი',
      submittedAt: '12 ოქტომბერი, 2026',
      status: 'pending',
      statusLabel: 'განხილვაშია',
      reviewerNote: 'გადაცემულია ეკონომიკის ადმინისტრატორთან დასამტკიცებლად.',
    },
  ],
  ledger: [
    {
      id: 'tx-1',
      dateLabel: '17 ოქტ, 20:15',
      typeLabel: 'ვაჭრობა',
      description: 'საქონლის ტყავის ჩაბარება · Blackwater Market',
      amountLabel: '+$420',
      isPositive: true,
    },
    {
      id: 'tx-2',
      dateLabel: '15 ოქტ, 18:40',
      typeLabel: 'გადასახადი',
      description: 'Blackwater Ranch — მიწის ყოველკვირეული მოსაკრებელი',
      amountLabel: '-$85',
      isPositive: false,
    },
    {
      id: 'tx-3',
      dateLabel: '12 ოქტ, 22:05',
      typeLabel: 'ჯარიმა',
      description: 'ქალაქში იარაღის ღიად ტარება · Valentine Sheriff',
      amountLabel: '-$50',
      isPositive: false,
    },
    {
      id: 'tx-4',
      dateLabel: '10 ოქტ, 16:30',
      typeLabel: 'ჯილდო',
      description: 'ძებნილის შესახებ ინფორმაციის მიწოდება · Marshal Office',
      amountLabel: '+$250',
      isPositive: true,
    },
  ],
};
