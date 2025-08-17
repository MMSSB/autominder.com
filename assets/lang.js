const translations = {
    en: {
        appTitle: "CarCare Log",
        welcomeTitle: "Welcome to CarCare Log",
        welcomeSubtitle: "Your personal car maintenance companion",
        carNamePlaceholder: "Enter your car name or model",
        getStarted: "Get Started",
        addEntry: "Add Entry",
        settings: "Settings",
        totalEntries: "Total Entries",
        totalCost: "Total Cost",
        lastService: "Last Service",
        searchPlaceholder: "Search maintenance logs...",
        allCategories: "All Categories",
        maintenanceHistory: "Maintenance History",
        exportPDF: "Export PDF",
        exportData: "Export Data",
        noRecords: "No maintenance records yet",
        addFirstEntry: "Add First Entry",
        // Add all other English translations here...
    },
    ar: {
        appTitle: "سجل العناية بالسيارة",
        welcomeTitle: "مرحبًا بك في سجل العناية بالسيارة",
        welcomeSubtitle: "رفيقك الشخصي في صيانة السيارات",
        carNamePlaceholder: "أدخل اسم أو موديل سيارتك",
        getStarted: "ابدأ الآن",
        addEntry: "إضافة إدخال",
        settings: "الإعدادات",
        totalEntries: "إجمالي الإدخالات",
        totalCost: "التكلفة الإجمالية",
        lastService: "آخر خدمة",
        searchPlaceholder: "ابحث في سجلات الصيانة...",
        allCategories: "جميع الفئات",
        maintenanceHistory: "سجل الصيانة",
        exportPDF: "تصدير PDF",
        exportData: "تصدير البيانات",
        noRecords: "لا توجد سجلات صيانة حتى الآن",
        addFirstEntry: "إضافة أول إدخال",
        // Add all other Arabic translations here...
    }
};

function detectSystemLanguage() {
    const userLang = navigator.language || navigator.userLanguage;
    return userLang.startsWith('ar') ? 'ar' : 'en';
}

function getTranslations(lang) {
    if (lang === 'system') {
        return translations[detectSystemLanguage()];
    }
    return translations[lang] || translations['en'];
}

window.translations = translations;
window.detectSystemLanguage = detectSystemLanguage;
window.getTranslations = getTranslations;