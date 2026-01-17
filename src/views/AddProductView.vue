<template>
  <div class="add-product">
    <h1>Добавить товар</h1>

    <form @submit.prevent="submitForm" class="product-form">
      <div class="form-group">
        <label for="name">Название товара:</label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          required
          placeholder="Введите название товара"
        >
      </div>

      <div class="form-group">
        <label for="price">Цена:</label>
        <input
          id="price"
          v-model.number="form.price"
          type="number"
          min="0"
          step="0.01"
          required
          placeholder="0.00"
        >
      </div>

      <div class="form-group">
        <label for="brand">Бренд:</label>
        <input
          id="brand"
          v-model="form.brand"
          type="text"
          required
          placeholder="Введите бренд"
        >
      </div>

      <div class="form-group">
        <label for="category">Категория:</label>
        <select id="category" v-model="form.categoryId" required>
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

      <div class="form-group">
        <label for="images">Изображения товара (3-10 файлов):</label>
        <input
          id="images"
          type="file"
          multiple
          accept="image/*"
          @change="handleFileSelect"
          ref="fileInput"
          required
        >
        <div v-if="selectedFiles.length > 0" class="selected-files">
          <p>Выбрано файлов: {{ selectedFiles.length }}</p>
          <ul>
            <li v-for="(file, index) in selectedFiles" :key="index">
              {{ file.name }} ({{ (file.size / 1024 / 1024).toFixed(2) }} MB)
            </li>
          </ul>
        </div>
        <small class="hint">
          Выберите от 3 до 10 изображений товара (JPEG, PNG, WebP)
        </small>
      </div>

      <div class="form-actions">
        <button type="submit" :disabled="isSubmitting" class="submit-btn">
          {{ isSubmitting ? 'Добавление...' : 'Добавить товар' }}
        </button>
        <router-link to="/" class="cancel-btn">Отмена</router-link>
      </div>
    </form>

    <div v-if="message" class="message" :class="{ success: !error, error }">
      {{ message }}
    </div>
  </div>
</template>

<script>
import { fetchCatalog, addProduct } from '@/api/catalog.js';

export default {
  name: 'AddProductView',

  data() {
    return {
      categories: [],
      selectedFiles: [],
      form: {
        name: '',
        price: null,
        brand: '',
        categoryId: '',
      },
      isSubmitting: false,
      message: '',
      error: false,
    }
  },

  async mounted() {
    try {
      const data = await fetchCatalog();
      this.categories = data.categories || [];
    } catch (error) {
      console.error('Ошибка загрузки категорий:', error);
      this.message = 'Ошибка загрузки категорий';
      this.error = true;
    }
  },

  methods: {
    handleFileSelect(event) {
      const files = Array.from(event.target.files);

      if (files.length < 3 || files.length > 10) {
        this.message = 'Выберите от 3 до 10 изображений';
        this.error = true;
        this.selectedFiles = [];
        event.target.value = '';
        return;
      }

      // Проверяем типы файлов
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      const invalidFiles = files.filter(file => !allowedTypes.includes(file.type));

      if (invalidFiles.length > 0) {
        this.message = 'Разрешены только изображения JPEG, PNG, WebP';
        this.error = true;
        this.selectedFiles = [];
        event.target.value = '';
        return;
      }

      // Проверяем размер файлов (макс 5MB каждый)
      const maxSize = 5 * 1024 * 1024; // 5MB
      const oversizedFiles = files.filter(file => file.size > maxSize);

      if (oversizedFiles.length > 0) {
        this.message = 'Максимальный размер файла - 5MB';
        this.error = true;
        this.selectedFiles = [];
        event.target.value = '';
        return;
      }

      this.selectedFiles = files;
      this.message = '';
      this.error = false;
    },

    async submitForm() {
      if (this.selectedFiles.length < 3 || this.selectedFiles.length > 10) {
        this.message = 'Необходимо выбрать от 3 до 10 изображений';
        this.error = true;
        return;
      }

      this.isSubmitting = true;
      this.message = '';
      this.error = false;

      try {
        const formData = new FormData();
        formData.append('name', this.form.name);
        formData.append('price', this.form.price.toString());
        formData.append('brand', this.form.brand);
        formData.append('categoryId', this.form.categoryId);

        // Добавляем файлы
        this.selectedFiles.forEach((file) => {
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

        this.message = 'Товар успешно добавлен!';
        this.error = false;

        // Сброс формы
        this.form = {
          name: '',
          price: null,
          brand: '',
          categoryId: '',
        };
        this.selectedFiles = [];
        this.$refs.fileInput.value = '';

      } catch (error) {
        console.error('Ошибка добавления товара:', error);
        this.message = error.response?.data?.error || 'Ошибка добавления товара';
        this.error = true;
      } finally {
        this.isSubmitting = false;
      }
    },
  },
}
</script>

<style scoped>
.add-product {
  max-width: 600px;
  margin: 50px auto;
  padding: 20px;
}

.add-product h1 {
  text-align: center;
  margin-bottom: 30px;
  font-size: 28px;
}

.product-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 500;
  font-size: 14px;
}

.form-group input,
.form-group select {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.images-input {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.image-input-group {
  display: flex;
  gap: 10px;
  align-items: center;
}

.image-input-group input {
  flex: 1;
}

.remove-btn {
  padding: 8px 12px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.remove-btn:hover {
  background: #c82333;
}

.add-image-btn {
  padding: 10px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.add-image-btn:hover:not(:disabled) {
  background: #218838;
}

.add-image-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.hint {
  color: #6c757d;
  font-size: 12px;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 20px;
}

.submit-btn,
.cancel-btn {
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  text-decoration: none;
  display: inline-block;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.submit-btn {
  background: #007bff;
  color: white;
  border: none;
}

.submit-btn:hover:not(:disabled) {
  background: #0056b3;
}

.submit-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.cancel-btn {
  background: #6c757d;
  color: white;
  border: none;
}

.cancel-btn:hover {
  background: #545b62;
}

.message {
  margin-top: 20px;
  padding: 12px;
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
</style>
