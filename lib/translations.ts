export type Lang = 'en' | 'hi' | 'te' | 'ta' | 'mr' | 'pa';

export const LANGUAGES: { code: Lang; name: string; nativeName: string; flag: string }[] = [
  { code: 'en', name: 'English',  nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi',    nativeName: 'हिंदी',   flag: '🇮🇳' },
  { code: 'te', name: 'Telugu',   nativeName: 'తెలుగు',  flag: '🌾' },
  { code: 'ta', name: 'Tamil',    nativeName: 'தமிழ்',   flag: '🌿' },
  { code: 'mr', name: 'Marathi',  nativeName: 'मराठी',   flag: '🪷' },
  { code: 'pa', name: 'Punjabi',  nativeName: 'ਪੰਜਾਬੀ',  flag: '🌻' },
];

export const T = {
  // Navigation
  nav_dashboard:    { en: 'Dashboard',        hi: 'डैशबोर्ड',      te: 'డాష్‌బోర్డ్',      ta: 'டாஷ்போர்டு',    mr: 'डॅशबोर्ड',       pa: 'ਡੈਸ਼ਬੋਰਡ' },
  nav_disease:      { en: 'Disease Detection', hi: 'रोग पहचान',     te: 'వ్యాధి గుర్తింపు', ta: 'நோய் கண்டறிதல்', mr: 'रोग शोध',        pa: 'ਰੋਗ ਪਛਾਣ' },
  nav_fertilizer:   { en: 'Fertilizer',        hi: 'खाद सलाह',      te: 'ఎరువు సలహా',       ta: 'உர ஆலோசனை',      mr: 'खत सल्ला',       pa: 'ਖਾਦ ਸਲਾਹ' },
  nav_market:       { en: 'Market Prices',      hi: 'बाजार भाव',     te: 'మార్కెట్ ధరలు',    ta: 'சந்தை விலைகள்',  mr: 'बाजार भाव',      pa: 'ਮੰਡੀ ਭਾਅ' },
  nav_calendar:     { en: 'Crop Calendar',      hi: 'फसल कैलेंडर',   te: 'పంట క్యాలెండర్',   ta: 'பயிர் நாட்காட்டி', mr: 'पीक दिनदर्शिका', pa: 'ਫਸਲ ਕੈਲੰਡਰ' },
  nav_voice:        { en: 'AI Assistant',       hi: 'AI सहायक',      te: 'AI సహాయకుడు',      ta: 'AI உதவியாளர்',   mr: 'AI सहाय्यक',     pa: 'AI ਸਹਾਇਕ' },
  nav_yield:        { en: 'Yield Predictor',    hi: 'उपज अनुमान',    te: 'దిగుబడి అంచనా',    ta: 'மகசூல் கணிப்பு', mr: 'उत्पादन अंदाज',  pa: 'ਝਾੜ ਅੰਦਾਜ਼ਾ' },
  nav_irrigation:   { en: 'Irrigation',         hi: 'सिंचाई',         te: 'నీటిపారుదల',       ta: 'நீர்ப்பாசனம்',   mr: 'सिंचन',          pa: 'ਸਿੰਚਾਈ' },
  nav_expenses:     { en: 'Expenses',           hi: 'खर्च ट्रैकर',   te: 'ఖర్చుల ట్రాకర్',  ta: 'செலவு கண்காணி',  mr: 'खर्च ट्रॅकर',   pa: 'ਖਰਚ ਟਰੈਕਰ' },
  nav_signin:       { en: 'Sign In',            hi: 'लॉग इन',         te: 'సైన్ ఇన్',         ta: 'உள்நுழை',        mr: 'लॉग इन',         pa: 'ਸਾਈਨ ਇਨ' },

  // Dashboard
  dash_welcome:     { en: 'Welcome back',       hi: 'वापसी पर स्वागत', te: 'తిరిగి స్వాగతం',  ta: 'மீண்டும் வரவேற்கிறோம்', mr: 'पुन्हा स्वागत', pa: 'ਵਾਪਸੀ ਤੇ ਸੁਆਗਤ' },
  dash_hero_title:  { en: 'AI-Powered Farming', hi: 'AI-संचालित खेती', te: 'AI-ఆధారిత వ్యవసాయం', ta: 'AI-இயக்கப்பட்ட விவசாயம்', mr: 'AI-चालित शेती', pa: 'AI-ਸੰਚਾਲਿਤ ਖੇਤੀ' },
  dash_hero_sub:    { en: 'Smart decisions for better harvests', hi: 'बेहतर फसल के लिए स्मार्ट निर्णय', te: 'మెరుగైన పంటకు స్మార్ట్ నిర్ణయాలు', ta: 'சிறந்த அறுவடைக்கு அறிவார்ந்த முடிவுகள்', mr: 'चांगल्या पिकासाठी स्मार्ट निर्णय', pa: 'ਵਧੀਆ ਫਸਲ ਲਈ ਸਮਾਰਟ ਫੈਸਲੇ' },
  dash_weather:     { en: 'Weather',            hi: 'मौसम',            te: 'వాతావరణం',         ta: 'வானிலை',         mr: 'हवामान',         pa: 'ਮੌਸਮ' },
  dash_soil:        { en: 'Soil Health',        hi: 'मिट्टी स्वास्थ्य', te: 'నేల ఆరోగ్యం',     ta: 'மண் ஆரோக்கியம்', mr: 'मातीचे आरोग्य', pa: 'ਮਿੱਟੀ ਸਿਹਤ' },
  dash_quick_actions: { en: 'Quick Actions',   hi: 'त्वरित क्रियाएं', te: 'త్వరిత చర్యలు',   ta: 'விரைவு செயல்கள்', mr: 'जलद क्रिया',    pa: 'ਤੇਜ਼ ਕਾਰਵਾਈਆਂ' },

  // Common
  loading:          { en: 'Loading...',         hi: 'लोड हो रहा है...', te: 'లోడ్ అవుతోంది...', ta: 'ஏற்றுகிறது...',  mr: 'लोड होत आहे...', pa: 'ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...' },
  save:             { en: 'Save',               hi: 'सहेजें',           te: 'సేవ్ చేయి',        ta: 'சேமி',           mr: 'जतन करा',        pa: 'ਸੇਵ ਕਰੋ' },
  cancel:           { en: 'Cancel',             hi: 'रद्द करें',        te: 'రద్దు',            ta: 'ரத்து',          mr: 'रद्द करा',       pa: 'ਰੱਦ ਕਰੋ' },
  submit:           { en: 'Submit',             hi: 'जमा करें',         te: 'సమర్పించు',        ta: 'சமர்பி',         mr: 'सबमिट करा',      pa: 'ਜਮ੍ਹਾਂ ਕਰੋ' },
  back:             { en: 'Back',               hi: 'वापस',             te: 'వెనక్కి',          ta: 'திரும்பு',       mr: 'मागे',           pa: 'ਵਾਪਸ' },
  next:             { en: 'Next',               hi: 'अगला',             te: 'తదుపరి',           ta: 'அடுத்து',        mr: 'पुढे',           pa: 'ਅੱਗੇ' },
  analyze:          { en: 'Analyze',            hi: 'विश्लेषण करें',    te: 'విశ్లేషించు',      ta: 'பகுப்பாய்வு',    mr: 'विश्लेषण करा',   pa: 'ਵਿਸ਼ਲੇਸ਼ਣ ਕਰੋ' },
  results:          { en: 'Results',            hi: 'परिणाम',           te: 'ఫలితాలు',          ta: 'முடிவுகள்',      mr: 'निकाल',          pa: 'ਨਤੀਜੇ' },
  select_crop:      { en: 'Select Crop',        hi: 'फसल चुनें',        te: 'పంట ఎంచుకోండి',    ta: 'பயிர் தேர்ந்தெடு', mr: 'पीक निवडा',    pa: 'ਫਸਲ ਚੁਣੋ' },
  select_state:     { en: 'Select State',       hi: 'राज्य चुनें',      te: 'రాష్ట్రం ఎంచుకోండి', ta: 'மாநிலம் தேர்ந்தெடு', mr: 'राज्य निवडा', pa: 'ਸੂਬਾ ਚੁਣੋ' },
  sign_out:         { en: 'Sign Out',           hi: 'लॉग आउट',          te: 'సైన్ అవుట్',       ta: 'வெளியேறு',       mr: 'लॉग आउट',        pa: 'ਸਾਈਨ ਆਉਟ' },

  // Disease page
  disease_title:    { en: 'Disease Detection',  hi: 'फसल रोग पहचान',   te: 'పంట వ్యాధి గుర్తింపు', ta: 'பயிர் நோய் கண்டறிதல்', mr: 'पीक रोग शोध', pa: 'ਫਸਲ ਰੋਗ ਪਛਾਣ' },
  disease_upload:   { en: 'Upload plant photo', hi: 'पौधे की फोटो अपलोड करें', te: 'మొక్క ఫోటో అప్‌లోడ్ చేయండి', ta: 'தாவர புகைப்படம் பதிவேற்று', mr: 'झाडाचा फोटो अपलोड करा', pa: 'ਪੌਦੇ ਦੀ ਫੋਟੋ ਅਪਲੋਡ ਕਰੋ' },
  disease_analyzing: { en: 'Analyzing...', hi: 'विश्लेषण हो रहा है...', te: 'విశ్లేషిస్తోంది...', ta: 'பகுப்பாய்வு செய்கிறது...', mr: 'विश्लेषण होत आहे...', pa: 'ਵਿਸ਼ਲੇਸ਼ਣ ਹੋ ਰਿਹਾ ਹੈ...' },

  // Fertilizer page
  fert_title:       { en: 'Fertilizer Advisor', hi: 'उर्वरक सलाहकार',  te: 'ఎరువుల సలహాదారు',  ta: 'உர ஆலோசகர்',     mr: 'खत सल्लागार',    pa: 'ਖਾਦ ਸਲਾਹਕਾਰ' },
  fert_soil_type:   { en: 'Soil Type',          hi: 'मिट्टी का प्रकार', te: 'నేల రకం',           ta: 'மண் வகை',        mr: 'मातीचा प्रकार',  pa: 'ਮਿੱਟੀ ਦੀ ਕਿਸਮ' },
  fert_get_advice:  { en: 'Get Advice',         hi: 'सलाह लें',         te: 'సలహా పొందండి',     ta: 'ஆலோசனை பெறு',   mr: 'सल्ला घ्या',     pa: 'ਸਲਾਹ ਲਓ' },

  // Market page
  market_title:     { en: 'Market Prices',      hi: 'मंडी भाव',         te: 'మార్కెట్ ధరలు',    ta: 'சந்தை விலைகள்',  mr: 'बाजार भाव',      pa: 'ਮੰਡੀ ਭਾਅ' },
  market_msp:       { en: 'MSP',                hi: 'एमएसपी',            te: 'MSP',               ta: 'MSP',            mr: 'एमएसपी',         pa: 'MSP' },
  market_trend:     { en: 'Price Trend',        hi: 'मूल्य प्रवृत्ति',  te: 'ధర ధోరణి',         ta: 'விலை போக்கு',    mr: 'किंमत प्रवृत्ती', pa: 'ਕੀਮਤ ਰੁਝਾਨ' },

  // Calendar
  cal_title:        { en: 'Crop Calendar',      hi: 'फसल कैलेंडर',      te: 'పంట క్యాలెండర్',   ta: 'பயிர் நாட்காட்டி', mr: 'पीक दिनदर्शिका', pa: 'ਫਸਲ ਕੈਲੰਡਰ' },
  cal_sowing:       { en: 'Sowing',             hi: 'बुवाई',             te: 'విత్తనాలు',         ta: 'விதைப்பு',       mr: 'पेरणी',          pa: 'ਬਿਜਾਈ' },
  cal_harvest:      { en: 'Harvest',            hi: 'कटाई',              te: 'కోత',              ta: 'அறுவடை',         mr: 'काढणी',          pa: 'ਵਾਢੀ' },

  // Register
  reg_title:        { en: 'Your Details',       hi: 'आपकी जानकारी',     te: 'మీ వివరాలు',       ta: 'உங்கள் விவரங்கள்', mr: 'तुमची माहिती',  pa: 'ਤੁਹਾਡੀ ਜਾਣਕਾਰੀ' },
  reg_name:         { en: 'Full Name',          hi: 'पूरा नाम',          te: 'పూర్తి పేరు',      ta: 'முழு பெயர்',     mr: 'पूर्ण नाव',      pa: 'ਪੂਰਾ ਨਾਮ' },
  reg_phone:        { en: 'Mobile Number',      hi: 'मोबाइल नंबर',       te: 'మొబైల్ నంబర్',    ta: 'மொபைல் எண்',     mr: 'मोबाइल नंबर',    pa: 'ਮੋਬਾਈਲ ਨੰਬਰ' },
  reg_village:      { en: 'Village / Town',     hi: 'गांव / शहर',        te: 'గ్రామం / పట్టణం', ta: 'கிராமம் / நகரம்', mr: 'गाव / शहर',     pa: 'ਪਿੰਡ / ਸ਼ਹਿਰ' },
  reg_language:     { en: 'Preferred Language', hi: 'पसंदीदा भाषा',      te: 'ఇష్టపడే భాష',     ta: 'விரும்பும் மொழி', mr: 'पसंतीची भाषा',  pa: 'ਪਸੰਦੀਦਾ ਭਾਸ਼ਾ' },
  reg_start:        { en: '🌾 Start Farming',   hi: '🌾 खेती शुरू करें', te: '🌾 వ్యవసాయం ప్రారంభించు', ta: '🌾 விவசாயம் தொடங்கு', mr: '🌾 शेती सुरू करा', pa: '🌾 ਖੇਤੀ ਸ਼ੁਰੂ ਕਰੋ' },

  // Footer
  footer_tagline:   { en: 'AI-powered precision agriculture for Indian farmers', hi: 'भारतीय किसानों के लिए AI-संचालित परिशुद्ध कृषि', te: 'భారతీయ రైతులకు AI-ఆధారిత సూక్ష్మ వ్యవసాయం', ta: 'இந்திய விவசாயிகளுக்கு AI-இயக்கப்பட்ட துல்லிய விவசாயம்', mr: 'भारतीय शेतकऱ्यांसाठी AI-चालित अचूक शेती', pa: 'ਭਾਰਤੀ ਕਿਸਾਨਾਂ ਲਈ AI-ਸੰਚਾਲਿਤ ਸਟੀਕ ਖੇਤੀ' },
} as const;

export type TKey = keyof typeof T;
