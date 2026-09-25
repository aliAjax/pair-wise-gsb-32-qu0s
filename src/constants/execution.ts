export enum ExecutionItemStatus {
  PENDING = 'pending',
  DONE = 'done',
  SKIPPED = 'skipped',
}
export const EXECUTION_STATUS_OPTIONS = [
  { label: '待执行', value: ExecutionItemStatus.PENDING },
  { label: '已完成', value: ExecutionItemStatus.DONE },
  { label: '已跳过', value: ExecutionItemStatus.SKIPPED },
];
export const SKIP_REASON_OPTIONS = [
  { label: '天气原因', value: 'weather' },
  { label: '体力不支', value: 'tired' },
  { label: '时间不够', value: 'no_time' },
  { label: '景点临时关闭', value: 'closed' },
  { label: '其他原因', value: 'other' },
];
