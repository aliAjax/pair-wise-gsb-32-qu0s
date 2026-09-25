<template>
  <section class="band">
    <h3>执行记录</h3>
    <p class="muted">
      已完成 {{ progress.done }} / {{ totalItems }} · 已跳过 {{ progress.skipped }} ·
      实际花费 {{ formatCurrency(progress.actualCost, trip.currency) }} · 实际用时 {{ progress.actualMinutes }} 分钟
    </p>
    <EmptyState v-if="!totalItems" title="暂无行程项" :description="messages.emptyExecution" />
    <div v-for="day in sortedDays" :key="day.id">
      <h4>第 {{ day.day_index }} 天 · {{ day.date }}</h4>
      <ol>
        <li v-for="(item, itemIndex) in day.items" :key="item.spot_id + itemIndex" class="exec-item">
          <strong>{{ spotName(item.spot_id) }}</strong>
          <el-tag size="small" :type="tagType(statusOf(day.day_index, itemIndex))">{{ executionStatusText[statusOf(day.day_index, itemIndex)] }}</el-tag>
          <span class="muted">计划 {{ item.start_time }}-{{ item.end_time }}</span>
          <template v-if="recordOf(day.day_index, itemIndex)?.status === ExecutionItemStatus.DONE">
            <span class="muted">实际 {{ recordOf(day.day_index, itemIndex)?.actual_minutes }} 分钟 · {{ formatCurrency(recordOf(day.day_index, itemIndex)?.actual_cost || 0, trip.currency) }}</span>
          </template>
          <template v-if="recordOf(day.day_index, itemIndex)?.status === ExecutionItemStatus.SKIPPED">
            <span class="muted">跳过原因：{{ skipReasonText(recordOf(day.day_index, itemIndex)?.skip_reason || '') }}</span>
          </template>
          <template v-if="!readonly && trip.status === TripStatus.ONGOING">
            <el-button size="small" type="primary" :disabled="!isNext(day.day_index, itemIndex)" @click="openComplete(day.day_index, itemIndex, item.spot_id)">完成</el-button>
            <el-button size="small" :disabled="!isNext(day.day_index, itemIndex)" @click="openSkip(day.day_index, itemIndex, item.spot_id)">跳过</el-button>
          </template>
        </li>
      </ol>
      <p v-if="!day.items.length" class="muted">这一天还没有安排。</p>
    </div>

    <el-dialog v-model="completeDialog" title="完成该项" width="360px">
      <p>实际用时（分钟）</p>
      <el-input-number v-model="completeForm.minutes" :min="1" :max="1440" />
      <p>实际花费（元）</p>
      <el-input-number v-model="completeForm.cost" :min="0" :max="100000" />
      <template #footer>
        <el-button @click="completeDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmComplete">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="skipDialog" title="跳过该项" width="360px">
      <p>跳过原因（必选，原计划顺序保持不变）</p>
      <el-select v-model="skipForm.reason" placeholder="请选择跳过原因" style="width: 100%">
        <el-option v-for="item in SKIP_REASON_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <template #footer>
        <el-button @click="skipDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmSkip">确定</el-button>
      </template>
    </el-dialog>
  </section>
</template>
<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import type { Trip } from '../../models/trip';
import type { DayPlan } from '../../models/dayPlan';
import type { Spot } from '../../models/spot';
import { TripStatus } from '../../constants/trip';
import { ExecutionItemStatus, SKIP_REASON_OPTIONS } from '../../constants/execution';
import { useExecutionStore } from '../../stores/executionStore';
import { executionStatusText, formatCurrency, skipReasonText } from '../../utils/formatters';
import { messages } from '../../constants/messages';
import EmptyState from './EmptyState.vue';

const props = withDefaults(defineProps<{ trip: Trip; days: DayPlan[]; spots: Spot[]; readonly?: boolean }>(), { readonly: false });
const executionStore = useExecutionStore();

const sortedDays = computed(() => [...props.days].sort((a, b) => a.day_index - b.day_index));
const totalItems = computed(() => props.days.reduce((sum, day) => sum + day.items.length, 0));
const progress = computed(() => executionStore.progressOf(props.trip.id));
const spotName = (id: string) => props.spots.find((spot) => spot.id === id)?.name || '未知景点';
const recordOf = (dayIndex: number, itemIndex: number) => executionStore.recordOf(props.trip.id, dayIndex, itemIndex);
const statusOf = (dayIndex: number, itemIndex: number) => recordOf(dayIndex, itemIndex)?.status || ExecutionItemStatus.PENDING;
const tagType = (status: ExecutionItemStatus) => status === ExecutionItemStatus.DONE ? 'success' : status === ExecutionItemStatus.SKIPPED ? 'warning' : 'info';

const nextKey = computed(() => {
  for (const day of sortedDays.value) {
    for (let itemIndex = 0; itemIndex < day.items.length; itemIndex += 1) {
      if (!recordOf(day.day_index, itemIndex)) return day.day_index + ':' + itemIndex;
    }
  }
  return '';
});
const isNext = (dayIndex: number, itemIndex: number) => nextKey.value === dayIndex + ':' + itemIndex;

const completeDialog = ref(false);
const skipDialog = ref(false);
const target = reactive({ dayIndex: 0, itemIndex: 0, spotId: '' });
const completeForm = reactive({ minutes: 60, cost: 0 });
const skipForm = reactive({ reason: '' });

function openComplete(dayIndex: number, itemIndex: number, spotId: string) {
  Object.assign(target, { dayIndex, itemIndex, spotId });
  completeDialog.value = true;
}
function confirmComplete() {
  executionStore.completeItem(props.trip.id, target.dayIndex, target.itemIndex, target.spotId, completeForm.minutes, completeForm.cost);
  completeDialog.value = false;
}
function openSkip(dayIndex: number, itemIndex: number, spotId: string) {
  Object.assign(target, { dayIndex, itemIndex, spotId });
  skipForm.reason = '';
  skipDialog.value = true;
}
function confirmSkip() {
  if (executionStore.skipItem(props.trip.id, target.dayIndex, target.itemIndex, target.spotId, skipForm.reason)) {
    skipDialog.value = false;
  }
}
</script>
<style scoped>
.exec-item { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin: 6px 0; }
</style>
