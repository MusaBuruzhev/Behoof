<template>
  <div class="comparison-view">
    <div class="container">
      <div class="comparison-header">
        <div class="header-content">
          <h1 class="comparison-title">Сравнение товаров</h1>
          <p class="comparison-subtitle">
            Сравните характеристики, цены и оценки товаров перед покупкой
          </p>
        </div>
        <div v-if="products.length > 0" class="products-count">
          <span class="count-value">{{ products.length }}</span>
          <span class="count-label">товара</span>
        </div>
      </div>
      
      <div v-if="products.length === 0" class="empty-state">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M9 3v18M15 3v18M3 9h6M3 15h6M15 9h6M15 15h6" />
        </svg>
        <h2 class="empty-title">Нет товаров для сравнения</h2>
        <p class="empty-description">
          Добавьте товары из каталога и сравните их характеристики
        </p>
        <router-link to="/catalog" class="btn btn-primary btn-lg">
          Перейти в каталог
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </router-link>
      </div>
      
      <div v-else>
        <div class="quick-summary">
          <div class="summary-card">
            <div class="summary-icon price-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div class="summary-content">
              <span class="summary-label">Самая низкая цена</span>
              <span class="summary-value">{{ formatPrice(lowestPrice) }} ₽</span>
              <span class="summary-product">{{ lowestPriceProductName }}</span>
            </div>
          </div>
          
          <div class="summary-card">
            <div class="summary-icon rating-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <div class="summary-content">
              <span class="summary-label">Лучший рейтинг</span>
              <span class="summary-value">{{ highestRating.toFixed(1) }}</span>
              <span class="summary-product">{{ highestRatingProductName }}</span>
            </div>
          </div>
          
          <div class="summary-card">
            <div class="summary-icon reviews-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div class="summary-content">
              <span class="summary-label">Больше отзывов</span>
              <span class="summary-value">{{ mostReviewsCount }}</span>
              <span class="summary-product">{{ mostReviewsProductName }}</span>
            </div>
          </div>
        </div>
        
        <div class="comparison-controls">
          <label class="toggle-control">
            <input
              v-model="showOnlyDifferences"
              type="checkbox"
              class="toggle-checkbox"
            />
            <span class="toggle-slider"></span>
            <span class="toggle-label">Показывать только различия</span>
          </label>
          
          <button class="btn btn-secondary" @click="clearAll">
            Очистить всё
          </button>
        </div>
        
        <div class="products-sticky-wrapper" ref="stickyWrapper">
          <div class="products-cards">
            <div class="characteristics-spacer"></div>
            
            <div
              v-for="product in products"
              :key="product.id"
              class="product-card-wrapper"
            >
              <div class="product-card">
                <div class="product-image-wrapper">
                  <img
                    :src="getProductImage(product)"
                    :alt="product.name"
                    class="product-image"
                  />
                </div>
                
                <div class="product-details">
                  <span class="product-brand">{{ product.brand }}</span>
                  <h3 class="product-name">
                    <router-link :to="`/product/${product.id}`" :title="product.name">
                      {{ product.name }}
                    </router-link>
                  </h3>
                </div>
                
                <div class="product-price">{{ formatPrice(product.price) }} ₽</div>
                
                <button
                  class="remove-btn"
                  @click="removeProduct(product.id)"
                  title="Удалить из сравнения"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div class="comparison-table">
          <div
            v-for="(group, groupIndex) in filteredCharacteristicGroups"
            :key="groupIndex"
            class="characteristic-group"
          >
            <div class="group-header">
              <div class="characteristics-spacer"></div>
              <div
                v-for="product in products"
                :key="product.id"
                class="group-header-cell"
              >
              </div>
            </div>
            
            <div
              v-for="(char, charIndex) in group.characteristics"
              :key="charIndex"
              class="characteristic-row"
              :class="{ 'row-even': charIndex % 2 === 1 }"
            >
              <div class="characteristic-name">
                {{ char.name }}
              </div>
              
              <div
                v-for="product in products"
                :key="product.id"
                class="characteristic-value"
                :class="getBestValueClass(product.id, { ...char, name: char.name })"
              >
                <span v-if="isBestValue(product.id, char)" class="best-badge">
                  Лучшее
                </span>
                {{ getCharacteristicValue(product, char) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { getProduct } from '@/api'
import { useComparisonStore } from '@/stores'
import type { Product } from '@/types'

const comparisonStore = useComparisonStore()

const products = ref<Product[]>([])
const isLoading = ref(true)
const showOnlyDifferences = ref(false)

const characteristicGroups = ref([
  {
    name: 'Основные',
    characteristics: [
      { name: 'Бренд', key: 'brand', type: 'string' },
      { name: 'Цена', key: 'price', type: 'number' },
    ],
  },
  {
    name: 'Характеристики',
    characteristics: [] as { name: string; key: string; type: string }[],
  },
])

const loadProducts = async () => {
  isLoading.value = true
  const productPromises = comparisonStore.productIds.map(id => getProduct(id))
  
  try {
    const responses = await Promise.all(productPromises)
    products.value = responses.map(r => r.data)
    
    generateCharacteristicGroups()
  } catch (error) {
    console.error('Failed to load products:', error)
    products.value = []
  } finally {
    isLoading.value = false
  }
}

const generateCharacteristicGroups = () => {
  if (products.value.length === 0) return
  
  const allCharacteristics = new Map<string, { name: string; values: any[] }>()
  
  products.value.forEach(product => {
    if (product.characteristics) {
      product.characteristics.forEach(char => {
        const key = char.trait.toLowerCase().trim()
        if (!allCharacteristics.has(key)) {
          allCharacteristics.set(key, {
            name: char.trait,
            values: [],
          })
        }
        allCharacteristics.get(key)!.values.push(parseValue(char.value))
      })
    }
  })
  
  const characteristics = Array.from(allCharacteristics.entries())
    .filter(([_, data]) => data.values.length > 0)
    .map(([key, data]) => ({
      name: data.name,
      key: key,
      type: getCharacteristicType(data.values),
    }))
  
  characteristicGroups.value = [
    {
      name: 'Основные',
      characteristics: [
        { name: 'Бренд', key: 'brand', type: 'string' },
        { name: 'Цена', key: 'price', type: 'number' },
      ],
    },
    {
      name: 'Характеристики',
      characteristics: characteristics.slice(0, 12), 
    },
  ]
}

const getCharacteristicType = (values: any[]): string => {
  const hasNumbers = values.some(v => typeof v === 'number' && !isNaN(v))
  if (hasNumbers) return 'number'
  return 'string'
}

const parseValue = (value: string): any => {
  const match = value.match(/(\d+(?:[.,]\d+)?)/)
  if (match) {
    const num = parseFloat(match[1].replace(',', '.'))
    return isNaN(num) ? value : num
  }
  return value
}

const getCharacteristicValue = (product: Product, char: { key: string }): string => {
  if (char.key === 'brand') return product.brand
  if (char.key === 'price') return `${product.price.toLocaleString('ru-RU')} ₽`
  
  const characteristic = product.characteristics?.find(
    c => c.trait.toLowerCase().trim() === char.key
  )
  return characteristic?.value || '—'
}

const hasDifferences = (char: { key: string; name: string }): boolean => {
  const values = products.value.map(p => getCharacteristicValue(p, char))
  const uniqueValues = new Set(values)
  return uniqueValues.size > 1
}

const filteredCharacteristicGroups = computed(() => {
  if (!showOnlyDifferences.value) return characteristicGroups.value
  
  return characteristicGroups.value.map(group => ({
    ...group,
    characteristics: group.characteristics.filter(char => hasDifferences(char)),
  })).filter(group => group.characteristics.length > 0)
})

// Извлекаем число из строки значения
const extractNumber = (value: string): number => {
  if (!value || value === '—') return 0
  const match = value.match(/(\d+(?:[.,]\d+)?)/)
  if (match) return parseFloat(match[1].replace(',', '.'))
  return 0
}

// Определяет направление сравнения для характеристики
const getComparisonDirection = (charName: string): 'higher-is-better' | 'lower-is-better' => {
  const lower = charName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') // убираем диакритики
  
  // Чем МЕНЬШЕ — лучше (цена, вес и т.д.)
  const lowerIsBetter = [
    'цена', 'price', 'вес', 'weight',
  ]
  
  // Чем БОЛЬШЕ — лучше (почти всё остальное)
  const higherIsBetter = [
    'частота', 'resolution', 'разрешение', 'диагональ', 'диаг',
    'памяти', 'гб', 'gb', 'мп', 'mp',
    'ватт', 'wh', 'мач', 'mah',
    'дюйм', 'inch', 'bit', 'hz', 'fps',
    'мощность', 'чувствительность', 'импеданс',
    'время работы', 'автономность', 'батареи',
    'оператив', 'встроенн', 'накопитель',
    'камера', 'камер',
    'дисплей', 'экран',
    'bluetooth', 'nfc', 'gps', 'пульс',
    'защит', 'зарядк',
    'rtx', 'core', 'ryzen', 'intel', 'apple', 'snapdragon',
    'процессор', 'проц',
    'видео', 'video',
    'отзывов', 'reviews',
    'ram', 'rom', 'storage', 'display', 'battery', 'camera',
    'processor', 'performance', 'screen', 'resolution', 'refresh',
  ]
  
  // Сначала проверяем "меньше лучше"
  for (const keyword of lowerIsBetter) {
    if (lower.includes(keyword)) return 'lower-is-better'
  }
  
  // Потом проверяем "больше лучше"
  for (const keyword of higherIsBetter) {
    if (lower.includes(keyword)) return 'higher-is-better'
  }
  
  // По умолчанию — больше лучше
  return 'higher-is-better'
}

// Парсинг видео-качества: "4K @ 60fps", "1080p @ 30fps" и т.д.
const parseVideoQuality = (value: string): number => {
  const lower = value.toLowerCase()
  
  // Определяем разрешение
  let resolutionScore = 0
  if (lower.includes('8k') || lower.includes('4320')) resolutionScore = 4
  else if (lower.includes('4k') || lower.includes('2160')) resolutionScore = 3
  else if (lower.includes('2k') || lower.includes('1440') || lower.includes('qhd')) resolutionScore = 2.5
  else if (lower.includes('1080') || lower.includes('fhd') || lower.includes('1920')) resolutionScore = 2
  else if (lower.includes('720') || lower.includes('hd') || lower.includes('1280')) resolutionScore = 1
  else if (lower.includes('480') || lower.includes('sd')) resolutionScore = 0.5
  
  // Извлекаем fps
  const fpsMatch = lower.match(/(\d+)\s*fps/)
  const fps = fpsMatch ? parseInt(fpsMatch[1]) : 0
  
  // Формула: разрешение * 100 + fps
  // 4K@60fps = 400 + 60 = 460
  // 1080p@30fps = 200 + 30 = 230
  return resolutionScore * 100 + fps
}

// Парсинг разрешения экрана: "1920x1080", "2560x1600" и т.д.
const parseResolution = (value: string): number => {
  const parts = value.match(/(\d+)\s*[xх×]\s*(\d+)/i)
  if (parts) {
    return parseInt(parts[1]) * parseInt(parts[2]) // общее количество пикселей
  }
  return extractNumber(value)
}

// Парсинг процессора: "Intel Core i7-13700H", "Snapdragon 8 Gen 3" и т.д.
const parseProcessorScore = (value: string): number => {
  const lower = value.toLowerCase()
  
  // Apple M-серия
  if (lower.includes('m4')) return 500
  if (lower.includes('m3 max') || lower.includes('m3 max')) return 480
  if (lower.includes('m3')) return 450
  if (lower.includes('m2 max') || lower.includes('m2 max')) return 400
  if (lower.includes('m2')) return 380
  if (lower.includes('m1')) return 350
  
  // Intel Core
  const intelMatch = lower.match(/i[579](?:-\d+)?(?:h|u)?/)
  if (intelMatch) {
    const generationMatch = lower.match(/(\d{4})/)
    if (generationMatch) {
      const gen = parseInt(generationMatch[1])
      if (gen >= 14000) return 300
      if (gen >= 13000) return 280
      if (gen >= 12000) return 260
      if (gen >= 11000) return 240
      return 200
    }
    return 200
  }
  
  // AMD Ryzen
  const ryzenMatch = lower.match(/ryzen\s*(\d)(\d+)/)
  if (ryzenMatch) {
    const series = parseInt(ryzenMatch[1] + ryzenMatch[2])
    if (series >= 9000) return 280
    if (series >= 8000) return 260
    if (series >= 7000) return 240
    if (series >= 5000) return 220
    return 200
  }
  
  // Snapdragon
  const snapMatch = lower.match(/snapdragon\s*(\d)\s*gen\s*(\d)/)
  if (snapMatch) {
    const gen = parseInt(snapMatch[2])
    if (gen >= 3) return 450
    if (gen >= 2) return 400
    if (gen >= 1) return 350
    return 300
  }
  
  // Общий номер в названии процессора
  const numMatch = lower.match(/(\d{3,})/)
  if (numMatch) {
    return parseInt(numMatch[1])
  }
  
  return 0
}

// Парсинг видеокарты: "RTX 4060", "RTX 3050" и т.д.
const parseGraphicsScore = (value: string): number => {
  const lower = value.toLowerCase()
  
  if (lower.includes('rtx 4090')) return 500
  if (lower.includes('rtx 4080')) return 480
  if (lower.includes('rtx 4070')) return 450
  if (lower.includes('rtx 4060')) return 400
  if (lower.includes('rtx 4050')) return 350
  if (lower.includes('rtx 3080')) return 400
  if (lower.includes('rtx 3070')) return 350
  if (lower.includes('rtx 3060')) return 300
  if (lower.includes('rtx 3050')) return 250
  if (lower.includes('gtx')) return 150
  if (lower.includes('интегрир') || lower.includes('integrated') || lower.includes('встроенн')) return 50
  
  return 0
}

// Главная функция — определяет лучшее значение
const isBestValue = (productId: string, char: { key: string; type: string; name?: string }): boolean => {
  if (char.key === 'price') return false
  
  const charValues = products.value.map(p => {
    const charForProduct = p.characteristics?.find(
      c => c.trait.toLowerCase().trim() === char.key
    )
    return {
      productId: p.id,
      value: charForProduct?.value || getCharacteristicValue(p, char),
      trait: charForProduct?.trait || ''
    }
  })
  
  const charName = char.name || char.key
  
  // Отладка — раскомментируйте для отладки
  // console.log(`isBestValue: productId=${productId}, charName="${charName}", key="${char.key}", type="${char.type}", direction="${direction}"`)
  // console.log('charValues:', JSON.stringify(charValues))
  
  // Видео — спец. парсинг
  if (charName.includes('видео') || charName.includes('video')) {
    const scores = charValues.map(v => ({
      productId: v.productId,
      score: parseVideoQuality(v.value)
    }))
    const maxScore = Math.max(...scores.map(s => s.score))
    const productScore = scores.find(s => s.productId === productId)?.score || 0
    return maxScore > 0 && productScore === maxScore
  }
  
  if (charName.includes('разрешение') || charName.includes('resolution')) {
    const scores = charValues.map(v => ({
      productId: v.productId,
      score: parseResolution(v.value)
    }))
    const maxScore = Math.max(...scores.map(s => s.score))
    const productScore = scores.find(s => s.productId === productId)?.score || 0
    return maxScore > 0 && productScore === maxScore
  }
  
  if (charName.includes('процессор') || charName.includes('processor') || charName.includes('проц')) {
    const scores = charValues.map(v => ({
      productId: v.productId,
      score: parseProcessorScore(v.value)
    }))
    const maxScore = Math.max(...scores.map(s => s.score))
    const productScore = scores.find(s => s.productId === productId)?.score || 0
    return maxScore > 0 && productScore === maxScore
  }
  
  if (charName.includes('видеокарт') || charName.includes('graphics') || charName.includes('gpu')) {
    const scores = charValues.map(v => ({
      productId: v.productId,
      score: parseGraphicsScore(v.value)
    }))
    const maxScore = Math.max(...scores.map(s => s.score))
    const productScore = scores.find(s => s.productId === productId)?.score || 0
    return maxScore > 0 && productScore === maxScore
  }
  
  if (charName.includes('камер') || charName.includes('camera')) {
    const scores = charValues.map(v => ({
      productId: v.productId,
      score: extractNumber(v.value)
    }))
    const maxScore = Math.max(...scores.map(s => s.score))
    const productScore = scores.find(s => s.productId === productId)?.score || 0
    return maxScore > 0 && productScore === maxScore
  }
  
  if (char.type !== 'number') return false
  
  const direction = getComparisonDirection(charName)
  
  const valuesWithNums = charValues.map(v => ({
    productId: v.productId,
    value: v.value,
    num: extractNumber(v.value)
  })).filter(v => v.num > 0)
  
  if (valuesWithNums.length === 0) return false
  
  const productVal = valuesWithNums.find(v => v.productId === productId)
  if (!productVal) return false
  
  if (direction === 'higher-is-better') {
    const maxNum = Math.max(...valuesWithNums.map(v => v.num))
    return productVal.num === maxNum
  } else {
    const minNum = Math.min(...valuesWithNums.map(v => v.num))
    return productVal.num === minNum
  }
}

const getBestValueClass = (productId: string, char: { key: string; type: string; name: string }): string => {
  if (isBestValue(productId, char)) {
    return 'best-value'
  }
  return ''
}

const lowestPrice = computed(() => {
  if (products.value.length === 0) return 0
  return Math.min(...products.value.map(p => p.price))
})

const lowestPriceProductName = computed(() => {
  const product = products.value.find(p => p.price === lowestPrice.value)
  return product?.name || ''
})

const highestRating = computed(() => {
  if (products.value.length === 0) return 0
  const ratings = products.value.map(p => {
    if (!p.traitRatings || Object.keys(p.traitRatings).length === 0) return 0
    const values = Object.values(p.traitRatings)
    return values.reduce((a, b) => a + b, 0) / values.length
  })
  return Math.max(...ratings)
})

const highestRatingProductName = computed(() => {
  if (products.value.length === 0) return ''
  const product = products.value.find(p => {
    if (!p.traitRatings || Object.keys(p.traitRatings).length === 0) return false
    const values = Object.values(p.traitRatings)
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    return avg === highestRating.value
  })
  return product?.name || ''
})

const mostReviewsCount = computed(() => {
  if (products.value.length === 0) return 0
  return Math.max(...products.value.map(p => p.reviews.length))
})

const mostReviewsProductName = computed(() => {
  const product = products.value.find(p => p.reviews.length === mostReviewsCount.value)
  return product?.name || ''
})

const removeProduct = (productId: string) => {
  comparisonStore.removeFromCompare(productId)
  products.value = products.value.filter(p => p.id !== productId)
}

const clearAll = () => {
  comparisonStore.clearCompare()
  products.value = []
}

const getProductImage = (product: Product): string => {
  if (product.images && product.images.length > 0) {
    return `http://localhost:5000${product.images[0]}`
  }
  return 'https://via.placeholder.com/400x400/F5F7FA/2563EB?text=Product'
}

const formatPrice = (price: number): string => {
  return price.toLocaleString('ru-RU')
}

watch(
  () => comparisonStore.productIds,
  () => {
    if (comparisonStore.productIds.length > 0) {
      loadProducts()
    } else {
      products.value = []
    }
  },
  { deep: true }
)

onMounted(() => {
  if (comparisonStore.productIds.length > 0) {
    loadProducts()
  }
})
</script>

<style scoped>
.comparison-view {
  min-height: 100vh;
  background: var(--color-background);
  padding: var(--spacing-8) 0;
}

.container {
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 var(--spacing-6);
}

/* Header */
.comparison-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-8);
}

