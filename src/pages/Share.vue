<template>
  <main class="page">
    <TripHeader v-if="trip" :trip="trip" />
    <ExecutionBoard v-if="trip" :trip="trip" :days="tripDays" :spots="spotStore.spots" readonly />
    <DayTimeline v-for="day in tripDays" :key="day.id" :day="day" :spots="spotStore.spots" />
    <el-button @click="copyText">复制行程文本</el-button>
  </main>
</template>
<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useTripStore } from '../stores/tripStore';
import { useSpotStore } from '../stores/spotStore';
import { useDayPlanStore } from '../stores/dayPlanStore';
import TripHeader from '../components/common/TripHeader.vue';
import DayTimeline from '../components/common/DayTimeline.vue';
import ExecutionBoard from '../components/common/ExecutionBoard.vue';
const tripStore = useTripStore();
const spotStore = useSpotStore();
const dayPlanStore = useDayPlanStore();
const trip = computed(() => tripStore.trips[0]);
const tripDays = computed(() => dayPlanStore.dayPlans.filter((day) => day.trip_id === trip.value?.id));
onMounted(() => tripStore.syncTripStatus());
function copyText() { navigator.clipboard?.writeText('TripWeaver 行程单：' + (trip.value?.title || '未命名')); }
</script>
