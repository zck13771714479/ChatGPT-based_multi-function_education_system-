<template>
  <div class="upload-pdf-container">
    <div class="head">
      <ElPageHeader @back="goBack" content="Choose File"></ElPageHeader>
    </div>
    <h1 class="title">Please upload the {{ type }} file</h1>
    <div class="subtitle" v-if="!isQuestion">
      Grade for academic essay, student homework with the given criteria
    </div>
    <div class="subtitle" v-else>
      AI will analyze the class slides and design some basic questions for the
      final exams
    </div>
    <!-- <nuxt-link to="/grade"></nuxt-link> -->
    <input type="file" @change="chooseFile($event)" ref="uploadInput" hidden />
    <section class="upload_box" v-if="!isChosen">
      <div
        class="upload-drag"
        @click="clickUpload()"
        @dragover="$event.preventDefault()"
        @drop="dropEvent($event)"
      >
        <i class="icon"></i>
        <span class="text"
          >Drag the file to here，or
          <a href="javascript:;" class="upload-submit">Click to choose</a></span
        >
      </div>
    </section>
    <section class="uploaded" v-else>
      <img
        v-if="type == 'PDF'"
        class="pdf-icon"
        src="~/assets/pdf-icon.png"
        alt=""
      />
      <img v-else class="pdf-icon" :src="smallImg" alt="" />
      <div class="filename">{{ filename }}</div>
      <div class="filesize">{{ fileSizeText }}</div>
      <div class="progress-conatiner">
        <ElProgress :format="format" :percentage="percentage"></ElProgress>
      </div>
      <div class="btn-container">
        <ElButton type="danger" @click="deleteFile">Delete the file</ElButton>
        <ElButton
          type="primary"
          :loading="percentage < 100 && percentage > 0"
          @click="uploadFile"
          v-if="percentage < 100"
          >Upload the file</ElButton
        >
        <ElButton
          type="warning"
          @click="grade"
          v-if="!isQuestion && percentage >= 100"
          >Grade for the file</ElButton
        >
        <ElButton
          type="success"
          @click="question"
          v-if="isQuestion && percentage >= 100"
          >AI Design Question</ElButton
        >
        <i
          @click="showGradeDialog = true"
          class="el-icon-date"
          v-if="!isQuestion"
          style="font-size: 25px; cursor: pointer"
        ></i>
        <i
          @click="showQuestionPrompt = true"
          class="el-icon-setting"
          v-if="isQuestion"
          style="font-size: 25px; cursor: pointer"
        ></i>
      </div>
      <ElDialog :visible.sync="showGradeDialog" :close-on-click-modal="false">
        <ElTabs>
          <ElTabPane>
            <span slot="label"><i class="el-icon-date"></i> Criteria</span>
            <el-form>
              <el-form-item label="Common criteria">
                <el-checkbox-group v-model="criteriaForm.checkList">
                  <el-checkbox
                    :label="item"
                    v-for="(item, index) in criteriaList"
                    :key="index"
                  ></el-checkbox>
                </el-checkbox-group>
              </el-form-item>
            </el-form>
          </ElTabPane>
          <ElTabPane>
            <span slot="label"><i class="el-icon-setting"></i> Advanced </span>
            <ElForm>
              <el-form-item label="System role">
                <el-input
                  v-model="advancedForm.system"
                  type="textarea"
                  :autosize="{ minRows: 2, maxRows: 6 }"
                ></el-input>
              </el-form-item>
              <el-form-item label="Temperature">
                <div class="slider-container">
                  <el-slider
                    v-model="advancedForm.temperature"
                    :min="0"
                    :max="1"
                    :step="0.1"
                    show-input
                  ></el-slider>
                </div>
              </el-form-item>
            </ElForm>
          </ElTabPane>
        </ElTabs>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="showGradeDialog = false"
            >Confirm</el-button
          >
        </div>
      </ElDialog>
      <ElDialog
        :visible.sync="showQuestionPrompt"
        :close-on-click-modal="false"
      >
        <ElTabs>
          <ElTabPane>
            <span slot="label"
              ><i class="el-icon-date"></i> Question setting</span
            >
            <el-form
              :model="questionForm"
              :label-position="labelPosition"
              :label-width="'200px'"
              :rules="questionRules"
              ref="ruleForm"
            >
              <el-form-item label="Main topic" prop="mainTopic">
                <el-input
                  v-model="questionForm.mainTopic"
                  placeholder="Please input the main topic of this class or module"
                ></el-input>
              </el-form-item>
              <el-form-item
                label="Key Knowledge Points"
                prop="keyKnowledgePoints"
              >
                <el-input
                  v-model="questionForm.keyKnowledgePoints"
                  placeholder="Please input the key knowledge points"
                ></el-input>
              </el-form-item>
              <el-form-item label="Difficult level" prop="difficultLevel">
                <el-select
                  v-model="questionForm.difficultLevel"
                  placeholder="Select the difficult level"
                >
                  <el-option
                    v-for="item in difficultLevelOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="Question type" prop="questionType">
                <el-select
                  v-model="questionForm.questionType"
                  placeholder="Select the question type"
                >
                  <el-option
                    v-for="item in questionTypeOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="Question number" prop="questionNumber">
                <el-input-number
                  v-model="questionForm.questionNumber"
                  :min="1"
                  :max="8"
                  label="Question number"
                ></el-input-number>
              </el-form-item>
              <el-form-item label="Additional tips" prop="additionalDesc">
                <el-input
                  type="textarea"
                  :rows="2"
                  placeholder="Please input the additional description of the questions"
                  v-model="questionForm.additonalTips"
                >
                </el-input>
              </el-form-item>
            </el-form>
          </ElTabPane>
        </ElTabs>
        <div slot="footer" class="dialog-footer">
          <el-button type="primary" @click="submitQuestion('ruleForm')"
            >Confirm</el-button
          >
        </div>
      </ElDialog>
    </section>
  </div>
