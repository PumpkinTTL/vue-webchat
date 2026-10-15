<template>
  <a-drawer
    :open="open"
    placement="right"
    width="min(560px, 100vw)"
    root-class-name="chat-history-drawer"
    :body-style="{ padding: '0' }"
    @close="closePanel"
    @update:open="handleOpenChange"
  >
    <template #title>
      <div class="chp-header">
        <div class="chp-header__icon">
          <font-awesome-icon :icon="['fas', 'clock']" />
        </div>
        <div class="chp-header__text">
          <h2 class="chp-header__title">聊天记录</h2>
          <p class="chp-header__subtitle">搜索 · 媒体库 · 统计</p>
        </div>
      </div>
    </template>

    <a-tabs
      v-model:active-key="activeTab"
      class="chp-tabs"
      @change="handleTabChange"
    >
      <!-- ==================== 搜索 ==================== -->
      <a-tab-pane key="search" tab="搜索">
        <div class="chp-pane">
          <div class="chp-toolbar">
            <div class="chp-search">
              <span class="chp-search__icon">
                <font-awesome-icon :icon="['fas', 'search']" />
              </span>
              <a-input
                v-model:value="keyword"
                class="chp-search__input"
                placeholder="搜索聊天内容…"
                allow-clear
                @press-enter="performSearch(true)"
              />
            </div>
            <button
              class="chp-btn chp-btn--primary"
              :disabled="searchLoading"
              @click="performSearch(true)"
            >
              搜索
            </button>
          </div>

          <div class="chp-chips">
            <button
              v-for="opt in TYPE_OPTIONS"
              :key="opt.value"
              class="chp-chip"
              :class="{ 'is-active': typeFilter === opt.value }"
              @click="setTypeFilter(opt.value)"
            >
              {{ opt.label }}
            </button>
          </div>

          <div class="chp-dates">
            <a-date-picker
              v-model:value="dateFrom"
              value-format="YYYY-MM-DD"
              class="chp-date"
              placeholder="开始日期"
            />
            <span class="chp-dates__sep">至</span>
            <a-date-picker
              v-model:value="dateTo"
              value-format="YYYY-MM-DD"
              class="chp-date"
              placeholder="结束日期"
            />
            <button class="chp-btn chp-btn--ghost" @click="resetFilters">重置</button>
          </div>
        </div>

        <div class="chp-scroll">
          <div v-if="searchDone" class="chp-meta">
            共 <strong>{{ searchTotal }}</strong> 条结果
          </div>

          <div v-if="searchLoading && searchResults.length === 0" class="chp-loading">
            <a-spin />
          </div>

          <a-empty
            v-else-if="searchDone && searchResults.length === 0"
            description="没有找到相关记录"
          />

          <div v-else-if="!searchDone && searchResults.length === 0" class="chp-hint">
            输入关键词，或选择类型 / 日期范围后开始搜索
          </div>

          <div v-else class="chp-list">
            <button
              v-for="msg in searchResults"
              :key="msg.id"
              class="chp-item"
              @click="openMessage(msg)"
            >
              <div class="chp-item__avatar">
                <img v-if="avatarOf(msg)" :src="avatarOf(msg)" :alt="nicknameOf(msg)" />
                <span v-else>{{ nicknameOf(msg).charAt(0) }}</span>
              </div>

              <!-- 图片 / 视频：左侧小缩略图，文字作为辅助信息保留 -->
              <div v-if="isThumbable(msg)" class="chp-item__thumb">
                <img
                  v-if="thumbOf(msg) && !failedThumbs[msg.id]"
                  :src="thumbOf(msg)"
                  alt=""
                  loading="lazy"
                  @error="markThumbFailed(msg.id)"
                />
                <span v-else class="chp-item__thumb-fallback">
                  <font-awesome-icon :icon="['fas', msg.type === 'video' ? 'video' : 'image']" />
                </span>
                <span v-if="msg.type === 'video'" class="chp-item__thumb-play">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              </div>

              <div class="chp-item__body">
                <div class="chp-item__top">
                  <span class="chp-item__name">{{ nicknameOf(msg) }}</span>
                  <span class="chp-item__time">{{ formatDateTime(msg.time) }}</span>
                </div>
                <div class="chp-item__summary">
                  <span v-if="typeBadge(msg.type)" class="chp-item__badge">
                    {{ typeBadge(msg.type) }}
                  </span>
                  <span v-if="summaryOf(msg)" class="chp-item__text">{{ summaryOf(msg) }}</span>
                </div>
              </div>
            </button>

            <button
              v-if="searchHasMore"
              class="chp-more"
              :disabled="searchLoading"
              @click="loadMoreSearch"
            >
              {{ searchLoading ? '加载中…' : '加载更多' }}
            </button>
          </div>
        </div>
      </a-tab-pane>

      <!-- ==================== 媒体库 ==================== -->
      <a-tab-pane key="media" tab="媒体库">
        <div class="chp-pane">
          <div class="chp-chips">
            <button
              v-for="opt in MEDIA_TYPES"
              :key="opt.value"
              class="chp-chip"
              :class="{ 'is-active': mediaType === opt.value }"
              @click="setMediaType(opt.value)"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>

        <div class="chp-scroll">
          <div v-if="mediaLoading && mediaItems.length === 0" class="chp-loading">
            <a-spin />
          </div>

          <a-empty
            v-else-if="mediaDone && mediaItems.length === 0"
            description="暂无媒体内容"
          />

          <div v-else-if="mediaItems.length === 0" class="chp-hint">
            正在准备媒体库…
          </div>

          <template v-else>
            <div v-if="isGrid" class="chp-grid">
              <button
                v-for="m in mediaItems"
                :key="m.id"
                class="chp-cell"
                @click="openMessage(m)"
              >
                <img v-if="thumbOf(m)" :src="thumbOf(m)" alt="" loading="lazy" />
                <div v-else class="chp-cell__placeholder">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <path d="M3 15l5-4 4 3 3-2 6 5" />
                  </svg>
                </div>
                <span v-if="m.type === 'video'" class="chp-cell__play">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
                <span v-if="m.type === 'video' && m.videoDuration" class="chp-cell__dur">
                  {{ formatDuration(m.videoDuration) }}
                </span>
              </button>
            </div>

            <div v-else class="chp-list">
              <button
                v-for="m in mediaItems"
                :key="m.id"
                class="chp-file"
                @click="openMessage(m)"
              >
                <div class="chp-file__icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
                    <path d="M13 2v7h7" />
                  </svg>
                </div>
                <div class="chp-file__body">
                  <div class="chp-file__name">{{ mediaName(m) }}</div>
                  <div class="chp-file__meta">{{ mediaMeta(m) }}</div>
                </div>
              </button>
            </div>

            <button
              v-if="mediaHasMore"
              class="chp-more"
              :disabled="mediaLoading"
              @click="loadMoreMedia"
            >
              {{ mediaLoading ? '加载中…' : '加载更多' }}
            </button>
          </template>
        </div>
      </a-tab-pane>

      <!-- ==================== 统计 ==================== -->
      <a-tab-pane key="stats" tab="统计">
        <div class="chp-scroll chp-scroll--stats">
          <div v-if="statsLoading && !statistics" class="chp-loading">
            <a-spin />
          </div>

          <template v-else-if="statistics">
            <div class="chp-cards">
              <div
                v-for="c in statCards"
                :key="c.key"
                class="chp-card"
                :class="{ 'chp-card--accent': c.accent }"
              >
                <div class="chp-card__value">{{ c.value }}</div>
                <div class="chp-card__label">{{ c.label }}</div>
              </div>
            </div>

            <div class="chp-span">
              <font-awesome-icon :icon="['fas', 'clock']" />
              <span>时间跨度 {{ timeSpan }}</span>
            </div>

            <div v-if="hasHighlights" class="chp-highlights">
              <div v-if="busiestDay" class="chp-highlight">
                <span class="chp-highlight__icon">
                  <font-awesome-icon :icon="['fas', 'chart-line']" />
                </span>
                <div class="chp-highlight__body">
                  <div class="chp-highlight__value">{{ busiestDay.date }}</div>
                  <div class="chp-highlight__label">
                    最活跃的一天 · <strong>{{ busiestDay.count }}</strong> 条
                  </div>
                </div>
              </div>
              <div v-if="busiestHour" class="chp-highlight">
                <span class="chp-highlight__icon">
                  <font-awesome-icon :icon="['fas', 'clock']" />
                </span>
                <div class="chp-highlight__body">
                  <div class="chp-highlight__value">{{ busiestHour.range }}</div>
                  <div class="chp-highlight__label">
                    最活跃时段 · <strong>{{ busiestHour.count }}</strong> 条
                  </div>
                </div>
              </div>
            </div>

            <section class="chp-block">
              <h3 class="chp-block__title">近 30 天消息趋势</h3>
              <div class="chp-trend">
                <div class="chp-trend__bars">
                  <div
                    v-for="d in trendDays"
                    :key="d.date"
                    class="chp-trend__col"
                    :title="`${d.date} · ${d.count} 条`"
                  >
                    <div class="chp-trend__barcell">
                      <div class="chp-trend__bar" :style="{ height: barHeight(d.count) }"></div>
                    </div>
                    <span class="chp-trend__label">{{ d.showLabel ? d.label : '' }}</span>
                  </div>
                </div>
                <div class="chp-trend__foot">
                  近 30 天共 <strong>{{ trendTotal }}</strong> 条
                </div>
              </div>
            </section>

            <section class="chp-block">
              <h3 class="chp-block__title">发言排行 Top 10</h3>
              <a-empty v-if="topSenders.length === 0" description="暂无数据" />
              <ul v-else class="chp-rank">
                <li v-for="(s, i) in topSenders" :key="s.user_id" class="chp-rank__item">
                  <span class="chp-rank__no" :class="{ 'is-top': i < 3 }">{{ i + 1 }}</span>
                  <div class="chp-rank__avatar">
                    <img v-if="s.avatarUrl" :src="s.avatarUrl" :alt="s.nickname" />
                    <span v-else>{{ (s.nickname || 'U').charAt(0) }}</span>
                  </div>
                  <div class="chp-rank__main">
                    <div class="chp-rank__top">
                      <span class="chp-rank__name">{{ s.nickname || '用户' }}</span>
                      <span class="chp-rank__count">{{ s.count }}</span>
                    </div>
                    <div class="chp-rank__track">
                      <div class="chp-rank__fill" :style="{ width: s.percent + '%' }"></div>
                    </div>
                  </div>
                </li>
              </ul>
            </section>

            <section v-if="myRank" class="chp-block">
              <h3 class="chp-block__title">我的发言</h3>
              <div class="chp-mine">
                <div class="chp-mine__stat">
                  <div class="chp-mine__num">{{ myRank.count }}</div>
                  <div class="chp-mine__label">我的发言数</div>
                </div>
                <div class="chp-mine__divider"></div>
                <div class="chp-mine__stat">
                  <div class="chp-mine__num">
                    第 {{ myRank.rank }} 名
                    <span v-if="myRank.total" class="chp-mine__sub">/ 共 {{ myRank.total }} 人</span>
                  </div>
                  <div class="chp-mine__label">我的排名</div>
                </div>
              </div>
            </section>
          </template>

          <a-empty v-else description="暂无统计数据" />
        </div>
      </a-tab-pane>
    </a-tabs>
  </a-drawer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { message as antMessage } from 'ant-design-vue'
