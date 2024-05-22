<template>
  <div class="select-container">
    <ElCard class="card" shadow="hover">
      <h3 class="title">{{ title }}</h3>
      <div class="flex-container img-container">
        <img class="icon" :src="iconPath" alt="" />
      </div>
      <div class="flex-container btn">
        <ElButton
          icon="el-icon-magic-stick"
          type="warning"
          @click="goUpload(route)"
          >Go!</ElButton
        >
      </div>
    </ElCard>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: "",
    },
    path: {
      type: String,
    },
    route: {
      type: Object,
    },
  },
  computed: {
    iconPath() {
      return require(`~/assets/${this.path}`);
    },
  },
  methods: {
    goUpload(route) {
      this.$router.push(this.route);
    },
  },
};
</script>

<style scoped lang="scss">
.card {
  width: 400px;
  height: 380px;
  border-radius: 15px;
  .title {
    display: flex;
    justify-content: center;
    font-size: 18px;
    color: rgba(0, 0, 0, 0.7);
  }

  .img-container {
    margin-top: 30px;
    height: 180px;
  }
  .flex-container {
    display: flex;
    justify-content: center;
    .icon {
      width: 45%;
      margin-bottom: 20px;
      user-select: none;
    }
  }
}
</style>