</template>
  
  <script>
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.js";
import SparkMD5 from "spark-md5";
import { Message } from "element-ui";
import { nanoid } from "nanoid";
if (process.client) {
  pdfjs.GlobalWorkerOptions.workerSrc = require("pdfjs-dist/build/pdf.worker.entry");
}
export default {
  data() {
    return {
      advancedForm: {
        system: "",
        temperature: 1,
      },
      criteriaForm: {
        checkList: [],
      },
      questionForm: {
        mainTopic: "",
        keyKnowledgePoints: "",
        difficultLevel: "",
        questionType: "",
        questionNumber: 3,
        additonalTips: "",
      },
      labelPosition: "right",
      difficultLevelOptions: [
        { label: "Easy", value: "Easy" },
        { label: "Middle", value: "Middle" },
        { label: "Difficult", value: "Difficult" },
      ],
      questionTypeOptions: [
        { label: "Short answer", value: "Short answer" },
        { label: "Fill in blank", value: "Fill in blank" },
        { label: "True/False questions", value: "True/False questions" },
      ],
      showGradeDialog: false,
      showQuestionPrompt: false,
      isChosen: false,
      filename: "",
      filesize: 0,
      percentage: 0,
      formData: {},
      hash: "",
      smallImg: "",
      isBig: false,
      criteriaList: [],
      questionRules: {
        mainTopic: [
          {
            required: true,
            message: "Please input the Course Material Overview",
            trigger: "blur",
          },
        ],
        keyKnowledgePoints: [
          {
            required: true,
            message: "Please input the Key Knowledge Points",
            trigger: "blur",
          },
        ],
        difficultLevel: [
          {
            required: true,
            message: "Please select the Difficult Level",
            trigger: "change",
          },
        ],
        questionType: [
          {
            required: true,
            message: "Please select the Question Type",
            trigger: "change",
          },
        ],
        questionNumber: [
          {
            required: true,
            message: "Please select the Question Number",
            trigger: "change",
          },
        ],
      },
    };
  },
  async asyncData({ $request, params }) {
    try {
      let res = await $request("/criteria");
      if (res.code == 200) {
        return {
          criteriaList: res.list,
          advancedForm: {
            system: res.system,
            temperature: res.temperature,
          },
        };
      }
    } catch (e) {
      console.log("getCriteriaFail" + e);
    }
  },
  mounted() {
    this.criteriaForm.checkList.push(...this.criteriaList);
  },
  computed: {
    fileSizeText() {
      //转换单位
      const sizeUnit = ["Bytes", "KB", "MB", "GB"];
      const sizeFactor = 1024;
      let unitIndex = 0;
      let size = this.filesize;
      while (size >= 1000 && unitIndex < sizeUnit.length) {
        size /= sizeFactor;
        unitIndex++;
      }
      let textNum = (this.filesize / Math.pow(sizeFactor, unitIndex)).toFixed(
        2
      );
      return textNum + sizeUnit[unitIndex];
    },
    type() {
      return this.$route.params.type == "handWritten" ? "Image" : "PDF";
    },
    isQuestion() {
      return this.$route.params.type == "question";
    },
  },
  methods: {
    submitQuestion(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.showQuestionPrompt = false;
        } else {
          return false;
        }
      });
    },
    clickUpload() {
      this.$refs.uploadInput.click();
    },
    async chooseFile(event, file) {
      //选择文件
      this.formData = new FormData();
      if (!file) {
        file = event.target.files[0];
      }
      // console.log(file);
      if (
        this.type == "PDF" &&
        (file.type !== "application/pdf" || !/.pdf$/.test(file.name))
      ) {
        Message.error("Please Upload PDF file!");
        return;
      }
      if (this.type == "Image" && !/^image\/(png|jpeg)$/.test(file.type)) {
        Message.error("Please Upload PNG or JPG file!");
        return;
      }
      this.isChosen = true;
      this.formData.append("file", file);
      this.formData.append("filename", file.name);
      this.filename = file.name;
      this.filesize = file.size;
      if (this.filesize > 1024 * 1024 * 15) {
        //15MB以上选择大文件分片上传
        this.isBig = true;
      }
      if (!this.isBig && this.type == "Image") {
        //缩略图处理
        this.smallImg = await this.showImg(file);
      } else if (this.isBig && this.type == "Image") {
        //大文件缩略图处理
        this.smallImg = await this.showImg(
          file.slice(0, Math.min(1024 * 1024 * 5, this.filesize))
        );
      }
    },
    getHash(file) {
      return new Promise((resolve, reject) => {
        let fileReader = new FileReader();
        let spark = new SparkMD5.ArrayBuffer();
        let suffix = /\.([a-zA-Z0-9]+)$/.exec(file.name)[1];
        fileReader.onload = (event) => {
          spark.append(event.target.result);
          let hash = spark.end();
          resolve({
            hash,
            suffix,
          });
        };
        fileReader.readAsArrayBuffer(file);
      });
    },
    showImg(file) {
      return new Promise((resolve, reject) => {
        let fileReader = new FileReader();
        fileReader.onload = (event) => {
          resolve(event.target.result);
        };
        fileReader.readAsDataURL(file);
      });
    },
    goBack() {
      this.$router.push("/");
    },
    async uploadFile() {
      //上传文件
      let res;
      if (!this.isBig) {
        //普通文件上传
        res = await this.$request("/upload/single", this.formData, {
          onUploadProgress: (progressEvent) => {
            this.percentage = Math.round(
              (progressEvent.loaded / progressEvent.total) * 100
            );
          },
        });
      } else {
        //大文件上传
        let file = this.formData.get("file");
        this.uploadBigFile(file);
      }
      if (res && res.code == 200) {
        this.hash = res.hash;
        this.$store.dispatch("setHash", this.hash);
        this.$store.dispatch("setFilename", this.formData.get("filename"));
        if (this.$route.params.type == "typed") {
          this.showGradeDialog = true;
        } else if (this.$route.params.type == "question") {
          this.showQuestionPrompt = true;
        }
      }
    },
    async uploadBigFile(file) {
      //大文件上传
      let { hash, suffix } = await this.getHash(file);
      //切片
      const chunks = [];
      let chunkSize = 1024 * 10;
      let count = Math.ceil(file.size / chunkSize);
      if (count > 100) {
        count = 100;
        chunkSize = file.size / 100;
      }
      let index = 0;
      while (index < count) {
        let chunk = file.slice(index * chunkSize, (index + 1) * chunkSize);
        chunks.push({
          chunk,
          filename: `${hash}-${index + 1}.${suffix}`,
        });
        index++;
      }
      const maxConcurrent = 6;
      let promises = [];
      try {
        let { fileList } = await this.$request("/upload/checkHash", {
          hash,
          suffix,
        });
        for (let i = 0; i < chunks.length; i++) {
          //并行传输分片
          let item = chunks[i];
          if (fileList.includes(item.filename)) {
            //切片后检测断点，并断点续传
            continue;
          }
          const formData = new FormData();
          formData.append("file", item.chunk);
          formData.append("filename", item.filename);
          //加入id的query参数仅为了防止重复请求同一个url
          promises.push(this.$request(`/upload/chunk?id=${i}`, formData));
          if (promises.length >= maxConcurrent || i == chunks.length - 1) {
            await Promise.all(promises);
            promises = [];
            this.completeChunkUpload(i, count, hash, suffix);
            if (this.$route.params.type == "typed") {
              this.showGradeDialog = true;
            } else if (this.$route.params.type == "question") {
              this.showQuestionPrompt = true;
            }
          }
        }
      } catch (e) {
        Message.error("Upload chunk fail");
      }
    },
    async completeChunkUpload(index, count, hash, suffix) {
      try {
        this.percentage = Math.round(((index + 1) / count) * 100);
        if (index + 1 < count) {
          return;
        }
        let res = await this.$request("/upload/mergeChunk", {
          count,
          hash,
          suffix,
        });
        if (res.code == 200) {
          this.hash = hash;
        }
      } catch (e) {
        Message.error("Server: Merge file error");
      }
    },
    format(percentage) {
      return percentage === 100 ? "Upload Success!" : `${percentage}%`;
    },
    addUUID(obj, uid) {
      if (uid) {
        return {
          uid,
          ...obj,
        };
      } else {
        return {
          uid: nanoid(),
          ...obj,
        };
      }
    },
    deleteFile() {
      //删除想上传的文件
      this.$refs.uploadInput.value = "";
      this.showGradeDialog = false;
      this.isChosen = false;
      this.filename = "";
      this.filesize = 0;
      this.percentage = 0;
      this.formData = {};
      this.hash = "";
      this.smallImg = "";
      this.isBig = false;
      this.showQuestionPrompt = false;
    },
    grade() {
      let uid = nanoid();
      sessionStorage.setItem(
        "criteriaForm",
        JSON.stringify(this.addUUID(this.criteriaForm, uid))
      );
      sessionStorage.setItem(
        "advancedForm",
        JSON.stringify(this.addUUID(this.advancedForm, uid))
      );
      this.$router.push({
        name: "ai-type-id",
        params: {
          type: this.$route.params.type,
          id: this.hash,
        },
      });
    },
    dropEvent(event) {
      // console.log('drop');
      event.preventDefault();
      let file = event.dataTransfer.files[0];
      this.chooseFile(null, file);
    },
    question() {
      if (
        this.questionForm.mainTopic.trim() &&
        this.questionForm.keyKnowledgePoints.trim() &&
        this.questionForm.questionNumber &&
        this.questionForm.difficultLevel &&
        this.questionForm.questionType
      ) {
        sessionStorage.setItem(
          "questionForm",
          JSON.stringify(this.addUUID(this.questionForm))
        );
        this.$router.push({
          name: "ai-type-id",
          params: {
            type: this.$route.params.type,
            id: this.hash,
          },
        });
      } else {
        Message.warning("Please fill the form about question description!");
      }
    },
  },
};
</script>
  
  <style lang="scss" scoped>
