<template>
  <div class="reviews">
     <div class="header">
      <h1>Обзоры</h1>
      <a href="/reviews">К обзорам ></a>
    </div>
    <div class="cont">
      <div class="reviews_card">
        <img src="../../public/a1/1.png" alt="">
          <h1>Обзор устаревших смартфонов</h1>
          <p>Lorem ipsum dolor sit amet consectetur.</p>
          <a href="/novelties">Смотреть ></a>
      </div>
      <div class="reviews_card">
          <img src="../../public/a1/2.png" alt="">
          <h1>Обзор устаревших смартфонов</h1>
          <p>Lorem ipsum dolor sit amet consectetur.</p>
          <a href="/novelties">Смотреть ></a>
      </div>
      <div class="reviews_card">
          <img src="../../public/a1/3.png" alt="">
          <h1>Обзор устаревших смартфонов</h1>
          <p>Lorem ipsum dolor sit amet consectetur.</p>
          <a href="/novelties">Смотреть ></a>
      </div>
      <div class="reviews_card">
          <img src="../../public/a1/4.png" alt="">
          <h1>Обзор устаревших смартфонов</h1>
          <p>Lorem ipsum dolor sit amet consectetur.</p>
          <a href="/novelties">Смотреть ></a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProductReviews'
}
</script>

<style scoped>

.header a{
  text-decoration: none;
  color: #FF4D4D;
  font-size: 20px;
}
.reviews{
  width: 85%;
  margin: 100px auto 0 auto;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.cont{
  display: flex;
  justify-content: space-between;
}

.reviews_card{
    width: 24%;
    /* height: 500px; */
    background-color: #F6F7FA;
    /* padding: 10px; */
    box-sizing: border-box;
    border-radius: 20px;
      min-height: 710px;
}


.reviews_card img {
  width: 100%;
  height: auto;
  margin-bottom: 10px;
  border-radius: 20px 20px 0 0;
}

.reviews_card h1 {
  padding: 0 5px;
  margin-bottom: 10px;
  font-size: 38px;
  margin-left: 15px;
}

.reviews_card p {
  padding: 0 5px;
  margin-bottom: 20px;
  font-size: 19px;
  margin-left: 15px;
}

.reviews_card a{
  width: 85%;

  margin-top: 20px;

  text-decoration: none;
  color: #FF4D4D;
  font-size: 20px;
  margin-left: 20px;
  ;
}
</style>
