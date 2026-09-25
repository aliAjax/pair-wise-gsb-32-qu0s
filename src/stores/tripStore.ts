import { defineStore } from 'pinia';
import { TripStatus } from '../constants/trip';
import type { Trip } from '../models/trip';
import { tripApi } from '../api/tripApi';
import { messages } from '../constants/messages';
import { toast } from '../utils/message';

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
    removeTrip(id: string) {
      this.trips = this.trips.filter((trip) => trip.id !== id);
      tripApi.save(this.trips);
      toast.ok(messages.tripDeleted);
    },
    syncTripStatus() {
      const today = new Date().toISOString().slice(0, 10);
      let changed = false;
      this.trips.forEach((trip) => {
        if (trip.status === TripStatus.PLANNING && trip.start_date <= today) {
          trip.status = TripStatus.ONGOING;
          changed = true;
        }
      });
      if (changed) tripApi.save(this.trips);
    },
    finishTrip(id: string) {
      const trip = this.trips.find((item) => item.id === id);
      if (!trip) return;
      trip.status = TripStatus.FINISHED;
      tripApi.save(this.trips);
      toast.ok(messages.tripFinished);
    },
  },
});

