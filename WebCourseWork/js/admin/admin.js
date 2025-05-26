import { AdminElements } from './admin-elements.js';
import { AdminValidation } from './admin-validation.js';
import { AdminAPI } from './admin-api.js';
import { showNotification } from '../notifications.js';
import { getTranslation } from './admin-translations.js';

export class AdminPanel {
  constructor() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.productToDelete = null;
    this.elements = new AdminElements().initElements();
    this.api = new AdminAPI();
    this.validation = new AdminValidation(this.elements);

    this.checkAdminAccess();
    this.initAdmin();
  }

  initAdmin() {
    this.setupEventListeners();
    this.loadProducts();
  }

  setupEventListeners() {
    this.elements.addProductBtn?.addEventListener('click', () => this.openAddModal());
    this.elements.productForm?.addEventListener('submit', (e) => this.handleFormSubmit(e));
    this.elements.cancelProductBtn?.addEventListener('click', () => this.closeModal());
    this.elements.confirmDeleteBtn?.addEventListener('click', () => this.deleteProduct());
    this.elements.cancelDeleteBtn?.addEventListener('click', () => this.closeConfirmModal());
    this.elements.logoutBtn?.addEventListener('click', (e) => this.logout(e));

    // Валидация полей
    const fields = ['name', 'nameKey', 'description', 'descriptionKey', 'price', 'image'];
    fields.forEach(field => {
      const element = this.elements[`product${field.charAt(0).toUpperCase() + field.slice(1)}`];
      if (element) {
        element.addEventListener('input', () => {
          this.validation.validateField(field);
          this.validation.updateSaveButtonState();
        });
        element.addEventListener('blur', () => {
          this.validation.validateField(field);
          this.validation.updateSaveButtonState();
        });
      }
    });

    this.elements.productCategory?.addEventListener('change', () => {
      this.validation.validateNameKeyPattern();
      this.validation.validateDescriptionKeyPattern();
      this.validation.updateSaveButtonState();
    });
  }

  checkAdminAccess() {
    if (!this.currentUser || this.currentUser.role !== 'admin') {
      showNotification('Access denied. Admin privileges required.', 'error');
      setTimeout(() => {
        window.location.href = 'main.html';
      }, 2000);
      return false;
    }
    return true;
  }

  async loadProducts() {
    try {
      const products = await this.api.loadProducts();
      this.renderProducts(products);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  }

  renderProducts(products) {
  if (!this.elements.productsList) return;
  
  this.elements.productsList.innerHTML = '';
  
  if (!products || products.length === 0) {
    const noProductsText = getTranslation('no_products');
    this.elements.productsList.innerHTML = `<p>${noProductsText}</p>`;
    return;
  }
  
  products.forEach(product => {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    
    const editText = getTranslation('edit');
    const deleteText = getTranslation('delete');
    
    let imageUrl = product.image || './assets/default-product.png';
    if (!imageUrl.startsWith('http') && !imageUrl.startsWith('./assets')) {
      imageUrl = `./assets/${imageUrl}`;
    }
    
    const name = getTranslation(product.nameKey) || product.name;
    const description = getTranslation(product.descriptionKey) || product.description;
    const category = getTranslation(product.category) || product.category;

    productCard.innerHTML = `
      <div class="product-image-wrapper">
        <img src="${imageUrl}" alt="${name}" 
            onerror="this.onerror=null;this.src='./assets/default-product.png'">
      </div>
      <div class="product-details">
        <h3 data-lang="${product.nameKey}">${name}</h3>
        <p class="product-description" data-lang="${product.descriptionKey}">${description}</p>
        <div class="product-footer">
          <span class="product-price">$${product.price.toFixed(2)}</span>
          <span class="product-category" data-lang="category_${product.category}">${category}</span>
        </div>
        <div class="product-actions">
          <button class="btn btn-edit" data-id="${product.id}" data-lang="edit">${editText}</button>
          <button class="btn btn-delete" data-id="${product.id}" data-lang="delete">${deleteText}</button>
        </div>
      </div>
    `;
    
    productCard.querySelector('.btn-edit').addEventListener('click', (e) => {
      this.openEditModal(e.target.dataset.id);
    });
    
    productCard.querySelector('.btn-delete').addEventListener('click', (e) => {
      this.openConfirmModal(e.target.dataset.id);
    });

    this.elements.productsList.appendChild(productCard);
  });
  
  this.updateTranslations();
}

updateTranslations() {
  const currentLang = window.getCurrentLang?.() || 'en';
  const currentText = window.getCurrentText?.() || {};
  
  document.querySelectorAll('[data-lang]').forEach(element => {
    const key = element.dataset.lang;
    if (currentText[key]?.[currentLang]) {
      element.textContent = currentText[key][currentLang];
    }
  });
  document.querySelectorAll('.btn-edit, .btn-delete').forEach(btn => {
    const key = btn.dataset.lang;
    if (currentText[key]?.[currentLang]) {
      btn.textContent = currentText[key][currentLang];
    }
  });
}

  openAddModal() {
    this.elements.modalTitle.textContent = getTranslation('add_product');
    this.elements.productId.value = '';
    this.elements.productForm.reset();
    this.validation.clearValidation();
    this.elements.productModal.style.display = 'block';
  }

  async openEditModal(productId) {
    try {
      const response = await fetch(`http://localhost:3000/menuItems/${productId}`);
      if (!response.ok) throw new Error('Failed to load product');
      
      const product = await response.json();
      
      this.elements.modalTitle.textContent = getTranslation('edit_product');
      this.elements.productId.value = product.id;
      this.elements.productName.value = product.name;
      this.elements.productNameKey.value = product.nameKey || '';
      this.elements.productDescription.value = product.description;
      this.elements.productDescriptionKey.value = product.descriptionKey || '';
      this.elements.productPrice.value = product.price;
      this.elements.productCategory.value = product.category;
      this.elements.productImage.value = product.image;
      
      this.validation.clearValidation();
      this.validation.validateForm();
      this.validation.updateSaveButtonState();
      this.elements.productModal.style.display = 'block';
    } catch (error) {
      console.error('Error loading product:', error);
      showNotification('Failed to load product', 'error');
    }
  }

  openConfirmModal(productId) {
    this.productToDelete = productId;
    this.elements.confirmMessage.textContent = getTranslation('confirm_delete');
    this.elements.confirmModal.style.display = 'block';
  }

  closeModal() {
    this.elements.productModal.style.display = 'none';
  }

  closeConfirmModal() {
    this.elements.confirmModal.style.display = 'none';
    this.productToDelete = null;
  }

  async handleFormSubmit(e) {
    e.preventDefault();
    
    if (!this.validation.validateForm()) return;
    
    const productData = {
      name: this.elements.productName.value.trim(),
      nameKey: this.elements.productNameKey.value.trim(),
      description: this.elements.productDescription.value.trim(),
      descriptionKey: this.elements.productDescriptionKey.value.trim(),
      price: parseFloat(this.elements.productPrice.value),
      category: this.elements.productCategory.value,
      image: this.elements.productImage.value.trim()
    };
    
    const productId = this.elements.productId.value;
    const success = await this.api.saveProduct(productData, !!productId, productId);
    
    if (success) {
      this.closeModal();
      this.loadProducts();
    }
  }

  async deleteProduct() {
    if (!this.productToDelete) return;
    
    const success = await this.api.deleteProduct(this.productToDelete);
    if (success) {
      this.closeConfirmModal();
      this.loadProducts();
    }
  }

  logout(e) {
    e.preventDefault();
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
    window.location.href = 'main.html';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('productsList')) {
    window.adminPanel = new AdminPanel();
  }
});