<template>
  <div class="HomeInfo">
    <h2>Наша цель - создать фантастический
      сервис для всех потребителей
    </h2>
    <div class="container">
      <div>
        <h1>5</h1>
        <p>Lorem ipsum dolor sit amet consectetur. Rhoncus risus nunc a pharetra viverra enim nunc. </p>
      </div>
      <div>
        <h1>30</h1>
        <p>Gravida vel convallis id aliquet volutpat nullam dignissim. Amet parturient elementum lectus rhoncus at.</p>
      </div>
      <div>
        <h1>300</h1>
        <p>Sed varius ut venenatis id amet et consectetur pellentesque. Vitae urna ornare vel suspendisse tincidunt. </p>
      </div>
      <div>
        <h1>8</h1>
        <p>Id enim ornare lacus duis. Ac fermentum auctor cras adipiscing feugiat quis convallis velit. </p>
      </div>

    </div>

    <img src="../../public/fon/BanerHomeInfo.png" alt="">
  </div>
</template>

<script>
export default {
  name: 'HomeInfo',
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
  src: url('../../fonts/Inter_24pt-Bold.ttf');
}
@font-face {
  font-family: 'Inter';
  font-weight: 800;
  src: url('../../fonts/Inter_24pt-ExtraBold.ttf');
}

.HomeInfo{
  width: 85%;
  margin-left: auto;
  margin-right: auto;
}
h2{
  font-size: 30px;
  font-weight: 900;
  width: 600px;
}

img{
  width: 100%;
  margin-top: 20px;
}

.container{
  display: flex;
  justify-content: space-between;
}

.container div{
 max-width: 24%;
}

.container div h1{
  color: #FF4D4D;
  font-size: 60px;
  font-weight: 900;
}
.container div p{
  font-size: 18px;
}


</style>
