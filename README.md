# TripWeaver 旅游行程规划助手

## 快速启动

```bash
pnpm install
pnpm dev
```

访问地址：http://localhost:18417

TripWeaver 是一款纯前端旅行规划应用，支持创建旅行、探索景点、编排每日行程、预算统计、**旅行执行记录**和分享预览。

## 主要功能

- 我的旅行：创建、筛选、删除旅行计划。
- 行程详情：查看每日行程、预算图表和共享时间线。
- 景点探索：按 SpotCategory 搜索和筛选，收藏并加入行程。
- 行程编排：SortableJS 拖拽排序，实时影响预算计算。
- 旅行执行：到出发日自动进入进行中，按计划顺序逐项完成（记录实际用时/花费）或临时跳过（选择原因、保留原顺序），回来后结束旅行。
- 分享预览：与详情页读取同一份执行进度的只读行程单，可复制行程文本。

## 技术栈

| 分类 | 技术 |
| --- | --- |
| 前端 | Vue 3 + TypeScript |
| 构建 | Vite |
| UI | Element Plus + ECharts |
| 状态 | Pinia |
| 路由 | Vue Router 4 |
| 持久化 | localStorage + Dexie.js |
| 交互 | sortablejs |

## 目录结构

```
src/
├── api/              # tripApi.ts, spotApi.ts, dayPlanApi.ts, executionApi.ts
├── stores/           # tripStore.ts（状态推进）, spotStore.ts, dayPlanStore.ts, executionStore.ts（执行记录）, themeStore.ts
├── models/           # trip.ts, spot.ts, dayPlan.ts, execution.ts
├── types/
├── components/common/# TripCard, SpotCard, DayTimeline, ExecutionTimeline, ExecutionPanel, CategoryFilter, SpotMiniCard, BudgetChart, TripHeader, EmptyState
├── hooks/            # useTripStats.ts, useTripExecution.ts, useLocalStorage.ts, useMapSpots.ts
├── pages/            # Trips, TripDetail, Spots, Planner, Share
├── router/
├── utils/            # storage.ts, execution.ts, budgetCalculator.ts, formatters.ts, validators.ts
├── config/
└── constants/        # spot.ts, trip.ts, execution.ts, themes.ts, messages.ts, storageVersion.ts
```

### 执行记录三层分离

- **状态推进**：只存在 `tripStore`（规划中 → 进行中 → 已结束），到出发日/结束日由 `executionStore.activateDueTrips()` 驱动自动流转。
- **执行记录**：独立模型 `TripExecution`（`models/execution.ts`）与独立 store，出发时按当时计划顺序冻结快照；完成写实际用时/花费，跳过写原因且不改变原顺序。
- **本地留存**：执行记录走独立的 `executionApi` 与 localStorage 键 `tripweaver-v1:executions`（Dexie 同步预留 `executions` 表），与 `trips` 键互不覆盖，关掉浏览器再打开可续办；删除旅行连带清理。
- 详情页与分享页通过共用的 `useTripExecution` hook 和 `<ExecutionTimeline>`/`<ExecutionPanel>` 组件读取同一份进度（分享页只读）。

## 数据持久化

本地数据通过 `utils/storage.ts` 统一写入 localStorage，并保留 Dexie 数据库对象用于后续 IndexedDB 扩展。版本键来自 `constants/storageVersion.ts`。其中旅行状态（`trips` 键）与执行记录（`executions` 键）分开留存，互不影响。

## 环境变量

`VITE_AMAP_KEY`：高德地图 key。未配置时使用 demo-key，地图主题配置同时出现在 `config/map.ts`、`SpotCard`、`DayTimeline`、`Planner` 相关逻辑中。

## 枚举出现位置清单

SpotCategory：
- `src/constants/spot.ts`
- `src/models/spot.ts`
- `src/stores/spotStore.ts`
- `src/components/common/CategoryFilter.vue`
- `src/components/common/SpotCard.vue`
- `src/pages/Spots.vue`
- `src/pages/TripDetail.vue`
- `src/utils/formatters.ts`
- `src/router/guards.ts`

TripStatus：
- `src/constants/trip.ts`
- `src/models/trip.ts`
- `src/stores/tripStore.ts`
- `src/stores/executionStore.ts`
- `src/components/common/TripCard.vue`
- `src/components/common/TripHeader.vue`
- `src/pages/Trips.vue`
- `src/utils/formatters.ts`
- `src/router/guards.ts`

SkipReason / ItemRunState（执行记录枚举）：
- `src/constants/execution.ts`
- `src/models/execution.ts`
- `src/stores/executionStore.ts`
- `src/components/common/ExecutionTimeline.vue`
- `src/pages/TripDetail.vue`
- `src/utils/formatters.ts`
- `src/utils/execution.ts`

## License

MIT

