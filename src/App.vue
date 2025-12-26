<template>
  <div id="app">
    <a-config-provider>
      <a-layout class="app-layout">
        <a-layout-header class="app-header">
          <div class="header-content">
            <h1>{{ title }}</h1>
            <a-menu
              mode="horizontal"
              :selected-keys="[$route.path]"
              class="header-menu"
              @menu-item-click="handleMenuClick"
            >
              <a-menu-item key="/">
                <font-awesome-icon :icon="['fas', 'home']" />
                首页
              </a-menu-item>
              <a-menu-item key="/about">
                <font-awesome-icon :icon="['fas', 'cog']" />
                关于
              </a-menu-item>
              <a-menu-item key="/icon-test">
                <font-awesome-icon :icon="['fas', 'eye']" />
                图标测试
              </a-menu-item>
            </a-menu>
          </div>
        </a-layout-header>

        <a-layout-content class="app-main">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </a-layout-content>
      </a-layout>
    </a-config-provider>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

function sayHello() {
  pywebview.api.say_hello('弟弟')
}
// 这里可以添加全局逻辑
const title = ref('标题')

const router = useRouter()

const handleMenuClick = (key: string) => {
  router.push(key)
}
</script>

<style lang="scss">
@import "@/styles/variables.scss";

#app {
  min-height: 100vh;
}

.app-layout {
  min-height: 100vh;
}

.app-header {
  background-color: $bg-color;
  border-bottom: 1px solid $border-base;
  padding: 0;
  line-height: normal;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 $spacing-lg;

  h1 {
    margin: 0;
    color: $primary-color;
  }
}

.header-menu {
  border-bottom: none;
  background: transparent;
}

.app-main {
  padding: 0;
  background-color: $bg-color-page;
}

// 页面切换动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
