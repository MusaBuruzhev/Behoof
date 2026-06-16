<template>
  <div class="product-wizard">
    <!-- Шаги -->
    <div class="wizard-steps">
      <button
        :class="['step', { active: currentStep === 1, done: currentStep > 1 }]"
        @click="currentStep = 1"
      >
        <span class="step-num">1</span>
        <span class="step-label">Основная информация</span>
      </button>
      <div class="step-divider" :class="{ done: currentStep > 1 }"></div>
      <button
        :class="['step', { active: currentStep === 2 }]"
        @click="currentStep = 2"
        :disabled="!step1Valid"
      >
        <span class="step-num">2</span>
        <span class="step-label">Визуальный редактор</span>
      </button>
    </div>

    <!-- Шаг 1: Основная информация -->
    <div v-if="currentStep === 1" class="step-content">
      <div class="form-grid">
        <div class="form-group full-width">
          <label>Название товара *</label>
          <input
            v-model="form.name"
            type="text"
            class="input input-lg"
            placeholder="Например: iPhone 15 Pro Max 256GB"
          />
        </div>

        <div class="form-group">
          <label>Цена (₽) *</label>
          <input
            v-model.number="form.price"
            type="number"
            min="0"
            class="input input-lg"
            placeholder="0"
          />
        </div>

        <div class="form-group">
          <label>Категория *</label>
          <select
            v-model="form.categoryId"
            class="input"
            @change="onCategoryChange"
          >
            <option value="">Выберите категорию</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Бренд *</label>
          <select v-model="form.brand" class="input">
            <option value="">Выберите бренд</option>
            <option v-for="b in filteredBrands" :key="b.id" :value="b.name">
              {{ b.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Модель</label>
          <select v-model="form.modelId" class="input">
            <option value="">Выберите модель</option>
            <option v-for="m in filteredModels" :key="m.id" :value="m.id">
              {{ m.name }}
            </option>
          </select>
        </div>

        <!-- Характеристики -->
        <div class="form-group full-width">
          <label>Характеристики</label>
          <div v-if="characteristicGroups.length === 0" class="hint-text">
            Выберите категорию, чтобы загрузить характеристики
          </div>
          <div v-else class="characteristics-grid">
            <div
              v-for="group in characteristicGroups"
              :key="group.group.id"
              class="char-group"
            >
              <h4 class="char-group-title">{{ group.group.name }}</h4>
              <div class="char-fields">
                <div
                  v-for="traitName in group.group.traitNames"
                  :key="traitName"
                  class="char-field"
                >
                  <label>{{ traitName }}</label>
                  <div class="char-input-wrapper">
                    <select
                      v-model="form.characteristics[traitName]"
                      class="input input-sm"
                    >
                      <option value="">—</option>
                      <option
                        v-for="v in getValuesForTrait(group.values, traitName)"
                        :key="v.id"
                        :value="v.value"
                      >
                        {{ v.value }}{{ v.unit ? " " + v.unit : "" }}
                      </option>
                    </select>
                    <input
                      v-if="form.characteristics[traitName] === '__custom__'"
                      v-model="form.customCharacteristics[traitName]"
                      type="text"
                      class="input input-sm"
                      placeholder="Своё значение"
                    />
                    <button
                      type="button"
                      class="btn-custom-toggle"
                      :class="{
                        active:
                          form.characteristics[traitName] === '__custom__',
                      }"
                      @click="toggleCustomTrait(traitName)"
                      title="Ввести своё значение"
                    >
                      ✎
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="step-footer">
        <router-link to="/admin/products" class="btn-ghost">Отмена</router-link>
        <button class="btn-primary" @click="goToStep2" :disabled="!step1Valid">
          Далее →
        </button>
      </div>
    </div>

    <!-- Шаг 2: Визуальный редактор -->
    <div v-if="currentStep === 2" class="step-content">
      <div class="editor-layout">
        <!-- Левая колонка: Галерея изображений -->
        <div class="editor-gallery">
          <h3 class="section-title">Изображения</h3>

          <div v-if="previewImages.length > 0" class="gallery-main">
            <img
              :src="previewImages[currentImageIndex] || ''"
              alt=""
              class="main-image"
            />
          </div>
          <div v-else class="gallery-placeholder">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <span>Нет изображений</span>
          </div>

          <div v-if="previewImages.length > 1" class="gallery-thumbs">
            <button
              v-for="(img, idx) in previewImages"
              :key="idx"
              :class="['thumb', { active: currentImageIndex === idx }]"
              @click="currentImageIndex = idx"
            >
              <img :src="img" alt="" />
              <button class="thumb-remove" @click.stop="removeImage(idx)">
                ×
              </button>
            </button>
          </div>

          <div class="upload-zone">
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              @change="handleImageUpload"
              hidden
              ref="fileInput"
            />
            <div
              class="upload-drop"
              @click="fileInput?.click()"
              @dragover.prevent
              @dragenter.prevent
              @drop.prevent="handleImageDrop"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <p>Перетащите изображения сюда</p>
              <span class="hint"
                >или кликните для выбора (JPEG, PNG, WebP)</span
              >
            </div>
            <div class="image-count" v-if="previewImages.length > 0">
              {{ previewImages.length }} / 10 изображений
            </div>
          </div>
        </div>

        <!-- Правая колонка: Визуальное превью -->
        <div class="editor-preview">
          <h3 class="section-title">Превью товара</h3>

          <div class="preview-card">
            <!-- Бренд -->
            <div class="preview-brand">{{ form.brand || "Бренд" }}</div>

            <!-- Название -->
            <h1
              class="preview-title"
              contenteditable
              @blur="onTitleEdit($event)"
            >
              {{ form.name || "Название товара" }}
            </h1>

            <!-- Цена -->
            <div class="preview-price">
              <span class="price-value">{{ formatPrice(form.price) }} ₽</span>
            </div>

            <!-- Характеристики -->
            <div v-if="hasCharacteristics" class="preview-chars">
              <h3>Характеристики</h3>
              <div class="chars-grid">
                <div
                  v-for="(value, trait) in displayCharacteristics"
                  :key="trait"
                  class="char-item"
                >
                  <span class="char-name">{{ trait }}</span>
                  <span class="char-value">{{ value }}</span>
                </div>
              </div>
              <button class="btn-link" @click="currentStep = 1">
                ✏️ Изменить характеристики
              </button>
            </div>

            <!-- Описание -->
            <div class="preview-desc">
              <h3>Описание</h3>
              <div
                class="desc-editor"
                contenteditable
                @blur="onDescEdit($event)"
                v-html="form.description"
                ref="descEditor"
              ></div>
              <p class="hint" v-if="!form.description">
                Кликните чтобы добавить описание...
              </p>
            </div>

            <!-- Мета -->
            <div class="preview-meta">
              <div class="meta-item">
                <span class="meta-label">Модель</span>
                <span class="meta-value">{{
                  models.find((m) => m.id === form.modelId)?.name || "—"
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="step-footer">
        <button class="btn-ghost" @click="currentStep = 1">← Назад</button>
        <button
          class="btn-primary"
          @click="saveProduct"
          :disabled="saving || !step2Valid"
        >
          {{ isEdit ? "Сохранить" : "Добавить товар" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "@/api/axios";
import { useAdminStore } from "@/stores";

const route = useRoute();
const router = useRouter();
const adminStore = useAdminStore();

const isEdit = computed(() => !!route.params.id);
const productId = computed(() => route.params.id as string);

const currentStep = ref(1);
const saving = ref(false);
const categories = ref<any[]>([]);
const brands = ref<any[]>([]);
const models = ref<any[]>([]);
const characteristicGroups = ref<any[]>([]);
const currentImageIndex = ref(0);
const imageFiles = ref<File[]>([]);
const existingImages = ref<string[]>([]);
const fileInput = ref<HTMLInputElement | null>(null);
// descEditor используется для contenteditable в шаблоне

const form = ref({
  name: "",
  price: 0,
  categoryId: "",
  brand: "",
  modelId: "",
  description: "",
  characteristics: {} as Record<string, string>,
  customCharacteristics: {} as Record<string, string>,
});

const filteredBrands = computed(() => {
  if (!form.value.categoryId) return brands.value;
  return brands.value.filter(
    (b: any) => !b.categoryId || b.categoryId === form.value.categoryId
  );
});

const filteredModels = computed(() => {
  if (!form.value.brand) return [];
  const brand = brands.value.find((b: any) => b.name === form.value.brand);
  if (!brand) return [];
  return models.value.filter(
    (m: any) => m.brandId === brand.id || m.subcategoryId === brand.id
  );
});

const step1Valid = computed(() => {
  return (
    form.value.name.trim() !== "" &&
    form.value.price > 0 &&
    form.value.categoryId !== "" &&
    form.value.brand !== ""
  );
});

const step2Valid = computed(() => {
  return step1Valid.value;
});

const previewImages = computed(() => {
  const imgs: string[] = existingImages.value.map((img: string) => {
    // Если путь относительный, добавляем baseURL
    if (img.startsWith("/uploads/")) {
      return "http://localhost:5000" + img;
    }
    return img;
  });
  for (const file of imageFiles.value) {
    imgs.push(URL.createObjectURL(file));
  }
  return imgs;
});

const hasCharacteristics = computed(() => {
  const chars = getActiveCharacteristics();
  return Object.keys(chars).length > 0;
});

const displayCharacteristics = computed(() => {
  return getActiveCharacteristics();
});

const getActiveCharacteristics = () => {
  const result: Record<string, string> = {};
  for (const [trait, value] of Object.entries(form.value.characteristics)) {
    if (value === "__custom__") {
      const custom = form.value.customCharacteristics[trait];
      if (custom) result[trait] = custom;
    } else if (value) {
      result[trait] = value;
    }
  }
  return result;
};

const getValuesForTrait = (values: any[], traitName: string) => {
  return values.filter((v: any) => v.traitName === traitName);
};

const toggleCustomTrait = (traitName: string) => {
  if (form.value.characteristics[traitName] === "__custom__") {
    form.value.characteristics[traitName] = "";
    form.value.customCharacteristics[traitName] = "";
  } else {
    form.value.characteristics[traitName] = "__custom__";
  }
};

const onCategoryChange = async () => {
  form.value.brand = "";
  form.value.modelId = "";
  form.value.characteristics = {};
  form.value.customCharacteristics = {};

  if (form.value.categoryId) {
    try {
      const res = await api.get(
        `/admin/categories/${form.value.categoryId}/characteristics`
      );
      characteristicGroups.value = res.data.characteristics || [];
    } catch {
      characteristicGroups.value = [];
    }
  } else {
    characteristicGroups.value = [];
  }
};

// Шаг 1 → Шаг 2
const goToStep2 = () => {
  if (!step1Valid.value) return;
  currentStep.value = 2;
};

// Изображения
const handleImageUpload = (event: Event) => {
  const files = (event.target as HTMLInputElement).files;
  if (!files) return;
  addFiles(Array.from(files));
  if (fileInput.value) fileInput.value.value = "";
};

const handleImageDrop = (event: DragEvent) => {
  const files = event.dataTransfer?.files;
  if (!files) return;
  addFiles(Array.from(files));
};

const addFiles = (files: File[]) => {
  const total = existingImages.value.length + imageFiles.value.length;
  const remaining = 10 - total;
  if (remaining <= 0) return;
  const toAdd = files
    .slice(0, remaining)
    .filter((f) => f.type.startsWith("image/"));
  imageFiles.value = [...imageFiles.value, ...toAdd];
};

const removeImage = (index: number) => {
  if (index < existingImages.value.length) {
    existingImages.value.splice(index, 1);
  } else {
    const fileIdx = index - existingImages.value.length;
    imageFiles.value.splice(fileIdx, 1);
  }
  if (currentImageIndex.value >= previewImages.value.length) {
    currentImageIndex.value = Math.max(0, previewImages.value.length - 1);
  }
};

// Редактирование текста в превью
const onTitleEdit = (event: Event) => {
  const el = event.target as HTMLElement;
  form.value.name = el.textContent?.trim() || "";
};

const onDescEdit = (event: Event) => {
  const el = event.target as HTMLElement;
  form.value.description = el.innerHTML;
};

// Сохранение
const buildFormData = () => {
  const fd = new FormData();

  const characteristics = Object.entries(getActiveCharacteristics()).map(
    ([trait, value]) => ({ trait, value })
  );

  fd.append("name", form.value.name.trim());
  fd.append("price", String(form.value.price));
  fd.append("categoryId", form.value.categoryId);
  fd.append("brand", form.value.brand);
  fd.append("modelId", form.value.modelId || "");
  fd.append("characteristics", JSON.stringify(characteristics));
  fd.append("description", form.value.description || "");

  for (const file of imageFiles.value) {
    fd.append("images", file);
  }

  return fd;
};

// Сохранение товара
const saveProduct = async () => {
  saving.value = true;
  try {
    const fd = buildFormData();

    if (isEdit.value) {
      await api.put(`/products/${productId.value}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } else {
      await api.post("/products", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }

    router.push("/admin/products");
  } catch (err: any) {
    // error handled silently
  } finally {
    saving.value = false;
  }
};

// Форматирование
const formatPrice = (price: number) => {
  if (!price && price !== 0) return "0";
  return price.toLocaleString("ru-RU");
};

// Загрузка данных
onMounted(async () => {
  await Promise.all([adminStore.fetchCategories(), adminStore.fetchBrands()]);
  categories.value = adminStore.categories.items;
  brands.value = adminStore.brands.items;

  // Загружаем модели
  try {
    const modelsRes = await api.get("/admin/models");
    models.value = modelsRes.data.models || [];
  } catch {}

  // Загружаем существующий товар при редактировании
  if (isEdit.value) {
    try {
      const res = await api.get(`/products/${productId.value}`);
      const p = res.data;

      form.value = {
        name: p.name || "",
        price:
          p.price || p.priceHistory?.[p.priceHistory.length - 1]?.price || 0,
        categoryId: p.categoryId || "",
        brand: p.brand || "",
        modelId: p.modelId || "",
        description: p.description || "",
        characteristics: {},
        customCharacteristics: {},
      };

      // Заполняем характеристики
      if (p.characteristics) {
        for (const ch of p.characteristics) {
          form.value.characteristics[ch.trait] = ch.value;
        }
      }

      // Загружаем изображения
      existingImages.value = p.images || [];

      // Загружаем группы характеристик для категории
      if (p.categoryId) {
        try {
          const charRes = await api.get(
            `/admin/categories/${p.categoryId}/characteristics`
          );
          characteristicGroups.value = charRes.data.characteristics || [];
        } catch {}
      }
    } catch (err: any) {
      router.push("/admin/products");
    }
  }

  if (!isEdit.value) {
    if (route.query.modelId) {
      form.value.modelId = route.query.modelId as string;
      const model = models.value.find((m: any) => m.id === route.query.modelId);
      if (model) {
        const brand = brands.value.find(
          (b: any) => b.id === model.brandId || b.id === model.subcategoryId
        );
        if (brand) form.value.brand = brand.name;
      }
    }
    if (route.query.categoryId) {
      form.value.categoryId = route.query.categoryId as string;
      await onCategoryChange();
    }
  }
});
</script>

<style scoped>
.product-wizard {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

/* Steps */
.wizard-steps {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
  padding: 8px 0;
}
.step {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  border: 2px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-surface);
  cursor: pointer;
  transition: all 0.15s;
  font-size: 14px;
  color: var(--color-text-tertiary);
}
.step:hover:not(:disabled) {
  border-color: var(--color-primary-light);
}
.step.active {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
.step.active .step-num {
  background: var(--color-primary);
  color: white;
}
.step.done {
  border-color: var(--color-success);
  color: var(--color-success);
}
.step.done .step-num {
  background: var(--color-success);
  color: white;
}
.step:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.step-num {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  background: var(--color-border);
  color: var(--color-text-tertiary);
  flex-shrink: 0;
}
.step-label {
  font-weight: 500;
}
.step-divider {
  width: 40px;
  height: 2px;
  background: var(--color-border);
  border-radius: 1px;
}
.step-divider.done {
  background: var(--color-success);
}

/* Form Grid */
.step-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.full-width {
  grid-column: 1 / -1;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.form-group label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.input {
  padding: 10px 14px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  background: var(--color-surface);
  color: var(--color-text-primary);
  outline: none;
  transition: border-color 0.15s;
  width: 100%;
  box-sizing: border-box;
}
.input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
}
.input-lg {
  font-size: 16px;
  padding: 12px 16px;
}
.input-sm {
  font-size: 13px;
  padding: 7px 10px;
}
select.input {
  cursor: pointer;
}

.hint-text {
  padding: 16px;
  color: var(--color-text-tertiary);
  font-size: 13px;
  text-align: center;
  background: var(--color-surface-secondary, #f9fafb);
  border-radius: 10px;
}

/* Characteristics */
.characteristics-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.char-group {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 16px;
}
.char-group-title {
  margin: 0 0 12px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.char-fields {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}
.char-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.char-field label {
  font-size: 12px;
  color: var(--color-text-tertiary);
}
.char-input-wrapper {
  display: flex;
  gap: 4px;
  align-items: center;
}
.char-input-wrapper select {
  flex: 1;
}
.btn-custom-toggle {
  width: 32px;
  height: 32px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
  cursor: pointer;
  font-size: 14px;
  color: var(--color-text-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.btn-custom-toggle:hover {
  background: var(--color-surface-secondary, #f9fafb);
}
.btn-custom-toggle.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

/* Buttons */
.btn-primary {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
}
.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn-ghost {
  padding: 10px 20px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-surface);
  font-size: 14px;
  cursor: pointer;
  color: var(--color-text-primary);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}
.btn-ghost:hover {
  background: var(--color-surface-secondary, #f9fafb);
}
.btn-link {
  background: none;
  border: none;
  color: var(--color-primary);
  cursor: pointer;
  font-size: 13px;
  padding: 0;
}
.btn-link:hover {
  text-decoration: underline;
}

.step-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
}

/* Step 2 Layout */
.editor-layout {
  display: grid;
  grid-template-columns: 420px 1fr;
  gap: 28px;
  min-height: 500px;
}
.section-title {
  margin: 0 0 16px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

/* Gallery */
.editor-gallery {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.gallery-main {
  aspect-ratio: 1;
  border-radius: 16px;
  overflow: hidden;
  background: var(--color-surface-secondary, #f9fafb);
  border: 1px solid var(--color-border);
}
.main-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.gallery-placeholder {
  aspect-ratio: 1;
  border-radius: 16px;
  border: 2px dashed var(--color-border);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--color-text-tertiary);
}
.gallery-placeholder svg {
  width: 48px;
  height: 48px;
  opacity: 0.3;
}
.gallery-thumbs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.thumb {
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid var(--color-border);
  cursor: pointer;
  padding: 0;
  background: none;
  transition: border-color 0.15s;
}
.thumb.active {
  border-color: var(--color-primary);
}
.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.thumb-remove {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 18px;
  height: 18px;
  border-radius: 6px;
  border: none;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.upload-zone {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.upload-drop {
  border: 2px dashed var(--color-border);
  border-radius: 14px;
  padding: 28px;
  text-align: center;
  cursor: pointer;
  transition: all 0.15s;
  color: var(--color-text-tertiary);
}
.upload-drop:hover {
  border-color: var(--color-primary);
  background: rgba(37, 99, 235, 0.02);
}
.upload-drop svg {
  width: 32px;
  height: 32px;
  margin-bottom: 8px;
  opacity: 0.5;
}
.upload-drop p {
  margin: 0;
  font-size: 13px;
  font-weight: 500;
}
.upload-drop .hint {
  font-size: 12px;
}
.image-count {
  font-size: 12px;
  color: var(--color-text-tertiary);
  text-align: center;
}

/* Preview */
.preview-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  padding: 32px;
}
.preview-brand {
  font-size: 13px;
  color: var(--color-primary);
  font-weight: 500;
  margin-bottom: 8px;
}
.preview-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 16px;
  color: var(--color-text-primary);
  outline: none;
  border-radius: 4px;
  padding: 2px 4px;
}
.preview-title:focus {
  background: rgba(37, 99, 235, 0.05);
}
.preview-price {
  margin-bottom: 24px;
}
.price-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.preview-chars {
  margin-bottom: 24px;
}
.preview-chars h3 {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 600;
}
.chars-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 12px;
}
.char-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 14px;
  background: var(--color-surface-secondary, #f9fafb);
  border-radius: 10px;
}
.char-name {
  font-size: 12px;
  color: var(--color-text-tertiary);
}
.char-value {
  font-size: 13px;
  font-weight: 500;
}

.preview-desc {
  margin-bottom: 24px;
}
.preview-desc h3 {
  margin: 0 0 10px;
  font-size: 16px;
  font-weight: 600;
}
.desc-editor {
  min-height: 60px;
  border: 1px solid transparent;
  border-radius: 8px;
  padding: 8px 10px;
  outline: none;
  font-size: 14px;
  line-height: 1.7;
  color: var(--color-text-primary);
}
.desc-editor:focus {
  border-color: var(--color-primary-light);
  background: rgba(37, 99, 235, 0.02);
}
.desc-editor:empty::before {
  content: "Добавьте описание...";
  color: var(--color-text-tertiary);
}
.hint {
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.preview-meta {
  display: flex;
  gap: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
}
.meta-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.meta-label {
  font-size: 11px;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.meta-value {
  font-size: 13px;
  font-weight: 500;
}

@media (max-width: 900px) {
  .editor-layout {
    grid-template-columns: 1fr;
  }
  .form-grid {
    grid-template-columns: 1fr;
  }
  .chars-grid {
    grid-template-columns: 1fr;
  }
  .wizard-steps {
    flex-wrap: wrap;
  }
  .step-divider {
    display: none;
  }
}
</style>
