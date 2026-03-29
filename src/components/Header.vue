<template>
  <header>
    <div class="container flex v-center">

      <div class="headerLogoInfo flex v-center">
         <router-link to="/" class="flex v-center">
        <img src="../../public/logo.svg" alt="logo" />

        <h1>Behoof</h1>
          </router-link>
        <p>Лучшие цены в интернет-магазинах</p>
      </div>


      <div class="headerBtnCategory">
        <button class="headerBtnCategoryButtom" @click="toggleCatalog">
          Каталог товаров
          <div>
            <span class="headerBtnCategoryButtomSpan" :class="{ rotated: isCatalogOpen }">▼</span>
          </div>
        </button>
      </div>

      <div class="searchCont" @click="toggleCatalog">
        <span class="searchImg"><img src="../../public/iconHed/Search.svg" alt="" /></span>
        <input type="text" class="searchInput" placeholder="Поиск товаров" />
      </div>

      <nav class="headerNav">
 <router-link v-if="isAdmin" to="/add-product" class="add-product-link">
 <button title="Добавить товар">➕</button>
 </router-link>
        <div class="auth-section">
          <button
            v-if="!isAuthenticated"
            @click="goToLogin"
            class="auth-button"
            title="Войти в аккаунт"
          >
            <img src="../../public/iconHed/authorization.svg" alt="Вход" />
          </button>
          <div v-else class="profile-menu">
            <button @click="toggleProfileMenu" class="profile-button" :title="currentUser?.firstName">
              <div class="profile-avatar">{{ userInitials }}</div>
            </button>
            <div v-show="showProfileMenu" class="profile-dropdown">
              <div class="profile-info">
                <div class="profile-info-name">{{ currentUser?.firstName }} {{ currentUser?.lastName }}</div>
                <div class="profile-info-email">{{ currentUser?.email }}</div>
              </div>
 <router-link to="/profile" class="profile-link">
 <span><img src="../../public/profIcon/l5.png" alt=""> Мой профиль</span>
 </router-link>
 <router-link to="/orders" class="profile-link">
 <span><img src="../../public/profIcon/l3.png" alt=""> Мои заказы</span>
 </router-link>
 <router-link v-if="isAdmin" to="/admin" class="profile-link">
 <span><img src="../../public/profIcon/l4.png" alt=""> Админ-панель</span>
 </router-link>
              <router-link to="/favorites" class="profile-link">
                <span><img src="../../public/profIcon/l1.png" alt=""> Избранное</span>
              </router-link>
              <router-link to="/comparison" class="profile-link">
                <span><img src="../../public/profIcon/l2.png" alt=""> Сравнение</span>
              </router-link>
              <button @click="handleLogout" class="logout-button">
                <span><img src="../../public/profIcon/l6.png" alt=""> Выход</span>
              </button>
            </div>
          </div>
        </div>
        <button @click="openCompareModal" title="Сравнение" class="header-icon-btn"><img src="../../public/iconHed/comparison.svg" alt="" /></button>
        <router-link to="/favorites" title="Избранное"><img src="../../public/iconHed/favourites.svg" alt="" /></router-link>
      </nav>
    </div>

    <div
      :class="{ 'catalog-block': true, 'catalog-block--open': isCatalogOpen }"
      ref="catalogBlock"
    >
      <div class="catalogCont">
        <div class="catalogContLeft">
          <h1>Каталог товаров</h1>
          <div v-if="loading" class="loading">Загрузка...</div>
          <div v-else class="catalogContDiv">
            <button
              v-for="category in categories"
              :key="category.id"
              @click="selectCategory(category.id)"
            >
              <div class="catalogButtom" :class="{ active: activeCategoryId === category.id }">
                <div :class="{ active: activeCategoryId === category.id }"></div>
                <p>{{ category.name }}</p>
              </div>
              <span :class="{ active: activeCategoryId === category.id }">▶</span>
            </button>
          </div>
        </div>

        <div class="catalogContCent" v-if="selectedCategoryId">
          <h1>
            {{ getCategoryName(selectedCategoryId) }}
          </h1>
          <div class="catalogContDiv">
            <!-- Кнопка "Все [Категория]" -->
            <button @click="goToCategoryCatalog(selectedCategoryId)" class="all-category-btn">
              <div class="catalogButtom" :class="{ active: !selectedSubcategoryId }">
                <div :class="{ active: !selectedSubcategoryId }"></div>
                <p>Все {{ getCategoryName(selectedCategoryId) }}</p>
              </div>
              <span :class="{ active: !selectedSubcategoryId }">▶</span>
            </button>

            <button
              v-for="subcat in subcategories"
              :key="subcat.id"
              @click="selectSubcategory(subcat.id)"
            >
              <div class="catalogButtom" :class="{ active: activeSubcategoryId === subcat.id }">
                <div :class="{ active: activeSubcategoryId === subcat.id }"></div>
                {{ subcat.name }}
              </div>
              <span :class="{ active: activeSubcategoryId === subcat.id }">▶</span>
            </button>
          </div>
        </div>
        <div class="t1 anim1" v-else>
          <video
            ref="catalogVideo"
            class="catalog-video"
            :src="videoSrc"
            muted
            @loadeddata="onVideoLoaded"
            @ended="onVideoEnded"
          ></video>
        </div>

        <div class="catalogContMid" v-if="selectedSubcategoryId">
          <h1>
            {{ getSubcategoryName(selectedSubcategoryId) }}
          </h1>
          <div class="catalogContDiv">
            <div v-if="modelsLoading" class="loading">Загрузка моделей...</div>
            <div v-else style="width: 100%;">
              <button
                v-for="model in models"
                :key="model.id"
                @click="selectModel(model.id)"
                class="model-button"
              >
                <div class="catalogButtom" :class="{ active: activeModelId === model.id }">
                  <div :class="{ active: activeModelId === model.id }"></div>
                  {{ model.name }}
                </div>
                <span :class="{ active: activeModelId === model.id }">▶</span>
              </button>
            </div>
          </div>
        </div>
        <div class="t2" v-else-if="selectedCategoryId"></div>

        <!-- В будущем при выборе модели перейти на страницу каталога -->
        <div class="catalogContRight" v-if="selectedModelId">
          <h1>
            {{ getModelName(selectedModelId) }}
          </h1>
          <div class="catalogContDiv">
            <p style="padding: 20px; text-align: center; color: #666;">
              Выберите модель для просмотра товаров в каталоге
            </p>
          </div>
        </div>
        <div class="t3" v-else-if="selectedSubcategoryId"></div>

        <div class="abc">
          <img src="../../public/iconHed/abc.png" alt="" />
        </div>
      </div>
    </div>

    <CompareSelectModal
      :show="showCompareModal"
      :currentProduct="null"
      @close="closeCompareModal"
    />
  </header>
