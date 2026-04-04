<template>
  <div v-if="hasEnoughData" class="price-history-chart">
    <apexchart type="area" :options="chartOptions" :series="series" height="300"></apexchart>
  </div>
</template>

<script>
export default {
  name: 'PriceHistoryChart',
  props: {
    priceHistory: {
      type: Array,
      required: true,
    },
  },
  computed: {
    sortedHistory() {
      if (!this.priceHistory || this.priceHistory.length === 0) {
        return []
      }
      return this.priceHistory.slice().sort((a, b) => new Date(a.date) - new Date(b.date))
    },
    hasEnoughData() {
      return this.sortedHistory.length >= 5
    },
    categories() {
      return this.sortedHistory.map((item) => this.formatDate(new Date(item.date)))
    },
    series() {
      return [
        {
          name: 'Цена',
          data: this.sortedHistory.map((item) => item.price),
        },
      ]
    },
    chartOptions() {
      return {
        chart: {
          type: 'area',
          height: 300,
          toolbar: {
            show: false,
          },
          background: 'transparent',
        },
        stroke: {
          curve: 'smooth',
          width: 3,
          colors: ['#ff4d4d'],
        },
        fill: {
          type: 'gradient',
          gradient: {
            shade: 'light',
            type: 'vertical',
            shadeIntensity: 0.4,
            gradientToColors: ['#ff4d4d'],
            inverseColors: false,
            opacityFrom: 0.8,
            opacityTo: 0.1,
            stops: [0, 100],
          },
        },
        markers: {
          size: 5,
          colors: ['#ff4d4d'],
          strokeColors: '#fff',
          strokeWidth: 2,
          hover: {
            size: 7,
          },
        },
        dataLabels: {
          enabled: false,
        },
        xaxis: {
          type: 'category',
          categories: this.categories,
          labels: {
            style: {
              colors: '#666',
              fontSize: '12px',
            },
          },
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
        },
        yaxis: {
          labels: {
            show: false,
          },
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
        },
        grid: {
          show: false,
        },
        annotations: {
          points: this.getTrendAnnotations(),
        },
        tooltip: {
          theme: 'light',
          x: {
            formatter: (value, { dataPointIndex }) => {
              return this.categories[dataPointIndex]
            },
          },
          y: {
            formatter: (value) => {
              return `${value.toLocaleString()} ₽`
            },
          },
        },
      }
    },
  },
  methods: {
    formatDate(date) {
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      return `${day}.${month}`
    },
    getTrendAnnotations() {
      return []
    },
  },
}
</script>

<style scoped>
.price-history-chart {
  width: 100%;
  height: 100%;
}

.custom-tooltip {
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.tooltip-date {
  margin: 0 0 5px 0;
  font-size: 12px;
  color: #666;
}

.tooltip-price {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
  color: #ff4d4d;
}
</style>
