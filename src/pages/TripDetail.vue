<template>
  <main class="page" v-if="trip">
    <TripHeader :trip="trip" />
    <div class="toolbar">
      <el-button type="primary" @click="router.push('/spots')">添加景点</el-button>
      <el-button @click="router.push('/planner/' + trip.id + '/1')">编排第 1 天</el-button>
      <el-button @click="router.push('/share/' + trip.id)">分享预览</el-button>
    </div>

    <ExecutionPanel
      :trip="trip"
      :execution="execution"
      @start="executionStore.startTrip(trip.id)"
      @finish="executionStore.finishTrip(trip.id)"
    />

    <section class="grid">
      <BudgetChart :spent="stats.value.budget.spent" :remaining="stats.value.budget.remaining" />
      <div class="band">
        <strong>统计</strong>
        <p>天数 {{ stats.value.days }} · 景点 {{ stats.value.spotCount }}</p>
        <p>实际花费 {{ formatCurrency(summary.actualCost, trip.currency) }} / 预算 {{ formatCurrency(stats.value.budget.spent, trip.currency) }}</p>
        <p class="muted">{{ stats.value.budget.warning }}</p>
      </div>
    </section>

    <ExecutionTimeline
      v-for="day in tripDays"
      :key="day.id"
      :day="day"
      :spots="spotStore.spots"
      :execution="execution"
      @complete="openComplete"
      @skip="openSkip"
    />

    <!-- 完成：记录实际用时和花费 -->
    <el-dialog v-model="completeVisible" :title="messages.completeItem" width="360px">
      <el-form label-width="110px">
        <el-form-item :label="messages.actualDuration" required>
          <el-input-number v-model="completeForm.duration" :min="1" :step="10" />
        </el-form-item>
        <el-form-item :label="messages.actualCost" required>
          <el-input-number v-model="completeForm.cost" :min="0" :step="10" />
        </el-form-item>
        <el-form-item :label="messages.actualNote">
          <el-input v-model="completeForm.note" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="completeVisible = false">取消</el-button>
        <el-button type="primary" @click="submitComplete">确认完成</el-button>
      </template>
    </el-dialog>

    <!-- 临时跳过：必须选原因，原顺序保留 -->
    <el-dialog v-model="skipVisible" :title="messages.skipItem" width="360px">
      <el-form label-width="90px">
        <el-form-item :label="messages.skipReason" required>
          <el-select v-model="skipForm.reason" :placeholder="messages.skipReason" style="width: 100%">
            <el-option v-for="option in SKIP_REASON_OPTIONS" :key="option.value" :label="option.label" :value="option.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="skipForm.note" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="skipVisible = false">取消</el-button>
        <el-button type="warning" @click="submitSkip">确认跳过</el-button>
      </template>
    </el-dialog>
  </main>
  <main v-else class="page"><EmptyState title="旅行不存在" /></main>
</template>
<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTripStore } from '../stores/tripStore';
import { useSpotStore } from '../stores/spotStore';
import { useDayPlanStore } from '../stores/dayPlanStore';
import { useExecutionStore } from '../stores/executionStore';
import { useTripStats } from '../hooks/useTripStats';
import { useTripExecution } from '../hooks/useTripExecution';
import TripHeader from '../components/common/TripHeader.vue';
import ExecutionTimeline from '../components/common/ExecutionTimeline.vue';
import ExecutionPanel from '../components/common/ExecutionPanel.vue';
import BudgetChart from '../components/common/BudgetChart.vue';
import EmptyState from '../components/common/EmptyState.vue';
import { messages } from '../constants/messages';
import { SKIP_REASON_OPTIONS, SkipReason } from '../constants/execution';
import { formatCurrency } from '../utils/formatters';
import { toast } from '../utils/message';

const route = useRoute();
const router = useRouter();
const tripStore = useTripStore();
const spotStore = useSpotStore();
const dayPlanStore = useDayPlanStore();
const executionStore = useExecutionStore();
const trip = computed(() => tripStore.trips.find((item) => item.id === route.params.id));
const tripDays = computed(() =>
  dayPlanStore.dayPlans.filter((day) => day.trip_id === route.params.id).sort((a, b) => a.day_index - b.day_index),
);
const stats = computed(() => trip.value ? useTripStats(trip.value, dayPlanStore.dayPlans, spotStore.spots) : { value: { days: 0, spotCount: 0, budget: { spent: 0, remaining: 0, warning: '' } } });

const { execution, summary } = useTripExecution(trip);

const completeVisible = ref(false);
const completeKey = ref('');
const completeForm = reactive({ duration: 60, cost: 0, note: '' });
function openComplete(key: string) {
  completeKey.value = key;
  completeForm.duration = 60;
  completeForm.cost = 0;
  completeForm.note = '';
  completeVisible.value = true;
}
function submitComplete() {
  if (!completeForm.duration) return toast.warn(messages.durationRequired);
  if (completeForm.cost === null || completeForm.cost === undefined) return toast.warn(messages.costRequired);
  executionStore.completeItem(String(route.params.id), completeKey.value, completeForm.duration, completeForm.cost, completeForm.note || undefined);
  completeVisible.value = false;
}

const skipVisible = ref(false);
const skipKey = ref('');
const skipForm = reactive<{ reason: SkipReason | ''; note: string }>({ reason: '', note: '' });
function openSkip(key: string) {
  skipKey.value = key;
  skipForm.reason = '';
  skipForm.note = '';
  skipVisible.value = true;
}
function submitSkip() {
  if (!skipForm.reason) return toast.warn(messages.skipReasonRequired);
  executionStore.skipItem(String(route.params.id), skipKey.value, skipForm.reason, skipForm.note || undefined);
  skipVisible.value = false;
}
</script>