import { searchMessages, getMessageStatistics } from '@/apis/message'
import type { Message, MessageStatistics } from '@/apis/message'

const props = defineProps<{ open: boolean; roomId: number }>()
const emit = defineEmits<{ 'update:open': [v: boolean]; jump: [messageId: number] }>()

const serverUrl = import.meta.env.VITE_SERVER_URL || ''

// ==================== 常量 ====================
const TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: '全部' },
  { value: 'text', label: '文本' },
  { value: 'image', label: '图片' },
  { value: 'video', label: '视频' },
  { value: 'audio', label: '音频' },
  { value: 'file', label: '文件' }
]

type MediaType = 'image' | 'video' | 'audio' | 'file'
const MEDIA_TYPES: { value: MediaType; label: string }[] = [
  { value: 'image', label: '图片' },
  { value: 'video', label: '视频' },
  { value: 'audio', label: '音频' },
  { value: 'file', label: '文件' }
]

const PAGE_SIZE = 20

// ==================== 通用状态 ====================
const activeTab = ref<string | number>('search')

// 搜索
const keyword = ref('')
const typeFilter = ref('')
const dateFrom = ref<string | null>(null)
const dateTo = ref<string | null>(null)
const searchResults = ref<Message[]>([])
const searchTotal = ref(0)
const searchHasMore = ref(false)
const searchPage = ref(1)
const searchDone = ref(false)
const searchLoading = ref(false)

