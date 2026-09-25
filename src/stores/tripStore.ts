import { defineStore } from 'pinia';
import { TripStatus } from '../constants/trip';
import type { Trip } from '../models/trip';
import { tripApi } from '../api/tripApi';
import { messages } from '../constants/messages';
import { toast } from '../utils/message';
import { useExecutionStore } from './executionStore';

export const useTripStore = defineStore('trip', {
  state: () => ({ trips: tripApi.list() as Trip[], statusFilter: 'all' as TripStatus | 'all' }),
  getters: {
    filteredTrips: (state) => state.statusFilter === 'all' ? state.trips : state.trips.filter((trip) => trip.status === state.statusFilter),
  },
  actions: {
    createTrip(title = '杭州周末慢旅行') {
      const trip: Trip = {
        id: crypto.randomUUID(),
        title,
        destination: '杭州',
        start_date: new Date().toISOString().slice(0, 10),
        end_date: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
        budget: 3200,
        currency: 'CNY',
        members: ['我', '朋友'],
        status: TripStatus.PLANNING,
        created_at: new Date().toISOString(),
      };
      this.trips.unshift(trip);
      tripApi.save(this.trips);
      toast.ok(messages.tripCreated);
      return trip.id;
    },
    // 状态推进只改 Trip 状态本身；执行记录由 executionStore 单独留存
    markOngoing(id: string) {
      const trip = this.trips.find((item) => item.id === id);
      if (trip && trip.status !== TripStatus.ONGOING) {
        trip.status = TripStatus.ONGOING;
        tripApi.save(this.trips);
      }
    },
    markFinished(id: string) {
      const trip = this.trips.find((item) => item.id === id);
      if (trip && trip.status !== TripStatus.FINISHED) {
        trip.status = TripStatus.FINISHED;
        tripApi.save(this.trips);
      }
    },
    removeTrip(id: string) {
      this.trips = this.trips.filter((trip) => trip.id !== id);
      tripApi.save(this.trips);
      // 连带清理执行记录（状态与执行记录分开留存）
      useExecutionStore().removeByTrip(id);
      toast.ok(messages.tripDeleted);
    },
  },
});
