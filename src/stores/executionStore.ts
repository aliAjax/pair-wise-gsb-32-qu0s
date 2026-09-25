import { defineStore } from 'pinia';
import { ExecutionItemStatus } from '../constants/execution';
import type { ExecutionRecord, TripExecution } from '../models/execution';
import { executionApi } from '../api/executionApi';
import { messages } from '../constants/messages';
import { toast } from '../utils/message';

export const useExecutionStore = defineStore('execution', {
  state: () => ({ executions: executionApi.list() as TripExecution[] }),
  getters: {
    byTrip: (state) => (tripId: string) => state.executions.find((item) => item.trip_id === tripId),
  },
  actions: {
    persist() {
      executionApi.save(this.executions);
    },
    ensureStarted(tripId: string) {
      let execution = this.executions.find((item) => item.trip_id === tripId);
      if (!execution) {
        execution = { trip_id: tripId, started_at: new Date().toISOString(), finished_at: '', records: [] };
        this.executions.push(execution);
        this.persist();
        toast.ok(messages.tripStarted);
      }
      return execution;
    },
    recordOf(tripId: string, dayIndex: number, itemIndex: number) {
      return this.byTrip(tripId)?.records.find((item) => item.day_index === dayIndex && item.item_index === itemIndex);
    },
    upsertRecord(tripId: string, record: ExecutionRecord) {
      const execution = this.ensureStarted(tripId);
      const index = execution.records.findIndex((item) => item.day_index === record.day_index && item.item_index === record.item_index);
      if (index >= 0) execution.records.splice(index, 1, record);
      else execution.records.push(record);
      this.persist();
    },
    completeItem(tripId: string, dayIndex: number, itemIndex: number, spotId: string, actualMinutes: number, actualCost: number) {
      this.upsertRecord(tripId, {
        day_index: dayIndex,
        item_index: itemIndex,
        spot_id: spotId,
        status: ExecutionItemStatus.DONE,
        actual_minutes: actualMinutes,
        actual_cost: actualCost,
        skip_reason: '',
        completed_at: new Date().toISOString(),
      });
      toast.ok(messages.itemCompleted);
    },
    skipItem(tripId: string, dayIndex: number, itemIndex: number, spotId: string, reason: string) {
      if (!reason) {
        toast.warn(messages.skipReasonRequired);
        return false;
      }
      this.upsertRecord(tripId, {
        day_index: dayIndex,
        item_index: itemIndex,
        spot_id: spotId,
        status: ExecutionItemStatus.SKIPPED,
        actual_minutes: null,
        actual_cost: null,
        skip_reason: reason,
        completed_at: new Date().toISOString(),
      });
      toast.ok(messages.itemSkipped);
      return true;
    },
    finish(tripId: string) {
      const execution = this.ensureStarted(tripId);
      execution.finished_at = new Date().toISOString();
      this.persist();
    },
    progressOf(tripId: string) {
      const records = this.byTrip(tripId)?.records || [];
      return {
        done: records.filter((item) => item.status === ExecutionItemStatus.DONE).length,
        skipped: records.filter((item) => item.status === ExecutionItemStatus.SKIPPED).length,
        actualCost: records.reduce((sum, item) => sum + (item.actual_cost || 0), 0),
        actualMinutes: records.reduce((sum, item) => sum + (item.actual_minutes || 0), 0),
      };
    },
  },
});