// 媒体库
const mediaType = ref<MediaType>('image')
const mediaItems = ref<Message[]>([])
const mediaHasMore = ref(false)
const mediaPage = ref(1)
const mediaDone = ref(false)
const mediaLoading = ref(false)

// 统计
const statistics = ref<MessageStatistics | null>(null)
const statsLoading = ref(false)
const statsLoaded = ref(false)

// ==================== 工具函数 ====================
function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`
}

function parseDate(input: string): Date {
  const d = new Date(input)
  if (!Number.isNaN(d.getTime())) return d
  return new Date(input.replace(/-/g, '/'))
}

/** 绝对时刻，如 10/15 14:30 */
function formatDateTime(input?: string | number | null): string {
  if (input === null || input === undefined || input === '') return '—'
  const d = typeof input === 'number' ? new Date(input * 1000) : parseDate(input)
  if (Number.isNaN(d.getTime())) return String(input)
  return `${d.getMonth() + 1}/${d.getDate()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** 只取日期部分，如 10/15（跨年时补上年份） */
function formatDay(input?: string | number | null): string {
  if (input === null || input === undefined || input === '') return '—'
  const d = typeof input === 'number' ? new Date(input * 1000) : parseDate(input)
  if (Number.isNaN(d.getTime())) return String(input).slice(0, 10)
  const md = `${d.getMonth() + 1}/${d.getDate()}`
  return d.getFullYear() === new Date().getFullYear() ? md : `${d.getFullYear()}/${md}`
}

function resolveUrl(url?: string): string {
  if (!url) return ''
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('blob:') ||
    url.startsWith('data:')
  ) {
    return url
  }
  return serverUrl + (url.startsWith('/') ? url : `/${url}`)
}

function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return ''
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.min(sizes.length - 1, Math.floor(Math.log(bytes) / Math.log(k)))
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`
}

function formatDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return ''
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${pad(s)}`
}

function nicknameOf(m: Message): string {
  return m.sender?.nickname || '用户'
}

function avatarOf(m: Message): string {
  return resolveUrl(m.sender?.avatar)
}

function typeBadge(type: string): string {
  switch (type) {
    case 'image':
      return '[图片]'
    case 'video':
      return '[视频]'
    case 'audio':
    case 'voice':
      return '[音频]'
    case 'file':
      return '[文件]'
    default:
      return ''
  }
}

function summaryOf(m: Message): string {
  switch (m.type) {
    case 'audio':
    case 'voice':
      return m.audioName || ''
    case 'file':
      return m.fileName || ''
    case 'image':
    case 'video':
      return ''
    default:
      return m.text || ''
  }
}

function mediaName(m: Message): string {
  return m.fileName || m.audioName || m.text || '未命名文件'
}

function mediaMeta(m: Message): string {
  const parts: string[] = []
  const size = formatFileSize(m.fileSize)
  if (size) parts.push(size)
  parts.push(formatDateTime(m.time))
  return parts.join(' · ')
}

function thumbOf(m: Message): string {
  if (m.type === 'image') return resolveUrl(m.imageUrl || m.text)
  if (m.type === 'video') return resolveUrl(m.videoThumbnail)
  return ''
}

/** 图片 / 视频在搜索结果里展示为左侧小缩略图 */
function isThumbable(m: Message): boolean {
  return m.type === 'image' || m.type === 'video'
}

/** 缩略图加载失败兜底（按消息 id 记录） */
const failedThumbs = ref<Record<string | number, boolean>>({})

function markThumbFailed(id: string | number): void {
  failedThumbs.value[id] = true
}

