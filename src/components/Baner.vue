<template>
  <div class="banner">
    <div class="bannerCont">
      <!-- Левый баннер -->
      <div class="bannerContl">
        <div class="backgroundIMG">
          <img src="../../public/fon/Patterns.png" alt="" />
        </div>
        <div class="banner-content">
          <h2>
            <span class="highlight">1.8 млн</span> товаров в
            <span class="highlight">2272</span> магазинах найди, сравни, выбери!
          </h2>
          <p></p>
          <button class="btn">Перейти к категориям</button>
        </div>
      </div>

      <!-- Правый баннер -->
      <div class="bannerContR">
        <div class="backgroundIMG">
          <img src="../../public/fon/Patterns.png" alt="" />
        </div>
        <div class="banner-content">
          <h2><span class="highlight">Топ-10</span> смартфонов 2023 года</h2>
          <p></p>
          <button class="btn">Смотреть</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BannerComponent',
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
@font-face {
  font-family: 'Inter';
  font-weight: 800;
  src: url('../../fonts/Inter_24pt-ExtraBold.ttf');
}

.bannerCont {
  width: 85%;
  margin-top: 30px;
  margin-left: auto;
  margin-right: auto;
  display: flex;
}

.bannerContl {
  width: 65%;
  position: relative;
  height: 308px;
  background-color: #f2f5f9;
  border-radius: 16px;
  overflow: hidden;
}
.backgroundIMG {
  position: absolute;
}
.bannerContR {
  width: 33%;
  position: relative;
  height: 308px;
  background-color: #f2f5f9;
  border-radius: 16px;
  margin-left: auto;
  overflow: hidden;
}

/* Добавленные стили для контента */
.banner-content {
  position: relative;
  z-index: 2;
  padding: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.banner-content h2 {
  margin: 0 0 8px;
  font-size: 48px;
  font-weight: 700;
  color: #000;
}

.banner-content p {
  margin: 0 0 16px;
  font-size: 16px;
  color: #000;
}

.highlight {
  color: #ff4d4d; /* красный цвет */
}

.btn {
  background-color: #ff4d4d;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 20px 20px;
  font-size: 14px;
  cursor: pointer;
  width: fit-content;
}
</style>
