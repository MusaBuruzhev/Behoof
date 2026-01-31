<template>
  <div class="product-management">
    <div class="container">
      <h1>Управление товарами</h1>

      <!-- Tabs -->
      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="['tab-button', { active: activeTab === tab.id }]"
        >
          {{ tab.name }}
        </button>
      </div>

      <!-- Add Product Tab -->
      <div v-if="activeTab === 'add'" class="tab-content">
        <h2>Добавить товар</h2>
        <form @submit.prevent="submitAddForm" class="product-form">
          <div class="form-row">
            <div class="form-group">
              <label for="name">Название товара:</label>
              <input
                id="name"
                v-model="addForm.name"
                type="text"
                required
                placeholder="Введите название товара"
              >
            </div>

            <div class="form-group">
              <label for="price">Цена:</label>
              <input
                id="price"
                v-model.number="addForm.price"
                type="number"
                min="0"
                step="0.01"
                required
                placeholder="0.00"
              >
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="brand">Бренд:</label>
              <input
                id="brand"
                v-model="addForm.brand"
                type="text"
                required
                placeholder="Введите бренд"
              >
            </div>

            <div class="form-group">
              <label for="category">Категория:</label>
              <select id="category" v-model="addForm.categoryId" required>
                <option value="">Выберите категорию</option>
                <option
                  v-for="category in categories"
                  :key="category.id"
                  :value="category.id"
                >
                  {{ category.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="description">Описание:</label>
            <textarea
              id="description"
              v-model="addForm.description"
              placeholder="Введите описание товара"
              rows="3"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Характеристики:</label>
            <div v-if="addForm.categoryId" class="characteristics-section">
              <div class="add-characteristic">
                <select v-model="selectedCharacteristic" class="char-select">
                  <option value="">Выберите характеристику</option>
                  <option
                    v-for="char in availableCharacteristics"
                    :key="char"
                    :value="char"
                    :disabled="addForm.characteristics.some(c => c.trait === char)"
                  >
                    {{ char }}
                  </option>
                </select>
                <button
                  type="button"
                  @click="addSelectedCharacteristic('add')"
                  :disabled="!selectedCharacteristic"
                  class="add-char-btn"
                >
                  Добавить
                </button>
              </div>
              <div v-if="addForm.characteristics.length > 0" class="characteristics-list">
                <div v-for="(char, index) in addForm.characteristics" :key="index" class="characteristic-item">
                  <label class="trait-label">{{ char.trait }}:</label>
                  <input
                    v-model="char.value"
                    type="text"
                    :placeholder="`Введите значение для ${char.trait}`"
                  >
                  <button type="button" @click="removeCharacteristic('add', index)" class="remove-char-btn">×</button>
                </div>
              </div>
            </div>
            <div v-else class="no-category-hint">
              Выберите категорию, чтобы добавить характеристики
            </div>
          </div>

          <div class="form-group">
            <label for="images">Изображения товара (3-10 файлов):</label>
            <input
              id="images"
              type="file"
              multiple
              accept="image/*"
              @change="handleFileSelect('add')"
              ref="addFileInput"
              required
            >
            <div v-if="addSelectedFiles.length > 0" class="selected-files">
              <p>Выбрано файлов: {{ addSelectedFiles.length }}</p>
              <ul>
                <li v-for="(file, index) in addSelectedFiles" :key="index">
                  {{ file.name }} ({{ (file.size / 1024 / 1024).toFixed(2) }} MB)
                </li>
              </ul>
            </div>
            <small class="hint">
              Выберите от 3 до 10 изображений товара (JPEG, PNG, WebP)
            </small>
          </div>

          <div class="form-actions">
            <button type="submit" :disabled="addSubmitting" class="submit-btn">
              {{ addSubmitting ? 'Добавление...' : 'Добавить товар' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Update Product Tab -->
      <div v-if="activeTab === 'update'" class="tab-content">
        <h2>Обновить товар</h2>

        <div class="product-selector">
          <label for="productSelect">Выберите товар:</label>
          <select id="productSelect" v-model="selectedProductId" @change="loadProductForUpdate">
            <option value="">Выберите товар</option>
            <option
              v-for="product in productsList"
              :key="product.id"
              :value="product.id"
            >
              {{ product.name }} - {{ product.price }} руб.
            </option>
          </select>
        </div>

        <form v-if="updateForm" @submit.prevent="submitUpdateForm" class="product-form">
          <div class="form-row">
            <div class="form-group">
              <label for="updateName">Название товара:</label>
              <input
                id="updateName"
                v-model="updateForm.name"
                type="text"
                required
                placeholder="Введите название товара"
              >
            </div>

            <div class="form-group">
              <label for="updatePrice">Цена:</label>
              <input
                id="updatePrice"
                v-model.number="updateForm.price"
                type="number"
                min="0"
                step="0.01"
                required
                placeholder="0.00"
              >
              <small class="hint">При изменении цены будет добавлена новая запись в историю цен</small>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="updateBrand">Бренд:</label>
              <input
                id="updateBrand"
                v-model="updateForm.brand"
                type="text"
                required
                placeholder="Введите бренд"
              >
            </div>

            <div class="form-group">
              <label for="updateCategory">Категория:</label>
              <select id="updateCategory" v-model="updateForm.categoryId" required disabled>
                <option
                  v-for="category in categories"
                  :key="category.id"
                  :value="category.id"
                >
                  {{ category.name }}
                </option>
              </select>
              <small class="hint">Категория не может быть изменена</small>
            </div>
          </div>

          <div class="form-group">
            <label for="updateDescription">Описание:</label>
            <textarea
              id="updateDescription"
              v-model="updateForm.description"
              placeholder="Введите описание товара"
              rows="3"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Характеристики:</label>
            <div class="characteristics-list">
              <div v-for="(char, index) in updateForm.characteristics" :key="index" class="characteristic-item">
                <label class="trait-label">{{ char.trait }}:</label>
                <input
                  v-model="char.value"
                  type="text"
                  :placeholder="`Введите значение для ${char.trait}`"
                >
              </div>
            </div>
          </div>

          <div v-if="updateForm.priceHistory && updateForm.priceHistory.length > 0" class="price-history">
            <h3>История цен:</h3>
            <div class="history-list">
              <div v-for="(entry, index) in updateForm.priceHistory.slice().reverse()" :key="index" class="history-item">
                <span>{{ new Date(entry.date).toLocaleDateString() }}</span>
                <span>{{ entry.price }} руб.</span>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" :disabled="updateSubmitting" class="submit-btn">
              {{ updateSubmitting ? 'Обновление...' : 'Обновить товар' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Delete Product Tab -->
      <div v-if="activeTab === 'delete'" class="tab-content">
        <h2>Удалить товар</h2>

        <div class="product-selector">
          <label for="deleteProductSelect">Выберите товар для удаления:</label>
          <select id="deleteProductSelect" v-model="selectedDeleteProductId">
            <option value="">Выберите товар</option>
            <option
              v-for="product in productsList"
              :key="product.id"
              :value="product.id"
            >
              {{ product.name }} - {{ product.price }} руб.
            </option>
          </select>
        </div>

        <div v-if="selectedDeleteProductId" class="delete-confirmation">
          <p>Вы уверены, что хотите удалить товар <strong>{{ getProductName(selectedDeleteProductId) }}</strong>?</p>
          <p class="warning">Это действие нельзя отменить.</p>
          <div class="form-actions">
            <button @click="confirmDelete" :disabled="deleteSubmitting" class="delete-btn">
              {{ deleteSubmitting ? 'Удаление...' : 'Удалить товар' }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="message" class="message" :class="{ success: !error, error }">
        {{ message }}
      </div>
    </div>
  </div>
</template>

<script>
import { fetchCatalog, addProduct, updateProduct, deleteProduct, getProduct } from '@/api/catalog.js';

const PRODUCT_CHARACTERISTICS = {
  cat1: [
    'Экран',
    'Процессор',
    'Оперативная память',
    'Встроенная память',
    'Основная камера',
    'Фронтальная камера',
    'Аккумулятор',
    'Операционная система',
    'Степень защиты'
  ],
  cat2: [
    'Процессор',
    'Оперативная память',
    'Жесткий диск',
    'Экран',
    'Графический процессор',
    'Вес',
    'Клавиатура',
    'Время работы'
  ],
  cat3: [
    'Экран',
    'Процессор',
    'Оперативная память',
    'Встроенная память',
    'Основная камера',
    'Фронтальная камера',
    'Аккумулятор',
    'Операционная система',
    'Вес'
  ],
  cat4: [
    'Тип',
    'Подключение',
    'Время работы',
    'Шумоподавление',
    'Частотный диапазон',
    'Чувствительность',
    'Импеданс',
    'Вес'
  ],
  cat5: [
    'Экран',
    'Процессор',
    'Оперативная память',
    'Встроенная память',
    'Аккумулятор',
    'Датчики',
    'Водонепроницаемость',
    'Совместимость'
  ],
  cat6: [
    'Процессор',
    'Оперативная память',
    'Встроенная память',
    'Графический процессор',
    'Поддержка 4K',
    'Жесткий диск',
    'Количество игроков'
  ],
  cat7: [
    'Мощность',
    'Время работы',
    'Подключение',
    'Водонепроницаемость',
    'Частотный диапазон',
    'Вес',
    'Bluetooth версия'
  ],
  cat8: [
    'Тип',
    'Совместимость',
    'Материал',
    'Цвет',
    'Размеры',
    'Вес',
    'Дополнительные функции'
  ],
};

export default {
  name: 'AddProductView',

  data() {
    return {
      activeTab: 'add',
      tabs: [
        { id: 'add', name: 'Добавить товар' },
        { id: 'update', name: 'Обновить товар' },
        { id: 'delete', name: 'Удалить товар' }
      ],
      categories: [],
      productsList: [],

      // Add form
      addSelectedFiles: [],
      selectedCharacteristic: '',
      addForm: {
        name: '',
        price: null,
        brand: '',
        categoryId: '',
        description: '',
        characteristics: []
      },
      addSubmitting: false,

      // Update form
      selectedProductId: '',
      updateForm: null,
      updateSubmitting: false,

      // Delete
      selectedDeleteProductId: '',
      deleteSubmitting: false,

      message: '',
      error: false,
    }
  },

  computed: {
    availableCharacteristics() {
      if (this.addForm.categoryId && PRODUCT_CHARACTERISTICS[this.addForm.categoryId]) {
        return PRODUCT_CHARACTERISTICS[this.addForm.categoryId];
      }
      return [];
    }
  },

  async mounted() {
    await this.loadData();
  },

  methods: {
    async loadData() {
      try {
        const data = await fetchCatalog();
        this.categories = data.categories || [];
        this.productsList = Object.values(data.products || {});
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        this.showMessage('Ошибка загрузки данных', true);
      }
    },

    showMessage(message, error = false) {
      this.message = message;
      this.error = error;
      setTimeout(() => {
        this.message = '';
        this.error = false;
      }, 5000);
    },

    addCharacteristic(formType) {
      if (formType === 'add') {
        this.addForm.characteristics.push('');
      } else if (formType === 'update' && this.updateForm) {
        this.updateForm.characteristics.push('');
      }
    },

    addSelectedCharacteristic(formType) {
      if (formType === 'add' && this.selectedCharacteristic) {
        this.addForm.characteristics.push({
          trait: this.selectedCharacteristic,
          value: ''
        });
        this.selectedCharacteristic = '';
      }
    },

    removeCharacteristic(formType, index) {
      if (formType === 'add') {
        this.addForm.characteristics.splice(index, 1);
      } else if (formType === 'update' && this.updateForm) {
        this.updateForm.characteristics.splice(index, 1);
      }
    },

    handleFileSelect(formType) {
      const event = formType === 'add' ? this.$refs.addFileInput : null;
      if (!event) return;

      const files = Array.from(event.files);

      if (files.length < 3 || files.length > 10) {
        this.showMessage('Выберите от 3 до 10 изображений', true);
        if (formType === 'add') {
          this.addSelectedFiles = [];
          event.value = '';
        }
        return;
      }

      // Проверяем типы файлов
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));

      if (invalidFiles.length > 0) {
        this.showMessage('Разрешены только изображения JPEG, PNG, WebP', true);
        if (formType === 'add') {
          this.addSelectedFiles = [];
          event.value = '';
        }
        return;
      }

      // Проверяем размер файлов (макс 5MB каждый)
      const maxSize = 5 * 1024 * 1024; // 5MB
      const oversizedFiles = files.filter(file => file.size > maxSize);

      if (oversizedFiles.length > 0) {
        this.showMessage('Максимальный размер файла - 5MB', true);
        if (formType === 'add') {
          this.addSelectedFiles = [];
          event.value = '';
        }
        return;
      }

      if (formType === 'add') {
        this.addSelectedFiles = files;
      }
      this.message = '';
      this.error = false;
    },

    async submitAddForm() {
      if (this.addSelectedFiles.length < 3 || this.addSelectedFiles.length > 10) {
        this.showMessage('Необходимо выбрать от 3 до 10 изображений', true);
        return;
      }

      this.addSubmitting = true;
      this.message = '';
      this.error = false;

      try {
        const formData = new FormData();
        formData.append('name', this.addForm.name);
        formData.append('price', this.addForm.price.toString());
        formData.append('brand', this.addForm.brand);
        formData.append('categoryId', this.addForm.categoryId);
        formData.append('description', this.addForm.description);
        formData.append('characteristics', JSON.stringify(this.addForm.characteristics));

        // Добавляем файлы
        this.addSelectedFiles.forEach((file) => {
          formData.append('images', file);
        });

        console.log('Sending FormData:');
        for (let [key, value] of formData.entries()) {
          if (value instanceof File) {
            console.log(key, ': File -', value.name, '(' + value.size + ' bytes)');
          } else {
            console.log(key, ':', value);
          }
        }

        await addProduct(formData);

        this.showMessage('Товар успешно добавлен!');
        this.error = false;

        // Сброс формы
        this.addForm = {
          name: '',
          price: null,
          brand: '',
          categoryId: '',
          description: '',
          characteristics: []
        };
        this.selectedCharacteristic = '';
        this.addSelectedFiles = [];
        this.$refs.addFileInput.value = '';

        // Обновляем список товаров
        await this.loadData();

      } catch (error) {
        console.error('Ошибка добавления товара:', error);
        this.showMessage(error.response?.data?.error || 'Ошибка добавления товара', true);
      } finally {
        this.addSubmitting = false;
      }
    },

    async loadProductForUpdate() {
      if (!this.selectedProductId) {
        this.updateForm = null;
        return;
      }

      try {
        const product = await getProduct(this.selectedProductId);
        this.updateForm = {
          ...product,
          characteristics: product.characteristics.length > 0 ? product.characteristics : ['']
        };
      } catch (error) {
        console.error('Ошибка загрузки товара:', error);
        this.showMessage('Ошибка загрузки товара', true);
      }
    },

    async submitUpdateForm() {
      if (!this.updateForm) return;

      this.updateSubmitting = true;
      this.message = '';
      this.error = false;

      try {
        const updateData = {
          name: this.updateForm.name,
          price: this.updateForm.price,
          brand: this.updateForm.brand,
          description: this.updateForm.description,
          characteristics: this.updateForm.characteristics.filter(char => char.trim())
        };

        await updateProduct(this.selectedProductId, updateData);

        this.showMessage('Товар успешно обновлен!');
        this.error = false;

        // Обновляем список товаров
        await this.loadData();

      } catch (error) {
        console.error('Ошибка обновления товара:', error);
        this.showMessage(error.response?.data?.error || 'Ошибка обновления товара', true);
      } finally {
        this.updateSubmitting = false;
      }
    },

    getProductName(productId) {
      const product = this.productsList.find(p => p.id === productId);
      return product ? product.name : '';
    },

    async confirmDelete() {
      if (!this.selectedDeleteProductId) return;

      this.deleteSubmitting = true;
      this.message = '';
      this.error = false;

      try {
        await deleteProduct(this.selectedDeleteProductId);

        this.showMessage('Товар успешно удален!');
        this.error = false;

        // Обновляем список товаров
        await this.loadData();
        this.selectedDeleteProductId = '';

      } catch (error) {
        console.error('Ошибка удаления товара:', error);
        this.showMessage(error.response?.data?.error || 'Ошибка удаления товара', true);
      } finally {
        this.deleteSubmitting = false;
      }
    },
  },
}
</script>

<style scoped>
.product-management {
  max-width: 1200px;
  margin: 50px auto;
  padding: 20px;
  font-family: 'Inter', sans-serif;
}

.container {
  width: 100%;
}

.product-management h1 {
  text-align: center;
  margin-bottom: 30px;
  font-size: 32px;
  color: #263141;
}

.tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
  border-bottom: 1px solid #f2f5f9;
}

.tab-button {
  padding: 12px 24px;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  font-size: 16px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-button:hover {
  color: #ff4d4d;
}

.tab-button.active {
  color: #ff4d4d;
  border-bottom-color: #ff4d4d;
}

.tab-content {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.tab-content h2 {
  margin-bottom: 20px;
  font-size: 24px;
  color: #263141;
}

.product-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  font-size: 14px;
  color: #263141;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #ff4d4d;
  box-shadow: 0 0 0 3px rgba(255, 77, 77, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.characteristics-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.add-characteristic {
  display: flex;
  gap: 10px;
  align-items: center;
}

.char-select {
  flex: 1;
  padding: 10px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
}

.char-select:focus {
  outline: none;
  border-color: #ff4d4d;
  box-shadow: 0 0 0 3px rgba(255, 77, 77, 0.1);
}

.characteristics-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.trait-label {
  min-width: 150px;
  font-weight: 500;
  color: #263141;
}

.no-category-hint {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
  color: #666;
  text-align: center;
  font-style: italic;
}

.characteristic-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.characteristic-item input {
  flex: 1;
}

.remove-char-btn {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 50%;
  background: #dc3545;
  color: white;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
}

.remove-char-btn:hover {
  background: #c82333;
}

.add-char-btn {
  padding: 8px 16px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  align-self: flex-start;
  transition: background-color 0.3s ease;
}

.add-char-btn:hover {
  background: #218838;
}

.selected-files {
  margin-top: 10px;
  padding: 10px;
  background: white;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

.selected-files ul {
  margin: 5px 0 0 0;
  padding-left: 20px;
}

.selected-files li {
  font-size: 14px;
  color: #666;
}

.hint {
  color: #666;
  font-size: 12px;
  margin-top: 4px;
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.submit-btn,
.delete-btn {
  padding: 14px 28px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.submit-btn {
  background: #28a745;
  color: white;
}

.submit-btn:hover:not(:disabled) {
  background: #218838;
  transform: translateY(-1px);
}

.submit-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
  transform: none;
}

.delete-btn {
  background: #dc3545;
  color: white;
}

.delete-btn:hover:not(:disabled) {
  background: #c82333;
  transform: translateY(-1px);
}

.delete-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
  transform: none;
}

.product-selector {
  margin-bottom: 30px;
}

.product-selector label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #263141;
}

.product-selector select {
  width: 100%;
  padding: 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 16px;
}

.product-selector select:focus {
  outline: none;
  border-color: #ff4d4d;
  box-shadow: 0 0 0 3px rgba(255, 77, 77, 0.1);
}

.price-history {
  margin-top: 20px;
  padding: 20px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
}

.price-history h3 {
  margin-bottom: 15px;
  color: #263141;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 4px;
  font-size: 14px;
}

.history-item span:first-child {
  color: #666;
}

.history-item span:last-child {
  font-weight: 600;
  color: #263141;
}

.delete-confirmation {
  padding: 20px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  text-align: center;
}

.delete-confirmation p {
  margin-bottom: 10px;
  color: #263141;
}

.warning {
  color: #dc3545;
  font-weight: 600;
}

.message {
  margin-top: 20px;
  padding: 15px;
  border-radius: 6px;
  text-align: center;
  font-weight: 500;
}

.message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .tabs {
    flex-direction: column;
  }

  .tab-button {
    border-bottom: none;
    border-right: 3px solid transparent;
  }

  .tab-button.active {
    border-bottom: none;
    border-right-color: #ff4d4d;
  }
}
</style>