// ==================== 统计派生 ====================
// 后端新增字段（接口类型未声明，做可选访问兜底，缺失时不崩）
interface ExtraStats {
  busiest_day?: { date: string; count: number } | null
  busiest_hour?: { hour: number; count: number } | null
  media_total?: number
  rank?: { my_count: number; my_rank: number; senders_total: number } | null
}

const extraStats = computed<ExtraStats>(() => {
  /**
   * MessageStatistics 未声明新字段，这里做一次窄化后的可选读取；
   * 后端字段缺失时返回空对象，下游一律走 null 兜底不渲染。
   */
  const s = statistics.value as (MessageStatistics & ExtraStats) | null
  return s || {}
})

const statCards = computed(() => {
  const bt = statistics.value?.by_type || {}
  const pick = (keys: string[]) => keys.reduce((sum, k) => sum + (bt[k] || 0), 0)
  const cards = [
    { key: 'total', label: '总消息数', value: statistics.value?.total ?? 0, accent: true },
    { key: 'text', label: '文本', value: pick(['text', 'normal']), accent: false },
    { key: 'image', label: '图片', value: pick(['image']), accent: false },
    { key: 'video', label: '视频', value: pick(['video']), accent: false },
    { key: 'audio', label: '音频', value: pick(['audio', 'voice']), accent: false },
    { key: 'file', label: '文件', value: pick(['file']), accent: false }
  ]
  // 媒体总数（图片 + 视频 + 音频），接口未返回时补一项不上屏
  const mediaTotal = extraStats.value.media_total
  if (typeof mediaTotal === 'number') {
    cards.push({ key: 'media', label: '媒体总数', value: mediaTotal, accent: false })
  }
  return cards
})

/** 最活跃的一天 / 时段（缺失则不渲染对应块） */
const busiestDay = computed(() => {
  const b = extraStats.value.busiest_day
  if (!b || !b.date) return null
  return { date: formatDay(b.date), count: b.count ?? 0 }
})

const busiestHour = computed(() => {
  const b = extraStats.value.busiest_hour
  if (!b || typeof b.hour !== 'number') return null
  const start = pad(((b.hour % 24) + 24) % 24)
  const end = pad((((b.hour + 1) % 24) + 24) % 24)
  return { range: `${start}:00-${end}:00`, count: b.count ?? 0 }
})

const hasHighlights = computed(() => !!busiestDay.value || !!busiestHour.value)

/** 我的发言数与排名 */
const myRank = computed(() => {
  const r = extraStats.value.rank
  if (!r || typeof r.my_rank !== 'number') return null
  return {
    count: r.my_count ?? 0,
    rank: r.my_rank,
    total: r.senders_total ?? 0
  }
})

const timeSpan = computed(() => {
  const first = statistics.value?.first_time
  const last = statistics.value?.last_time
  if (!first && !last) return '暂无记录'
  return `${formatDateTime(first)} ~ ${formatDateTime(last)}`
})

const trendDays = computed(() => {
  const map = new Map<string, number>()
  for (const item of statistics.value?.by_day || []) {
    const key = String(item.date).slice(0, 10)
    map.set(key, (map.get(key) || 0) + (item.count || 0))
  }

  const today = new Date()
  const result: { date: string; label: string; count: number; showLabel: boolean }[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i)
    const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
    result.push({
      date: key,
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      count: map.get(key) || 0,
      showLabel: i % 5 === 0
    })
  }
  return result
})

const trendTotal = computed(() => trendDays.value.reduce((sum, d) => sum + d.count, 0))

const maxTrend = computed(() => Math.max(1, ...trendDays.value.map((d) => d.count)))

function barHeight(count: number): string {
  return `${Math.max(2, Math.round((count / maxTrend.value) * 100))}%`
}

const topSenders = computed(() => {
  const list = [...(statistics.value?.by_sender || [])].sort((a, b) => b.count - a.count).slice(0, 10)
  const max = list[0]?.count || 1
  return list.map((s) => ({
    ...s,
    avatarUrl: resolveUrl(s.avatar),
    percent: Math.max(4, Math.round((s.count / max) * 100))
  }))
})

// 媒体库网格：图片 / 视频用网格，音频 / 文件用列表
const isGrid = computed(() => mediaType.value === 'image' || mediaType.value === 'video')

// ==================== 数据加载 ====================
async function performSearch(reset = false): Promise<void> {
  if (!props.roomId) return

  if (reset) {
    searchPage.value = 1
    searchResults.value = []
    searchHasMore.value = false
  }

  searchLoading.value = true
  try {
    const res = await searchMessages({
      room_id: props.roomId,
      keyword: keyword.value.trim() || undefined,
      type: typeFilter.value || undefined,
      date_from: dateFrom.value || undefined,
      date_to: dateTo.value || undefined,
      page: searchPage.value,
      limit: PAGE_SIZE
    })
    if (res.code === 0 && res.data) {
      const list = res.data.messages || []
      searchResults.value = reset ? list : [...searchResults.value, ...list]
      searchTotal.value = res.data.total ?? searchResults.value.length
      searchHasMore.value = !!res.data.has_more
      searchDone.value = true
    } else {
      antMessage.error(res.msg || '搜索失败')
    }
  } catch (err: any) {
    antMessage.error(err?.message || '搜索失败，请稍后重试')
  } finally {
    searchLoading.value = false
  }
}

function loadMoreSearch(): void {
  if (!searchHasMore.value || searchLoading.value) return
  searchPage.value += 1
  void performSearch(false)
}