</template>

<script>
import { fetchCatalog } from '@/api/catalog.js';
import authAPI from '@/api/auth.js';
import CompareSelectModal from '@/components/CompareSelectModal.vue';

export default {
  name: 'HeaderComponent',
  components: {
    CompareSelectModal
  },

  data() {
    return {
      isCatalogOpen: false,
      selectedCategoryId: null,
      selectedSubcategoryId: null,
      selectedModelId: null,

      activeCategoryId: null,
      activeSubcategoryId: null,
      activeModelId: null,
      activeProductId: null,

      catalogData: {
        categories: [],
        subcategories: {},
        models: {},
        products: {}
      },

      loading: false,
      modelsLoading: false,
      productsLoading: false,

      videoSrc: '/videos/catalog-animation.mp4',
      isVideoPlaying: false,

      isAuthenticated: false,
      currentUser: null,
      showProfileMenu: false,
      showCompareModal: false
    }
  },

 computed: {
 isAdmin() {
 return this.currentUser?.role === 'admin';
 },
 userInitials() {
 if (this.currentUser) {
 const first = this.currentUser.firstName?.[0] || '';
 const last = this.currentUser.lastName?.[0] || '';
 return (first + last).toUpperCase();
 }
 return '';
 },
    categories() {
      return this.catalogData.categories || [];
    },

    subcategories() {
      if (!this.selectedCategoryId) return [];

      const category = this.catalogData.categories.find((cat) => cat.id === this.selectedCategoryId);
      if (!category || !category.subcategoryIds) return [];

      return category.subcategoryIds
        .map((id) => this.catalogData.subcategories[id])
        .filter(subcat => subcat);
    },

    models() {
      if (!this.selectedSubcategoryId) return [];

      const subcategory = this.catalogData.subcategories[this.selectedSubcategoryId];
      if (!subcategory) return [];

      return Object.values(this.catalogData.models || {})
        .filter(model => model.subcategoryId === this.selectedSubcategoryId);
    },

    products() {
      if (!this.selectedModelId) return [];

      const model = this.catalogData.models[this.selectedModelId];
      if (!model || !model.productIds) return [];

      return model.productIds
        .map((id) => this.catalogData.products[id])
        .filter(product => product);
    },
  },

  methods: {
    async loadCatalogData() {
      this.loading = true;
      try {
        const data = await fetchCatalog();
        this.catalogData = data;
        console.log('Данные каталога загружены:', data);
      } catch (error) {
        console.error('Ошибка загрузки каталога:', error);
      } finally {
        this.loading = false;
      }
    },

    resetSelections() {
      this.selectedCategoryId = null
      this.selectedSubcategoryId = null
      this.selectedModelId = null
      this.activeCategoryId = null
      this.activeSubcategoryId = null
      this.activeModelId = null
      this.activeProductId = null
    },

    async toggleCatalog() {
      this.isCatalogOpen = !this.isCatalogOpen

      if (this.isCatalogOpen) {
        await this.loadCatalogData();

        if (!this.selectedCategoryId) {
          this.$nextTick(() => {
            this.playVideo()
          })
        }
      } else {
        this.selectedCategoryId = null
        this.selectedSubcategoryId = null
        this.resetSelections()

        if (this.$refs.catalogVideo) {
          this.$refs.catalogVideo.pause()
          this.$refs.catalogVideo.currentTime = 0
        }
        this.isVideoPlaying = false
      }
    },

    selectCategory(categoryId) {
      this.selectedCategoryId = categoryId
      this.selectedSubcategoryId = null
      this.selectedModelId = null
      this.activeCategoryId = categoryId
      this.activeSubcategoryId = null
      this.activeModelId = null
      this.activeProductId = null

      if (this.$refs.catalogVideo) {
        this.$refs.catalogVideo.pause()
        this.isVideoPlaying = false
      }
    },

    selectSubcategory(subcategoryId) {
      this.selectedSubcategoryId = subcategoryId
      this.selectedModelId = null
      this.activeSubcategoryId = subcategoryId
      this.activeModelId = null
      this.activeProductId = null
      this.loadModelsForSubcategory(subcategoryId);
    },

    selectModel(modelId) {
      this.selectedModelId = modelId
      this.activeModelId = modelId
      this.activeProductId = null
      this.isCatalogOpen = false;
      this.$router.push(`/catalog?modelId=${modelId}`);
    },

    selectProduct(productId) {
      this.activeProductId = productId
      console.log('Выбран товар:', productId, this.catalogData.products[productId]);
    },

    closeCatalog(event) {
      const catalogBlock = this.$refs.catalogBlock
      const buttonCatalog = event?.target?.closest('.headerBtnCategoryButtom')
      const buttonSearch = event?.target?.closest('.searchCont')

      if (catalogBlock && !catalogBlock.contains(event.target) && !buttonCatalog && !buttonSearch) {
        this.isCatalogOpen = false
        this.selectedCategoryId = null
        this.selectedSubcategoryId = null
        this.resetSelections()

        if (this.$refs.catalogVideo) {
          this.$refs.catalogVideo.pause()
          this.$refs.catalogVideo.currentTime = 0
        }
        this.isVideoPlaying = false
      }
    },

    onVideoLoaded() {
      if (this.isCatalogOpen && !this.selectedCategoryId) {
        this.playVideo()
      }
    },

    onVideoEnded() {
      if (this.$refs.catalogVideo) {
        this.$refs.catalogVideo.pause()
      }
    },

    playVideo() {
      const video = this.$refs.catalogVideo
      if (video) {
        video.currentTime = 0
        video.play()
        this.isVideoPlaying = true
      }
    },

    getCategoryName(categoryId) {
      const category = this.catalogData.categories.find(cat => cat.id === categoryId);
      return category ? category.name : '';
    },

    getSubcategoryName(subcategoryId) {
      const subcat = this.catalogData.subcategories[subcategoryId];
      return subcat ? subcat.name : '';
    },

    getModelName(modelId) {
      const model = this.catalogData.models[modelId];
      return model ? model.name : '';
    },

    loadModelsForSubcategory() {
      this.modelsLoading = true;
      setTimeout(() => {
        this.modelsLoading = false;
      }, 100);
    },

    loadProductsForModel() {
      this.productsLoading = true;
      setTimeout(() => {
        this.productsLoading = false;
      }, 100);
    },

    goToLogin() {
      this.$router.push('/login');
    },

    toggleProfileMenu() {
      this.showProfileMenu = !this.showProfileMenu;
    },

    handleLogout() {
      authAPI.logout();
      this.isAuthenticated = false;
      this.currentUser = null;
      this.showProfileMenu = false;
      this.$router.push('/');
    },

    checkAuthStatus() {
      this.isAuthenticated = authAPI.isAuthenticated();
      if (this.isAuthenticated) {
        this.currentUser = authAPI.getCurrentUser();
      }
    },

    closeProfileMenu(event) {
      const profileMenu = this.$refs.profileMenu;
      const profileButton = event?.target?.closest('.profile-button');
      if (profileMenu && !profileMenu.contains(event.target) && !profileButton) {
        this.showProfileMenu = false;
      }
    },

    openCompareModal() {
      const token = localStorage.getItem('token');
      if (!token) {
        this.$router.push('/login');
        return;
      }
      this.showCompareModal = true;
    },

    closeCompareModal() {
      this.showCompareModal = false;
    },

    goToCategoryCatalog(categoryId) {
      this.isCatalogOpen = false;
      this.$router.push(`/catalog?categoryId=${categoryId}`);
    }
  },

  mounted() {
    document.addEventListener('click', this.closeCatalog);
    document.addEventListener('click', this.closeProfileMenu);
    this.checkAuthStatus();
  },

  beforeUnmount() {
    document.removeEventListener('click', this.closeCatalog);
    document.removeEventListener('click', this.closeProfileMenu);
  },

  watch: {
    '$route'() {
      this.checkAuthStatus();
    }
  }
}
</script>
<style scoped>
@font-face {
  font-family: 'Inter';
  font-weight: 400;
  src: url('../../fonts/Inter_24pt-Regular.ttf');
}
@font-face {
  font-family: 'Inter';
  font-weight: 500;
  src: url('../../fonts/Inter_24pt-Medium.ttf');
}
@font-face {
  font-family: 'Inter';
  font-weight: 600;
  src: url('../../fonts/Inter_24pt-SemiBold.ttf');
}
@font-face {
  font-family: 'Inter';
  font-weight: 700;
  src: url('../../fonts/Inter_28pt-Bold.ttf');
}

