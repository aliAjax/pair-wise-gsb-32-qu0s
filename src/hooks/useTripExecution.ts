import { computed, type ComputedRef } from 'vue';
import type { Trip } from '../models/trip';
import { useExecutionStore } from '../stores/executionStore';
import { currentPendingItem, executionSummary } from '../utils/execution';
import type { TripExecution } from '../models/execution';

// 详情页与分享页共用：从同一份本地执行记录读取进度
export function useTripExecution(trip: ComputedRef<Trip | undefined>) {
  const executionStore = useExecutionStore();
  const execution = computed<TripExecution | undefined>(() =>
    trip.value ? executionStore.byTripId(trip.value.id) : undefined,
  );
  const summary = computed(() => executionSummary(execution.value));
  const currentItem = computed(() => currentPendingItem(execution.value));
  const progressPercent = computed(() =>
    summary.value.total ? Math.round(((summary.value.doneCount + summary.value.skippedCount) / summary.value.total) * 100) : 0,
  );
  return { execution, summary, currentItem, progressPercent };
}
