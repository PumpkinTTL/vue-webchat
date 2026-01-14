<template>
  <div class="home-container">
    <a-card class="demo-card" :bordered="false">
      <template #header>
        <div class="card-header">
          <span>Vue3 + Ant Design Vue 示例</span>
          <font-awesome-icon :icon="['fas', 'home']" />
        </div>
      </template>

      <div class="demo-content">
        <h3>计数器示例 (Pinia)</h3>
        <p>当前计数: {{ count }}</p>
        <p>双倍计数: {{ doubleCount }}</p>
        <p>是否为偶数: {{ isEven ? '是' : '否' }}</p>

        <div class="button-group">
          <a-button type="primary" @click="increment">
            <font-awesome-icon :icon="['fas', 'plus']" />
            增加
          </a-button>
          <a-button danger @click="decrement">
            <font-awesome-icon :icon="['fas', 'minus']" />
            减少
          </a-button>
          <a-button @click="reset">
            <font-awesome-icon :icon="['fas', 'refresh']" />
            重置
          </a-button>
        </div>

        <div class="mt-4">
          <a-input-number v-model:value="inputValue" placeholder="输入数字" style="width: 200px; margin-right: 10px;" />
          <a-button @click="setCount(inputValue)">设置计数</a-button>
        </div>

        <div class="mt-4">
          <a-button type="primary" status="success" @click="showFingerprint">
            获取浏览器指纹
          </a-button>
          <p v-if="fingerprint">指纹ID: {{ fingerprint }}</p>
        </div>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useCounterStore } from '@/store/counter'
import { getBrowserFingerprint } from '@/utils/fingerprint'
import { message } from 'ant-design-vue'



const counterStore = useCounterStore()
const { count, doubleCount, isEven } = storeToRefs(counterStore)
const { increment, decrement, reset, setCount } = counterStore

const inputValue = ref<number>(0)
const fingerprint = ref('')

const showFingerprint = async () => {
  try {
    fingerprint.value = await getBrowserFingerprint()
    message.success('获取指纹成功')
  } catch (error) {
    message.error('获取指纹失败')
  }
}
</script>

<style scoped lang="scss">
@import "@/styles/variables.scss";

.home-container {
  padding: $spacing-lg;
}

.demo-card {
  max-width: 600px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.demo-content {
  text-align: center;
}

.button-group {
  margin: $spacing-md 0;

  .ant-btn {
    margin: 0 $spacing-xs;
  }
}

.mt-4 {
  margin-top: $spacing-md;
}
</style>
