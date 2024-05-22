<template>
  <div class="grade-container-componment">
    <div class="controls">
      <!-- 控制按钮 ... -->
      <i class="el-icon-edit"></i>
      <div class="filename">{{ filename }}</div>
      <div style="flex: 1"></div>
      <ElTooltip
        class="item"
        effect="dark"
        content="Zoom In"
        placement="bottom-end"
        :open-delay="0.1"
      >
        <img class="btn" src="~/assets/add.png" @click="zoomIn" />
      </ElTooltip>

      <ElTooltip
        class="item"
        effect="dark"
        content="Zoom Out"
        placement="bottom-start"
        :open-delay="0.1"
      >
        <img class="btn" src="~/assets/minus.png" @click="zoomOut" />
      </ElTooltip>
      <div class="page-num">{{ curPage }} /{{ totalPages }} Page</div>
    </div>
    <div class="pdf-container" ref="container" @scroll="handleScroll">
      <canvas
        v-for="pageNum in totalPages"
        :key="pageNum"
        :id="'canvas-' + pageNum"
        class="pdf-page"
      ></canvas>
    </div>
  </div>
</template>
  
  
  <script>
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.js";
if (process.client) {
  pdfjs.GlobalWorkerOptions.workerSrc = require("pdfjs-dist/build/pdf.worker.entry");
}

export default {
  props: {
    url: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      pdf: null,
      totalPages: 0,
      scale: 1.0,
      bitmaps: [], // 存储 ImageBitmaps
      curPage: 0,
      filename: "",
      isImage: false,
    };
  },
  async mounted() {
    // PDF 加载和渲染逻辑
    if (process.client) {
      this.filename = localStorage.getItem("filename");
    }
    if (this.$route.params.type == "typed" || this.$route.params.type == "question") {
      this.renderPDF();
    } else {
      this.renderImage();
    }
  },
  methods: {
    async renderPDF() {
      try {
        this.pdf = await pdfjs.getDocument(this.url).promise;
        this.totalPages = this.pdf.numPages;
        for (let pageNum = 1; pageNum <= this.totalPages; pageNum++) {
          let bitmap = await this.renderPDFPageToBitmap(pageNum);
          this.bitmaps.push(bitmap);
          this.displayPage(pageNum - 1);
          if (pageNum == 1) {
            this.curPage = 1;
          }
        }
        console.log("触发loadPDF");
        this.$emit("loadedPDF");
      } catch (e) {
        console.log("display PDF fail", e);
      }
    },
    async renderPDFPageToBitmap(pageNum) {
      const page = await this.pdf.getPage(pageNum);
      const scale = window.devicePixelRatio + 0.5 || 1; // 获取设备的像素比率
      this.drawScale = scale;
      const viewport = page.getViewport({ scale: scale });
      let offscreenCanvas = new OffscreenCanvas(
        viewport.width,
        viewport.height
      );
      let context = offscreenCanvas.getContext("2d");
      await page.render({ canvasContext: context, viewport: viewport }).promise;
      return offscreenCanvas.transferToImageBitmap();
    },
    async renderImage() {
      this.totalPages = 1;
      this.curPage = 1;
      const img = new Image();
      img.src = this.url;
      img.onload = () => {
        let offscreenCanvas = new OffscreenCanvas(img.width, img.height);
        let context = offscreenCanvas.getContext("2d");
        context.drawImage(img, 0, 0, img.width, img.height);
        let bitmap = offscreenCanvas.transferToImageBitmap();
        this.bitmaps.push(bitmap);
        this.displayPage(0);
        this.$emit("loadedImg");
      };
    },
    displayPage(index) {
      let canvas = document.getElementById("canvas-" + (index + 1));
      let ctx = canvas.getContext("2d");
      const scale = window.devicePixelRatio || 1;
      const bitmap = this.bitmaps[index];
      canvas.width = bitmap.width * scale; // 考虑像素比率
      canvas.height = bitmap.height * scale; // 考虑像素比率
      ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      canvas.style.width = `${bitmap.width}px`; // CSS 尺寸
      canvas.style.height = `${bitmap.height}px`; // CSS 尺寸
    },

    zoomIn() {
      this.scale *= 1.1;
      this.updateZoom();
    },
    zoomOut() {
      if (this.scale > 0.5) {
        this.scale /= 1.1;
        this.updateZoom();
      }
    },
    updateZoom() {
      for (let i = 0; i < this.totalPages; i++) {
        let canvas = document.getElementById("canvas-" + (i + 1));
        canvas.style.transform = `scale(${this.scale})`;
        canvas.style.transformOrigin = "top left";
      }
    },
    handleScroll() {
      let container = this.$refs.container;
      let scrollHeight = container.scrollHeight;
      let containerHeight = container.offsetHeight;
      let canavsList = document.getElementsByTagName("canvas");

      for (let i = 0; i < canavsList.length; i++) {
        let canvas = canavsList[i];
        let canvasTop = canvas.offsetTop;
        let canvasBottom = canvasTop + canvas.offsetHeight;
        if (
          canvasTop < containerHeight + container.scrollTop &&
          canvasBottom > container.scrollTop
        ) {
          this.curPage = i + 1;
          break;
        }
      }
    },
  },
};
</script>
  
<style lang="scss" scoped>
.grade-container-componment {
  margin-top: 10px;
}
.pdf-container {
  width: 100%;
  height: calc(99vh - 86px);
  overflow: auto;
  border: 1px solid #ccc;
  background-color: #fff;
}
.pdf-page {
  width: auto; /* 每页 PDF 的宽度 */
  height: auto;
  margin-bottom: 10px; /* 页与页之间的间隙 */
}

.controls {
  height: 40px;
  display: flex;
  flex-direction: row;
  user-select: none;
  width: 100%;
  align-items: center;
  justify-content: flex-end;
  // background-color: #fff;
  .btn {
    width: 40px;
    height: 40px;
    cursor: pointer;
  }
  .filename {
    width: 60%;
    font-size: 18px;
    // font-weight: 700;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-left: 5px;
  }
  .page-num {
    font-size: 16px;
    color: #333;
    margin-left: 5px;
  }
}
</style>
  