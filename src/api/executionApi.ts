import type { TripExecution } from '../models/execution';
import { STORAGE_KEYS } from '../constants/storageVersion';
import { loadLocal, saveLocal } from '../utils/storage';

export const executionApi = {
  list: () => loadLocal<TripExecution[]>(STORAGE_KEYS.executions, []),
  save: (items: TripExecution[]) => saveLocal(STORAGE_KEYS.executions, items),
};
