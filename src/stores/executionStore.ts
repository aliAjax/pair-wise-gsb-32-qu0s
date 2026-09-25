import { defineStore } from 'pinia';
import type { TripExecution } from '../models/execution';
import { ItemRunState, SkipReason } from '../constants/execution';
import { executionApi } from '../api/executionApi';
import { buildExecution, isExecutionDone, executionItemKey, isDepartureDue, isReturnDue } from '../utils/execution';
import { useTripStore } from './tripStore';
import { useDayPlanStore } from './dayPlanStore';
import { TripStatus } from '../constants/trip';
import { messages } from '../constants/messages';
import { toast } from '../utils/message';

export const useExecutionStore = defineStore('execution', {
  state: () => ({ executions: executionApi.list() as TripExecution[] }),
  getters: {
    byTripId: (state) => (tripId: string) => state.executions.find((item) => item.trip_id === tripId),
  },
  actions: {
    persist() {
      executionApi.save(this.executions);
    },
    // 出发：冻结当时计划顺序的执行快照，并把旅行状态推进到进行中（状态推进归 tripStore）
    startTrip(tripId: string) {
      if (this.byTripId(tripId)) {
        toast.warn(messages.executionAlreadyStarted);
        return this.byTripId(tripId)!;
      }
      const dayPlanStore = useDayPlanStore();
      const execution = buildExecution(tripId, dayPlanStore.dayPlans);
      this.executions.push(execution);
      this.persist();
      useTripStore().markOngoing(tripId);
      toast.ok(messages.executionStarted);
      return execution;
    },
    // 完成：必须是按计划顺序轮到的当前项，记录实际用时与实际花费
    completeItem(tripId: string, key: string, actualDurationMinutes: number, actualCost: number, actualNote?: string) {
      const execution = this.requireExecution(tripId);
      const item = execution.items.find((candidate) => candidate.key === key);
      if (!item) return;
      item.state = ItemRunState.DONE;
      item.actual_duration_minutes = actualDurationMinutes;
      item.actual_cost = actualCost;
      item.actual_note = actualNote;
      item.completed_at = new Date().toISOString();
      this.persist();
      toast.ok(messages.itemCompleted);
      if (isExecutionDone(execution)) toast.ok(messages.executionAllDone);
    },
    // 临时跳过：选择原因，执行快照里的原顺序保持不变
    skipItem(tripId: string, key: string, reason: SkipReason, actualNote?: string) {
      const execution = this.requireExecution(tripId);
      const item = execution.items.find((candidate) => candidate.key === key);
      if (!item) return;
      item.state = ItemRunState.SKIPPED;
      item.skip_reason = reason;
      item.actual_note = actualNote;
      item.completed_at = new Date().toISOString();
      this.persist();
      toast.ok(messages.itemSkipped);
      if (isExecutionDone(execution)) toast.ok(messages.executionAllDone);
    },
    // 回来后旅行结束；有未处理项时拒绝（过了结束日的自动收尾除外）
    finishTrip(tripId: string, force = false) {
      const execution = this.byTripId(tripId);
      if (!force && execution && !isExecutionDone(execution)) {
        toast.warn(messages.executionUnfinished);
        return false;
      }
      if (!execution) this.executions.push(buildExecution(tripId, useDayPlanStore().dayPlans));
      const target = this.byTripId(tripId)!;
      target.finished_at = new Date().toISOString();
      this.persist();
      useTripStore().markFinished(tripId);
      toast.ok(messages.executionFinished);
      return true;
    },
    // 进行中临时新增行程项（如现场加景点）：追加到当天快照末尾，不打乱原顺序
    syncNewItem(tripId: string, dayIndex: number, spotId: string, start_time: string, end_time: string, note: string, transport: 'walk' | 'metro' | 'taxi' | 'train') {
      const execution = this.byTripId(tripId);
      if (!execution) return;
      const sameDay = execution.items.filter((item) => item.day_index === dayIndex);
      const order = sameDay.length;
      execution.items.push({
        key: executionItemKey(dayIndex, order),
        day_index: dayIndex,
        order,
        spot_id: spotId,
        start_time,
        end_time,
        note,
        transport,
        state: ItemRunState.PENDING,
      });
      this.persist();
    },
    removeByTrip(tripId: string) {
      this.executions = this.executions.filter((item) => item.trip_id !== tripId);
      this.persist();
    },
    // 关掉浏览器再打开后的续办：到出发日自动进入进行中并补建执行快照，过结束日自动结束
    activateDueTrips() {
      const tripStore = useTripStore();
      for (const trip of tripStore.trips) {
        const execution = this.byTripId(trip.id);
        if (trip.status === TripStatus.PLANNING && isDepartureDue(trip.start_date)) {
          if (!execution) {
            this.executions.push(buildExecution(trip.id, useDayPlanStore().dayPlans));
            this.persist();
          }
          tripStore.markOngoing(trip.id);
          // 出发日早已过去且已过结束日：进入进行中后立即自动收尾
          if (isReturnDue(trip.end_date)) this.finishTrip(trip.id, true);
        } else if (trip.status === TripStatus.ONGOING && isReturnDue(trip.end_date)) {
          this.finishTrip(trip.id, true);
        }
      }
    },
    requireExecution(tripId: string) {
      const execution = this.byTripId(tripId);
      if (!execution) throw new Error(messages.executionMissing);
      return execution;
    },
  },
});
