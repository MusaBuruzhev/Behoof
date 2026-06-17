<template>
  <div class="home-view">
    <HeroSection />
    <CategoriesSection />
    <PopularProductsSection />
    <NewArrivalsSection />
    <FeaturesSection />
    <CtaSection />
  </div>
</template>

<script setup lang="ts">
import HeroSection from "@/components/home/HeroSection.vue";
import CategoriesSection from "@/components/home/CategoriesSection.vue";
import PopularProductsSection from "@/components/home/PopularProductsSection.vue";
import NewArrivalsSection from "@/components/home/NewArrivalsSection.vue";
import FeaturesSection from "@/components/home/FeaturesSection.vue";
import CtaSection from "@/components/home/CtaSection.vue";
</script>

<style scoped>
.home-view {
  width: 100%;
}
</style>
