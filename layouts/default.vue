<template>
  <div class="default-container">
    <transition name="el-fade-in">
      <Nuxt />
    </transition>
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
.default-container {
  // display: flow-root;
  // width: 100vw;
  // min-height: 100vh;
  // // height: 100%;
  // background: url(~/assets/yes3.jpg) no-repeat;
  // background-size: 100% 100%;
}
</style>