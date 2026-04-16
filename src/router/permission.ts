import router from "@/router"
import axiosController from "@/utils/axios-controller"
import { useTitle } from "@/hooks/useTitle"
import NProgress from "nprogress"
NProgress.configure({ showSpinner: true })
import "nprogress/nprogress.css"
const whiteList = ["/login", "/404", "/403", "/MB"]
const { setTitle } = useTitle()
NProgress.configure({ showSpinner: true })
router.beforeEach(async (to, _from, next) => {
  // 路由切换时取消上一个页面中的所有axios-pending的请求
  axiosController.removeAllPending()
  NProgress.start()
  const toPath = to.path
  if (whiteList.includes(toPath)) {
    next()
  } else {
    const token = getToken()
    if (token) {
      next()
    } else {
      ElMessage.info("登录信息已失效,请重新登录")
      next("/login?redirect=" + toPath)
    }
  }
  // next()
})

router.afterEach((to) => {
  setTitle(to.meta.title as string)
  NProgress.done()
})
