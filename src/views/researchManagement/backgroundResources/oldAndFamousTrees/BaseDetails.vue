<script lang="ts" setup>
import { u } from "@/utils/viewerjs"
interface Props {
  data?: any
}
const props = withDefaults(defineProps<Props>(), {
  data: {}
})
// 预览图片
const preview = () => {
  if (props.data.filelist?.length > 0) {
    const url = props.data.filelist.map((item: any) => "/fireStaticUrl/" + item.filepath)

    u.showPreviewImg(0, url)
  } else {
    ElMessage.warning("暂无预览图片")
  }
}
// 跳转全景
const toQJ = (type: string) => {
  if (props.data[type]) {
    window.open("/statisUrl/" + props.data[type], "_blank")
  } else {
    ElMessage.warning("暂无全景")
  }
}
</script>
<template>
  <div class="trees-base-details">
    <h3>{{ data.mc }}-古树详情</h3>
    <div class="contain panzoom-exclude">
      <div class="con-box">
        <div class="row">
          <div class="col">
            <div class="label">海拔:</div>
            <el-text
              class="value"
              truncated
            >
              {{ data.hb ? `${data.hb}` : "暂无" }}
            </el-text>
          </div>
          <div class="col">
            <div class="label">胸径:</div>
            <el-text
              class="value"
              truncated
            >
              {{ data.gs_xj ? `${data.gs_xj}cm` : "暂无" }}
            </el-text>
          </div>
        </div>
        <div class="row">
          <div class="col">
            <div class="label">经度:</div>
            <el-text
              class="value"
              truncated
              >{{ data.lon || "暂无" }}</el-text
            >
          </div>
          <div class="col">
            <div class="label">纬度:</div>
            <el-text
              class="value"
              truncated
            >
              {{ data.lat || "暂无" }}
            </el-text>
          </div>
        </div>
        <div class="row">
          <div class="col">
            <div class="label">株高:</div>
            <el-text
              class="value"
              truncated
            >
              {{ data.gs_zg ? `${data.gs_zg}m` : "暂无" }}
            </el-text>
          </div>
          <div class="col">
            <div class="label">数目:</div>
            <el-text
              class="value"
              truncated
            >
              {{ data.gs_sm + "棵" || "暂无" }}
            </el-text>
          </div>
        </div>
        <div class="row">
          <div class="col">
            <div class="label">树龄:</div>
            <el-text
              class="value"
              truncated
            >
              {{ data.gs_sl + "年" || "暂无" }}
            </el-text>
          </div>
          <div class="col">
            <div class="label">级别:</div>
            <el-text
              class="value"
              truncated
            >
              {{ data.plevel || "暂无" }}</el-text
            >
          </div>
        </div>
        <div class="row">
          <div class="col">
            <div class="label">科名:</div>
            <el-text
              class="value"
              truncated
            >
              {{ data.ke || "暂无" }}
            </el-text>
          </div>
          <div class="col">
            <div class="label">属名:</div>
            <el-text
              class="value"
              truncated
              >{{ data.shu || "暂无" }}</el-text
            >
          </div>
        </div>
        <div class="row">
          <div class="col">
            <div class="label">种名:</div>
            <el-text
              class="value"
              truncated
            >
              {{ data.mc || "暂无" }}
            </el-text>
          </div>
        </div>
        <div class="row">
          <div class="col">
            <div class="label">生存环境:</div>
            <el-text
              class="value"
              line-clamp="3"
              :title="data.schj"
            >
              {{ data.schj || "暂无" }}
            </el-text>
          </div>
        </div>
        <div class="row">
          <div class="col">
            <div class="label">特征特性:</div>
            <el-text
              class="value"
              line-clamp="2"
              :title="data.tztx"
            >
              {{ data.tztx || "暂无" }}
            </el-text>
          </div>
        </div>
        <div class="row">
          <div class="col">
            <div class="label">习性:</div>
            <el-text
              class="value"
              line-clamp="2"
              :title="data.habit"
            >
              {{ data.habit || "暂无" }}
            </el-text>
          </div>
        </div>
        <div class="row">
          <div class="col">
            <div class="label">用途:</div>
            <el-text
              class="value"
              line-clamp="3"
              :title="data.yt"
            >
              {{ data.yt || "暂无" }}
            </el-text>
          </div>
        </div>
        <div class="row">
          <div class="col">
            <div class="label">问题上报:</div>
            <el-text
              class="value"
              truncated
            >
              {{ data.wt || "暂无" }}
            </el-text>
          </div>
        </div>
      </div>
      <div class="r-box">
        <div
          class="img-box"
          @click="preview"
        >
          <el-image
            :src="data.filelist?.length > 0 ? '/fireStaticUrl/' + data.filelist[0].filepath : ''"
            alt=""
            fit="fill"
          >
            <template #placeholder>
              <el-skeleton
                class="image-placeholder"
                style="width: 100%; height: 100%"
                animated
              >
                <template #template>
                  <el-skeleton-item
                    variant="image"
                    style="width: 100%; height: 100%"
                  />
                </template>
              </el-skeleton>
            </template>
            <template #error>
              <div class="image-slot">
                <i-ep-picture />
                <span style="margin-left: 3px">暂无预览</span>
              </div>
            </template></el-image
          >
        </div>
        <div class="qj">
          <button
            class="qj-item"
            :class="{ disabled: !data.springqj }"
            @click="toQJ('springqj')"
          >
            春全景
          </button>
          <button
            class="qj-item"
            :class="{ disabled: !data.summerqj }"
            @click="toQJ('summerqj')"
          >
            夏全景
          </button>
          <button
            class="qj-item"
            :class="{ disabled: !data.autumnqj }"
            @click="toQJ('autumnqj')"
          >
            秋全景
          </button>
          <button
            class="qj-item"
            :class="{ disabled: !data.winterqj }"
            @click="toQJ('winterqj')"
          >
            冬全景
          </button>
        </div>
      </div>
    </div>
    <div class="qrCode">
      <img
        class="qrCodeImg"
        :src="'/statisUrl/' + data.remark2"
        alt=""
      />
      <span>微信扫一扫</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.trees-base-details {
  display: flex;
  flex-direction: column;
  width: 45.9375vw;
  height: 620px;
  background: url("@/assets/images/dialog-bg1.png") no-repeat center center / 100% 100%;
  font-size: 14px;
  color: #beccdc;
  padding: 20px 1.8229vw 30px 1.8229vw;
  h3 {
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
    font-size: 1.25vw;
    font-weight: bold;
    font-style: italic;
  }
  .contain {
    display: flex;
    gap: 0.5208vw;
    .con-box {
      flex: 1;
      .row {
        display: flex;
        align-items: center;
        gap: 0.5208vw;
        padding: 8px 0;
        border-bottom: 1px solid #4977a1;
        .col {
          flex: 1;
          display: flex;
          height: 100%;
          // line-height: 1.5em;
          .label {
            width: 6.25vw;
            height: 100%;
            text-align: left;
            font-size: 14px;
            color: #426e98;
          }
          .value {
            flex: 1;
            overflow: hidden;
            width: 100%;
            color: #beccdc;
            font-size: 14px;
            line-height: 1.5em;
          }
        }
      }
    }
    .r-box {
      display: flex;
      flex-direction: column;
      gap: 30px;
      .img-box {
        width: 200px;
        height: 160px;
        .el-image {
          width: 100%;
          height: 100%;
          .image-slot {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            height: 100%;
            border: 1px dashed #999;
            color: var(--el-text-color-secondary);
            font-size: 0.9375vw;
          }
        }
      }
      .qj {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
        .qj-item {
          margin: 0 auto;
          width: fit-content;
          display: inline-block;
          color: #999;
          background-color: transparent;
          outline: 0;
          border: none;
          font-size: 14px;
          cursor: pointer;
          text-align: center;
          line-height: 1.5em;
          transition: all 0.3s ease;
          &:hover {
            padding-top: 3px;
            text-decoration: underline;
          }
          &:focus {
            text-decoration: underline;
            color: #e67e22;
          }
          &.disabled {
            color: #666;
            cursor: not-allowed;
          }
        }
      }
    }
  }
  .qrCode {
    position: absolute;
    bottom: 45px;
    right: 45px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    font-size: 18px;

    .qrCodeImg {
      overflow: hidden;
      border-radius: 8px;
      width: 150px;
    }
  }
}
</style>
