<template>
  <div class="select-main">
    <h1 class="title">ChatGPT Based Essay Grading System</h1>
    <h2 class="subtitle">
      Grade for academic essay, student homework with the given criteria
    </h2>
    <div class="select-container">
      <SelectGate
        v-for="(item, index) in gateInfoList"
        :key="index"
        :title="item.title"
        :path="item.path"
        :route="item.route"
      />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      gateInfoList: [
        {
          title: "Grade typed PDF essay",
          path: "pdf_icon.svg.png",
          route: {
            name: "uploadPdf-type",
            params: {
              type: "typed",
            },
          },
        },
        {
          title: "Grade handwritten PDF essay by OCR",
          path: "image.png",
          route: {
            name: "uploadPdf-type",
            params: {
              type: "handWritten",
            },
          },
        },
      ],
    };
  },
};
</script>

<style lang="scss" scoped>
.select-main {
  display: flow-root;
  width: 100vw;
  min-height: 100vh;
  background: url(~/assets/bg.png) no-repeat;
  background-size: 100% 100%;
  .title {
    margin-top: 50px;
    font-size: 38px;
    text-align: center;
  }
  .subtitle {
    text-align: center;
    font-size: 22px;
    margin-top: 20px;
    color: #444;
  }
  .select-container {
    display: flex;
    justify-content: center;
    gap: 80px;
    margin-top: 50px;
  }
}
</style>