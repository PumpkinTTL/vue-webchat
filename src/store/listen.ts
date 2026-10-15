import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useWebSocketStore } from '@/store/websocket'

/**
 * 一起听（同步播放）状态与同步引擎
 *
 * 同步模型：
 * - 服务端只做广播/转发，不计算进度；双方靠 server_at（毫秒时间戳）在本地换算目标进度，
 *   避免网络延迟与时钟偏差造成的错位。
 * - 发起方 = 主时钟：播放期间每 5s 心跳广播一次进度，持续纠偏（自愈）。
 * - 任意一方 播放/暂停/拖动进度条 都会立即广播，另一方应用（带 applyingRemote 守卫，避免回灌成环）。
 * 数据的生命周期：会话由服务端统一管理，任何结束路径（结束/拒绝/超时/掉线/离开/清空）
 * 都会释放并下发 listen_ended → 本 store 立即 teardown，不残留、不泄露。
 */

export interface ListenInfo {
  audioUrl: string
  audioName: string
  audioDuration: number | null
  position: number
  playing: boolean
  serverAt: number
  initiatorId?: number
  initiatorName?: string
  responderId?: number
  responderName?: string
}

export interface ListenInvitation {
  fromUserId: number
  fromNickname: string
  audioUrl: string
  audioName: string
  audioDuration: number | null
  position: number
  playing: boolean
  at: number
}

