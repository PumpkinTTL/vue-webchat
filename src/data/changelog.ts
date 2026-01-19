/**
 * 版本日志数据
 * 格式：版本号 -> 发布日期 -> 分类 -> 功能列表
 */

export interface ChangelogFeature {
  /** 功能标题 */
  title: string
  /** 功能描述 */
  description: string
}

export interface ChangelogCategory {
  /** 图标 emoji */
  icon: string
  /** 分类标题 */
  title: string
  /** 功能列表 */
  features: ChangelogFeature[]
}

export interface ChangelogVersion {
  /** 版本号 */
  version: string
  /** 发布日期 */
  date: string
  /** 是否为当前版本 */
  isCurrent?: boolean
  /** 分类列表 */
  categories: ChangelogCategory[]
}

export const changelogData: ChangelogVersion[] = [
  {
    version: '2.0.0',
    date: '2026-01-19',
    isCurrent: true,
    categories: [
      {
        icon: '🚀',
        title: '重构',
        features: [
          {
            title: '客户端全面重构',
            description: 'Vite+Vue3全新的前端技术架构，页面加载速度大幅提升，界面响应更加迅速，整体使用体验更加流畅',
          },
          {
            title: 'Pinia 状态管理',
            description: '采用新一代状态管理方案，数据流转更清晰，多标签页数据同步更可靠',
          },
          {
            title: 'Vue Router 路由',
            description: '页面切换更加平滑，支持浏览器前进后退，提供更接近原生应用的体验',
          },
          {
            title: 'Axios 网络请求',
            description: '统一的接口请求管理，自动处理错误和超时，网络交互更加稳定',
          },
        ],
      },
      {
        icon: '✨',
        title: '新增',
        features: [
          {
            title: '亲密度系统',
            description: '私密房间专属功能，记录互动经验、等级成长、实时计时',
          },
          {
            title: '羁绊连接提醒',
            description: '对方上线时触发浪漫通知，爱心点亮动画',
          },
          {
            title: '消息编辑功能',
            description: '支持编辑已发送的文本消息，显示编辑标记',
          },
          {
            title: '消息焚毁功能',
            description: '支持永久删除消息，所有人不可见',
          },
          {
            title: '房间管理功能',
            description: '管理员可锁定房间、清理消息、恢复消息',
          },
          {
            title: '私密房间密码',
            description: '创建房间时可设置密码，保护隐私',
          },
          {
            title: '版本日志',
            description: '在用户卡片下方查看完整的更新历史',
          },
          {
            title: '深色模式',
            description: '完整的深色主题支持，自动适配系统设置',
          },
        ],
      },
      {
        icon: '🎨',
        title: '优化',
        features: [
          {
            title: '界面设计',
            description: '采用 Swiss Modernism 2.0 设计语言，追求极致简洁',
          },
          {
            title: '私密房间装饰',
            description: '标题添加镜面扫光和皇冠装饰，爱心标签动态点亮',
          },
          {
            title: '消息引用',
            description: '采用玻璃拟态设计，支持点击跳转并高亮原消息',
          },
          {
            title: '历史消息浏览',
            description: '查看历史时发送消息不再强制滚动，尊重浏览状态',
          },
          {
            title: '上传体验',
            description: '图片/视频上传显示实时进度，支持预览',
          },
          {
            title: '性能提升',
            description: '消息列表虚拟滚动，支持数万条消息流畅渲染',
          },
          {
            title: '连接稳定性',
            description: 'WebSocket 自动重连，网络波动不掉线',
          },
        ],
      },
      {
        icon: '🐛',
        title: '修复',
        features: [
          {
            title: '在线人数显示问题',
            description: '修复刷新页面后在线人数显示为 0 的问题',
          },
          {
            title: '事件冒泡问题',
            description: '修复图片点击和链接点击的事件冒泡问题',
          },
          {
            title: '亲密度计时器',
            description: '修复亲密度互动计时器的启动和重置逻辑',
          },
          {
            title: '羁绊通知',
            description: '修复羁绊通知的显示时机和记录清理',
          },
          {
            title: '已读状态',
            description: '修复消息已读状态的实时更新',
          },
          {
            title: '状态重置',
            description: '修复切换房间时状态未正确重置的问题',
          },
        ],
      },
    ],
  },
  {
    version: '1.0.0',
    date: '2025-12-20',
    categories: [
      {
        icon: '🎉',
        title: '首次发布',
        features: [
          {
            title: 'WebSocket 实时通信',
            description: '基于 WebSocket 协议的实时聊天系统，消息即时送达',
          },
          {
            title: '多媒体消息',
            description: '支持文本、图片、视频、文件等多种消息类型',
          },
          {
            title: '房间系统',
            description: '创建和加入聊天房间，支持多人在线',
          },
          {
            title: '消息引用',
            description: '引用回复功能，保持对话上下文',
          },
          {
            title: '已读状态',
            description: '实时显示消息已读人数和状态',
          },
          {
            title: '输入提示',
            description: '显示正在输入的用户，增强互动感',
          },
          {
            title: '用户系统',
            description: '完整的注册、登录、个人资料管理',
          },
        ],
      },
    ],
  },
]
