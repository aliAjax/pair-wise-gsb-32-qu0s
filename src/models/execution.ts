import { ExecutionItemStatus } from '../constants/execution';

export interface ExecutionRecord {
  day_index: number;
  item_index: number;
  spot_id: string;
  status: ExecutionItemStatus;
  actual_minutes: number | null;
  actual_cost: number | null;
  skip_reason: string;
  completed_at: string;
}

export interface TripExecution {
  trip_id: string;
  started_at: string;
  finished_at: string;
  records: ExecutionRecord[];
}
