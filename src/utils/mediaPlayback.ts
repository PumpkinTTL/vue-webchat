/**
 * 全局媒体播放仲裁器
 *
 * 目的：同一时间只允许一个媒体（音频/视频）在播放。
 *
 * 为什么需要单独一个模块：
 * `<script setup>` 里的顶层变量是「每个组件实例一份」的，
 * 所以把它写在组件里做「同时只播一个」的互斥，跨实例根本不生效
 * （多个音频消息各自持有一个 currentPlayingEl，互不相识）。
 * 只有真正的模块级单例才能跨组件实例协调。
 */

let current: HTMLMediaElement | null = null

/**
 * 认领播放权：暂停当前正在播放的其它媒体，并把播放权交给 el
 */
export function claimPlayback(el: HTMLMediaElement): void {
  if (current && current !== el) {
    try {
      current.pause()
    } catch {
      /* ignore */
    }
  }
  current = el
}

/**
 * 释放播放权（仅当 el 仍是当前播放者时）
 */
export function releasePlayback(el: HTMLMediaElement): void {
  if (current === el) {
    current = null
  }
}

/**
 * el 是否持有播放权
 */
export function isPlaybackOwner(el: HTMLMediaElement): boolean {
  return current === el
}
