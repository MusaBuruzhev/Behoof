<template>
  <header>
    <div class="container flex v-center">
      <div class="headerLogoInfo flex v-center">
        <img src="../../public/logo.svg" alt="logo" />
        <h1>Behoof</h1>
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
        <button><img src="../../public/iconHed/authorization.svg" alt="" /></button>
        <button><img src="../../public/iconHed/comparison.svg" alt="" /></button>
        <button><img src="../../public/iconHed/favourites.svg" alt="" /></button>
      </nav>
    </div>

    <div
      :class="{ 'catalog-block': true, 'catalog-block--open': isCatalogOpen }"
      ref="catalogBlock"
    >
      <div class="catalogCont">
        <div class="catalogContLeft">
          <h1>Каталог товаров</h1>
          <div class="catalogContDiv">
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
            {{ categories.find((c) => c.id === selectedCategoryId)?.name }}
          </h1>
          <div class="catalogContDiv">
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

        <!-- Правая колонка -->
        <div class="catalogContRight" v-if="selectedSubcategoryId">
          <h1>
            {{ subcategories.find((s) => s.id === selectedSubcategoryId)?.name }}
          </h1>
          <div class="catalogContDiv">
            <button
              v-for="product in products"
              :key="product.id"
              @click="selectProduct(product.id)"
              class="product-button"
            >
              <div class="catalogButtom">
                <div></div>
                {{ product.name }} - {{ product.price }} руб.
              </div>
            </button>
          </div>
        </div>
        <div class="t2" v-else-if="selectedCategoryId">
          <!-- Анимация T2 -->
          Выберите подкатегорию
        </div>

        <div class="abc">
          <img src="../../public/iconHed/abc.png" alt="" />
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import catalogData from '@/data/data'

export default {
  name: 'HeaderComponent',

  data() {
    return {
      isCatalogOpen: false,
      catalogData: catalogData,
      selectedCategoryId: null,
      selectedSubcategoryId: null,

      activeCategoryId: null,
      activeSubcategoryId: null,
      activeProductId: null,

      videoSrc: '/videos/catalog-animation.mp4',
      isVideoPlaying: false,
    }
  },

  methods: {
    resetSelections() {
      this.selectedCategoryId = null
      this.selectedSubcategoryId = null
      this.activeCategoryId = null
      this.activeSubcategoryId = null
      this.activeProductId = null
    },

    toggleCatalog() {
      this.isCatalogOpen = !this.isCatalogOpen
      if (!this.isCatalogOpen) {
        this.selectedCategoryId = null
        this.selectedSubcategoryId = null
        this.resetSelections()
        if (this.$refs.catalogVideo) {
          this.$refs.catalogVideo.pause()
          this.$refs.catalogVideo.currentTime = 0
        }
        this.isVideoPlaying = false
      } else {
        if (!this.selectedCategoryId) {
          this.$nextTick(() => {
            this.playVideo()
          })
        }
      }
    },

    selectCategory(categoryId) {
      this.selectedCategoryId = categoryId
      this.selectedSubcategoryId = null
      this.activeCategoryId = categoryId
      this.activeSubcategoryId = null
      this.activeProductId = null

      if (this.$refs.catalogVideo) {
        this.$refs.catalogVideo.pause()
        this.isVideoPlaying = false
      }
    },

    selectSubcategory(subcategoryId) {
      this.selectedSubcategoryId = subcategoryId
      this.activeSubcategoryId = subcategoryId
      this.activeProductId = null
    },

    selectProduct(productId) {
      this.activeProductId = productId
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
  },

  computed: {
    categories() {
      return this.catalogData.categories
    },

    subcategories() {
      if (!this.selectedCategoryId) return []

      const category = this.catalogData.categories.find((cat) => cat.id === this.selectedCategoryId)
      if (!category || !category.subcategoryIds) return []
      return category.subcategoryIds.map((id) => this.catalogData.subcategories[id])
    },

    products() {
      if (!this.selectedSubcategoryId) return []

      const subcategory = this.catalogData.subcategories[this.selectedSubcategoryId]

      if (!subcategory || !subcategory.productIds) return []

      return subcategory.productIds.map((id) => this.catalogData.products[id])
    },
  },

  mounted() {
    document.addEventListener('click', this.closeCatalog)
  },

  beforeUnmount() {
    document.removeEventListener('click', this.closeCatalog)
  },
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
}

.headerLogoInfo h1 {
  font-weight: 700;
  font-size: 52px;
  margin-left: 15px;
}
.headerLogoInfo p {
  max-width: 200px;
  min-width: 200px;
  margin-left: 9px;
  font-size: 19px;
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
  font-size: 11px;
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
.headerNav button {
  background-color: #f2f5f9;
  height: 52px;
  width: 52px;
  border: none;
  border-radius: 8px;
}

.catalog-block {
  position: absolute;
  top: 76px;
  left: 0;
  width: 100%;
  z-index: 1000;
  overflow: hidden;
  display: flex;
  justify-content: center;
  opacity: 0;
  padding: 0;
  transform: translateY(-20px);
  transition:
    max-height 0.4s ease-out,
    opacity 0.4s ease-out,
    padding 0.4s ease-out,
    transform 0.4s ease-out;
}

.catalog-block--open {
  max-height: 600px;
  opacity: 1;
  transform: translateY(0);
  background-color: white;
}

.catalogCont {
  width: 85%;
  min-height: 500px;
  display: flex;
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
  font-size: 13px;
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
  width: 24%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-left: 1.5%;
}

.catalogContRight {
  width: 24%;
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
  height: 400px;
  margin-left: auto;
  margin-top: 20px;
  margin-top: 25px;
  border-radius: 5px;
  border: 1px solid #ff4d4d;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
.abc img {
  width: 100%;
}
</style>
