<template>
  <footer>
    <div class="footerTop">
      <div class="container">
        <div class="footerGrid">
          <div class="footerSection">
            <div class="footerLogoInfo flex v-center">
              <router-link to="/">
                <img src="../../public/logo.svg" alt="logo" />
              </router-link>
              <router-link to="/">
                <h1>Behoof</h1>
              </router-link>
            </div>
            <p>
              Лучшие цены в интернет-магазинах. Мы сравниваем предложения от ведущих продавцов и
              помогаем вам найти оптимальные варианты.
            </p>
          </div>
          <div class="footerSection">
            <h3>Навигация</h3>
            <ul>
              <li><router-link to="/">Главная</router-link></li>
              <li><router-link to="/catalog">Каталог</router-link></li>
              <li><router-link to="/novelties">Новинки</router-link></li>
              <li><router-link to="/favorites">Избранное</router-link></li>
            </ul>
          </div>
          <div class="footerSection">
            <h3>Информация</h3>
            <ul>
              <li><router-link to="/about">О нас</router-link></li>
              <li><a href="mailto:info@behoof.com">Контакты</a></li>
              <li><router-link to="/catalog">Каталог</router-link></li>
              <li><router-link to="/login">Условия использования</router-link></li>
            </ul>
          </div>
          <div class="footerSection">
            <h3>Контакты</h3>
            <p>Email: <a href="mailto:info@behoof.com">info@behoof.com</a></p>
            <p>Телефон: +7 (123) 456-78-90</p>
            <p>Адрес: г. Москва, ул. Примерная, 1</p>
            <div class="socialLinks">
              <a href="https://vk.com" target="_blank" class="socialIcon">VK</a>
              <a href="https://t.me" target="_blank" class="socialIcon">TG</a>
              <a href="https://instagram.com" target="_blank" class="socialIcon">IG</a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="footerBottom">
      <div class="container flex v-center">
        <p>&copy; {{ currentYear }} Behoof. Все права защищены.</p>
        <div class="footerBottomLinks">
          <router-link to="/">Политика конфиденциальности</router-link>
          <router-link to="/">Пользовательское соглашение</router-link>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'FooterComponent',
  computed: {
    currentYear() {
      return new Date().getFullYear()
    },
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
  align-items: center;
}
footer {
  width: 100%;
  margin-top: 100px;
}

.footerTop {
  background-color: #f6f7fa;
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

.footerSection ul li a,
.footerSection ul li router-link,
.footerSection a {
  text-decoration: none;
  color: #263141;
  font-size: 14px;
  font-weight: 400;
}

.footerSection ul li a:hover,
.footerSection ul li router-link:hover,
.footerSection a:hover {
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

.footerBottomLinks a,
.footerBottomLinks router-link {
  text-decoration: none;
  color: #666;
  font-size: 14px;
}

.footerBottomLinks a:hover,
.footerBottomLinks router-link:hover {
  color: #ff4d4d;
}
</style>