async function loadMedia(reset = false): Promise<void> {
  if (!props.roomId) return

  if (reset) {
    mediaPage.value = 1
    mediaItems.value = []
    mediaHasMore.value = false
  }

  mediaLoading.value = true
  try {
    const res = await searchMessages({
      room_id: props.roomId,
      type: mediaType.value,
      page: mediaPage.value,
      limit: PAGE_SIZE
    })
    if (res.code === 0 && res.data) {
      const list = res.data.messages || []
      mediaItems.value = reset ? list : [...mediaItems.value, ...list]
      mediaHasMore.value = !!res.data.has_more
      mediaDone.value = true
    } else {
      antMessage.error(res.msg || '媒体库加载失败')
    }
  } catch (err: any) {
    antMessage.error(err?.message || '媒体库加载失败，请稍后重试')
  } finally {
    mediaLoading.value = false
  }
}

function loadMoreMedia(): void {
  if (!mediaHasMore.value || mediaLoading.value) return
  mediaPage.value += 1
  void loadMedia(false)
}

async function loadStatistics(): Promise<void> {
  if (!props.roomId) return

  statsLoading.value = true
  try {
    const res = await getMessageStatistics(props.roomId)
    if (res.code === 0 && res.data) {
      statistics.value = res.data
      statsLoaded.value = true
    } else {
      antMessage.error(res.msg || '统计数据加载失败')
    }
  } catch (err: any) {
    antMessage.error(err?.message || '统计数据加载失败，请稍后重试')
  } finally {
    statsLoading.value = false
  }
}

// ==================== 交互 ====================
function resetState(): void {
  keyword.value = ''
  typeFilter.value = ''
  dateFrom.value = null
  dateTo.value = null

  searchResults.value = []
  searchTotal.value = 0
  searchHasMore.value = false
  searchPage.value = 1
  searchDone.value = false
  searchLoading.value = false

  mediaType.value = 'image'
  mediaItems.value = []
  mediaHasMore.value = false
  mediaPage.value = 1
  mediaDone.value = false
  mediaLoading.value = false

  statistics.value = null
  statsLoaded.value = false
}

function closePanel(): void {
  emit('update:open', false)
}

function handleOpenChange(v: boolean): void {
  if (!v) emit('update:open', false)
}

function openMessage(m: Message): void {
  const id = Number(m.id)
  if (!Number.isFinite(id)) {
    antMessage.warning('该消息无法定位')
    return
  }
  emit('jump', id)
  emit('update:open', false)
}

function setTypeFilter(value: string): void {
  if (typeFilter.value === value) return
  typeFilter.value = value
  void performSearch(true)
}

function setMediaType(value: MediaType): void {
  if (mediaType.value === value) return
  mediaType.value = value
  mediaDone.value = false
  void loadMedia(true)
}

function resetFilters(): void {
  keyword.value = ''
  typeFilter.value = ''
  dateFrom.value = null
  dateTo.value = null
  void performSearch(true)
}

function handleTabChange(key: string | number): void {
  activeTab.value = key
  if (key === 'search' && !searchDone.value) void performSearch(true)
  if (key === 'media' && !mediaDone.value) void loadMedia(true)
  if (key === 'stats' && !statsLoaded.value) void loadStatistics()
}

// ==================== 生命周期 ====================
watch(
  () => props.open,
  (v) => {
    if (!v) return
    resetState()
    activeTab.value = 'search'
    void performSearch(true)
  }
)

watch(
  () => props.roomId,
  () => {
    if (!props.open) return
    resetState()
    activeTab.value = 'search'
    void performSearch(true)
  }
)
</script>

<style lang="scss" scoped>
// 变量已通过 vite.config.ts 全局注入

// ==================== 抽屉头部 ====================
.chp-header {
  display: flex;
  align-items: center;
  gap: $spacing-sm + 4px;
  padding: 2px 0;
}

.chp-header__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border-radius: $border-radius-sm;
  background: rgba($primary-color, 0.1);
  color: $primary-color;
  font-size: 15px;
}

.chp-header__text {
  min-width: 0;
}

.chp-header__title {
  margin: 0;
  font-family: $font-family-heading;
  font-size: $font-size-lg;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  line-height: 1.3;
}

.chp-header__subtitle {
  margin: 1px 0 0;
  font-size: $font-size-xs;
  color: $text-tertiary;
  letter-spacing: 0.3px;
}

// ==================== 面板与滚动容器 ====================
.chp-pane,
.chp-scroll {
  padding: 0 $spacing-lg;
}

.chp-pane {
  padding-top: $spacing-md;
}

.chp-scroll {
  padding-top: $spacing-md;
  padding-bottom: $spacing-xl;
  min-height: 160px;

  &--stats {
    padding-top: $spacing-md;
  }
}

.chp-loading {
  display: flex;
  justify-content: center;
  padding: $spacing-2xl 0;
}

.chp-hint {
  padding: $spacing-2xl $spacing-md;
  text-align: center;
  font-size: $font-size-sm;
  color: $text-tertiary;
}

.chp-meta {
  margin-bottom: $spacing-sm;
  font-size: $font-size-xs;
  color: $text-tertiary;

  strong {
    color: $primary-color;
    font-variant-numeric: tabular-nums;
  }
}

// ==================== 搜索工具区 ====================
.chp-toolbar {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
}

.chp-search {
  position: relative;
  flex: 1;
  min-width: 0;

  &__icon {
    position: absolute;
    top: 50%;
    left: 11px;
    transform: translateY(-50%);
    color: $text-placeholder;
    font-size: 12px;
    pointer-events: none;
  }

  &__input {
    :deep(.ant-input) {
      padding-left: 32px;
    }
  }
}