.upload-pdf-container {
  display: flex;
  width: 100%;
  align-items: center;
  flex-direction: column;
  width: 100vw;
  min-height: 100vh;
  // height: 100%;
  background: url(~/assets/yes3.jpg) no-repeat;
  background-size: 100% 100%;
  .head {
    position: fixed;
    top: 0;
    width: 100%;
    padding: 10px;
    background-color: rgb(84, 92, 100);
    color: rgb(255, 208, 75);
    ::v-deep .el-page-header__content {
      color: rgb(255, 208, 75);
    }
  }
  .title {
    display: flex;
    justify-content: center;
    color: rgba(0, 0, 0, 0.88);
    font-size: 36px;
    margin-top: 50px;
  }
  .subtitle {
    display: flex;
    justify-content: center;
    color: rgba(0, 0, 0, 0.45);
    font-size: 24px;
    margin-top: 20px;
    margin-bottom: 50px;
  }

  .upload-drag {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 450px;
    height: 250px;
    background: #fff;
    border: 4px dashed #bfefff;
    border-radius: 15px;

    cursor: pointer;

    .icon {
      width: 100%;
      height: 150px;
      margin-top: 10px;
      background: url(~assets/upload.png) no-repeat center;
      background-size: 50%;
    }
    .text {
      margin-top: 5px;
      font-size: 16px;
      .upload-submit {
        margin-left: 2px;
        color: #409eff;
        font-size: 16px;
      }
    }
  }
  .uploaded {
    width: 480px;
    height: 370px;
    background: #fff;
    border: 2px dashed #bfefff;
    border-radius: 15px;
    text-align: center;
    .pdf-icon {
      margin-top: 5px;
      width: 167px;
      height: 167px;
    }
    .filename {
      font-size: 16px;
      color: #333;
      margin-bottom: 5px;
    }
    .filesize {
      font-size: 16px;
      color: #333;
      margin-bottom: 35px;
    }
    .progress-conatiner {
      display: inline-block;
      width: 75%;
    }
    .btn-container {
      display: inline-flex;
      margin: 0 auto;
      gap: 15px;
      margin-top: 20px;
    }
  }
  ::v-deep .el-form-item__content {
    display: flex;
  }
  .slider-container {
    width: 100%;
  }
}
</style>