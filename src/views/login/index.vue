<script lang="ts" setup>
import { sendSmsCodeApi } from "@/api"

// 登录方式：'password' | 'sms'
const loginModes = ref<any>([])
const loginMode = ref<"账号登录" | "短信验证">("账号登录")
// 用户名密码登录
const username = ref("")
const password = ref("")

// 手机号短信登录
const phone = ref("")
const smsCode = ref("")
const countdown = ref(0)
const isSendingSms = ref(false)

const { login, loginWithSms, loginMethodList } = useConfigStore()

// 切换登录方式
const switchLoginMode = (mode: "账号登录" | "短信验证") => {
  loginMode.value = mode
  // 清空表单
  username.value = ""
  password.value = ""
  phone.value = ""
  smsCode.value = ""
  countdown.value = 0
}

// 发送短信验证码
const sendSmsCode = async () => {
  if (!phone.value) {
    ElMessage.warning("请输入手机号码")
    return
  }

  // 验证手机号格式
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(phone.value)) {
    ElMessage.warning("请输入正确的手机号码")
    return
  }

  try {
    isSendingSms.value = true
    // TODO: 调用发送短信验证码的API
    await sendSmsCodeApi({ phone: phone.value })
    // 模拟发送成功
    ElMessage.success("验证码已发送")
    countdown.value = 60

    // 开始倒计时
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error) {
    ElMessage.error("发送验证码失败")
  } finally {
    isSendingSms.value = false
  }
}