.chp-btn {
  height: 32px;
  padding: 0 $spacing-md;
  border-radius: $border-radius-sm;
  border: 1px solid transparent;
  font-family: $font-family-body;
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  cursor: pointer;
  white-space: nowrap;
  transition: all $transition-fast;

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  &--primary {
    background: $primary-color;
    color: #fff;

    &:hover:not(:disabled) {
      background: $primary-hover;
    }
  }

  &--ghost {
    border-color: $border-base;
    background: transparent;
    color: $text-secondary;

    &:hover:not(:disabled) {
      border-color: $primary-color;
      color: $primary-color;
    }
  }
}

// ==================== Chips ====================
.chp-chips {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-sm;
  margin-top: $spacing-md;
}

.chp-chip {
  padding: 5px 12px;
  border-radius: $border-radius-round;
  border: 1px solid $border-base;
  background: transparent;
  color: $text-secondary;
  font-family: $font-family-body;
  font-size: $font-size-xs;
  font-weight: $font-weight-medium;
  cursor: pointer;
  transition: all $transition-fast;

  &:hover {
    border-color: $primary-light;
    color: $primary-color;
  }

  &.is-active {
    background: $primary-color;
    border-color: $primary-color;
    color: #fff;
  }
}

// ==================== 日期范围 ====================
.chp-dates {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  margin-top: $spacing-sm;
  flex-wrap: wrap;
}

.chp-date {
  flex: 1;
  min-width: 132px;
}

.chp-dates__sep {
  font-size: $font-size-xs;
  color: $text-tertiary;
}

// ==================== 结果列表 ====================
.chp-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.chp-item {
  display: flex;
  align-items: flex-start;
  gap: $spacing-sm + 2px;
  width: 100%;
  padding: $spacing-sm + 2px $spacing-sm + 4px;
  border: 1px solid $border-light;
  border-radius: $border-radius-base;
  background: $bg-color-elevated;
  text-align: left;
  cursor: pointer;
  transition: all $transition-fast;

  &:hover {
    border-color: rgba($primary-color, 0.35);
    box-shadow: $box-shadow-sm;
  }
}

.chp-item__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border-radius: $border-radius-sm;
  overflow: hidden;
  background: linear-gradient(135deg, $primary-color, $primary-light);
  color: #fff;
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.chp-item__body {
  flex: 1;
  min-width: 0;
}

.chp-item__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-sm;
}

.chp-item__name {
  font-size: $font-size-sm;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chp-item__time {
  flex-shrink: 0;
  font-size: $font-size-xs;
  color: $text-tertiary;
  font-variant-numeric: tabular-nums;
}

.chp-item__summary {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-top: 3px;
  min-width: 0;
}

.chp-item__badge {
  flex-shrink: 0;
  font-size: $font-size-xs;
  color: $text-tertiary;
}

.chp-item__text {
  font-size: $font-size-xs;
  color: $text-secondary;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// 搜索结果左侧小缩略图（图片 / 视频）
.chp-item__thumb {
  position: relative;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  align-self: center;
  border: 1px solid $border-light;
  border-radius: $border-radius-sm;
  overflow: hidden;
  background: $bg-color-page;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

.chp-item__thumb-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: $text-placeholder;
  font-size: 15px;
}

.chp-item__thumb-play {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(15, 23, 42, 0.6);
  color: #fff;

  svg {
    width: 10px;
    height: 10px;
    margin-left: 1px;
  }
}

// ==================== 媒体网格 ====================
.chp-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  gap: $spacing-sm;
}

.chp-cell {
  position: relative;
  aspect-ratio: 1;
  border: 1px solid $border-light;
  border-radius: $border-radius-sm;
  overflow: hidden;
  background: $bg-color-page;
  padding: 0;
  cursor: pointer;
  transition: all $transition-fast;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  &:hover {
    border-color: rgba($primary-color, 0.4);
    box-shadow: $box-shadow-sm;
  }
}

.chp-cell__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: $text-placeholder;

  svg {
    width: 26px;
    height: 26px;
  }
}

.chp-cell__play {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(15, 23, 42, 0.55);
  color: #fff;

  svg {
    width: 15px;
    height: 15px;
    margin-left: 1px;
  }
}

.chp-cell__dur {
  position: absolute;
  right: 5px;
  bottom: 5px;
  padding: 1px 5px;
  border-radius: 4px;
  background: rgba(15, 23, 42, 0.66);
  color: #fff;
  font-size: 10px;
  font-variant-numeric: tabular-nums;
}

// ==================== 媒体列表（音频 / 文件） ====================
.chp-file {
  display: flex;
  align-items: center;
  gap: $spacing-sm + 2px;
  width: 100%;
  padding: $spacing-sm + 2px;
  border: 1px solid $border-light;
  border-radius: $border-radius-base;
  background: $bg-color-elevated;
  text-align: left;
  cursor: pointer;
  transition: all $transition-fast;

  &:hover {
    border-color: rgba($primary-color, 0.35);
    box-shadow: $box-shadow-sm;
  }
}

.chp-file__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  border-radius: $border-radius-sm;
  background: rgba($primary-color, 0.08);
  color: $primary-color;

  svg {
    width: 19px;
    height: 19px;
  }
}

.chp-file__body {
  flex: 1;
  min-width: 0;
}

