<template>
  <section class="band execution-panel">
    <div class="panel-head">
      <strong>{{ messages.executionProgress }}</strong>
      <el-tag v-if="execution?.finished_at" type="info">结束于 {{ formatDateTime(execution.finished_at) }}</el-tag>
      <el-tag v-else-if="execution" type="success">出发于 {{ formatDateTime(execution.started_at) }}</el-tag>
      <el-tag v-else type="info">规划中</el-tag>
    </div>
    <el-progress :percentage="progressPercent" />
    <p class="muted">
      共 {{ summary.total }} 项 · 完成 {{ summary.doneCount }} · 跳过 {{ summary.skippedCount }} · 待执行 {{ summary.pendingCount }}
      <template v-if="summary.doneCount"> · {{ messages.actualSpent }} {{ formatCurrency(summary.actualCost, trip.currency) }}（用时 {{ formatDuration(summary.actualMinutes) }}）</template>
    </p>
    <div v-if="!readonly" class="toolbar">
      <template v-if="!execution">
        <el-popconfirm :title="messages.startConfirm" @confirm="$emit('start')">
          <template #reference>
            <el-button type="primary">{{ messages.startTrip }}</el-button>
          </template>
        </el-popconfirm>
        <span class="muted">到出发日也会自动进入进行中</span>
      </template>
      <template v-else-if="!execution.finished_at">
        <el-popconfirm :title="messages.finishConfirm" @confirm="$emit('finish')">
          <template #reference>
            <el-button type="danger" plain>{{ messages.finishTrip }}</el-button>
          </template>
        </el-popconfirm>
      </template>
    </div>
  </section>
</template>
<script setup lang="ts">
import type { Trip } from '../../models/trip';
import type { TripExecution } from '../../models/execution';
import { messages } from '../../constants/messages';
import { formatCurrency, formatDateTime, formatDuration } from '../../utils/formatters';
import { executionSummary } from '../../utils/execution';
import { computed } from 'vue';

const props = defineProps<{ trip: Trip; execution?: TripExecution; readonly?: boolean }>();
defineEmits<{ start: []; finish: [] }>();

const summary = computed(() => executionSummary(props.execution));
const progressPercent = computed(() =>
  summary.value.total ? Math.round(((summary.value.doneCount + summary.value.skippedCount) / summary.value.total) * 100) : 0,
);
</script>
<style scoped>
.execution-panel { border-color: #2d7a46; }
.panel-head { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
</style>
