<script lang="ts" setup>
import { RouterLink } from "vue-router"
import ScrollPane from "./ScrollPane.vue"
const instance = getCurrentInstance()
const tagsViewStore = useTagsViewStore()
const { visitedViews, activeTag } = storeToRefs(tagsViewStore)
/** 标签页组件元素的引用数组 */
const tagRefs = ref<InstanceType<typeof RouterLink>[]>([])
/** 右键菜单的状态 */
const visible = ref(false)
/** 右键菜单的 top 位置 */
const top = ref(0)
/** 右键菜单的 left 位置 */
const left = ref(0)
/** 当前正在右键操作的标签页 */
const selectedTag = ref<any>({})
const router = useRouter()
const route = useRoute()
/** 刷新当前正在右键操作的标签页 */
const refreshSelectedTag = (view: any) => {
  tagsViewStore.delCachedView(view)
  router.replace({ path: "/redirect" + view.path, query: view.query })
}
/** 关闭当前正在右键操作的标签页 */
const closeSelectedTag = (view: any) => {
  tagsViewStore.delVisitedView(view)
  tagsViewStore.delCachedView(view)
  isActive(view) && toLastView(tagsViewStore.visitedViews)
}
/** 判断标签页是否激活 */
const isActive = (tag: any) => {
  return tag.path === route.path
}

/** 跳转到最后一个标签页 */
const toLastView = (visitedViews: any[]) => {
  const latestView = visitedViews.slice(-1)[0]
  const path = latestView?.path
  if (path !== undefined) {
    router.push(path)
  } else {
    // 如果没有最后一个标签，则跳转到首页
    router.push("/")
  }
}
/** 关闭其他标签页 */
const closeOthersTags = () => {
  const path = selectedTag.value.path
  if (path !== route.path && path !== undefined) {
    router.push(path)
  }
  tagsViewStore.delOthersVisitedViews(selectedTag.value)
  tagsViewStore.delOthersCachedViews(selectedTag.value)
}
/** 关闭所有标签页 */
const closeAllTags = () => {
  tagsViewStore.delAllVisitedViews()
  tagsViewStore.delAllCachedViews()
  toLastView(tagsViewStore.visitedViews)
}
/** 打开右键菜单面板 需要父组件css设置relative属性*/
const openMenu = (tag: any, e: MouseEvent) => {
  const menuMinWidth = 105
  // 当前组件距离浏览器左端的距离
  const offsetLeft = instance!.proxy!.$el.getBoundingClientRect().left
  // 当前组件宽度
  const offsetWidth = instance!.proxy!.$el.offsetWidth
  // 面板的最大左边距
  const maxLeft = offsetWidth - menuMinWidth
  // 面板距离鼠标指针的距离
  const left15 = e.clientX - offsetLeft + 15
  left.value = left15 > maxLeft ? maxLeft : left15
  top.value = e.clientY
  // 显示面板
  visible.value = true
  // 更新当前正在右键操作的标签页
  selectedTag.value = tag
}

/** 关闭右键菜单面板 */
const closeMenu = () => {
  visible.value = false
}

watch(visible, (value) => {
  value ? document.body.addEventListener("click", closeMenu) : document.body.removeEventListener("click", closeMenu)
})
</script>

<template>
  <div class="tags-view-container">
    <ScrollPane
      class="tags-view-wrapper"
      :tag-refs="tagRefs"
    >
      <router-link
        ref="tagRefs"
        v-for="tag in visitedViews"
        :key="tag.path"
        class="tags-view-item"
        :class="{ active: activeTag.path === tag.path }"
        :to="{ path: tag.path, query: tag.query }"
        @contextmenu.prevent="openMenu(tag, $event)"
      >
        {{ tag.meta?.title }}
        <el-icon
          :size="12"
          @click.prevent.stop="closeSelectedTag(tag)"
        >
          <i-ep-close />
        </el-icon>
      </router-link>
    </ScrollPane>
    <ul
      v-show="visible"
      class="contextmenu"
      :style="{ left: left + 'px', top: top + 'px' }"
    >
      <li @click="refreshSelectedTag(selectedTag)">刷新</li>
      <li @click="closeSelectedTag(selectedTag)">关闭</li>
      <li @click="closeOthersTags">关闭其它</li>
      <li @click="closeAllTags">关闭所有</li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
.tags-view-container {
  width: 100%;
  height: 34px;
  background-color: #fff;
  box-shadow: 0 0 3px 0 rgba(0, 0, 0, 0.06);
  .tags-view-wrapper {
    .tags-view-item {
      display: inline-block;
      position: relative;
      cursor: pointer;
      height: 26px;
      line-height: 26px;
      border: 1px solid #d8dce5;
      border-radius: 2px;
      color: var(--v3-tagsview-tag-text-color);
      background-color: var(--v3-tagsview-tag-bg-color);
      padding: 0 8px;
      font-size: 12px;
      margin-left: 5px;
      margin-top: 4px;
      &:first-of-type {
        margin-left: 5px;
      }
      &:last-of-type {
        margin-right: 5px;
      }
      &.active {
        background-color: var(--v3-tagsview-tag-active-bg-color);
        color: var(--v3-tagsview-tag-active-text-color);
        border-color: var(--v3-tagsview-tag-active-border-color);
        &::before {
          content: "";
          background-color: var(--v3-tagsview-tag-active-before-color);
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          position: relative;
          margin-right: 2px;
        }
      }
      .el-icon {
        margin: 0 2px;
        vertical-align: middle;
        border-radius: 50%;
        &:hover {
          background-color: var(--v3-tagsview-tag-icon-hover-bg-color);
          color: var(--v3-tagsview-tag-icon-hover-color);
        }
      }
    }
  }
  .contextmenu {
    margin: 0;
    background-color: #fff;
    z-index: 3000;
    position: absolute;
    list-style-type: none;
    padding: 5px 0;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 400;
    color: #333;
    box-shadow: 2px 2px 3px 0 #00000030;
    li {
      margin: 0;
      padding: 7px 16px;
      cursor: pointer;
      &:hover {
        background-color: #eee;
      }
    }
  }
}
</style>
