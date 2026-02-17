<template>
  <footer>
    <div class="footerTop">
      <div class="container">
        <div class="footerGrid">
          <div class="footerSection">
            <div class="footerLogoInfo flex v-center">
              <img src="../../public/logo.svg" alt="logo" />
              <h1>Behoof</h1>
            </div>
            <p>Лучшие цены в интернет-магазинах. Мы сравниваем предложения от ведущих продавцов и помогаем вам найти оптимальные варианты.</p>
          </div>
          <div class="footerSection">
            <h3>Навигация</h3>
            <ul>
              <li><a href="#">Главная</a></li>
              <li><a href="#">Каталог</a></li>
              <li><a href="#">Обзоры</a></li>
              <li><a href="#">Новинки</a></li>
            </ul>
          </div>
          <div class="footerSection">
            <h3>Информация</h3>
            <ul>
              <li><a href="#">О нас</a></li>
              <li><a href="#">Контакты</a></li>
              <li><a href="#">Доставка</a></li>
              <li><a href="#">Условия использования</a></li>
            </ul>
          </div>
          <div class="footerSection">
            <h3>Контакты</h3>
            <p>Email: info@behoof.com</p>
            <p>Телефон: +7 (123) 456-78-90</p>
            <p>Адрес: г. Москва, ул. Примерная, 1</p>
            <div class="socialLinks">
              <a href="#" class="socialIcon">VK</a>
              <a href="#" class="socialIcon">TG</a>
              <a href="#" class="socialIcon">IG</a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="footerBottom">
      <div class="container flex v-center">
        <p>&copy; 2023 Behoof. Все права защищены.</p>
        <div class="footerBottomLinks">
          <a href="#">Политика конфиденциальности</a>
          <a href="#">Пользовательское соглашение</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'FooterComponent'
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
  align-items: center;
}
footer {
  width: 100%;
  margin-top: 100px;
}

.footerTop {
  background-color: #F6F7FA;
  padding: 40px 0;
}

.footerBottom {
  background-color: #ffffff;
  border-top: 1px solid #f2f5f9;
  padding: 20px 0;
}

.container {
  width: 85%;
  margin: 0 auto;
}

.footerGrid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 30px;
}

.footerSection h3 {
  font-weight: 600;
  font-size: 18px;
  color: #263141;
  margin-bottom: 15px;
}

.footerSection p {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin-bottom: 10px;
}

.footerSection ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footerSection ul li {
  margin-bottom: 8px;
}

.footerSection ul li a {
  text-decoration: none;
  color: #263141;
  font-size: 14px;
  font-weight: 400;
}

.footerSection ul li a:hover {
  color: #ff4d4d;
}

.footerLogoInfo {
  margin-bottom: 15px;
}

.footerLogoInfo img {
  height: 40px;
}

.footerLogoInfo h1 {
  font-weight: 700;
  font-size: 32px;
  margin-left: 15px;
  color: #263141;
}

.socialLinks {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.socialIcon {
  display: inline-block;
  width: 40px;
  height: 40px;
  background-color: #ff4d4d;
  color: white;
  text-align: center;
  line-height: 40px;
  border-radius: 50%;
  text-decoration: none;
  font-weight: 600;
  font-size: 12px;
}

.socialIcon:hover {
  background-color: #e63939;
}

.footerBottom .container {
  justify-content: space-between;
}

.footerBottom p {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.footerBottomLinks {
  display: flex;
  gap: 20px;
}

.footerBottomLinks a {
  text-decoration: none;
  color: #666;
  font-size: 14px;
}

.footerBottomLinks a:hover {
  color: #ff4d4d;
}
</style>
