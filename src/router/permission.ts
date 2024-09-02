import router from "@/router"
import { useTitle } from "@/hooks/useTitle"
import NProgress from "nprogress"
NProgress.configure({ showSpinner: true })
import "nprogress/nprogress.css"

const { setTitle } = useTitle()
NProgress.configure({ showSpinner: true })
router.beforeEach(async (_, _from, next) => {
  // console.info(to)
  NProgress.start()
  next()
})

router.afterEach((to) => {
  setTitle(to.meta.title as string)
  NProgress.done()
})
