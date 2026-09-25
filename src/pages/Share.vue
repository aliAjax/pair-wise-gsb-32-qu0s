<template>
  <main class="page">
    <EmptyState v-if="!trip" title="暂无可分享的旅行" description="先从“我的旅行”进入一次行程。" />
    <template v-else>
      <TripHeader :trip="trip" />
      <ExecutionPanel :trip="trip" :execution="execution" readonly />
      <ExecutionTimeline
        v-for="day in tripDays"
        :key="day.id"
        :day="day"
        :spots="spotStore.spots"
        :execution="execution"
        readonly
      />
      <el-button @click="copyText">复制行程文本</el-button>
    </template>
  </main>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useTripStore } from '../stores/tripStore';
import { useSpotStore } from '../stores/spotStore';
import { useDayPlanStore } from '../stores/dayPlanStore';
import { useTripExecution } from '../hooks/useTripExecution';
import TripHeader from '../components/common/TripHeader.vue';
import ExecutionTimeline from '../components/common/ExecutionTimeline.vue';
import ExecutionPanel from '../components/common/ExecutionPanel.vue';
import EmptyState from '../components/common/EmptyState.vue';

const route = useRoute();
const tripStore = useTripStore();
const spotStore = useSpotStore();
const dayPlanStore = useDayPlanStore();
// 详情页带 id 进入；导航栏无 id 时回退到最近一次旅行
const trip = computed(() => {
  const id = route.params.id ? String(route.params.id) : '';
  return tripStore.trips.find((item) => item.id === id) || (id ? undefined : tripStore.trips[0]);
});
const tripDays = computed(() =>
  trip.value ? dayPlanStore.dayPlans.filter((day) => day.trip_id === trip.value!.id).sort((a, b) => a.day_index - b.day_index) : [],
);
// 与详情页读取同一份本地执行记录（只读），同行人打开分享页看到同样的每天实际执行
const { execution } = useTripExecution(trip);

function copyText() {
  navigator.clipboard?.writeText('TripWeaver 行程单：' + (trip.value?.title || '未命名'));
}
</script>
