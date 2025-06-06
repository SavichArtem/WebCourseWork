document.querySelector('.header-reload-btn').addEventListener('click', function() {
    localStorage.clear();
    
    const isBrowserDarkTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (isBrowserDarkTheme) {
        document.body.classList.add('night-theme');
        localStorage.setItem('theme', 'night-theme');
    } else {
        document.body.classList.remove('night-theme');
        localStorage.setItem('theme', '');
    }
    
    const browserLang = navigator.language.slice(0, 2).toLowerCase();
    const newLang = ['ru', 'en'].includes(browserLang) ? browserLang : 'en';
    localStorage.setItem('language', newLang);
    
    const langBtn = document.querySelector(`[data-btn="${newLang}"]`);
    if (langBtn) {
        langBtn.click();
    }
});