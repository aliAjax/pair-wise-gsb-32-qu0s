# TripWeaver 旅游行程规划助手

## 快速启动

```bash
pnpm install
pnpm dev
```

访问地址：http://localhost:18417

TripWeaver 是一款纯前端旅行规划应用，支持创建旅行、探索景点、编排每日行程、预算统计和分享预览。

## 主要功能

- 我的旅行：创建、筛选、删除旅行计划。
- 行程详情：查看每日行程、预算图表和共享时间线。
- 旅行执行：到出发日自动进入进行中，按计划顺序逐项完成并记录实际用时和花费；临时跳过必选原因且保留原顺序；结束后归档为已结束。详情页与分享页读取同一份执行进度，刷新或重开浏览器可续办。
- 景点探索：按 SpotCategory 搜索和筛选，收藏并加入行程。
- 行程编排：SortableJS 拖拽排序，实时影响预算计算。
- 分享预览：生成可复制的行程文本。

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
├── api/
├── stores/
├── models/
├── types/
├── components/common/
├── hooks/
├── pages/
├── router/
├── utils/
├── config/
└── constants/
```

## 数据持久化

本地数据通过 `utils/storage.ts` 统一写入 localStorage，并保留 Dexie 数据库对象用于后续 IndexedDB 扩展。版本键来自 `constants/storageVersion.ts`。

执行功能按职责拆为三层：状态推进在 `stores/tripStore.ts`（出发日自动转进行中、结束旅行），执行记录在 `stores/executionStore.ts`（逐项完成/跳过、实际用时与花费），本地留存在 `api/executionApi.ts` + `utils/storage.ts`（`executions` 键独立持久化）。

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
- `src/components/common/TripCard.vue`
- `src/components/common/ExecutionBoard.vue`
- `src/pages/Trips.vue`
- `src/pages/TripDetail.vue`
- `src/utils/formatters.ts`
- `src/router/guards.ts`

ExecutionItemStatus：
- `src/constants/execution.ts`
- `src/models/execution.ts`
- `src/stores/executionStore.ts`
- `src/components/common/ExecutionBoard.vue`
- `src/utils/formatters.ts`

## License

MIT

