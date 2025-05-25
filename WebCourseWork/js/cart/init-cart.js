import { Cart } from './cart.js';
import { setupCartModal, showCartModal } from './cart-modal.js';

export async function initCart() {
    // Получаем ID пользователя из localStorage
    const userId = localStorage.getItem('currentUser') 
        ? JSON.parse(localStorage.getItem('currentUser')).id 
        : localStorage.getItem('guestId') || 'guest';
    
    const cart = new Cart(userId);
    
    try {
        await cart.init();
    } catch (error) {
        console.error('Failed to initialize cart:', error);
    }

    setupCartModal(cart);
    
    const headerBasketBtn = document.querySelector('.header-basket-btn');
    if (headerBasketBtn) {
        headerBasketBtn.addEventListener('click', () => {
            showCartModal(cart);
        });
    }
    return cart;
}
(async () => {
    if (document.readyState === 'loading') {
        await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
    }
    await initCart();
})();