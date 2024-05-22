<template>
  <div>
    <div class="head">
      <ElPageHeader @back="goBack" content="Grade Essay"></ElPageHeader>
    </div>
    <div class="grade-container">
      <div class="pdf">
        <FileViewer
          :url="fileURL"
          @loadedPDF="loadedPDF"
          @loadedImg="loadedImg"
        ></FileViewer>
      </div>
      <div class="grade" ref="chat">
        <h3 class="report-title" v-if="!isQuestion">Grading Report</h3>
        <h3 class="report-title" v-if="isQuestion">AI Exam Questions</h3>
        <!-- <div class="markdown" v-html="renderedMarkdown"></div> -->

        <div class="message" v-for="(item, index) in messageList" :key="index">
          <div class="msg-head" v-if="item.type == 'ai'">
            <img class="avatar" src="~/assets/AI.png" alt="" />
            AI:
          </div>
          <div class="msg-head" v-else>
            <img class="avatar" src="~/assets/user.png" alt="" />
            You:
          </div>
          <div class="markdown" v-html="item.markdown"></div>
        </div>
        <div class="question-container">
          <el-input
            class="question-ipt"
            v-model="question"
            placeholder="Please Input the question"
            @keyup.enter.native="askQuestion"
          ></el-input>
          <el-button
            type="warning"
            icon="el-icon-position"
            @click="askQuestion"
          ></el-button>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import MarkdownIt from "markdown-it";
import { config } from "@/config/default.js";
export default {
  data() {
    return {
      fileURL: "",
      evaluate: "",
      paragraphList: [],
      eventSource: {},
      sectionOrder: 0,
      renderedMarkdown: "",
      markdownText: ``,
      question: "",
      messageList: [],
      ongoingMessageIndex: -1,
      canAskNow: true,
    };
  },
  computed: {
    isQuestion() {
      return this.$route.params.type == "question";
    },
  },
  watch: {
    messageList() {
      console.log("watch messagelist变化了");
      this.scrollToBottom();
    },
  },
  async asyncData({ $request, params }) {
    try {
      let res = await $request("/upload/getFileURL", {
        hash: params.id,
        type: params.type,
      });
      if (res.code == 200) {
        return {
          fileURL: res.url,
        };
      }
    } catch (e) {
      console.log("getFileURL error: " + e.message);
    }
  },
  async created() {
    let form = {
      advancedForm: JSON.parse(sessionStorage.getItem("advancedForm")),
      criteriaForm: JSON.parse(sessionStorage.getItem("criteriaForm")),
      questionForm: JSON.parse(sessionStorage.getItem("questionForm")),
    };
    if (!this.isQuestion) {
      await this.$request("/setPrompt", {
        advancedForm: form.advancedForm,
        criteriaForm: form.criteriaForm,
      });
    } else {
      await this.$request("/setQuestionPrompt", {
        questionForm: form.questionForm,
      });
    }
  },
  methods: {
    goBack() {
      this.$router.push({
        name: "uploadPdf-type",
        params: {
          type: this.$route.params.type,
        },
      });
    },
    scrollToBottom() {
      this.$nextTick(() => {
        let chatBox = this.$refs.chat;
        chatBox.scrollTop = chatBox.scrollHeight;
      });
    },
    eventSourceProcess(url) {
      console.log("进入方法");
      this.eventSource = new EventSource(url);
      let endFlag = "messageEND";
      const md = new MarkdownIt();
      let msg = "";
      let msgIndex = null;
      this.canAskNow = false;
      this.eventSource.onmessage = (e) => {
        // console.log(e.data);
        if (e.data == endFlag) {
          this.eventSource.close();
          this.eventSource = null;
          console.log("sse结束了");
          msg = "";
          this.canAskNow = true;
        } else {
          let modifiedMessage;
          if (this.isQuestion) {
            modifiedMessage = e.data.replaceAll(/<br>/g, "\n");
          } else {
            modifiedMessage = e.data.trim().replaceAll(/<br>/g, "\n");
          }
          msg += modifiedMessage;
          if (msgIndex == null) {
            this.messageList.push({
              type: "ai",
              markdown: md.render(msg),
            });
            msgIndex = ++this.ongoingMessageIndex;
          } else {
            this.messageList[msgIndex].markdown = md.render(msg);
            this.scrollToBottom();
          }
          // this.markdownText += modifiedMessage;
          // this.renderedMarkdown = md.render(this.markdownText);
        }
      };
    },
    askQuestion() {
      if (this.canAskNow && this.question.trim() !== "") {
        const md = new MarkdownIt();
        this.messageList.push({
          type: "you",
          markdown: md.render(this.question),
        });
        let uid = JSON.parse(sessionStorage.getItem("criteriaForm")).uid;
        let filename = localStorage.getItem("filename");
        let suffix = /\.([a-zA-Z0-9]+)$/.exec(filename)[1];
        let baseUrl = `${config.host}:${config.port}/api/grade?hash=${this.$route.params.id}&uid=${uid}`;
        if (suffix.toLowerCase() !== "pdf") {
          baseUrl = `${config.host}:${config.port}/api/grade?hash=${this.$route.params.id}&suffix=${suffix}`;
        }
        if (this.isQuestion) {
          uid = JSON.parse(sessionStorage.getItem("questionForm")).uid;
          baseUrl = `${config.host}:${config.port}/api/designQuestion?hash=${this.$route.params.id}&uid=${uid}`;
        }
        let question = encodeURIComponent(this.question);
        this.eventSourceProcess(`${baseUrl}&question=${question}`);
        // console.log('结束ask');
        this.question = "";
        this.ongoingMessageIndex++;
      }
    },
    loadedPDF() {
      let url = "";
      let uid = "";
      if (!this.isQuestion) {
        uid = JSON.parse(sessionStorage.getItem("criteriaForm")).uid;
        url = `${config.host}:${config.port}/api/grade?hash=${this.$route.params.id}&uid=${uid}`;
      } else {
        uid = JSON.parse(sessionStorage.getItem("questionForm")).uid;
        url = `${config.host}:${config.port}/api/designQuestion?hash=${this.$route.params.id}&uid=${uid}`;
      }
      this.eventSourceProcess(url);
    },
    loadedImg() {
      let filename = localStorage.getItem("filename");
      let suffix = /\.([a-zA-Z0-9]+)$/.exec(filename)[1];
      let url = `${config.host}:${config.port}/api/grade?hash=${this.$route.params.id}&suffix=${suffix}`;
      console.log("加载图片成功");
      this.eventSourceProcess(url);
    },
  },

  beforeDestroy() {
    if (this.eventSource && this.eventSource.close) {
      this.eventSource.close();
    }
    this.eventSource = null;
  },
};
</script>

