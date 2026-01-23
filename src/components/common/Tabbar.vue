<template>
  <div class="tabbar-container">
    <div class="solid-capsule" ref="navRef">
      <!-- Background Pill (Sliding) -->
      <div class="active-bg" :style="pillStyle"></div>

      <!-- Tab Items -->
      <div
        v-for="(tab, index) in tabs"
        :key="index"
        ref="itemRefs"
        class="nav-item"
        :class="{ 'is-active': modelValue === index }"
        @click="selectTab(index)"
      >
        <div class="icon-wrapper">
          <span class="icon-box">
            <font-awesome-icon :icon="tab.icon" />
          </span>
          <!-- Badge -->
          <transition name="scale-fade">
            <span v-if="tab.badge && tab.badge > 0" class="badge">
              {{ tab.badge > 99 ? '99+' : tab.badge }}
            </span>
          </transition>
        </div>
        <span class="label-text">{{ tab.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from "vue";

export interface TabItem {
  label: string;
  icon: string | string[];
  badge?: number;
}

const props = defineProps<{
  modelValue: number;
  tabs: TabItem[];
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: number): void;
}>();

const navRef = ref<HTMLElement | null>(null);
const itemRefs = ref<HTMLElement[]>([]);
const pillStyle = ref({
  width: "0px",
  transform: "translateX(0px)",
  opacity: 0,
});

const selectTab = (index: number) => {
  emit("update:modelValue", index);
};

const updatePillPosition = () => {
  if (!navRef.value || !itemRefs.value[props.modelValue]) return;

  const activeEl = itemRefs.value[props.modelValue];

  if (activeEl) {
    pillStyle.value = {
      width: `${activeEl.offsetWidth}px`,
      transform: `translateX(${activeEl.offsetLeft}px)`,
      opacity: 1,
    };
  }
};

watch(
  () => props.modelValue,
  () => {
    nextTick(() => {
      updatePillPosition();
    });
  },
);

onMounted(() => {
  // Use ResizeObserver for robust size tracking
  const resizeObserver = new ResizeObserver(() => {
    updatePillPosition();
  });

  if (navRef.value) {
    resizeObserver.observe(navRef.value);
  }

  // Initial calculation
  nextTick(() => {
    updatePillPosition();
  });
});
</script>

<style lang="scss" scoped>
@use "@/styles/variables.scss" as *;

.tabbar-container {
  position: fixed;
  bottom: 32px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  pointer-events: none;
  z-index: 1000;
}

.solid-capsule {
  pointer-events: auto;
  position: relative;
  display: flex;
  align-items: center;
  padding: 4px;
  background: #ffffff; // Solid White
  border-radius: 999px; // Full pill shape
  box-shadow:
    0 8px 20px -4px rgba(0, 0, 0, 0.1),
    0 4px 8px -2px rgba(0, 0, 0, 0.05),
    0 0 0 1px rgba(0, 0, 0, 0.02);
  
  // Dark Mode Override
  :global(.dark-mode) & {
    background: #1e293b; // Slate-800
    box-shadow: 
      0 10px 25px -5px rgba(0, 0, 0, 0.5),
      0 0 0 1px rgba(255, 255, 255, 0.08);
  }
}

.active-bg {
  position: absolute;
  top: 4px;
  bottom: 4px;
  left: 0;
  background: $primary-color;
  border-radius: 999px;
  // Springy animation curve
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); 
  z-index: 0;
  box-shadow: 0 4px 12px rgba($primary-color, 0.3);
}

.nav-item {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6px 20px; // Compact padding
  min-width: 72px;   // Compact width
  cursor: pointer;
  border-radius: 999px;
  color: $text-secondary;
  transition: all 0.2s ease;
  user-select: none;
  -webkit-tap-highlight-color: transparent;

  // Jelly Click Effect
  &:active {
    transform: scale(0.92);
  }

  .icon-wrapper {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 2px;
  }

  .icon-box {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 18px;
    height: 20px;
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .label-text {
    font-size: 11px;
    font-weight: 500;
    line-height: 1.2;
    transition: all 0.3s ease;
    opacity: 0.8;
  }

  // Active State
  &.is-active {
    color: #ffffff;

    .icon-box {
      transform: translateY(-2px) scale(1.15); // Dynamic lift
    }

    .label-text {
      opacity: 1;
      font-weight: 600;
    }
  }

  // Hover State
  &:hover:not(.is-active) {
    color: $primary-color;
    
    :global(.dark-mode) & {
      color: $text-primary-dark;
    }

    .icon-box {
      transform: translateY(-1px);
    }
  }
  
  // Dark Mode Text
  :global(.dark-mode) & {
    color: $text-tertiary-dark;
    
    &.is-active {
      color: #ffffff;
    }
  }
}

// Badge Styles
.badge {
  position: absolute;
  top: -6px;
  right: -8px;
  background-color: #ef4444; // Red-500
  color: white;
  font-size: 10px;
  font-weight: 700;
  height: 16px;
  min-width: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 99px; // Pill shape
  padding: 0 4px;
  border: 2px solid #ffffff; // Contrast border
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 10;
  line-height: 1;
  
  :global(.dark-mode) & {
    border-color: #1e293b; // Match dark background
  }
}

// Badge Animation
.scale-fade-enter-active,
.scale-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.scale-fade-enter-from,
.scale-fade-leave-to {
  transform: scale(0);
  opacity: 0;
}
</style>