// 执行记录相关常量：临时跳过原因（详情页与分享页共用）
export enum SkipReason {
  WEATHER = 'weather',
  TIME = 'time',
  CLOSED = 'closed',
  BODY = 'body',
  COST = 'cost',
  OTHER = 'other',
}

export const SKIP_REASON_OPTIONS = [
  { label: '天气原因', value: SkipReason.WEATHER },
  { label: '时间不够', value: SkipReason.TIME },
  { label: '景点临时关闭/排队过长', value: SkipReason.CLOSED },
  { label: '体力不支', value: SkipReason.BODY },
  { label: '花费超预期', value: SkipReason.COST },
  { label: '其他突发', value: SkipReason.OTHER },
];

// 每个行程项执行状态：执行记录快照里的实时状态
export enum ItemRunState {
  PENDING = 'pending',
  DONE = 'done',
  SKIPPED = 'skipped',
}