<style lang="scss" scoped>
.head {
  // position: fixed;
  top: 0;
  width: 100%;
  padding: 10px;
  background-color: rgb(84, 92, 100);
  color: rgb(255, 208, 75);
  ::v-deep .el-page-header__content {
    color: rgb(255, 208, 75);
  }
}
.grade-container {
  display: flex;
  padding-top: 10px;
  gap: 60px;
  background-color: rgb(231, 248, 255);
  .pdf {
    width: 45%;
    height: calc(99vh - 10px - 40px);
  }
  .grade {
    position: relative;
    width: 40%;
    background-color: rgb(255, 252, 252);
    height: calc(99vh - 10px - 40px);
    padding: 12px;
    overflow-y: auto;
    border-radius: 15px;
    .report-title {
      text-align: center;
      font-size: 28px;
      margin-bottom: 20px;
    }
    .markdown {
      color: #333;
      padding-left: 35px;
      padding-bottom: 50px;
      ::v-deep h2 {
        font-size: 20px;
        margin-top: 20px;
        margin-bottom: 20px;
      }
      ::v-deep p {
        margin-bottom: 15px;
      }
    }
    .msg-head {
      margin-bottom: 10px;
      .avatar {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        vertical-align: middle;
      }
    }
    .question-container {
      width: 40%;
      position: fixed;
      bottom: 15px;
      .question-ipt {
        width: 80%;
      }
    }
  }
}
/* 在线链接服务仅供平台体验和调试使用，平台不承诺服务的稳定性，企业客户需下载字体包自行发布使用并做好备份。 */
@font-face {
  font-family: "iconfont"; /* Project id 3786628 */
  src: url("http://at.alicdn.com/t/c/font_3786628_r34ebr3r0ij.woff2?t=1669112668165")
      format("woff2"),
    url("http://at.alicdn.com/t/c/font_3786628_r34ebr3r0ij.woff?t=1669112668165")
      format("woff"),
    url("http://at.alicdn.com/t/c/font_3786628_r34ebr3r0ij.ttf?t=1669112668165")
      format("truetype");
}
.iconfont {
  font-family: "iconfont" !important;
  font-size: 16px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -webkit-text-stroke-width: 0.2px;
  -moz-osx-font-smoothing: grayscale;
}
</style>