// 提交登录
const submit = async () => {
  if (loginMode.value === "账号登录") {
    // 用户名密码登录
    if (username.value !== "" && password.value !== "") {
      await login(username.value, password.value)
    } else {
      ElMessage.info("请输入用户名和密码")
    }
  } else if (loginMode.value === "短信验证") {
    // 手机号短信登录
    if (phone.value !== "" && smsCode.value !== "") {
      await loginWithSms(phone.value, smsCode.value)
    } else {
      ElMessage.info("请输入手机号和验证码")
    }
  }
}
const showDownload = ref(false)
onMounted(async () => {
  const response = await loginMethodList()
  if (response) {
    loginModes.value = response.filter((item: any) => item.status).sort((a: any, b: any) => a.id - b.id)
    loginMode.value = loginModes.value?.[0].type
  }
})
</script>
<template>
  <div class="login-page">
    <div class="login-logo">
      <img
        :src="$fun.getImg('login/login-logo.png')"
        alt=""
      />
    </div>
    <div class="form">
      <!-- 登录方式切换 -->
      <div class="login-mode-switch">
        <div
          v-for="item in loginModes"
          :key="item.id"
          class="mode-tab"
          :class="{ active: loginMode === item.type }"
          @click="switchLoginMode(item.type)"
        >
          {{ item.type }}
        </div>
      </div>

      <!-- 用户名密码登录表单 -->
      <div
        v-if="loginMode === '账号登录'"
        class="box"
      >
        <div class="username">
          <el-input
            v-model="username"
            placeholder="请输入用户名"
            size="small"
            @keyup.enter="submit"
          />
        </div>
        <div class="password">
          <el-input
            v-model="password"
            placeholder="请输入密码"
            size="small"
            show-password
            @keyup.enter="submit"
          />
        </div>
      </div>

      <!-- 手机号短信登录表单 -->
      <div
        v-if="loginMode === '短信验证'"
        class="box"
      >
        <div class="phone">
          <el-input
            v-model="phone"
            placeholder="请输入手机号码"
            size="small"
            maxlength="11"
            @keyup.enter="submit"
          />
        </div>
        <div class="sms-code">
          <el-input
            v-model="smsCode"
            placeholder="请输入验证码"
            size="small"
            maxlength="6"
            @keyup.enter="submit"
          />
          <div
            class="sms-btn"
            :class="{ disabled: countdown > 0 || isSendingSms }"
            @click="sendSmsCode"
          >
            {{ countdown > 0 ? `${countdown}s` : isSendingSms ? "发送中..." : "获取验证码" }}
          </div>
        </div>
      </div>

      <div
        class="box btn"
        @click="submit"
      >
        登录
      </div>
    </div>

    <div class="download">
      <img
        class="hover-download"
        :src="$fun.getImg('login/download-qrcode.png')"
        alt=""
        @mouseenter="showDownload = true"
        @mouseleave="showDownload = false"
      />
      <div
        v-show="showDownload"
        class="app-qrcode"
      >
        <img
          class="hover-download"
          :src="$fun.getImg('login/下载app.png')"
          alt=""
        />
        <span>扫码下载</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@keyframes fadeInScale {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.login-page {
  position: relative;
  width: 100%;
  height: 100%;
  background: url("@/assets/images/login/login-bg.png") no-repeat center center / 100% 100%;
  font-size: 1.1458vw;
  .login-logo {
    display: flex;
    position: absolute;
    top: 11.1vh; //120px;
    left: 50%;
    transform: translateX(-50%);
    img {
      width: 66.7vw;
      // height: 150px;
    }
  }
  :deep(.form) {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -30%);
    width: 27.1354vw;
    height: 20.125vw; // 增加高度以容纳切换标签
    background: url("@/assets/images/login/login-form-bg.png") no-repeat center center / 100% 100%;
    padding: 2.6042vw;

    // 登录方式切换标签
    .login-mode-switch {
      display: flex;
      justify-content: flex-start;
      margin-bottom: 1vw;
      padding-left: 0.5vw;
      gap: 0.5vw;

      .mode-tab {
        // padding: 0.5vw 0.5vw;
        font-size: 0.7vw;
        font-weight: 600;
        color: #666;
        cursor: pointer;
        border-radius: 0.3vw;
        transition: all 0.3s ease;

        &:hover {
          color: #123c64;
          // background-color: rgba(18, 60, 100, 0.1);
        }

        &.active {
          color: #123c64;
          // background-color: rgba(18, 60, 100, 0.15);
        }
      }
    }

    .box {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      gap: 0.8vw;

      .username,
      .password,
      .phone {
        display: flex;
        align-items: center;
        width: 21.875vw;
        height: 3.525vw;
        padding-left: 3.6458vw;
        padding-right: 1.0417vw;

        .el-input__wrapper {
          background: transparent !important;
          box-shadow: none !important;
          .el-input__inner {
            color: #123c64;
            font-size: 1.0417vw;
            font-weight: 700;
            &::placeholder {
              color: #999;
            }
          }
          .el-input__password {
            color: #123c64 !important;
            font-size: 1.0417vw !important;
          }
        }
      }

      .sms-code {
        display: flex;
        align-items: center;
        width: 21.875vw;
        height: 3.525vw;
        padding-left: 3.6458vw;
        padding-right: 1.0417vw;
        background: url("@/assets/images/login/login-password.png") no-repeat center center / 100% 100%;
        gap: 0.5vw;

        .el-input {
          flex: 1;
          .el-input__wrapper {
            background: transparent !important;
            box-shadow: none !important;
            .el-input__inner {
              color: #123c64;
              font-size: 1.0417vw;
              font-weight: 700;
              &::placeholder {
                color: #999;
              }
            }
          }
        }

        .sms-btn {
          padding: 0.3vw 0.8vw;
          font-size: 0.8vw;
          font-weight: 600;
          color: #123c64;
          background-color: rgba(18, 60, 100, 0.1);
          border-radius: 0.2vw;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;

          &:hover:not(.disabled) {
            background-color: rgba(18, 60, 100, 0.2);
          }

          &.disabled {
            color: #999;
            background-color: rgba(153, 153, 153, 0.1);
            cursor: not-allowed;
          }
        }
      }

      .username {
        background: url("@/assets/images/login/login-username.png") no-repeat center center / 100% 100%;
      }
      .password {
        background: url("@/assets/images/login/login-password.png") no-repeat center center / 100% 100%;
      }
      .phone {
        background: url("@/assets/images/login/login-username.png") no-repeat center center / 100% 100%;
      }
    }

    .btn {
      margin-top: 1.125vw;
      font-weight: 700;
      width: 21.875vw;
      height: 2.9167vw;
      background: url("@/assets/images/login/login-btn-bg.png") no-repeat center center / 100% 100%;
      cursor: pointer;
    }
  }
  .download {
    position: absolute;
    left: 5vw;
    bottom: 10%;
    display: flex;
    justify-content: center;
    align-items: flex-end;
    gap: 0.2083vw;
    .hover-download {
      width: 4.7292vw;
      height: 4.7292vw;
      border-radius: 0.3125vw;
      box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
      cursor: pointer;
    }
    .app-qrcode {
      width: 6.2083vw;
      height: 6.2083vw;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 0.1042vw;
      font-size: 0.625vw;
      border-radius: 0.3125vw;
      background: linear-gradient(180deg, #ffffff 0%, #e2fffa 100%);
      box-shadow: 0 0.5208vw 1.0417vw rgba(0, 0, 0, 0.15);
      animation: fadeInScale 0.3s ease-out;
      transform-origin: bottom left;
      img {
        width: 4.5vw;
        height: 4.5vw;
        animation: pulse 2s infinite ease-in-out;
      }
      span {
        animation: fadeIn 0.5s ease-out 0.2s both;
      }
    }
  }
}
</style>