.chp-file__name {
  font-size: $font-size-sm;
  font-weight: $font-weight-medium;
  color: $text-primary;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chp-file__meta {
  margin-top: 2px;
  font-size: $font-size-xs;
  color: $text-tertiary;
  font-variant-numeric: tabular-nums;
}

// ==================== 加载更多 ====================
.chp-more {
  margin-top: $spacing-xs;
  padding: $spacing-sm;
  width: 100%;
  border: 1px dashed $border-base;
  border-radius: $border-radius-base;
  background: transparent;
  color: $text-secondary;
  font-family: $font-family-body;
  font-size: $font-size-sm;
  cursor: pointer;
  transition: all $transition-fast;

  &:hover:not(:disabled) {
    border-color: $primary-color;
    color: $primary-color;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

// ==================== 统计 ====================
.chp-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $spacing-sm;
}

.chp-card {
  padding: $spacing-md $spacing-sm;
  border: 1px solid $border-light;
  border-radius: $border-radius-base;
  background: $bg-color-elevated;
  text-align: center;

  &--accent {
    background: rgba($primary-color, 0.06);
    border-color: rgba($primary-color, 0.25);

    .chp-card__value {
      color: $primary-color;
    }
  }
}

.chp-card__value {
  font-family: $font-family-heading;
  font-size: $font-size-2xl;
  font-weight: $font-weight-bold;
  color: $text-primary;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}

.chp-card__label {
  margin-top: 4px;
  font-size: $font-size-xs;
  color: $text-tertiary;
}

.chp-span {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: $spacing-md;
  padding: $spacing-sm $spacing-md;
  border-radius: $border-radius-sm;
  background: $bg-color-page;
  font-size: $font-size-xs;
  color: $text-secondary;

  svg:first-child {
    color: $text-tertiary;
  }
}

.chp-block {
  margin-top: $spacing-lg;

  &__title {
    margin: 0 0 $spacing-sm;
    font-family: $font-family-heading;
    font-size: $font-size-base;
    font-weight: $font-weight-semibold;
    color: $text-primary;
  }
}

// ==================== 趋势柱状图 ====================
.chp-trend {
  padding: $spacing-md $spacing-sm $spacing-sm;
  border: 1px solid $border-light;
  border-radius: $border-radius-base;
  background: $bg-color-elevated;
}

.chp-trend__bars {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 132px;
}

.chp-trend__col {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  min-width: 0;
  height: 100%;
}

.chp-trend__barcell {
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  width: 100%;
  min-height: 0;
}

.chp-trend__bar {
  width: 100%;
  max-width: 14px;
  border-radius: 3px 3px 0 0;
  background: linear-gradient(180deg, $primary-light, $primary-color);
  transition: height $transition-base;
}

.chp-trend__label {
  margin-top: 4px;
  font-size: 9px;
  color: $text-placeholder;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  height: 11px;
}

.chp-trend__foot {
  margin-top: $spacing-sm;
  padding-top: $spacing-sm;
  border-top: 1px solid $border-light;
  font-size: $font-size-xs;
  color: $text-tertiary;

  strong {
    color: $text-primary;
    font-variant-numeric: tabular-nums;
  }
}

// ==================== 发言排行 ====================
.chp-rank {
  margin: 0;
  padding: 0;
  list-style: none;
}

.chp-rank__item {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm 0;

  &:not(:last-child) {
    border-bottom: 1px solid $border-light;
  }
}

.chp-rank__no {
  width: 18px;
  flex-shrink: 0;
  text-align: center;
  font-size: $font-size-xs;
  font-weight: $font-weight-semibold;
  color: $text-placeholder;
  font-variant-numeric: tabular-nums;

  &.is-top {
    color: $primary-color;
  }
}

.chp-rank__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  border-radius: $border-radius-sm;
  overflow: hidden;
  background: linear-gradient(135deg, $primary-color, $primary-light);
  color: #fff;
  font-size: $font-size-xs;
  font-weight: $font-weight-semibold;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.chp-rank__main {
  flex: 1;
  min-width: 0;
}

.chp-rank__top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: $spacing-sm;
}

.chp-rank__name {
  font-size: $font-size-sm;
  color: $text-primary;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chp-rank__count {
  flex-shrink: 0;
  font-size: $font-size-xs;
  color: $text-secondary;
  font-variant-numeric: tabular-nums;
}

.chp-rank__track {
  margin-top: 5px;
  height: 5px;
  border-radius: $border-radius-round;
  background: $border-light;
  overflow: hidden;
}

.chp-rank__fill {
  height: 100%;
  border-radius: $border-radius-round;
  background: $primary-color;
  transition: width $transition-base;
}

// ==================== 高光统计（最活跃的一天 / 时段） ====================
.chp-highlights {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: $spacing-sm;
  margin-top: $spacing-sm;
}

.chp-highlight {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-md;
  border: 1px solid $border-light;
  border-radius: $border-radius-base;
  background: $bg-color-elevated;
}

.chp-highlight__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border-radius: $border-radius-sm;
  background: rgba($primary-color, 0.08);
  color: $primary-color;
  font-size: 14px;
}

.chp-highlight__body {
  min-width: 0;
}

.chp-highlight__value {
  font-family: $font-family-heading;
  font-size: $font-size-base;
  font-weight: $font-weight-semibold;
  color: $text-primary;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chp-highlight__label {
  margin-top: 2px;
  font-size: $font-size-xs;
  color: $text-tertiary;

  strong {
    color: $primary-color;
    font-variant-numeric: tabular-nums;
  }
}

// ==================== 我的发言 ====================
.chp-mine {
  display: flex;
  align-items: stretch;
  padding: $spacing-md;
  border: 1px solid $border-light;
  border-radius: $border-radius-base;
  background: $bg-color-elevated;
}

.chp-mine__stat {
  flex: 1;
  min-width: 0;
  text-align: center;
}

.chp-mine__num {
  font-family: $font-family-heading;
  font-size: $font-size-xl;
  font-weight: $font-weight-bold;
  color: $primary-color;
  line-height: 1.15;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.chp-mine__sub {
  font-size: $font-size-xs;
  font-weight: $font-weight-medium;
  color: $text-tertiary;
}

.chp-mine__label {
  margin-top: 4px;
  font-size: $font-size-xs;
  color: $text-tertiary;
}

.chp-mine__divider {
  width: 1px;
  align-self: stretch;
  margin: 0 $spacing-sm;
  background: $border-light;
}

// ==================== 深色模式 ====================
:global(.dark-mode) {
  .chp-header__icon {
    background: rgba($primary-lighter, 0.14);
    color: $primary-lighter;
  }

  .chp-header__title {
    color: $text-primary-dark;
  }

  .chp-header__subtitle,
  .chp-item__time,
  .chp-item__badge,
  .chp-file__meta,
  .chp-card__label,
  .chp-hint,
  .chp-trend__label,
  .chp-rank__no {
    color: $text-tertiary-dark;
  }

  .chp-btn--ghost {
    border-color: $border-base-dark;
    color: $text-secondary-dark;

    &:hover:not(:disabled) {
      border-color: $primary-lighter;
      color: $primary-lighter;
    }
  }

  .chp-chip {
    border-color: $border-base-dark;
    color: $text-secondary-dark;

    &.is-active {
      background: $primary-color;
      border-color: $primary-color;
      color: #fff;
    }
  }

  .chp-item,
  .chp-file,
  .chp-card,
  .chp-trend,
  .chp-highlight,
  .chp-mine {
    background: $bg-color-elevated-dark;
    border-color: $border-base-dark;
  }

  .chp-highlight__icon {
    background: rgba($primary-lighter, 0.12);
    color: $primary-lighter;
  }

  .chp-highlight__value {
    color: $text-primary-dark;
  }

  .chp-mine__num {
    color: $primary-lighter;
  }

  .chp-highlight__label,
  .chp-mine__label,
  .chp-mine__sub {
    color: $text-tertiary-dark;
  }

  .chp-mine__divider {
    background: $border-base-dark;
  }

  .chp-card--accent {
    background: rgba($primary-lighter, 0.1);
    border-color: rgba($primary-lighter, 0.3);
  }

  .chp-item__name,
  .chp-file__name,
  .chp-card__value,
  .chp-block__title,
  .chp-rank__name {
    color: $text-primary-dark;
  }

  .chp-item__text,
  .chp-file__meta,
  .chp-span,
  .chp-more,
  .chp-rank__count {
    color: $text-secondary-dark;
  }

  .chp-cell {
    background: $bg-color-dark;
    border-color: $border-base-dark;
  }

  .chp-item__thumb {
    background: $bg-color-dark;
    border-color: $border-base-dark;
  }

  .chp-item__thumb-fallback {
    color: $text-placeholder-dark;
  }

  .chp-file__icon {
    background: rgba($primary-lighter, 0.12);
    color: $primary-lighter;
  }

  .chp-span {
    background: $bg-color-page-dark;
  }

  .chp-rank__item:not(:last-child),
  .chp-trend__foot {
    border-color: $border-base-dark;
  }

  .chp-rank__track {
    background: $border-base-dark;
  }

  .chp-more {
    border-color: $border-base-dark;

    &:hover:not(:disabled) {
      border-color: $primary-lighter;
      color: $primary-lighter;
    }
  }
}

// ==================== 移动端 ====================
@media (max-width: 560px) {
  .chp-pane,
  .chp-scroll {
    padding-left: $spacing-md;
    padding-right: $spacing-md;
  }

  .chp-cards {
    grid-template-columns: repeat(3, 1fr);
  }

  .chp-card__value {
    font-size: $font-size-xl;
  }

  .chp-dates .chp-btn--ghost {
    width: 100%;
  }
}
</style>

<style lang="scss">
// Ant Design Drawer / Tabs 样式穿透（抽屉挂载到 body，需全局样式）
.chat-history-drawer {
  .ant-drawer-body {
    padding: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .ant-tabs {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .ant-tabs-nav {
    margin: 0;
    padding: 0 24px;
  }

  .ant-tabs-content-holder {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  .ant-tabs-content {
    height: 100%;
  }

  .ant-tabs-tabpane {
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background: $border-base;
      border-radius: 3px;
    }
  }
}

.dark-mode {
  .chat-history-drawer {
    .ant-drawer-content,
    .ant-drawer-header,
    .ant-drawer-body {
      background: $bg-color-elevated-dark;
    }

    .ant-drawer-header {
      border-bottom-color: $border-base-dark;
    }

    .ant-drawer-close {
      color: $text-tertiary-dark;

      &:hover {
        color: $text-primary-dark;
      }
    }

    .ant-tabs-nav::before {
      border-bottom-color: $border-base-dark;
    }

    .ant-tabs-tab {
      color: $text-secondary-dark;
    }

    .ant-tabs-tab-active .ant-tabs-tab-btn {
      color: $primary-lighter;
    }

    .ant-tabs-ink-bar {
      background: $primary-lighter;
    }

    .ant-tabs-tabpane::-webkit-scrollbar-thumb {
      background: $border-base-dark;
    }

    .ant-empty-description {
      color: $text-tertiary-dark;
    }
  }
}

@media (max-width: 560px) {
  .chat-history-drawer .ant-tabs-nav {
    padding: 0 16px;
  }
}
</style>
