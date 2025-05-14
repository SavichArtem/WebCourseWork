import { initializeFilters } from './filters.js';
import { loadMenuItems, displayMenuItems } from './menu-display.js';
import { setupEventListeners } from './event-listeners.js';

document.addEventListener('DOMContentLoaded', function() {
    const currentFilters = initializeFilters(); /* Инициализация состояния фильтров */
    
    /* Загрузка и отображение меню */
    async function initMenu() {
        await displayMenuItems(currentFilters);
    }
    
    setupEventListeners(currentFilters, initMenu); /* Настройка обработчиков событий */
    
    initMenu(); /* Первоначальная загрузка */
});

