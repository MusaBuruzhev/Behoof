<template>
  <div class="characteristics-admin">
    <div class="page-header">
      <div>
        <h1 class="page-title">Характеристики</h1>
        <p class="page-subtitle">
          Группы характеристик и значения для категорий товаров
        </p>
      </div>
    </div>

    <!-- Вкладки -->
    <div class="tabs">
      <button
        class="tab"
        :class="{ active: activeTab === 'groups' }"
        @click="activeTab = 'groups'"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="9" y1="21" x2="9" y2="9" />
        </svg>
        Группы
        <span class="tab-count">{{ groups.length }}</span>
      </button>
      <button
        class="tab"
        :class="{ active: activeTab === 'values' }"
        @click="activeTab = 'values'"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path d="M4 7h16M4 12h16M4 17h10" />
        </svg>
        Значения
        <span class="tab-count">{{ totalValues }}</span>
      </button>
    </div>

    <!-- Группы -->
    <div v-if="activeTab === 'groups'" class="tab-content">
      <div class="toolbar">
        <div class="search-box">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            v-model="groupSearch"
            type="text"
            placeholder="Поиск групп..."
          />
        </div>
        <button class="btn-primary" @click="openGroupModal(null)">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Новая группа
        </button>
      </div>

      <div v-if="filteredGroups.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1"
          >
            <circle cx="12" cy="12" r="3" />
            <path
              d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
            />
          </svg>
        </div>
        <h3>Нет групп характеристик</h3>
        <p>
          Создайте первую группу, чтобы начать добавлять характеристики для
          товаров
        </p>
        <button class="btn-primary" @click="openGroupModal(null)">
          Создать группу
        </button>
      </div>

      <div v-else class="groups-grid">
        <div
          v-for="group in filteredGroups"
          :key="group.id"
          class="group-card"
          @click="selectGroup(group)"
        >
          <div class="group-card-header">
            <h3>{{ group.name }}</h3>
            <span v-if="group.categoryId" class="badge">Категория</span>
            <span v-else class="badge badge-global">Глобальная</span>
          </div>
          <p v-if="group.description" class="group-description">
            {{ group.description }}
          </p>
          <div class="traits-tags">
            <span
              v-for="trait in group.traitNames"
              :key="trait"
              class="traits-tag"
              >{{ trait }}</span
            >
          </div>
          <div class="group-card-footer">
            <span class="values-count"
              >{{ getGroupValuesCount(group.id) }} значений</span
            >
            <div class="group-actions" @click.stop>
              <button class="btn-ghost" @click="openGroupModal(group)">
                ✏️
              </button>
              <button
                class="btn-ghost btn-danger"
                @click="deleteGroupHandler(group.id)"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Значения -->
    <div v-if="activeTab === 'values'" class="tab-content">
      <div class="toolbar">
        <div class="search-box">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            v-model="valueSearch"
            type="text"
            placeholder="Поиск значений..."
          />
        </div>
        <div class="filter-group">
          <label>Группа:</label>
          <select v-model="selectedGroupFilter">
            <option value="">Все группы</option>
            <option v-for="group in groups" :key="group.id" :value="group.id">
              {{ group.name }}
            </option>
          </select>
        </div>
        <button
          class="btn-primary"
          @click="openValueModal(null)"
          :disabled="!selectedGroupFilter && groups.length > 0"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Новое значение
        </button>
      </div>

      <div v-if="filteredValues.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1"
          >
            <path d="M4 7h16M4 12h16M4 17h10" />
          </svg>
        </div>
        <h3>Нет значений</h3>
        <p>
          {{
            selectedGroupFilter
              ? "Добавьте значения в выбранную группу"
              : "Выберите группу для просмотра значений"
          }}
        </p>
      </div>

      <div v-else class="values-table-wrapper">
        <table class="values-table">
          <thead>
            <tr>
              <th>Значение</th>
              <th>Характеристика</th>
              <th>Группа</th>
              <th>Ед. изм.</th>
              <th>Исп.</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="val in filteredValues" :key="val.id">
              <td class="value-name">{{ val.value }}</td>
              <td>
                <span class="trait-badge">{{ val.traitName }}</span>
              </td>
              <td class="muted">{{ getGroupName(val.groupId) }}</td>
              <td class="muted">{{ val.unit || "—" }}</td>
              <td class="muted">{{ val.usageCount || 0 }}</td>
              <td>
                <div class="row-actions">
                  <button class="btn-ghost" @click="openValueModal(val)">
                    ✏️
                  </button>
                  <button
                    class="btn-ghost btn-danger"
                    @click="deleteValueHandler(val.id)"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Модальное окно группы -->
    <div
      v-if="showGroupModal"
      class="modal-overlay"
      @click.self="showGroupModal = false"
    >
      <div class="modal">
        <div class="modal-header">
          <h2>{{ editingGroup ? "Редактировать группу" : "Новая группа" }}</h2>
          <button class="btn-close" @click="showGroupModal = false">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <form @submit.prevent="saveGroup" class="modal-body">
          <div class="form-group">
            <label>Название *</label>
            <input
              v-model="groupForm.name"
              type="text"
              class="input"
              placeholder="Например: Процессоры"
              required
            />
          </div>
          <div class="form-group">
            <label>Slug</label>
            <input
              v-model="groupForm.slug"
              type="text"
              class="input"
              placeholder="processors"
            />
          </div>
          <div class="form-group">
            <label>Описание</label>
            <textarea
              v-model="groupForm.description"
              class="input"
              rows="2"
              placeholder="Краткое описание группы..."
            ></textarea>
          </div>
          <div class="form-group">
            <label>Категория</label>
            <select v-model="groupForm.categoryId" class="input">
              <option :value="null">Глобальная (для всех категорий)</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Характеристики *</label>
            <div class="traits-editor">
              <div
                v-for="(_trait, index) in groupForm.traitNames"
                :key="index"
                class="trait-input-row"
              >
                <input
                  v-model="groupForm.traitNames[index]"
                  type="text"
                  class="input"
                  placeholder="Название характеристики"
                />
                <button
                  type="button"
                  class="btn-ghost btn-danger"
                  @click="groupForm.traitNames.splice(index, 1)"
                >
                  ×
                </button>
              </div>
              <button
                type="button"
                class="btn-ghost"
                @click="groupForm.traitNames.push('')"
              >
                + Добавить характеристику
              </button>
            </div>
          </div>
          <div class="form-group">
            <label>Порядок сортировки</label>
            <input
              v-model.number="groupForm.sortOrder"
              type="number"
              class="input"
              min="0"
            />
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn-ghost"
              @click="showGroupModal = false"
            >
              Отмена
            </button>
            <button type="submit" class="btn-primary">
              {{ editingGroup ? "Сохранить" : "Создать" }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Модальное окно значения -->
    <div
      v-if="showValueModal"
      class="modal-overlay"
      @click.self="showValueModal = false"
    >
      <div class="modal">
        <div class="modal-header">
          <h2>
            {{ editingValue ? "Редактировать значение" : "Новое значение" }}
          </h2>
          <button class="btn-close" @click="showValueModal = false">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <form @submit.prevent="saveValue" class="modal-body">
          <div class="form-group">
            <label>Группа *</label>
            <select v-model="valueForm.groupId" class="input" required>
              <option value="">Выберите группу</option>
              <option v-for="group in groups" :key="group.id" :value="group.id">
                {{ group.name }}
              </option>
            </select>
          </div>
          <div v-if="valueForm.groupId" class="form-group">
            <label>Характеристика *</label>
            <select v-model="valueForm.traitName" class="input" required>
              <option value="">Выберите характеристику</option>
              <option
                v-for="trait in availableTraitsForGroup"
                :key="trait"
                :value="trait"
              >
                {{ trait }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Значение *</label>
            <input
              v-model="valueForm.value"
              type="text"
              class="input"
              placeholder="Например: Snapdragon 8 Gen 3"
              required
            />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Единица измерения</label>
              <input
                v-model="valueForm.unit"
                type="text"
                class="input"
                placeholder="gb, mAh, inch..."
              />
            </div>
            <div class="form-group">
              <label>Сорт.</label>
              <input
                v-model.number="valueForm.sortOrder"
                type="number"
                class="input"
                min="0"
              />
            </div>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn-ghost"
              @click="showValueModal = false"
            >
              Отмена
            </button>
            <button type="submit" class="btn-primary">
              {{ editingValue ? "Сохранить" : "Создать" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import api from "@/api/axios";

// --- Data ---
const groups = ref<any[]>([]);
const allValues = ref<any[]>([]);
const categories = ref<any[]>([]);
const activeTab = ref<"groups" | "values">("groups");

const groupSearch = ref("");
const valueSearch = ref("");
const selectedGroupFilter = ref("");

const showGroupModal = ref(false);
const showValueModal = ref(false);
const editingGroup = ref<any>(null);
const editingValue = ref<any>(null);

const groupForm = ref({
  name: "",
  slug: "",
  description: "",
  categoryId: null as string | null,
  traitNames: [""] as string[],
  sortOrder: 0,
});

const valueForm = ref({
  groupId: "",
  traitName: "",
  value: "",
  unit: "",
  sortOrder: 0,
});

// --- Computed ---
const filteredGroups = computed(() => {
  if (!groupSearch.value) return groups.value;
  const q = groupSearch.value.toLowerCase();
  return groups.value.filter(
    (g) =>
      g.name.toLowerCase().includes(q) ||
      g.description?.toLowerCase().includes(q) ||
      g.traitNames.some((t: string) => t.toLowerCase().includes(q))
  );
});

const filteredValues = computed(() => {
  let vals = allValues.value;
  if (selectedGroupFilter.value) {
    vals = vals.filter((v) => v.groupId === selectedGroupFilter.value);
  }
  if (valueSearch.value) {
    const q = valueSearch.value.toLowerCase();
    vals = vals.filter(
      (v) =>
        v.value.toLowerCase().includes(q) ||
        v.traitName.toLowerCase().includes(q)
    );
  }
  return vals;
});

const totalValues = computed(() => allValues.value.length);

const availableTraitsForGroup = computed(() => {
  if (!valueForm.value.groupId) return [];
  const group = groups.value.find((g) => g.id === valueForm.value.groupId);
  return group?.traitNames || [];
});

// --- Methods ---
const fetchGroups = async () => {
  try {
    const res = await api.get("/admin/characteristic-groups");
    groups.value = res.data.groups || [];
  } catch (err) {
    console.error("Failed to fetch groups:", err);
  }
};

const fetchAllValues = async () => {
  try {
    const all: any[] = [];
    for (const group of groups.value) {
      const res = await api.get(
        `/admin/characteristic-groups/${group.id}/values`
      );
      all.push(...(res.data.values || []));
    }
    allValues.value = all;
  } catch (err) {
    console.error("Failed to fetch values:", err);
  }
};

const fetchCategories = async () => {
  try {
    const res = await api.get("/admin/categories");
    categories.value = res.data.categories || [];
  } catch (err) {
    console.error("Failed to fetch categories:", err);
  }
};

const getGroupName = (groupId: string) =>
  groups.value.find((g) => g.id === groupId)?.name || groupId;

const getGroupValuesCount = (groupId: string) =>
  allValues.value.filter((v) => v.groupId === groupId).length;

const selectGroup = (group: any) => {
  selectedGroupFilter.value = group.id;
  activeTab.value = "values";
};

// Group CRUD
const openGroupModal = (group: any | null) => {
  editingGroup.value = group;
  if (group) {
    groupForm.value = {
      name: group.name,
      slug: group.slug,
      description: group.description || "",
      categoryId: group.categoryId || null,
      traitNames: [...group.traitNames],
      sortOrder: group.sortOrder || 0,
    };
  } else {
    groupForm.value = {
      name: "",
      slug: "",
      description: "",
      categoryId: null,
      traitNames: [""],
      sortOrder: 0,
    };
  }
  showGroupModal.value = true;
};

const saveGroup = async () => {
  try {
    const payload = {
      name: groupForm.value.name,
      description: groupForm.value.description,
      categoryId: groupForm.value.categoryId,
      traitNames: groupForm.value.traitNames || [""],
    };
    if (editingGroup.value) {
      await api.put(
        `/admin/characteristic-groups/${editingGroup.value.id}`,
        payload
      );
    } else {
      await api.post("/admin/characteristic-groups", payload);
    }
    showGroupModal.value = false;
    editingGroup.value = null;
    await fetchGroups();
    await fetchAllValues();
  } catch (err: any) {
    // error handled silently
  }
};

const deleteGroupHandler = async (groupId: string) => {
  try {
    await api.delete(`/admin/characteristic-groups/${groupId}`);
    await fetchGroups();
    await fetchAllValues();
  } catch (err: any) {
    // error handled silently
  }
};

// Value CRUD
const openValueModal = (val: any | null) => {
  editingValue.value = val;
  if (val) {
    valueForm.value = {
      groupId: val.groupId,
      traitName: val.traitName,
      value: val.value,
      unit: val.unit || "",
      sortOrder: val.sortOrder || 0,
    };
  } else {
    valueForm.value = {
      groupId: selectedGroupFilter.value || "",
      traitName: "",
      value: "",
      unit: "",
      sortOrder: 0,
    };
  }
  showValueModal.value = true;
};

const saveValue = async () => {
  try {
    if (editingValue.value) {
      await api.put(
        `/admin/characteristic-values/${editingValue.value.id}`,
        valueForm.value
      );
    } else {
      await api.post(
        `/admin/characteristic-groups/${valueForm.value.groupId}/values`,
        valueForm.value
      );
    }
    showValueModal.value = false;
    editingValue.value = null;
    await fetchAllValues();
  } catch (err: any) {
    // error handled silently
  }
};

const deleteValueHandler = async (valueId: string) => {
  try {
    await api.delete(`/admin/characteristic-values/${valueId}`);
    await fetchAllValues();
  } catch (err: any) {
    // error handled silently
  }
};

onMounted(async () => {
  await Promise.all([fetchGroups(), fetchCategories()]);
  await fetchAllValues();
});
</script>

<style scoped>
.characteristics-admin {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
  letter-spacing: -0.01em;
}

.page-subtitle {
  margin: 4px 0 0;
  font-size: 14px;
  color: var(--color-text-secondary);
}

/* Tabs */
.tabs {
  display: flex;
  gap: 4px;
  background: var(--color-surface-secondary, #f9fafb);
  padding: 4px;
  border-radius: 10px;
  width: fit-content;
}

.tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  border: none;
  background: transparent;
  border-radius: 7px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.tab svg {
  width: 16px;
  height: 16px;
}

.tab.active {
  background: var(--color-surface);
  color: var(--color-text-primary);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.tab-count {
  background: var(--color-border);
  color: var(--color-text-secondary);
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 10px;
  font-weight: 500;
}

.tab.active .tab-count {
  background: var(--color-primary-light, #dbeafe);
  color: var(--color-primary);
}

/* Toolbar */
.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  flex: 1;
  min-width: 200px;
  max-width: 320px;
}

.search-box svg {
  width: 16px;
  height: 16px;
  color: var(--color-text-tertiary);
  flex-shrink: 0;
}

.search-box input {
  border: none;
  outline: none;
  font-size: 13px;
  background: transparent;
  color: var(--color-text-primary);
  width: 100%;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group label {
  font-size: 13px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.filter-group select {
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 13px;
  background: var(--color-surface);
  color: var(--color-text-primary);
  outline: none;
}

/* Buttons */
.btn-primary {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 16px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.btn-primary:hover {
  background: var(--color-primary-dark);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary svg {
  width: 16px;
  height: 16px;
}

.btn-ghost {
  padding: 6px 10px;
  border: none;
  background: transparent;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: all 0.15s ease;
}

.btn-ghost:hover {
  background: var(--color-surface-secondary, #f9fafb);
  color: var(--color-text-primary);
}

.btn-danger:hover {
  color: var(--color-error);
  background: var(--color-error-light, #fee2e2);
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--color-text-secondary);
}

.empty-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: var(--color-surface-secondary, #f9fafb);
  margin-bottom: 16px;
}

.empty-icon svg {
  width: 24px;
  height: 24px;
  color: var(--color-text-tertiary);
}

.empty-state h3 {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.empty-state p {
  margin: 0 0 20px;
  font-size: 14px;
}

/* Groups Grid */
.groups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.group-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.group-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.group-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.group-card-header h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
}

.badge {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  background: var(--color-primary-light, #dbeafe);
  color: var(--color-primary);
  font-weight: 500;
}

.badge-global {
  background: var(--color-surface-secondary, #f9fafb);
  color: var(--color-text-secondary);
}

.group-description {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin: 0 0 12px;
  line-height: 1.5;
}

.traits-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
}

.traits-tag {
  font-size: 12px;
  padding: 3px 10px;
  background: var(--color-background);
  border-radius: 6px;
  color: var(--color-text-secondary);
}

.group-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid var(--color-border-light, #f3f4f6);
}

.values-count {
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.group-actions {
  display: flex;
  gap: 4px;
}

/* Values Table */
.values-table-wrapper {
  overflow-x: auto;
}

.values-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.values-table th {
  text-align: left;
  padding: 10px 12px;
  color: var(--color-text-tertiary);
  font-weight: 500;
  font-size: 12px;
  border-bottom: 1px solid var(--color-border);
}

.values-table td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--color-border-light, #f3f4f6);
}

.value-name {
  font-weight: 500;
  color: var(--color-text-primary);
}

.trait-badge {
  font-size: 12px;
  padding: 2px 8px;
  background: var(--color-surface-secondary, #f9fafb);
  border-radius: 5px;
  color: var(--color-text-secondary);
}

.muted {
  color: var(--color-text-tertiary);
  font-size: 13px;
}

.row-actions {
  display: flex;
  gap: 2px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal {
  background: var(--color-surface);
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 560px;
  max-height: 85vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-border);
}

.modal-header h2 {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
}

.btn-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: var(--color-surface-secondary, #f9fafb);
  border-radius: 8px;
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: all 0.15s ease;
}

.btn-close:hover {
  background: var(--color-border);
  color: var(--color-text-primary);
}

.btn-close svg {
  width: 16px;
  height: 16px;
}

.modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
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

.form-row {
  display: grid;
  grid-template-columns: 1fr 100px;
  gap: 12px;
}

.input {
  padding: 9px 12px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 13px;
  font-family: inherit;
  background: var(--color-surface);
  color: var(--color-text-primary);
  outline: none;
  transition: border-color 0.15s ease;
}

.input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

textarea.input {
  resize: vertical;
  min-height: 60px;
}

select.input {
  cursor: pointer;
}

/* Traits editor */
.traits-editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.trait-input-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.trait-input-row .input {
  flex: 1;
}

.trait-input-row .btn-ghost {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  font-size: 18px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--color-border-light, #f3f4f6);
  margin-top: 4px;
}

@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    max-width: none;
  }

  .groups-grid {
    grid-template-columns: 1fr;
  }

  .modal {
    width: 95%;
    max-width: none;
    border-radius: 16px 16px 0 0;
    margin-top: auto;
    max-height: 90vh;
  }
}
</style>
