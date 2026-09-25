<template>
  <header class="trip-header">
    <p class="muted">TripWeaver Share</p>
    <h1>{{ trip.title }} <el-tag size="small">{{ tripStatusText[trip.status] }}</el-tag></h1>
    <p>{{ trip.destination }} · {{ trip.start_date }} 至 {{ trip.end_date }} · 同行 {{ trip.members.join('、') }}</p>
  </header>
</template>
<script setup lang="ts">
import type { Trip } from '../../models/trip';
import { tripStatusText } from '../../utils/formatters';
defineProps<{ trip: Trip }>();
</script>
<style scoped>.trip-header { padding: 28px 0; border-bottom: 2px solid #2d7a46; }</style>