.header-content {
  flex: 1;
}

.comparison-title {
  font-size: var(--font-size-h1);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-2);
}

.comparison-subtitle {
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
}

.products-count {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-4) var(--spacing-6);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.count-value {
  font-size: var(--font-size-h2);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

.count-label {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-16);
  text-align: center;
  background: var(--color-surface);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
}

.empty-icon {
  width: 96px;
  height: 96px;
  color: var(--color-text-tertiary);
  margin-bottom: var(--spacing-6);
}

.empty-title {
  font-size: var(--font-size-h3);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-3);
}

.empty-description {
  font-size: var(--font-size-body);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-6);
  max-width: 400px;
}

.btn-lg {
  padding: var(--spacing-4) var(--spacing-8);
  font-size: var(--font-size-body);
}

.btn-icon {
  width: 20px;
  height: 20px;
  margin-left: var(--spacing-2);
}

/* Quick Summary */
.quick-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-6);
  margin-bottom: var(--spacing-8);
}

.summary-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  padding: var(--spacing-5);
  background: var(--color-surface);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-sm);
}

.summary-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  flex-shrink: 0;
}

.summary-icon svg {
  width: 28px;
  height: 28px;
}

.price-icon {
  background: rgba(37, 99, 235, 0.1);
  color: var(--color-primary);
}

