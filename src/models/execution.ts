import { ItemRunState, SkipReason } from '../constants/execution';

// 行程项的执行快照：出发时按当时计划顺序冻结，之后不再随编排改动重排
export interface ExecutionItem {
  key: string;
  day_index: number;
  order: number;
  spot_id: string;
  start_time: string;
  end_time: string;
  note: string;
  transport: 'walk' | 'metro' | 'taxi' | 'train';
  state: ItemRunState;
  actual_duration_minutes?: number; // 完成时记录的实际用时（分钟）
  actual_cost?: number; // 完成时记录的实际花费
  skip_reason?: SkipReason; // 跳过时选择的原因
  actual_note?: string;
  completed_at?: string;
}

// 一次旅行对应一条执行记录（与 Trip 分开留存）
export interface TripExecution {
  trip_id: string;
  started_at: string; // 进入“进行中”的时间
  finished_at?: string; // 旅行结束的时间
  items: ExecutionItem[];
}
