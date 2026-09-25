<template>
  <article class="trip-card">
    <div>
      <strong>{{ trip.title }}</strong>
      <p class="muted">{{ trip.destination }} · {{ formatDate(trip.start_date) }} - {{ formatDate(trip.end_date) }}</p>
    </div>
    <el-tag :type="tagType">{{ tripStatusText[trip.status] }}</el-tag>
    <p>预算 {{ formatCurrency(trip.budget, trip.currency) }} · 同行 {{ trip.members.join('、') }}</p>
    <p v-if="execution" class="muted">
      执行 {{ summary.doneCount + summary.skippedCount }}/{{ summary.total }}
      <template v-if="summary.doneCount"> · 实际花费 {{ formatCurrency(summary.actualCost, trip.currency) }}</template>
    </p>
    <div class="toolbar">
      <el-button type="primary" @click="$emit('open', trip.id)">进入详情</el-button>
      <el-button @click="$emit('remove', trip.id)">删除</el-button>
    </div>
  </article>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import type { Trip } from '../../models/trip';
import { TripStatus } from '../../constants/trip';
import { useExecutionStore } from '../../stores/executionStore';
import { executionSummary } from '../../utils/execution';
import { formatCurrency, formatDate, tripStatusText } from '../../utils/formatters';
const props = defineProps<{ trip: Trip }>();
defineEmits<{ open: [id: string]; remove: [id: string] }>();
const executionStore = useExecutionStore();
const execution = computed(() => executionStore.byTripId(props.trip.id));
const summary = computed(() => executionSummary(execution.value));
const tagType = computed(() =>
  props.trip.status === TripStatus.ONGOING ? 'success' : props.trip.status === TripStatus.FINISHED ? 'info' : 'warning',
);
</script>
<style scoped>
.trip-card { background: #fff; border: 1px solid #dbe7cf; border-radius: 8px; padding: 18px; }
</style>