.rating-icon {
  background: rgba(251, 191, 36, 0.1);
  color: #FBBF24;
}

.reviews-icon {
  background: rgba(5, 150, 105, 0.1);
  color: #059669;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  overflow: hidden;
}

.summary-label {
  font-size: var(--font-size-small);
  color: var(--color-text-secondary);
}

.summary-value {
  font-size: var(--font-size-h4);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.summary-product {
  font-size: var(--font-size-small);
  color: var(--color-text-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Controls */
.comparison-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-6);
  padding: var(--spacing-4) var(--spacing-6);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.toggle-control {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  cursor: pointer;
}

.toggle-checkbox {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: relative;
  width: 48px;
  height: 26px;
  background: var(--color-border);
  border-radius: var(--radius-full);
  transition: background var(--transition-fast);
}

.toggle-slider::before {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  background: var(--color-surface);
  border-radius: var(--radius-full);
  transition: transform var(--transition-fast);
  box-shadow: var(--shadow-sm);
}

.toggle-checkbox:checked + .toggle-slider {
  background: var(--color-primary);
}

.toggle-checkbox:checked + .toggle-slider::before {
  transform: translateX(22px);
}

.toggle-label {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

/* Sticky Product Cards */
.products-sticky-wrapper {
  position: sticky;
  top: 80px; /* Высота Header */
  z-index: var(--z-sticky);
  background: var(--color-background);
  padding-bottom: var(--spacing-4);
  margin-bottom: var(--spacing-6);
}

.products-cards {
  display: grid;
  grid-template-columns: 200px repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-4);
  overflow-x: auto;
}

.characteristics-spacer {
  background: var(--color-surface);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-sm);
}

.product-card-wrapper {
  min-width: 0;
}

.product-card {
  position: relative;
  background: var(--color-surface);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-sm);
  padding: var(--spacing-5);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
  height: 100%;
}

