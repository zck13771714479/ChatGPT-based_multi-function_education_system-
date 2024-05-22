<template>
  <div class="index-container">
    <h1 class="title">ChatGPT Education System</h1>
    <h2 class="subtitle">
      <div class="content">
        Easily use AI to assist grading essays and design final exam questions
      </div>
    </h2>
    <div class="btn-container">
      <div class="btn" @click="toSelectGradeWay">AI Grading</div>
      <div class="btn yellow" @click="toUploadSlides">AI Exam Questions</div>
    </div>
  </div>
</template>

<script>
export default {
  name: "IndexPage",
  data() {
    return {};
  },
  mounted() {},
  methods: {
    toSelectGradeWay() {
      this.$router.push("/selectGradeWay");
    },
    toUploadSlides() {
      this.$router.push({
        name: "uploadPdf-type",
        params: {
          type: "question",
        },
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.index-container {
  display: flow-root;
  width: 100vw;
  min-height: 100vh;
  // height: 100%;
  background: url(~/assets/yes3.jpg) no-repeat;
  background-size: 100% 100%;
  .title {
    display: flex;
    justify-content: flex-end;
    color: rgba(255, 255, 255, 1);
    font-size: 48px;
    margin-top: 50px;
    margin-right: 75px;
  }
  .subtitle {
    display: flex;
    justify-content: flex-end;
    color: rgb(195, 192, 192);
    font-size: 25px;
    margin-top: 20px;
    margin-right: 75px;
    font-weight: 400;
    .content {
      width: 640px;
    }
  }
  .btn-container {
    display: flex;
    gap: 40px;
    margin-top: 100px;
    justify-content: flex-end;
    margin-right: 75px;
    .btn {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 250px;
      height: 50px;
      background-color: #3d9970;
      font-size: 20px;
      border-radius: 25px;
      cursor: pointer;
      color: white;
      user-select: none;
      &:hover {
        box-shadow: 5px 5px 10px 10px rgba(255, 255, 0, 0.5) inset;
      }
    }
    .yellow {
      background-color: #ffae00;
    }
  }
}
</style>
