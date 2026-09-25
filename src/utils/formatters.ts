import dayjs from 'dayjs';
import { SpotCategory } from '../constants/spot';
import { TripStatus } from '../constants/trip';
import { ItemRunState, SkipReason, SKIP_REASON_OPTIONS } from '../constants/execution';

export const spotCategoryText: Record<SpotCategory, string> = {
  [SpotCategory.NATURE]: '自然风光',
  [SpotCategory.CULTURE]: '人文历史',
  [SpotCategory.FOOD]: '美食购物',
  [SpotCategory.ENTERTAINMENT]: '娱乐休闲',
};
export const tripStatusText: Record<TripStatus, string> = {
  [TripStatus.PLANNING]: '规划中',
  [TripStatus.ONGOING]: '进行中',
  [TripStatus.FINISHED]: '已结束',
};
export const transportText: Record<string, string> = { walk: '步行', metro: '地铁', taxi: '出租', train: '火车' };
export const itemRunStateText: Record<ItemRunState, string> = {
  [ItemRunState.PENDING]: '待执行',
  [ItemRunState.DONE]: '已完成',
  [ItemRunState.SKIPPED]: '已跳过',
};
export const itemRunStateTagType: Record<ItemRunState, 'info' | 'success' | 'warning'> = {
  [ItemRunState.PENDING]: 'info',
  [ItemRunState.DONE]: 'success',
  [ItemRunState.SKIPPED]: 'warning',
};
export const skipReasonText: Record<SkipReason, string> = SKIP_REASON_OPTIONS.reduce(
  (map, option) => ({ ...map, [option.value]: option.label }),
  {} as Record<SkipReason, string>,
);
// 分钟数格式化成 “2小时30分钟”
export const formatDuration = (minutes?: number) => {
  if (minutes === undefined || minutes === null || Number.isNaN(minutes)) return '—';
  if (minutes < 60) return `${minutes} 分钟`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} 小时 ${rest} 分钟` : `${hours} 小时`;
};
export const formatDateTime = (value?: string) => (value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '—');
export const formatDate = (value: string) => dayjs(value).format('YYYY-MM-DD');
export const formatCurrency = (value: number, currency = 'CNY') => new Intl.NumberFormat('zh-CN', { style: 'currency', currency }).format(value);