.product-image-wrapper {
  aspect-ratio: 1;
  background: var(--color-background);
  border-radius: var(--radius-md);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: var(--spacing-3);
}

.product-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.product-brand {
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
}

.product-name {
  font-size: var(--font-size-body);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  line-height: var(--line-height-snug);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 0;
}

.product-name a {
  color: inherit;
  text-decoration: none;
  transition: color var(--transition-fast);
}

.product-name a:hover {
  color: var(--color-primary);
}

.product-price {
  font-size: var(--font-size-h4);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.remove-btn {
  position: absolute;
  top: var(--spacing-3);
  right: var(--spacing-3);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  color: var(--color-text-tertiary);
  transition: all var(--transition-fast);
  opacity: 0;
}

.product-card:hover .remove-btn {
  opacity: 1;
}

.remove-btn:hover {
  background: var(--color-error);
  border-color: var(--color-error);
  color: var(--color-text-inverse);
}

.remove-btn svg {
  width: 18px;
  height: 18px;
}

/* Comparison Table */
.comparison-table {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.characteristic-group {
  background: var(--color-surface);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.group-header {
  display: grid;
  grid-template-columns: 200px repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-4);
  padding: var(--spacing-4);
  background: var(--color-background);
  border-bottom: 1px solid var(--color-border-light);
}

.group-header-cell {
  height: 20px;
}

.characteristic-row {
  display: grid;
  grid-template-columns: 200px repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-4);
  padding: var(--spacing-4);
  border-bottom: 1px solid var(--color-border-light);
  transition: background var(--transition-fast);
}

.characteristic-row:last-child {
  border-bottom: none;
}

.characteristic-row:hover {
  background: var(--color-surface-secondary);
}

.row-even {
  background: var(--color-background);
}

.row-even:hover {
  background: var(--color-surface-secondary);
}

.characteristic-name {
  font-size: var(--font-size-small);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
}

.characteristic-value {
  font-size: var(--font-size-body);
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.best-value {
  background: rgba(5, 150, 105, 0.1);
  color: #059669;
  font-weight: var(--font-weight-semibold);
}

.best-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-1) var(--spacing-2);
  background: #059669;
  color: var(--color-text-inverse);
  font-size: 10px;
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-full);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
}

