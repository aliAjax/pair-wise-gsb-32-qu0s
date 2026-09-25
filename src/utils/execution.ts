import dayjs from 'dayjs';
import type { DayPlan } from '../models/dayPlan';
import type { TripExecution, ExecutionItem } from '../models/execution';
import { ItemRunState } from '../constants/execution';

export const executionItemKey = (dayIndex: number, order: number) => `d${dayIndex}-i${order}`;

// 出发时按当时计划顺序逐项冻结为执行快照，保留原顺序
export function buildExecution(tripId: string, dayPlans: DayPlan[], startedAt = new Date().toISOString()): TripExecution {
  const days = dayPlans
    .filter((day) => day.trip_id === tripId)
    .slice()
    .sort((a, b) => a.day_index - b.day_index);
  const items: ExecutionItem[] = days.flatMap((day) =>
    day.items.map((item, index) => ({
      key: executionItemKey(day.day_index, index),
      spot_id: item.spot_id,
      day_index: day.day_index,
      order: index,
      start_time: item.start_time,
      end_time: item.end_time,
      note: item.note,
      transport: item.transport,
      state: ItemRunState.PENDING,
    })),
  );
  return { trip_id: tripId, started_at: startedAt, items };
}

export const isExecutionDone = (execution?: TripExecution) =>
  !!execution && execution.items.length > 0 && execution.items.every((item) => item.state !== ItemRunState.PENDING);

// 按计划顺序找到第一个尚未处理的项（已跳过的项不阻塞后续）
export function currentPendingItem(execution?: TripExecution): ExecutionItem | undefined {
  return execution?.items
    .slice()
    .sort((a, b) => a.day_index - b.day_index || a.order - b.order)
    .find((item) => item.state === ItemRunState.PENDING);
}

export function executionSummary(execution?: TripExecution) {
  const items = execution?.items ?? [];
  const done = items.filter((item) => item.state === ItemRunState.DONE);
  const skipped = items.filter((item) => item.state === ItemRunState.SKIPPED);
  const actualCost = done.reduce((sum, item) => sum + (item.actual_cost ?? 0), 0);
  const actualMinutes = done.reduce((sum, item) => sum + (item.actual_duration_minutes ?? 0), 0);
  return {
    total: items.length,
    doneCount: done.length,
    skippedCount: skipped.length,
    pendingCount: items.length - done.length - skipped.length,
    actualCost,
    actualMinutes,
  };
}

// 已到出发日（本地日期 >= start_date）的规划中旅行需要自动进入进行中
export function isDepartureDue(startDate: string, today = dayjs().format('YYYY-MM-DD')) {
  return dayjs(today).isSame(startDate, 'day') || dayjs(today).isAfter(startDate, 'day');
}

// 已过结束日仍在进行中的旅行，自动收尾
export function isReturnDue(endDate: string, today = dayjs().format('YYYY-MM-DD')) {
  return dayjs(today).isAfter(endDate, 'day');
}