.flex {
  display: flex;
}
.v-center {
  align-content: center;
}
header {
  width: 100%;
  border-bottom: 1px solid #f2f5f9;
  position: relative;
}
.container {
  width: 85%;
  margin: 0 auto;
  padding: 0 20px;
  height: 76px;
}
.headerLogoInfo {
  cursor: pointer;
  width: 22%;
  display: flex;
  align-items: center;
}

.headerLogoInfo img {
  height: 40px;
  margin-top: 48px;
}

.headerLogoInfo h1 {
  font-weight: 700;
  font-size: 52px;
  text-decoration: none;
  color: black;
  margin-left: 15px;
}
.headerLogoInfo p {
  max-width: 200px;
  min-width: 200px;
  margin-left: 9px;
  font-size: 18px;
  margin-right: 5px;
}

.headerBtnCategory {
  width: 12%;
  display: flex;
  align-items: center;
  margin-left: auto;
}

.headerBtnCategoryButtom {
  width: 100%;
  height: 52px;
  background-color: #ff4d4d;
  color: white;
  border: none;
  border-radius: 5px 0 0 5px;
  font-weight: 500;
  font-size: 16px;
  cursor: pointer;
  position: relative;
  padding-right: 30px;
}
.headerBtnCategoryButtom div {
  margin-top: -19px;
  margin-left: 155px;
  position: absolute;
}