export const useListenStore = defineStore('listen', () => {
  const wsStore = useWebSocketStore()

  const active = ref(false)
  const role = ref<'initiator' | 'responder' | null>(null)
  const pending = ref(false) // 发起方：已邀请、等待对方接受
  const info = ref<ListenInfo | null>(null)
  const invitation = ref<ListenInvitation | null>(null)
  const panelOpen = ref(false)
  const endedReason = ref<string | null>(null)

  // 音量各自独立（不做同步）
  const volume = ref<number>(Number(localStorage.getItem('listen_volume')) || 1)

  const partnerName = computed(() => {
    if (!info.value) return ''
    const myId = wsStore.currentUserId
    return String(info.value.initiatorId) === String(myId)
      ? info.value.responderName || '对方'
      : info.value.initiatorName || '对方'
  })

  // ==================== 音频元素与远程应用 ====================
  let audioEl: HTMLAudioElement | null = null
  let pendingApply: { position: number; playing: boolean; serverAt: number } | null = null
  let applyingRemote = false
  let applyGuardTimer: ReturnType<typeof setTimeout> | null = null

  const markApplying = () => {
    applyingRemote = true
    if (applyGuardTimer) clearTimeout(applyGuardTimer)
    applyGuardTimer = setTimeout(() => { applyingRemote = false }, 400)
  }

  const doApply = (pos: number, playing: boolean) => {
    if (!audioEl) return
    markApplying()
    try {
      if (isFinite(pos) && pos >= 0) audioEl.currentTime = pos
    } catch { /* ignore */ }
    if (playing) {
      audioEl.play().catch(() => { /* 需要用户手势时忽略 */ })
    } else {
      audioEl.pause()
    }
  }

  // 远程进度应用：按 server_at 折算已流逝时间；元数据未就绪时等待
  const applyRemote = (position: number, playing: boolean, serverAt: number) => {
    if (!audioEl) {
      pendingApply = { position, playing, serverAt }
      return
    }
    const elapsed = playing ? Math.max(0, (Date.now() - serverAt) / 1000) : 0
    const target = position + elapsed
    const ready = () => !!audioEl && audioEl.readyState >= 1
    if (ready()) {
      doApply(target, playing)
    } else {
      const onMeta = () => {
        audioEl?.removeEventListener('loadedmetadata', onMeta)
        doApply(target, playing)
      }
      audioEl.addEventListener('loadedmetadata', onMeta, { once: true })
      // 兜底：元数据迟迟不来时再试一次
      setTimeout(() => { if (ready()) doApply(target, playing) }, 900)
    }
  }

  function setVolume(v: number) {
    volume.value = Math.max(0, Math.min(1, v))
    localStorage.setItem('listen_volume', String(volume.value))
    if (audioEl) audioEl.volume = volume.value
  }

  // ==================== 本地 -> 远程 ====================
  let lastSyncSentAt = 0
  const sendSync = (position: number, playing: boolean) => {
    if (!active.value) return
    lastSyncSentAt = Date.now()
    wsStore.listenSync(Math.max(0, position), playing)
  }

  // 主时钟心跳：发起方在播放期间每 5s 广播一次，持续纠偏
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null
  const startHeartbeat = () => {
    stopHeartbeat()
    heartbeatTimer = setInterval(() => {
      if (!active.value || role.value !== 'initiator') return
      if (audioEl && !audioEl.paused) {
        sendSync(audioEl.currentTime, true)
      }
    }, 5000)
  }
  const stopHeartbeat = () => {
    if (heartbeatTimer) { clearInterval(heartbeatTimer); heartbeatTimer = null }
  }

  // 播放器挂载后注册元素；若有待应用命令则立即应用
  let boundEl: HTMLAudioElement | null = null
  const onElPlay = () => onLocalPlay()
  const onElPause = () => onLocalPause()
  const onElSeeked = () => { if (audioEl) onLocalSeek(audioEl.currentTime) }

  function registerAudio(el: HTMLAudioElement) {
    unregisterAudio()
    audioEl = el
    boundEl = el
    el.volume = volume.value
    el.addEventListener('play', onElPlay)
    el.addEventListener('pause', onElPause)
    el.addEventListener('seeked', onElSeeked)
    if (pendingApply) {
      const p = pendingApply
      pendingApply = null
      applyRemote(p.position, p.playing, p.serverAt)
    } else if (active.value && info.value) {
      applyRemote(info.value.position, info.value.playing, info.value.serverAt)
    }
  }
  function unregisterAudio() {
    if (boundEl) {
      boundEl.removeEventListener('play', onElPlay)
      boundEl.removeEventListener('pause', onElPause)
      boundEl.removeEventListener('seeked', onElSeeked)
    }
    boundEl = null
    audioEl = null
  }

  // 由面板在本地 播放/暂停/拖动 时调用（applyingRemote 期间忽略，防止回灌成环）
  function onLocalPlay() {
    if (!active.value || applyingRemote || !audioEl) return
    sendSync(audioEl.currentTime, true)
  }
  function onLocalPause() {
    if (!active.value || applyingRemote || !audioEl) return
    sendSync(audioEl.currentTime, false)
  }
  function onLocalSeek(position: number) {
    if (!active.value || applyingRemote) return
    sendSync(position, audioEl ? !audioEl.paused : true)
  }

  // ==================== 会话动作 ====================
  /** 完全重置（切房间 / 切账号 / 断线时调用）：释放一切本地状态，杜绝跨账号/跨房间泄漏 */
  function reset() {
    teardown(null)
    endedReason.value = null
  }

  function invite(payload: { audioUrl: string; audioName: string; audioDuration: number; position: number; playing: boolean }) {
    const myId = wsStore.currentUserId
    info.value = {
      audioUrl: payload.audioUrl,
      audioName: payload.audioName,
      audioDuration: payload.audioDuration || null,
      position: payload.position,
      playing: payload.playing,
      serverAt: Date.now(),
      initiatorId: myId || 0,
      initiatorName: wsStore.currentNickname
    }
    role.value = 'initiator'
    pending.value = true
    endedReason.value = null
    wsStore.listenInvite({
      audio_url: payload.audioUrl,
      audio_name: payload.audioName,
      audio_duration: payload.audioDuration || null,
      position: payload.position,
      playing: payload.playing
    })
  }

  function accept() {
    wsStore.listenAccept()
    clearInviteWatchdog()
    invitation.value = null
  }
  function decline() {
    wsStore.listenDecline()
    clearInviteWatchdog()
    invitation.value = null
  }
  function end() {
    wsStore.listenEnd()
  }
  function cancelPending() {
    wsStore.listenEnd()
    clearInviteWatchdog()
    pending.value = false
  }

  // ==================== 远程事件 ====================
  function teardown(reason?: string | null) {
    unregisterAudio()
    active.value = false
    role.value = null
    pending.value = false
    info.value = null
    invitation.value = null
    panelOpen.value = false
    pendingApply = null
    stopHeartbeat()
    clearInviteWatchdog()
    if (reason) endedReason.value = reason
  }

  // 兜底看门狗：邀请/等待若 65s 内无任何结果（服务端 60s 应已取消，通知可能丢失），
  // 本地也强制清除，杜绝任何「气泡残留」型泄漏。
  let inviteWatchdog: ReturnType<typeof setTimeout> | null = null
  const clearInviteWatchdog = () => {
    if (inviteWatchdog) { clearTimeout(inviteWatchdog); inviteWatchdog = null }
  }
  const armInviteWatchdog = () => {
    clearInviteWatchdog()
    inviteWatchdog = setTimeout(() => {
      inviteWatchdog = null
      if (invitation.value || pending.value) {
        invitation.value = null
        pending.value = false
        if (!active.value) info.value = null
      }
    }, 65000)
  }

  function onInvited(data: {
    from_user_id: number; from_nickname: string; audio_url: string; audio_name?: string
    audio_duration?: number | null; position: number; playing: boolean
  }) {
    // 已在会话中 / 已有待处理邀请 → 忽略（服务端也会拒绝重复）
    if (active.value || pending.value) return
    invitation.value = {
      fromUserId: data.from_user_id,
      fromNickname: data.from_nickname,
      audioUrl: data.audio_url,
      audioName: data.audio_name || '音频',
      audioDuration: data.audio_duration ?? null,
      position: data.position || 0,
      playing: !!data.playing,
      at: Date.now()
    }
    armInviteWatchdog()
  }

  function onStarted(data: {
    audio_url: string; audio_name?: string; audio_duration?: number | null
    position: number; playing: boolean; server_at: number
    initiator_id: number; initiator_name: string; responder_id: number; responder_name: string
  }) {
    const myId = wsStore.currentUserId
    const iAmParticipant = String(data.initiator_id) === String(myId) || String(data.responder_id) === String(myId)

    // 房间内的「旁观者」：别人之间开始了会话，若本地还挂着这条邀请气泡，清掉（防泄漏）
    if (!iAmParticipant) {
      if (invitation.value && invitation.value.fromUserId === data.initiator_id) {
        invitation.value = null
        clearInviteWatchdog()
      }
      return
    }

    active.value = true
    pending.value = false
    invitation.value = null
    clearInviteWatchdog()
    role.value = String(data.initiator_id) === String(myId) ? 'initiator' : 'responder'
    info.value = {
      audioUrl: data.audio_url,
      audioName: data.audio_name || '音频',
      audioDuration: data.audio_duration ?? null,
      position: data.position || 0,
      playing: !!data.playing,
      serverAt: data.server_at,
      initiatorId: data.initiator_id,
      initiatorName: data.initiator_name,
      responderId: data.responder_id,
      responderName: data.responder_name
    }
    endedReason.value = null
    panelOpen.value = true
    startHeartbeat()
  }

  function onDeclined(data: { by_user_id: number; by_nickname: string }) {
    teardown('declined')
  }

  function onSync(data: { position: number; playing: boolean; by_user_id: number; server_at: number }) {
    if (!active.value) return
    if (String(data.by_user_id) === String(wsStore.currentUserId)) return // 自己发的，忽略
    applyRemote(data.position || 0, !!data.playing, data.server_at || Date.now())
  }

  function onEnded(data: { reason: string }) {
    teardown(data.reason || 'ended')
  }

  function onState(data: {
    active: boolean; audio_url?: string; audio_name?: string; audio_duration?: number | null
    position?: number; playing?: boolean; server_at?: number
    initiator_id?: number; initiator_name?: string; responder_id?: number; responder_name?: string
  }) {
    if (data.active && data.audio_url) {
      active.value = true
      role.value = String(data.initiator_id) === String(wsStore.currentUserId) ? 'initiator' : 'responder'
      info.value = {
        audioUrl: data.audio_url,
        audioName: data.audio_name || '音频',
        audioDuration: data.audio_duration ?? null,
        position: data.position || 0,
        playing: !!data.playing,
        serverAt: data.server_at || Date.now(),
        initiatorId: data.initiator_id,
        initiatorName: data.initiator_name,
        responderId: data.responder_id,
        responderName: data.responder_name
      }
      panelOpen.value = true
      startHeartbeat()
    } else if (!data.active) {
      // 服务端说该房间无活跃会话：清理任何本地残留（会话/待接受/邀请气泡），杜绝泄漏
      if (active.value || pending.value || invitation.value) teardown('ended')
    }
  }

  return {
    // 状态
    active, role, pending, info, invitation, panelOpen, endedReason, volume,
    partnerName,
    // 音频同步
    registerAudio, unregisterAudio,
    onLocalPlay, onLocalPause, onLocalSeek,
    setVolume,
    // 动作
    invite, accept, decline, end, cancelPending,
    // 远程事件
    onInvited, onStarted, onDeclined, onSync, onEnded, onState,
    teardown, reset
  }
})