/* Responsive */
@media (max-width: 1024px) {
  .quick-summary {
    grid-template-columns: 1fr;
  }
  
  .products-cards {
    grid-template-columns: 150px repeat(auto-fill, minmax(250px, 1fr));
  }
  
  .group-header,
  .characteristic-row {
    grid-template-columns: 150px repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (max-width: 768px) {
  .comparison-view {
    padding: var(--spacing-6) 0;
  }
  
  .comparison-header {
    flex-direction: column;
    gap: var(--spacing-4);
  }
  
  .comparison-title {
    font-size: var(--font-size-h2);
  }
  
  .products-cards {
    overflow-x: auto;
    padding-bottom: var(--spacing-4);
  }
  
  .group-header,
  .characteristic-row {
    grid-template-columns: 120px repeat(auto-fill, minmax(220px, 1fr));
    gap: var(--spacing-3);
  }
  
  .characteristic-name {
    font-size: var(--font-size-small);
  }
  
  .characteristic-value {
    font-size: var(--font-size-small);
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 var(--spacing-4);
  }
  
  .empty-state {
    padding: var(--spacing-8);
  }
  
  .empty-icon {
    width: 64px;
    height: 64px;
  }
  
  .comparison-controls {
    flex-direction: column;
    gap: var(--spacing-4);
    align-items: flex-start;
  }
}
</style>