.headerBtnCategoryButtomSpan {
  color: white;
  font-weight: 500;
  font-size: 14px;
  display: inline-block;
  transition: transform 0.3s ease;
}

.headerBtnCategoryButtomSpan.rotated {
  transform: rotate(180deg);
}

.searchCont {
  width: 48%;
  height: 76px;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.searchInput {
  width: 100%;
  height: 52px;
  border: none;
  background-color: #f2f5f9;
  padding: 0 0 0 50px;
  font-weight: 400;
  border-radius: 0 8px 8px 0;
  cursor: text;
  font-size: 15px;
  font-weight: 400px;
}

.searchImg {
  position: absolute;
  margin-left: 20px;
}

.headerNav {
  width: 12%;
  height: 76px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0 0 40px;
}
.headerNav button,
.headerNav a {
  background-color: #f2f5f9;
  height: 52px;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  padding: 0 12px;
}

.headerNav a:hover {
  background-color: #e0e5f0;
}

.headerNav a img,
.headerNav button.header-icon-btn img {
  width: 24px;
  height: 24px;
}

.headerNav button.header-icon-btn {
  cursor: pointer;
}

.headerNav button.header-icon-btn:hover {
  background-color: #e0e5f0;
}

.add-product-link {
  text-decoration: none;
}

.add-product-link button {
  background-color: #28a745;
  color: white;
  width: 36px;
  height: 36px;
}

.add-product-link button:hover {
  background-color: #218838;
}

.catalog-block {
  position: absolute;
  top: 76px;
  left: 0;
  width: 100%;
  z-index: 1000;
  overflow: hidden;
  opacity: 0;
  padding: 0;
  transform: translateY(-20px);
  transition:
    opacity 0.4s ease-out,
    transform 0.4s ease-out;
  display: none;
}

.catalog-block--open {
  display: flex;
  min-height: 600px;
  opacity: 1;
  transform: translateY(0);
  background-color: white;
}

.catalogCont {
  width: 85%;
  min-height: 700px;
  display: flex;
  margin-left: auto;
  margin-right: auto;
}
.catalogCont button {
  width: 100%;
  height: 50px;
  text-align: left;
  display: flex;
  font-size: 18px;
  font-weight: 400;
  border: none;
  border-left: 0;
  border-right: 0;
  border-top: 0;
  border-bottom: 2px solid #a0a0a09b;
  color: #263141;
  padding-left: 0;
}
.catalogCont button span {
  margin-left: auto;
  padding: 15px 15px 0 0;
  font-size: 15px;
}

.catalogContLeft {
  width: 24%;
}
.catalogContDiv {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  border-radius: 5px;
  overflow: hidden;
  background-color: #f2f5f9;
}
.catalogButtom {
  display: flex;
  align-items: center;
}
.catalogButtom div {
  height: 25px;
  width: 4px;
  border-radius: 0 5px 5px 0;
  margin-right: 7px;
}

.all-category-btn {
  background: linear-gradient(135deg, #ff4d4d 0%, #ff6b6b 100%) !important;
  color: white !important;
}

.all-category-btn .catalogButtom {
  color: white !important;
}

.all-category-btn .catalogButtom div {
  background-color: white !important;
}

.all-category-btn span {
  color: white !important;
}

.all-category-btn:hover {
  background: linear-gradient(135deg, #e63939 0%, #ff5555 100%) !important;
}

.catalogCont button span {
  transition: color 0.3s ease;
}

.catalogCont button .catalogButtom {
  transition: color 0.3s ease;
}

.catalogCont button .catalogButtom div {
  transition: background-color 0.3s ease;
}

.catalogContCent {
  width: 22%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-left: 1.5%;
}

.catalogContMid {
  width: 22%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-left: 1.5%;
}

.catalogContRight {
  width: 22%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-left: 1.5%;
}
.catalogCont h1 {
  font-weight: 700;
  font-size: 22px;
}

.catalogCont button span.active {
  color: #ff4d4d;
}

.catalogButtom.active {
  color: #ff4d4d;
}

.catalogButtom div.active {
  background-color: #ff4d4d;
  color: #ff4d4d;
}

.catalogCont button:hover span {
  color: #ff4d4d;
}

.catalogCont button:hover .catalogButtom {
  color: #ff4d4d;
}

.catalogCont button:hover .catalogButtom div {
  background-color: #ff4d4d;
}

.t1.anim1 {
  width: 48%;
  height: 400px;
  margin-left: 2%;
  margin-top: 25px;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
}

.catalog-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}
.t2 {
  background-color: firebrick;
  width: 24%;
  height: 400px;
  margin-left: 2%;
  margin-top: 20px;
  margin-top: 25px;
}

.abc {
  width: 24%;
  height: 700px;
  margin-left: auto;
  margin-top: 20px;
  padding-top: 40px;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
.abc img {
  width: 100%;
}


.loading {
  padding: 20px;
  text-align: center;
  color: #666;
  font-size: 16px;
}

.auth-section {
  position: relative;
  display: flex;
  align-items: center;
}

.auth-button {
  background-color: #f2f5f9;
  height: 52px;
  width: 52px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.auth-button:hover {
  background-color: #e0e5f0;
  transform: translateY(-2px);
}

.profile-menu {
  position: relative;
}

.profile-button {
 background: linear-gradient(135deg, #667eea0%, #764ba2100%);
 height:52px;
 width:52px;
 border:none;
 border-radius:12px;
 cursor: pointer;
 display: flex;
 align-items: center;
 justify-content: center;
 transition: all0.3s ease;
 padding:0;
 box-shadow:03px10px rgba(102,126,234,0.3);
}

.profile-button:hover {
 transform: translateY(-2px);
 box-shadow:06px20px rgba(102,126,234,0.4);
}

.profile-button:active {
 transform: translateY(0);
}

.profile-button:hover {
  background-color: #764ba2;

}

.profile-avatar {
  color: white;
  font-weight: 700;
  font-size: 16px;
}

.profile-dropdown {
 position: absolute;
 top:100%;
 right:0;
 background: linear-gradient(180deg, #ffffff0%, #f8fafc100%);
 border-radius:16px;
 box-shadow:
020px40px rgba(0,0,0,0.1),
0001px rgba(255,255,255,0.5) inset;
 min-width:280px;
 z-index:1001;
 margin-top:12px;
 overflow: hidden;
 animation: dropdownFadeIn0.3s ease-out;
}

@keyframes dropdownFadeIn {
 from {
 opacity:0;
 transform: translateY(-10px);
 }
 to {
 opacity:1;
 transform: translateY(0);
 }
}

.profile-info {
 padding:20px;
 background: linear-gradient(135deg, #667eea0%, #764ba2100%);
}

.profile-info-name {
 font-weight:700;
 color: #ffffff;
 font-size:16px;
 margin-bottom:4px;
}

.profile-info-email {
 font-size:13px;
 color: rgba(255,255,255,0.85);
}

.profile-link {
 display: block;
 padding:14px20px;
 color: #374151;
 text-decoration: none;
 font-size:15px;
 font-weight:500;
 transition: all0.3s ease;
 border-bottom:1px solid #f1f5f9;
 position: relative;
 overflow: hidden;
}

.profile-link::before {
 content: '';
 position: absolute;
 left:0;
 top:0;
 height:100%;
 width:4px;
 background: linear-gradient(135deg, #667eea0%, #764ba2100%);
 transform: scaleY(0);
 transition: transform0.3s ease;
}

.profile-link:hover {
 background: linear-gradient(90deg, #f8fafc0%, #f1f5f9100%);
 color: #667eea;
 padding-left:28px;
}

.profile-link:hover::before {
 transform: scaleY(1);
}

.profile-link span {
 display: flex;
 align-items: center;
 gap:14px;
}

.profile-link img{
 width:22px;
 height:22px;
 filter: grayscale(0);
 transition: filter0.3s ease;
}

.profile-link:hover img {
 filter: grayscale(0) brightness(0.6) sepia(1) hue-rotate(180deg) saturate(3);
}

.logout-button {
 width:100%;
 padding:14px20px;
 background: none;
 border: none;
 text-align: left;
 color: #dc2626;
 font-size:15px;
 font-weight:500;
 cursor: pointer;
 transition: all0.3s ease;
 position: relative;
 overflow: hidden;
}

.logout-button::before {
 content: '';
 position: absolute;
 left:0;
 top:0;
 height:100%;
 width:4px;
 background: #dc2626;
 transform: scaleY(0);
 transition: transform0.3s ease;
}

.logout-button:hover {
 background: linear-gradient(90deg, #fef2f20%, #fee2e2100%);
 padding-left:28px;
}

.logout-button:hover::before {
 transform: scaleY(1);
}

.logout-button span {
 display: flex;
 align-items: center;
 gap:14px;
}


.logout-button img{
 width:22px;
 height:22px;
}

.profile-info {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.profile-info-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
  margin-bottom: 4px;
}

.profile-info-email {
  font-size: 12px;
  color: #6b7280;
}

.profile-link {
  display: block;
  padding: 12px 16px;
  color: #374151;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.3s ease;
  border-bottom: 1px solid #e5e7eb;
}

.profile-link:hover {
  background-color: #f3f4f6;
  color: #667eea;
  padding-left: 20px;
}

.profile-link span {
  display: flex;
  align-items: center;
  gap: 8px;
}

.profile-link img{
  width: 20px;
  height: 20px;
}

.logout-button {
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  text-align: left;
  color: #dc2626;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-button:hover {
  background-color: #fee2e2;
  padding-left: 20px;
}

.logout-button span {
  display: flex;
  align-items: center;
  gap: 8px;
}


.logout-button img{
  width: 20px;
  height: 20px;
}
</style>
