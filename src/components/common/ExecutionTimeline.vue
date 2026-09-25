<template>
  <section class="band execution-day">
    <h3>第 {{ day.day_index }} 天 · {{ day.date }}</h3>
    <ol>
      <li v-for="(row, index) in rows" :key="row.key" :class="rowClass(row)">
        <div class="row-head">
          <strong>{{ index + 1 }}. {{ spotName(row.spot_id) }}</strong>
          <el-tag v-if="executionItem(row)" size="small" :type="itemRunStateTagType[executionItem(row)!.state]">
            {{ isCurrent(row) ? messages.currentBadge : itemRunStateText[executionItem(row)!.state] }}
          </el-tag>
          <el-tag v-else size="small" type="info">{{ messages.pendingBadge }}</el-tag>
        </div>
        <p class="muted">
          计划 {{ row.start_time }}-{{ row.end_time }} · {{ transportText[row.transport] }} · {{ row.note }}
        </p>
        <p v-if="executionItem(row)?.state === ItemRunState.DONE" class="actual">
          {{ messages.actualSpent }}：{{ formatCurrency(executionItem(row)!.actual_cost ?? 0) }} ·
          实际用时：{{ formatDuration(executionItem(row)!.actual_duration_minutes) }}
          <template v-if="executionItem(row)!.actual_note"> · {{ executionItem(row)!.actual_note }}</template>
        </p>
        <p v-else-if="executionItem(row)?.state === ItemRunState.SKIPPED" class="actual skip">
          {{ messages.skippedBadge }}：{{ skipReasonText[executionItem(row)!.skip_reason!] }}
          <template v-if="executionItem(row)!.actual_note"> · {{ executionItem(row)!.actual_note }}</template>
        </p>
        <div v-if="!readonly && actionable(row)" class="toolbar">
          <el-button type="primary" size="small" @click="$emit('complete', executionItem(row)!.key)">
            {{ messages.completeItem }}
          </el-button>
          <el-button size="small" @click="$emit('skip', executionItem(row)!.key)">{{ messages.skipItem }}</el-button>
        </div>
      </li>
    </ol>
    <p v-if="!rows.length" class="muted">这一天还没有安排。</p>
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import type { DayPlan } from '../../models/dayPlan';
import type { Spot } from '../../models/spot';
import type { TripExecution, ExecutionItem } from '../../models/execution';
import { ItemRunState } from '../../constants/execution';
import { messages } from '../../constants/messages';
import {
  transportText,
  formatCurrency,
  formatDuration,
  itemRunStateText,
  itemRunStateTagType,
  skipReasonText,
} from '../../utils/formatters';
import { currentPendingItem, executionItemKey } from '../../utils/execution';

const props = defineProps<{
  day: DayPlan;
  spots: Spot[];
  execution?: TripExecution;
  readonly?: boolean;
}>();
defineEmits<{ complete: [key: string]; skip: [key: string] }>();

// 展示行始终按“计划顺序”（出发快照）排列；快照缺失时退回当天计划
const rows = computed<ExecutionItem[]>(() => {
  const fromExecution = props.execution?.items
    .filter((item) => item.day_index === props.day.day_index)
    .sort((a, b) => a.order - b.order);
  if (fromExecution && fromExecution.length) return fromExecution;
  return props.day.items.map((item, index) => ({
    key: executionItemKey(props.day.day_index, index),
    day_index: props.day.day_index,
    order: index,
    spot_id: item.spot_id,
    start_time: item.start_time,
    end_time: item.end_time,
    note: item.note,
    transport: item.transport,
    state: ItemRunState.PENDING,
  }));
});

const current = computed(() => currentPendingItem(props.execution));
function executionItem(row: ExecutionItem) {
  return props.execution?.items.find((item) => item.key === row.key);
}
function isCurrent(row: ExecutionItem) {
  return current.value?.key === row.key;
}
function actionable(row: ExecutionItem) {
  const item = executionItem(row);
  return !!item && item.state === ItemRunState.PENDING && isCurrent(row);
}
function rowClass(row: ExecutionItem) {
  const item = executionItem(row);
  return {
    'row-done': item?.state === ItemRunState.DONE,
    'row-skip': item?.state === ItemRunState.SKIPPED,
    'row-current': isCurrent(row),
  };
}
const spotName = (id: string) => props.spots.find((spot) => spot.id === id)?.name || '未知景点';
</script>
<style scoped>
.execution-day li { padding: 10px 12px; border-radius: 8px; margin-bottom: 8px; list-style: none; border: 1px solid #e2ead9; }
.row-head { display: flex; align-items: center; gap: 10px; }
.row-done { background: #f0f8f1; }
.row-skip { background: #fbf4e4; }
.row-current { border-color: #2d7a46; box-shadow: 0 0 0 1px #2d7a46 inset; }
.actual { margin: 6px 0 0; }
.skip { color: #a16207; }
</style>
